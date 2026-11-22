// The Gilded Vault: game state, the main loop and the screen flow.
// Title -> play -> level clear -> next gallery -> getaway, with a caught
// screen when the alarm trips. One room is always fully visible in a
// single frame: thief, guards and their cones, cameras, loot and alarm.
import { CANVAS_W, CANVAS_H } from './config.js';
import { LEVELS } from './levels.js';
import { Thief } from './thief.js';
import { Guard } from './guards.js';
import { Camera } from './cameras.js';
import { Alarm } from './alarm.js';
import { Input } from './input.js';
import { Renderer } from './render.js';
import { SoundEffects } from './audio.js';
import { applyScene, sceneFromUrl } from './scenes.js';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas);
    this.sounds = new SoundEffects();
    this.state = 'title';
    this.levelIndex = 0;
    this.level = LEVELS[0];
    this.thief = new Thief(LEVELS[0].start);
    this.guards = [];
    this.cameras = [];
    this.alarm = new Alarm();
    this.elapsed = 0;
    this.time = 0;
    this.totalLoot = 0;
    this.totalTime = 0;
    this.worstAlarm = 0;
    this.frozen = false;
    this.lastCrackTick = 0;
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.levelIndex = index;
    // Fresh copies: the layout is data, the run mutates loot flags.
    this.level = JSON.parse(JSON.stringify(LEVELS[index]));
    this.thief.reset(this.level.start);
    this.guards = this.level.guards.map((spec) => new Guard(spec));
    this.cameras = this.level.cameras.map((spec) => new Camera(spec));
    this.alarm.reset();
    this.elapsed = 0;
  }

  startRun() {
    this.totalLoot = 0;
    this.totalTime = 0;
    this.worstAlarm = 0;
    this.loadLevel(0);
    this.state = 'play';
  }

  update(dt) {
    this.time += dt;
    if (this.state !== 'play' || this.frozen) return;

    const beforeLoot = this.thief.lootValue;
    const beforeDiamond = this.thief.diamondTaken;
    const beforeSmoke = this.thief.smokeLeft;
    const beforeEmp = this.thief.empLeft;

    this.thief.update(dt, this.input, this.level, this.alarm);
    for (const guard of this.guards) {
      guard.update(dt, this.thief, this.level.walls, this.thief.smokes);
    }
    for (const camera of this.cameras) {
      camera.update(dt, this.time, this.thief, this.level.walls, this.thief.smokes);
    }
    if (this.thief.empTimer > 0) {
      // While the EMP pulse lasts, every camera stays dark.
      for (const camera of this.cameras) {
        camera.disabledTimer = Math.max(camera.disabledTimer, this.thief.empTimer);
      }
    }
    this.alarm.update(dt, this.guards, this.cameras);
    this.elapsed += dt;
    this.worstAlarm = Math.max(this.worstAlarm, this.alarm.peak);

    if (this.thief.lootValue > beforeLoot && !beforeDiamond && this.thief.diamondTaken) {
      this.sounds.diamond();
    } else if (this.thief.lootValue > beforeLoot) {
      this.sounds.pickup();
    }
    if (this.thief.smokeLeft < beforeSmoke) this.sounds.smoke();
    if (this.thief.empLeft < beforeEmp) this.sounds.emp();
    if (this.thief.channelProgress > 0 && this.time - this.lastCrackTick > 0.25) {
      this.lastCrackTick = this.time;
      this.sounds.crackTick();
    }
    if (this.alarm.value >= 65) this.sounds.alarmBeep(this.time);

    // Caught: a guard close enough to grab the thief, or the alarm trips.
    for (const guard of this.guards) {
      if (Math.hypot(guard.x - this.thief.x, guard.y - this.thief.y) < 22) {
        this.state = 'caught';
        this.sounds.caught();
        return;
      }
    }
    if (this.alarm.tripped) {
      this.state = 'caught';
      this.sounds.caught();
      return;
    }

    // Getaway: diamond in hand and the thief reaches the west door.
    if (this.thief.diamondTaken) {
      const exit = this.level.exit;
      if (
        this.thief.x - this.thief.radius < exit.x + exit.w &&
        this.thief.x + this.thief.radius > exit.x &&
        this.thief.y - this.thief.radius < exit.y + exit.h &&
        this.thief.y + this.thief.radius > exit.y
      ) {
        this.finishLevel();
      }
    }
  }

  finishLevel() {
    const bonus = Math.max(0, this.level.parSeconds - Math.floor(this.elapsed)) * 4;
    this.totalLoot += this.thief.lootValue + bonus;
    this.totalTime += this.elapsed;
    this.sounds.getaway();
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.state = 'win';
    } else {
      this.state = 'clear';
    }
  }

  handleScreens() {
    if (this.state === 'title' && (this.input.consumeEnter() || this.input.consumeRestart())) {
      this.sounds.ensure();
      this.startRun();
      return;
    }
    if (this.state === 'caught' && this.input.consumeRestart()) {
      this.loadLevel(this.levelIndex);
      this.state = 'play';
      return;
    }
    if (this.state === 'clear' && this.input.consumeEnter()) {
      this.loadLevel(this.levelIndex + 1);
      this.state = 'play';
      return;
    }
    if (this.state === 'win' && this.input.consumeRestart()) {
      this.startRun();
    }
  }

  render() {
    this.renderer.clear();
    if (this.state === 'title') {
      this.renderer.drawHUD(this);
      this.renderer.drawTitle(this);
      return;
    }
    this.renderer.drawHUD(this);
    if (this.state === 'caught') this.renderer.drawCaught(this);
    else if (this.state === 'clear') this.renderer.drawLevelClear(this);
    else if (this.state === 'win') this.renderer.drawWin(this);
    else this.renderer.drawRoom(this);
  }
}

function boot() {
  const canvas = document.getElementById('game');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const game = new Game(canvas);

  // A click anywhere on the title screen starts the run too.
  canvas.addEventListener('mousedown', () => {
    if (game.state === 'title') {
      game.sounds.ensure();
      game.startRun();
    }
  });

  const scene = sceneFromUrl();
  if (scene) applyScene(game, scene);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.handleScreens();
    game.update(dt);
    game.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot();
