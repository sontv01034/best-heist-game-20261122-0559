# The Gilded Vault

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/sontv01034/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/sontv01034/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A complete heist game for the make.fun bounty of the same name. You are Wren, a thief crossing three guarded galleries after dark. Steal the Sunspire Diamond in each room and slip out the west door before the alarm hits 100%.

## How to play

Open `game/index.html` from any static server (for example `python3 -m http.server` inside `game/`) in desktop Chrome. No build step, no network request.

- **WASD / arrow keys** — move · **click the floor** — walk there · **Shift** — sneak (slower, harder to spot)
- **E (hold)** — crack the diamond display case
- **1** — smoke pellet (blocks sight for 6s) · **2** — EMP (kills cameras for 8s, but adds 8% alarm)
- **Enter** — start / next gallery · **R** — retry a room

## The heist

- **Three galleries**, each a single room fully visible in one frame: the Meridian Gallery, the Hall of Coins and the Vault of Kings, with more guards and cameras each time.
- **Guards** patrol with sweeping red vision cones; a guard who spots you grows suspicious, then chases. **Cameras** sweep violet cones from the walls and drive the alarm up fast.
- **Alarm meter** (top bar): rises while you are seen, bleeds down while you are hidden. At 100% the run is over.
- **Tools at a cost**: two smoke pellets and one EMP per room, and the EMP itself feeds the alarm. Walls and smoke block line of sight, and several routes cross every room.
- **Loot**: the Sunspire Diamond ($500, needs a 1.6s crack) plus side loot ($120 each) for cash and a time bonus against each room's par.
- **Getaway**: grab the diamond, reach the green west door, and the next gallery opens. Clear all three for the final take.

## Layout

- `game/index.html` — the page; `game/src/main.js` — game state and loop
- `game/src/levels.js` — the three gallery layouts
- `game/src/thief.js` — movement, tools, loot grabbing
- `game/src/guards.js` — patrols, vision cones, line of sight
- `game/src/cameras.js` — sweeping cameras
- `game/src/alarm.js` — the alarm meter
- `game/src/render.js` — canvas drawing: HUD, room, screens
- `game/src/audio.js` — synthesised sound effects (Web Audio, no files)
- `game/src/input.js` — keyboard and mouse
- `game/src/scenes.js` — staged screenshot scenes (`?scene=cover|loot|alarm|win`)
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

All art, names and sounds are original, drawn and synthesised in code.
