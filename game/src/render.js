// All drawing for The Gilded Vault on one canvas: the HUD bar with the
// alarm meter, the room with its walls, cones, cameras, loot and exit, and
// the title, caught, level-clear and getaway screens. Room coordinates run
// 0..960 by 0..640 and are drawn HUD_H pixels down the canvas, so the whole
// heist — thief, guards, cones, cameras, loot and alarm — sits in one frame.
import { CANVAS_W, CANVAS_H, HUD_H, ROOM_W, ROOM_H } from './config.js';

function conePath(ctx, x, y, dir, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - halfAngle, dir + halfAngle);
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.fillStyle = '#0b0e16';
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  drawHUD(game) {
    const ctx = this.ctx;
    ctx.fillStyle = '#12151f';
    ctx.fillRect(0, 0, CANVAS_W, HUD_H);
    ctx.fillStyle = '#2a2f42';
    ctx.fillRect(0, HUD_H - 2, CANVAS_W, 2);

    // Title and level.
    ctx.fillStyle = '#e8c96a';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('THE GILDED VAULT', 14, 18);
    ctx.fillStyle = '#9aa3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`${game.levelIndex + 1}/3 · ${game.level.name}`, 14, 42);

    // Alarm meter: the bar the whole run hangs on. The label sits left of
    // the bar, centred on it, so it never clips the top of the bar.
    const alarm = game.alarm.value;
    const barX = 250;
    const barY = 14;
    const barW = 210;
    const barH = 20;
    ctx.fillStyle = '#e8e6df';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('ALARM', 200, barY + barH / 2);
    ctx.fillStyle = '#1d2230';
    roundRect(ctx, barX, barY, barW, barH, 5);
    ctx.fill();
    const fillColor = alarm < 30 ? '#3fae6a' : alarm < 65 ? '#e8a33d' : '#e5484d';
    ctx.fillStyle = fillColor;
    if (alarm > 0.5) {
      roundRect(ctx, barX + 2, barY + 2, Math.max(8, (barW - 4) * (alarm / 100)), barH - 4, 4);
      ctx.fill();
    }
    ctx.fillStyle = '#e8e6df';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`${Math.round(alarm)}%`, barX + barW + 10, barY + barH / 2);
    ctx.fillStyle = alarm >= 65 ? '#e5484d' : '#9aa3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(alarm >= 65 ? 'HOT — break line of sight!' : 'stay out of the cones', barX, 48);

    // Loot, timer and tools.
    ctx.fillStyle = '#e8c96a';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(`◆ $${game.thief.lootValue}`, 500, 20);
    ctx.fillStyle = '#9aa3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`time ${Math.floor(game.elapsed)}s / par ${game.level.parSeconds}s`, 500, 42);

    this.drawToolButton(648, 12, 104, 40, '1 · SMOKE', game.thief.smokeLeft, '#7dd3fc');
    this.drawToolButton(760, 12, 104, 40, '2 · EMP', game.thief.empLeft, '#f0abfc');
  }

  drawObjective(game) {
    // The current objective rides at the bottom of the room, clear of the
    // HUD tool buttons it used to overlap. End screens state their own
    // outcome, so the pill only shows while playing or on the title.
    if (game.state !== 'play' && game.state !== 'title') return;
    const ctx = this.ctx;
    const text = game.thief.diamondTaken
      ? 'DIAMOND SECURED ✓ — REACH THE WEST EXIT'
      : 'OBJECTIVE: STEAL THE SUNSPIRE DIAMOND';
    ctx.font = 'bold 12px system-ui, sans-serif';
    const width = ctx.measureText(text).width + 24;
    const x = (ROOM_W - width) / 2;
    const y = ROOM_H - 26;
    ctx.fillStyle = 'rgba(11, 14, 22, 0.78)';
    roundRect(ctx, x, y, width, 20, 10);
    ctx.fill();
    ctx.fillStyle = game.thief.diamondTaken ? '#3fae6a' : '#e8c96a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, ROOM_W / 2, y + 10);
    ctx.textAlign = 'left';
  }

  drawToolButton(x, y, w, h, label, count, color) {
    const ctx = this.ctx;
    ctx.fillStyle = count > 0 ? '#1d2230' : '#14161f';
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = count > 0 ? color : '#3a4054';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = count > 0 ? color : '#5a6276';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${label} ×${count}`, x + w / 2, y + h / 2);
    ctx.textAlign = 'left';
  }

  drawRoom(game) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(0, HUD_H);

    // Floor: dark tiles with a gold carpet runner down the middle.
    ctx.fillStyle = '#171a26';
    ctx.fillRect(0, 0, ROOM_W, ROOM_H);
    ctx.strokeStyle = '#1f2333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= ROOM_W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ROOM_H);
      ctx.stroke();
    }
    for (let y = 0; y <= ROOM_H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ROOM_W, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#3d2b2b';
    ctx.fillRect(430, 0, 100, ROOM_H);
    ctx.fillStyle = '#4d3636';
    ctx.fillRect(440, 0, 80, ROOM_H);
    ctx.strokeStyle = '#6b4d2e';
    ctx.strokeRect(430, 0, 100, ROOM_H);

    this.drawExit(game);
    for (const wall of game.level.walls) this.drawWall(wall);
    for (const loot of game.level.smallLoot) {
      if (!loot.taken) this.drawSmallLoot(loot);
    }
    this.drawDiamondCase(game);
    for (const camera of game.cameras) this.drawCameraCone(camera);
    for (const guard of game.guards) this.drawGuardCone(guard);
    for (const smoke of game.thief.smokes) this.drawSmoke(smoke);
    for (const camera of game.cameras) this.drawCamera(camera);
    for (const guard of game.guards) this.drawGuard(guard);
    this.drawThief(game);
    this.drawObjective(game);
    ctx.restore();
  }

  drawWall(wall) {
    const ctx = this.ctx;
    ctx.fillStyle = '#2e3448';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = '#3d4560';
    ctx.fillRect(wall.x, wall.y, wall.w, 5);
    ctx.strokeStyle = '#171a26';
    ctx.lineWidth = 2;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }

  drawExit(game) {
    const ctx = this.ctx;
    const exit = game.level.exit;
    const open = game.thief.diamondTaken;
    ctx.fillStyle = open ? '#1f7a44' : '#243024';
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.strokeStyle = open ? '#3fae6a' : '#4a5a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
    ctx.save();
    ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = open ? '#b8f5cd' : '#7d8a7d';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(open ? 'EXIT →' : 'EXIT', 0, 0);
    ctx.restore();
    if (open) {
      ctx.strokeStyle = '#3fae6a';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.strokeRect(exit.x - 4, exit.y - 4, exit.w + 8, exit.h + 8);
      ctx.setLineDash([]);
    }
  }

  drawSmallLoot(loot) {
    const ctx = this.ctx;
    const glow = 10 + Math.sin(Date.now() / 300) * 3;
    ctx.fillStyle = 'rgba(232, 201, 106, 0.25)';
    ctx.beginPath();
    ctx.arc(loot.x, loot.y, glow + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8c96a';
    if (loot.kind === 'coin') {
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a6d1f';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', loot.x, loot.y + 0.5);
    } else {
      ctx.beginPath();
      ctx.moveTo(loot.x, loot.y - 11);
      ctx.lineTo(loot.x + 8, loot.y);
      ctx.lineTo(loot.x, loot.y + 11);
      ctx.lineTo(loot.x - 8, loot.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8a6d1f';
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = 'left';
  }

  drawDiamondCase(game) {
    const ctx = this.ctx;
    const diamond = game.level.diamond;
    if (game.thief.diamondTaken) {
      // Empty case, lid open.
      ctx.strokeStyle = '#5a6276';
      ctx.lineWidth = 2;
      ctx.strokeRect(diamond.x - 24, diamond.y - 24, 48, 48);
      ctx.fillStyle = '#9aa3b8';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMPTY', diamond.x, diamond.y + 36);
      ctx.textAlign = 'left';
      return;
    }
    const pulse = 14 + Math.sin(Date.now() / 250) * 4;
    ctx.fillStyle = 'rgba(232, 201, 106, 0.22)';
    ctx.beginPath();
    ctx.arc(diamond.x, diamond.y, 30 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8c96a';
    ctx.lineWidth = 2;
    ctx.strokeRect(diamond.x - 24, diamond.y - 24, 48, 48);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.moveTo(diamond.x, diamond.y - 14);
    ctx.lineTo(diamond.x + 11, diamond.y);
    ctx.lineTo(diamond.x, diamond.y + 14);
    ctx.lineTo(diamond.x - 11, diamond.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8c96a';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SUNSPIRE DIAMOND', diamond.x, diamond.y - 34);
    ctx.fillText('hold E to crack the case', diamond.x, diamond.y + 54);
    ctx.textAlign = 'left';

    // Cracking progress ring while the thief holds E.
    if (game.thief.channelProgress > 0) {
      ctx.strokeStyle = '#ffe9a8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        diamond.x,
        diamond.y,
        32,
        -Math.PI / 2,
        -Math.PI / 2 + game.thief.channelProgress * Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  drawGuardCone(guard) {
    const ctx = this.ctx;
    const hot = guard.suspicion > 0.4;
    ctx.fillStyle = guard.alerted
      ? 'rgba(229, 72, 77, 0.45)'
      : hot
        ? 'rgba(232, 163, 61, 0.32)'
        : 'rgba(229, 72, 77, 0.22)';
    conePath(ctx, guard.x, guard.y, guard.dir, guard.coneRange, guard.coneHalfAngle);
    ctx.fill();
  }

  drawCameraCone(camera) {
    const ctx = this.ctx;
    if (camera.disabled) return;
    ctx.fillStyle = camera.seeing
      ? 'rgba(240, 171, 252, 0.45)'
      : 'rgba(240, 171, 252, 0.20)';
    conePath(ctx, camera.x, camera.y, camera.angle, camera.coneRange, camera.coneHalfAngle);
    ctx.fill();
  }

  drawSmoke(smoke) {
    const ctx = this.ctx;
    const alpha = Math.min(0.85, smoke.ttl / 2);
    ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
    ctx.beginPath();
    ctx.arc(smoke.x, smoke.y, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
    ctx.beginPath();
    ctx.arc(smoke.x - 20, smoke.y - 10, 34, 0, Math.PI * 2);
    ctx.arc(smoke.x + 22, smoke.y + 12, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGuard(guard) {
    const ctx = this.ctx;
    ctx.fillStyle = '#1c1f2b';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, guard.radius + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = guard.alerted ? '#e5484d' : '#f0a35e';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Facing tick.
    ctx.strokeStyle = '#f0a35e';
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.dir) * 18, guard.y + Math.sin(guard.dir) * 18);
    ctx.stroke();
    ctx.fillStyle = '#f0a35e';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUARD', guard.x, guard.y - guard.radius - 8);
    if (guard.suspicion > 0.05) {
      const mark = guard.alerted ? '!' : '?';
      ctx.fillStyle = guard.alerted ? '#e5484d' : '#e8a33d';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(mark, guard.x, guard.y - guard.radius - 20);
      // Suspicion bar.
      ctx.fillStyle = '#1d2230';
      ctx.fillRect(guard.x - 14, guard.y + guard.radius + 4, 28, 5);
      ctx.fillStyle = guard.alerted ? '#e5484d' : '#e8a33d';
      ctx.fillRect(guard.x - 14, guard.y + guard.radius + 4, 28 * guard.suspicion, 5);
    }
    ctx.textAlign = 'left';
  }

  drawCamera(camera) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.rotate(camera.angle);
    ctx.fillStyle = camera.disabled ? '#3a4054' : '#2b2f40';
    ctx.fillRect(-6, -6, 16, 12);
    ctx.fillStyle = camera.disabled ? '#5a6276' : camera.seeing ? '#f0abfc' : '#e5484d';
    ctx.beginPath();
    ctx.arc(10, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#f0abfc';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(camera.disabled ? 'CAM OFF' : 'CAM', camera.x, camera.y - 14);
    ctx.textAlign = 'left';
  }

  drawThief(game) {
    const ctx = this.ctx;
    const thief = game.thief;
    if (thief.inSmoke) {
      ctx.fillStyle = 'rgba(45, 212, 191, 0.25)';
      ctx.beginPath();
      ctx.arc(thief.x, thief.y, thief.radius + 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.radius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(thief.x, thief.y);
    ctx.lineTo(thief.x + Math.cos(thief.facing) * 16, thief.y + Math.sin(thief.facing) * 16);
    ctx.stroke();
    ctx.fillStyle = '#0b0e16';
    ctx.beginPath();
    ctx.arc(
      thief.x + Math.cos(thief.facing) * 4,
      thief.y + Math.sin(thief.facing) * 4,
      3.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = '#2dd4bf';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WREN', thief.x, thief.y - thief.radius - 8);
    ctx.textAlign = 'left';
    if (thief.sneaking) {
      ctx.fillStyle = '#9aa3b8';
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('sneaking', thief.x, thief.y + thief.radius + 14);
      ctx.textAlign = 'left';
    }
  }

  drawOverlayPanel(title, lines, accent) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 7, 12, 0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    const panelW = 620;
    const panelH = 300;
    const x = (CANVAS_W - panelW) / 2;
    const y = (CANVAS_H - panelH) / 2;
    ctx.fillStyle = '#141824';
    roundRect(ctx, x, y, panelW, panelH, 12);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, CANVAS_W / 2, y + 58);
    ctx.fillStyle = '#d7dce8';
    ctx.font = '15px system-ui, sans-serif';
    lines.forEach((line, index) => {
      ctx.fillText(line, CANVAS_W / 2, y + 104 + index * 28);
    });
    ctx.textAlign = 'left';
  }

  drawTitle(game) {
    this.drawRoom(game);
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 7, 12, 0.66)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#e8c96a';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE GILDED VAULT', CANVAS_W / 2, 150);
    ctx.fillStyle = '#d7dce8';
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText('A three-room heist. Steal the Sunspire Diamond in each gallery', CANVAS_W / 2, 196);
    ctx.fillText('and slip out the west door before the alarm hits 100%.', CANVAS_W / 2, 222);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#9aa3b8';
    const help = [
      'WASD / arrows — move · click the floor — walk there · Shift — sneak (harder to spot)',
      'E (hold) — crack the diamond case · 1 — smoke pellet · 2 — EMP kills cameras 8s',
      'Red cones are guards, violet cones are cameras. Walls and smoke block their sight.',
      'Grab the side loot for cash, but every second in a cone feeds the alarm.',
    ];
    help.forEach((line, index) => ctx.fillText(line, CANVAS_W / 2, 300 + index * 26));
    ctx.fillStyle = '#e8c96a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    const blink = Math.sin(Date.now() / 300) > -0.2;
    if (blink) ctx.fillText('Press ENTER or click to start the heist', CANVAS_W / 2, 448);
    ctx.fillStyle = '#9aa3b8';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Best played with keyboard and mouse · sound on for the alarm', CANVAS_W / 2, 486);
    ctx.textAlign = 'left';
  }

  drawCaught(game) {
    this.drawRoom(game);
    this.drawOverlayPanel('CAUGHT!', [
      `The alarm hit 100% in ${game.level.name}.`,
      `Loot carried: $${game.thief.lootValue} · best alarm peak ${Math.round(game.alarm.peak)}%`,
      'The guards know your face now. Press R to try the room again.',
    ], '#e5484d');
  }

  drawLevelClear(game) {
    this.drawRoom(game);
    const bonus = Math.max(0, game.level.parSeconds - Math.floor(game.elapsed)) * 4;
    this.drawOverlayPanel(`${game.level.name} — CLEAN GETAWAY`, [
      `Diamond secured · $${game.thief.lootValue} in loot · time bonus +$${bonus}`,
      `Alarm peaked at ${Math.round(game.alarm.peak)}% — the house never knew.`,
      'Press ENTER for the next gallery.',
    ], '#3fae6a');
  }

  drawWin(game) {
    this.drawRoom(game);
    this.drawOverlayPanel('THE VAULT IS YOURS', [
      `Three diamonds, three getaways. Total take: $${game.totalLoot}.`,
      `Highest alarm all night: ${Math.round(game.worstAlarm)}% · total time ${Math.floor(game.totalTime)}s`,
      'Wren vanishes into the night. Press R to run it back.',
    ], '#e8c96a');
  }
}
