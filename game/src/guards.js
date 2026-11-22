// Guards: patrol waypoints, pause and scan at each end, and watch a vision
// cone. A guard who sees the thief grows suspicious; a fully suspicious
// guard raises the alarm and closes in. Walls and smoke block sight.
import {
  GUARD_RADIUS,
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_CONE_RANGE,
  GUARD_CONE_HALF_ANGLE,
  GUARD_SUSPICION_RISE,
  GUARD_SUSPICION_FALL,
} from './config.js';

export function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

// Sampled line of sight: step along the segment and fail if any sample
// lands inside a wall. Cheap, and exact enough for cone checks.
export function lineBlocked(x1, y1, x2, y2, walls) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(dist / 8));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    for (const wall of walls) {
      if (x >= wall.x && x <= wall.x + wall.w && y >= wall.y && y <= wall.y + wall.h) return true;
    }
  }
  return false;
}

export function smokeBlocks(x1, y1, x2, y2, smokes) {
  for (const smoke of smokes) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(dist / 8));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      if (Math.hypot(x - smoke.x, y - smoke.y) < 70) return true;
    }
  }
  return false;
}

export class Guard {
  constructor(spec) {
    this.x = spec.x;
    this.y = spec.y;
    this.waypoints = spec.waypoints;
    this.wpIndex = 1 % spec.waypoints.length;
    this.dir = Math.atan2(
      spec.waypoints[this.wpIndex].y - spec.y,
      spec.waypoints[this.wpIndex].x - spec.x,
    );
    this.pauseTimer = 0;
    this.scanAngle = 0;
    this.suspicion = 0;
    this.alerted = false;
    this.radius = GUARD_RADIUS;
  }

  canSee(thief, walls, smokes) {
    const dx = thief.x - this.x;
    const dy = thief.y - this.y;
    const dist = Math.hypot(dx, dy);
    const range = thief.sneaking ? GUARD_CONE_RANGE * 0.72 : GUARD_CONE_RANGE;
    if (dist > range) return false;
    if (Math.abs(angleDifference(Math.atan2(dy, dx), this.dir)) > GUARD_CONE_HALF_ANGLE) return false;
    if (thief.inSmoke) return false;
    if (lineBlocked(this.x, this.y, thief.x, thief.y, walls)) return false;
    if (smokeBlocks(this.x, this.y, thief.x, thief.y, smokes)) return false;
    return true;
  }

  update(dt, thief, walls, smokes) {
    const sees = this.canSee(thief, walls, smokes);
    if (sees) {
      this.suspicion = Math.min(1, this.suspicion + GUARD_SUSPICION_RISE * dt);
    } else {
      this.suspicion = Math.max(0, this.suspicion - GUARD_SUSPICION_FALL * dt);
    }
    this.alerted = this.suspicion >= 1;

    if (this.alerted) {
      // A guard who is sure closes in on the thief.
      const dx = thief.x - this.x;
      const dy = thief.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        this.dir = Math.atan2(dy, dx);
        this.x += (dx / dist) * GUARD_CHASE_SPEED * dt;
        this.y += (dy / dist) * GUARD_CHASE_SPEED * dt;
      }
      return;
    }

    if (this.pauseTimer > 0) {
      // Pause at a waypoint and sweep the room before moving on.
      this.pauseTimer -= dt;
      this.scanAngle += dt * 1.6;
      this.dir += Math.sin(this.scanAngle) * dt * 1.1;
      return;
    }

    const target = this.waypoints[this.wpIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
      this.pauseTimer = 1.4;
      this.scanAngle = 0;
      return;
    }
    this.dir = Math.atan2(dy, dx);
    this.x += (dx / dist) * GUARD_PATROL_SPEED * dt;
    this.y += (dy / dist) * GUARD_PATROL_SPEED * dt;
  }

  get coneRange() {
    return GUARD_CONE_RANGE;
  }

  get coneHalfAngle() {
    return GUARD_CONE_HALF_ANGLE;
  }
}
