// Wall cameras: fixed to a wall, sweeping a vision cone back and forth.
// A camera that sees the thief drives the alarm up fast. An EMP pulse
// knocks every camera out for a few seconds.
import { CAMERA_CONE_RANGE, CAMERA_CONE_HALF_ANGLE } from './config.js';
import { angleDifference, lineBlocked, smokeBlocks } from './guards.js';

export class Camera {
  constructor(spec) {
    this.x = spec.x;
    this.y = spec.y;
    this.baseAngle = spec.baseAngle;
    this.sweep = spec.sweep;
    this.speed = spec.speed;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = spec.baseAngle;
    this.disabledTimer = 0;
    this.seeing = false;
  }

  get disabled() {
    return this.disabledTimer > 0;
  }

  canSee(thief, walls, smokes) {
    if (this.disabled) return false;
    const dx = thief.x - this.x;
    const dy = thief.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > CAMERA_CONE_RANGE) return false;
    if (Math.abs(angleDifference(Math.atan2(dy, dx), this.angle)) > CAMERA_CONE_HALF_ANGLE) {
      return false;
    }
    if (thief.inSmoke) return false;
    if (lineBlocked(this.x, this.y, thief.x, thief.y, walls)) return false;
    if (smokeBlocks(this.x, this.y, thief.x, thief.y, smokes)) return false;
    return true;
  }

  update(dt, time, thief, walls, smokes) {
    if (this.disabledTimer > 0) this.disabledTimer -= dt;
    this.angle = this.baseAngle + Math.sin(time * this.speed + this.phase) * this.sweep;
    this.seeing = this.canSee(thief, walls, smokes);
  }

  get coneRange() {
    return CAMERA_CONE_RANGE;
  }

  get coneHalfAngle() {
    return CAMERA_CONE_HALF_ANGLE;
  }
}
