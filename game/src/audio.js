// Tiny synthesised sound effects, made with the Web Audio API so the game
// needs no audio files: a blip for loot, a soft tick while cracking the
// case, a rising alarm tone when the meter runs hot, and a short jingle
// for a clean getaway. Nothing plays until the player first interacts,
// which is when the browser allows audio to start.
export class SoundEffects {
  constructor() {
    this.context = null;
    this.muted = false;
    this.lastAlarmBeep = 0;
  }

  ensure() {
    if (!this.context) {
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        this.context = null;
      }
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  tone(frequency, seconds, type, gainValue, when = 0) {
    if (!this.context || this.muted) return;
    const start = this.context.currentTime + when;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }

  pickup() {
    this.tone(880, 0.12, 'sine', 0.12);
    this.tone(1320, 0.16, 'sine', 0.1, 0.07);
  }

  diamond() {
    this.tone(523, 0.14, 'triangle', 0.14);
    this.tone(659, 0.14, 'triangle', 0.14, 0.1);
    this.tone(784, 0.22, 'triangle', 0.14, 0.2);
  }

  crackTick() {
    this.tone(1400, 0.04, 'square', 0.04);
  }

  smoke() {
    this.tone(220, 0.35, 'sine', 0.08);
  }

  emp() {
    this.tone(180, 0.3, 'sawtooth', 0.1);
    this.tone(90, 0.4, 'sawtooth', 0.08, 0.12);
  }

  caught() {
    this.tone(220, 0.25, 'sawtooth', 0.16);
    this.tone(165, 0.25, 'sawtooth', 0.16, 0.2);
    this.tone(110, 0.5, 'sawtooth', 0.16, 0.4);
  }

  getaway() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, index) => this.tone(note, 0.18, 'triangle', 0.13, index * 0.11));
  }

  alarmBeep(time) {
    if (time - this.lastAlarmBeep < 0.9) return;
    this.lastAlarmBeep = time;
    this.tone(980, 0.12, 'square', 0.05);
  }
}
