// Screenshot scenes: deterministic staged states of the real game, picked
// with ?scene= in the page URL. The game itself renders them — guards,
// cones, cameras, loot and the alarm meter are all live game objects, just
// frozen in place so a screenshot catches the heist at its best.

export function applyScene(game, scene) {
  if (!scene) return false;
  game.state = 'play';
  game.frozen = true;

  if (scene === 'cover') {
    // Mid-heist in the first gallery: Wren crossing the carpet with the
    // diamond ahead, a guard sweeping toward her and the alarm warming up.
    game.loadLevel(0);
    game.thief.x = 470;
    game.thief.y = 480;
    game.thief.facing = -Math.PI / 2;
    game.thief.lootValue = 120;
    game.level.smallLoot[0].taken = true;
    game.guards[0].x = 480;
    game.guards[0].y = 250;
    game.guards[0].dir = Math.PI / 2;
    game.guards[0].suspicion = 0.55;
    game.cameras[0].angle = Math.PI * 1.15;
    game.alarm.value = 34;
    game.alarm.peak = 34;
    game.elapsed = 23;
    return true;
  }

  if (scene === 'loot') {
    // The crack: Wren beside the case, progress ring half done, a camera
    // cone sweeping past and a guard closing in from the left.
    game.loadLevel(0);
    game.thief.x = 452;
    game.thief.y = 344;
    game.thief.facing = Math.PI / 4;
    game.thief.channelProgress = 0.55;
    game.thief.lootValue = 240;
    game.level.smallLoot[0].taken = true;
    game.level.smallLoot[1].taken = true;
    game.guards[0].x = 300;
    game.guards[0].y = 320;
    game.guards[0].dir = 0;
    game.guards[0].suspicion = 0.8;
    game.cameras[0].angle = Math.PI * 0.85;
    game.alarm.value = 58;
    game.alarm.peak = 58;
    game.elapsed = 41;
    return true;
  }

  if (scene === 'alarm') {
    // The hot moment: alarm at 88, a guard fully alerted and closing in,
    // Wren in smoke by the wall with the diamond already taken.
    game.loadLevel(1);
    game.thief.x = 250;
    game.thief.y = 470;
    game.thief.facing = -Math.PI / 2;
    game.thief.diamondTaken = true;
    game.thief.lootValue = 740;
    game.thief.smokeLeft = 1;
    game.thief.smokes = [{ x: 250, y: 470, ttl: 4.5 }];
    game.thief.channelProgress = 0;
    game.guards[0].x = 320;
    game.guards[0].y = 400;
    game.guards[0].dir = Math.PI * 0.75;
    game.guards[0].suspicion = 1;
    game.guards[0].alerted = true;
    game.guards[1].x = 640;
    game.guards[1].y = 200;
    game.guards[1].dir = Math.PI / 2;
    game.guards[1].suspicion = 0.4;
    game.cameras[0].angle = Math.PI * 0.9;
    game.cameras[0].seeing = true;
    game.alarm.value = 88;
    game.alarm.peak = 88;
    game.elapsed = 63;
    return true;
  }

  if (scene === 'win') {
    // The getaway screen after the third gallery.
    game.loadLevel(2);
    game.state = 'win';
    game.totalLoot = 2140;
    game.worstAlarm = 71;
    game.totalTime = 268;
    return true;
  }

  game.frozen = false;
  return false;
}

export function sceneFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('scene');
}
