// Keyboard and mouse input for The Gilded Vault. WASD or arrow keys move
// the thief, Shift sneaks, E holds to crack the display case, 1 drops a
// smoke pellet, 2 fires the EMP. A mouse click on the floor sets a move
// target; a click on a HUD tool button uses that tool.
import { HUD_H } from './config.js';

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.moveTarget = null; // {x, y} in room coordinates, or null
    this.clickedTool = null; // 'smoke' | 'emp' | null, consumed by the game
    this.pressedEnter = false;
    this.pressedRestart = false;
    this.mouse = { x: 0, y: 0 };

    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }
      if (event.repeat) return;
      this.keys.add(event.key.toLowerCase());
      if (event.key === 'Enter') this.pressedEnter = true;
      if (event.key.toLowerCase() === 'r') this.pressedRestart = true;
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('mousedown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      if (y < HUD_H) {
        // HUD tool buttons live in the top bar; the game reads the click.
        if (x > 640 && x < 760) this.clickedTool = 'smoke';
        else if (x > 770 && x < 890) this.clickedTool = 'emp';
        return;
      }
      this.moveTarget = { x, y: y - HUD_H };
    });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  get sneaking() {
    return this.keys.has('shift');
  }

  get grabbing() {
    return this.keys.has('e');
  }

  get running() {
    return this.keys.has(' ');
  }

  consumeEnter() {
    const value = this.pressedEnter;
    this.pressedEnter = false;
    return value;
  }

  consumeRestart() {
    const value = this.pressedRestart;
    this.pressedRestart = false;
    return value;
  }

  consumeToolClick() {
    const value = this.clickedTool;
    this.clickedTool = null;
    return value;
  }

  clearMoveTarget() {
    this.moveTarget = null;
  }
}
