// The alarm meter: the single number the whole heist hangs on. Being seen
// by a suspicious guard or a live camera pushes it up; staying out of sight
// lets it bleed back down. At 100 the alarm trips and the run is over.
import { ALARM_MAX, ALARM_DECAY, ALARM_GUARD_RATE, CAMERA_ALARM_RATE } from './config.js';

export class Alarm {
  constructor() {
    this.value = 0;
    this.peak = 0;
  }

  add(amount) {
    this.value = Math.min(ALARM_MAX, this.value + amount);
    this.peak = Math.max(this.peak, this.value);
  }

  update(dt, guards, cameras) {
    let pressure = 0;
    for (const guard of guards) {
      if (guard.alerted) pressure += ALARM_GUARD_RATE;
      else if (guard.suspicion > 0.4) pressure += ALARM_GUARD_RATE * guard.suspicion * 0.4;
    }
    for (const camera of cameras) {
      if (camera.seeing) pressure += CAMERA_ALARM_RATE;
    }
    if (pressure > 0) {
      this.add(pressure * dt);
    } else {
      this.value = Math.max(0, this.value - ALARM_DECAY * dt);
    }
  }

  get tripped() {
    return this.value >= ALARM_MAX;
  }

  get level() {
    if (this.value < 30) return 'quiet';
    if (this.value < 65) return 'tense';
    return 'critical';
  }

  reset() {
    this.value = 0;
    this.peak = 0;
  }
}
