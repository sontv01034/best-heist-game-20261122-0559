// Level layouts for The Gilded Vault. Each level is one room the thief
// crosses: walls are cover that block sight and movement, guards patrol
// between waypoints, cameras sweep from the walls, small loot tempts the
// thief off the direct line, and the diamond sits in a guarded display case.
// The exit door only opens once the diamond is taken.
import { ROOM_W, ROOM_H } from './config.js';

// A wall is a rectangle in room coordinates. Keep a 24px margin clear of
// the room edge so the thief can always slip around the outside.
export const LEVELS = [
  {
    name: 'The Meridian Gallery',
    briefing:
      'One guard, one camera. Learn the cones: cross behind the cases, lift the Sunspire Diamond, slip out the west door.',
    start: { x: 60, y: 580 },
    exit: { x: 8, y: 300, w: 26, h: 76 },
    walls: [
      { x: 200, y: 120, w: 180, h: 26 },
      { x: 200, y: 420, w: 180, h: 26 },
      { x: 560, y: 120, w: 180, h: 26 },
      { x: 560, y: 420, w: 180, h: 26 },
      { x: 400, y: 280, w: 40, h: 80 },
      { x: 520, y: 280, w: 40, h: 80 },
    ],
    diamond: { x: 480, y: 320 },
    smallLoot: [
      { x: 290, y: 250, kind: 'coin' },
      { x: 670, y: 390, kind: 'vase' },
      { x: 880, y: 90, kind: 'coin' },
    ],
    guards: [
      {
        x: 480, y: 180,
        waypoints: [
          { x: 480, y: 180 },
          { x: 480, y: 460 },
        ],
      },
    ],
    cameras: [
      { x: 940, y: 320, baseAngle: Math.PI, sweep: 0.7, speed: 0.45 },
    ],
    parSeconds: 75,
  },
  {
    name: 'The Hall of Coins',
    briefing:
      'Two guards cross-patrol the hall and two cameras sweep the vault. The smoke pellet buys a crossing; the EMP buys silence.',
    start: { x: 60, y: 580 },
    exit: { x: 8, y: 300, w: 26, h: 76 },
    walls: [
      { x: 170, y: 90, w: 26, h: 170 },
      { x: 170, y: 380, w: 26, h: 170 },
      { x: 470, y: 90, w: 26, h: 170 },
      { x: 470, y: 380, w: 26, h: 170 },
      { x: 740, y: 90, w: 26, h: 170 },
      { x: 740, y: 380, w: 26, h: 170 },
      { x: 330, y: 300, w: 140, h: 30 },
    ],
    diamond: { x: 880, y: 320 },
    smallLoot: [
      { x: 250, y: 320, kind: 'vase' },
      { x: 550, y: 130, kind: 'coin' },
      { x: 550, y: 510, kind: 'coin' },
      { x: 880, y: 90, kind: 'vase' },
    ],
    guards: [
      {
        x: 320, y: 320,
        waypoints: [
          { x: 320, y: 140 },
          { x: 320, y: 500 },
        ],
      },
      {
        x: 640, y: 320,
        waypoints: [
          { x: 640, y: 500 },
          { x: 640, y: 140 },
        ],
      },
    ],
    cameras: [
      { x: 940, y: 80, baseAngle: Math.PI * 0.75, sweep: 0.6, speed: 0.55 },
      { x: 940, y: 560, baseAngle: Math.PI * 1.25, sweep: 0.6, speed: 0.5 },
    ],
    parSeconds: 95,
  },
  {
    name: 'The Vault of Kings',
    briefing:
      'Three guards, three cameras, one diamond behind the densest patrol in the house. Take the long way round — the direct line is watched.',
    start: { x: 60, y: 580 },
    exit: { x: 8, y: 300, w: 26, h: 76 },
    walls: [
      { x: 150, y: 150, w: 200, h: 24 },
      { x: 150, y: 470, w: 200, h: 24 },
      { x: 610, y: 150, w: 200, h: 24 },
      { x: 610, y: 470, w: 200, h: 24 },
      { x: 420, y: 90, w: 120, h: 24 },
      { x: 420, y: 530, w: 120, h: 24 },
      { x: 420, y: 250, w: 120, h: 30 },
      { x: 420, y: 360, w: 120, h: 30 },
      { x: 420, y: 280, w: 30, h: 80 },
      { x: 510, y: 280, w: 30, h: 80 },
    ],
    diamond: { x: 480, y: 320 },
    smallLoot: [
      { x: 250, y: 320, kind: 'coin' },
      { x: 710, y: 320, kind: 'vase' },
      { x: 480, y: 60, kind: 'coin' },
      { x: 480, y: 580, kind: 'vase' },
      { x: 900, y: 320, kind: 'coin' },
    ],
    guards: [
      {
        x: 480, y: 130,
        waypoints: [
          { x: 280, y: 130 },
          { x: 680, y: 130 },
        ],
      },
      {
        x: 280, y: 510,
        waypoints: [
          { x: 280, y: 510 },
          { x: 680, y: 510 },
        ],
      },
      {
        x: 880, y: 320,
        waypoints: [
          { x: 880, y: 150 },
          { x: 880, y: 490 },
        ],
      },
    ],
    cameras: [
      { x: 20, y: 80, baseAngle: 0.5, sweep: 0.65, speed: 0.6 },
      { x: 940, y: 80, baseAngle: Math.PI * 0.6, sweep: 0.65, speed: 0.55 },
      { x: 480, y: 20, baseAngle: Math.PI * 0.5, sweep: 0.5, speed: 0.7 },
    ],
    parSeconds: 120,
  },
];

export function roomContains(x, y) {
  return x >= 16 && x <= ROOM_W - 16 && y >= 16 && y <= ROOM_H - 16;
}
