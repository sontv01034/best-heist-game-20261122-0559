// The thief: movement with wall collision, click-to-move, smoke pellets
// and the EMP, grabbing small loot on touch and cracking the diamond case
// by holding E beside it.
import {
  THIEF_RADIUS,
  THIEF_WALK_SPEED,
  THIEF_SNEAK_SPEED,
  DIAMOND_CHANNEL_SECONDS,
  DIAMOND_VALUE,
  SMALL_LOOT_VALUE,
  SMOKE_SECONDS,
  EMP_SECONDS,
  EMP_ALARM_COST,
  ROOM_W,
  ROOM_H,
} from './config.js';
import { roomContains } from './levels.js';

function circleHitsWall(x, y, radius, walls) {
  for (const wall of walls) {
    const nearestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const nearestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    const dx = x - nearestX;
    const dy = y - nearestY;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

export class Thief {
  constructor(start) {
    this.x = start.x;
    this.y = start.y;
    this.radius = THIEF_RADIUS;
    this.facing = -Math.PI / 2;
    this.smokeLeft = 2;
    this.empLeft = 1;
    this.smokes = []; // {x, y, ttl}
    this.empTimer = 0;
    this.diamondTaken = false;
    this.channelProgress = 0;
    this.lootValue = 0;
    this.smallLootTaken = 0;
    this.moving = false;
    this.sneaking = false;
  }

  get speed() {
    if (this.sneaking) return THIEF_SNEAK_SPEED;
    return THIEF_WALK_SPEED;
  }

  moveStep(dx, dy, walls) {
    // Axis-separated movement so the thief slides along walls instead of
    // sticking on corners.
    const nextX = this.x + dx;
    if (roomContains(nextX, this.y) && !circleHitsWall(nextX, this.y, this.radius, walls)) {
      this.x = nextX;
    }
    const nextY = this.y + dy;
    if (roomContains(this.x, nextY) && !circleHitsWall(this.x, nextY, this.radius, walls)) {
      this.y = nextY;
    }
    this.x = Math.max(this.radius, Math.min(ROOM_W - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(ROOM_H - this.radius, this.y));
  }

  update(dt, input, level, alarm) {
    this.sneaking = input.sneaking;
    const axis = input.axis();
    let dx = 0;
    let dy = 0;
    if (axis.x !== 0 || axis.y !== 0) {
      dx = axis.x * this.speed * dt;
      dy = axis.y * this.speed * dt;
      input.clearMoveTarget();
    } else if (input.moveTarget) {
      const tx = input.moveTarget.x - this.x;
      const ty = input.moveTarget.y - this.y;
      const dist = Math.hypot(tx, ty);
      if (dist < 6) {
        input.clearMoveTarget();
      } else {
        const step = Math.min(this.speed * dt, dist);
        dx = (tx / dist) * step;
        dy = (ty / dist) * step;
      }
    }
    if (dx !== 0 || dy !== 0) {
      this.facing = Math.atan2(dy, dx);
      this.moving = true;
    } else {
      this.moving = false;
    }
    this.moveStep(dx, dy, level.walls);

    // Tools: number keys or a click on the HUD button.
    const toolClick = input.consumeToolClick();
    if ((input.keys.has('1') || toolClick === 'smoke') && this.smokeLeft > 0) {
      this.dropSmoke();
      input.keys.delete('1');
    }
    if ((input.keys.has('2') || toolClick === 'emp') && this.empLeft > 0 && this.empTimer <= 0) {
      this.empLeft -= 1;
      this.empTimer = EMP_SECONDS;
      alarm.add(EMP_ALARM_COST);
    }

    for (const smoke of this.smokes) smoke.ttl -= dt;
    this.smokes = this.smokes.filter((smoke) => smoke.ttl > 0);
    if (this.empTimer > 0) this.empTimer -= dt;

    // Small loot is picked up by walking over it.
    for (const loot of level.smallLoot) {
      if (!loot.taken && Math.hypot(loot.x - this.x, loot.y - this.y) < this.radius + 14) {
        loot.taken = true;
        this.smallLootTaken += 1;
        this.lootValue += SMALL_LOOT_VALUE;
      }
    }

    // The diamond needs the thief beside the case, holding E to crack it.
    const nearDiamond =
      !this.diamondTaken && Math.hypot(level.diamond.x - this.x, level.diamond.y - this.y) < 46;
    if (nearDiamond && input.grabbing) {
      this.channelProgress += dt / DIAMOND_CHANNEL_SECONDS;
      if (this.channelProgress >= 1) {
        this.diamondTaken = true;
        this.lootValue += DIAMOND_VALUE;
        this.channelProgress = 0;
      }
    } else if (!this.diamondTaken) {
      this.channelProgress = Math.max(0, this.channelProgress - dt * 0.8);
    }
  }

  dropSmoke() {
    this.smokeLeft -= 1;
    this.smokes.push({ x: this.x, y: this.y, ttl: SMOKE_SECONDS });
  }

  get inSmoke() {
    for (const smoke of this.smokes) {
      if (Math.hypot(smoke.x - this.x, smoke.y - this.y) < 70) return true;
    }
    return false;
  }

  reset(start) {
    this.x = start.x;
    this.y = start.y;
    this.facing = -Math.PI / 2;
    this.smokeLeft = 2;
    this.empLeft = 1;
    this.smokes = [];
    this.empTimer = 0;
    this.diamondTaken = false;
    this.channelProgress = 0;
    this.lootValue = 0;
    this.smallLootTaken = 0;
  }
}
