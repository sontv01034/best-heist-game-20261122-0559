// The Gilded Vault — a make.fun best-heist-game entry (Node 22, standard
// library only). The game is plain static files under game/ (index.html and
// its ES modules, no library, no network request), and this program hands
// it in: it copies game/ and screenshots/ from beside this file into the
// output directory and writes dossier.json there with the vendored make.fun
// library, so the judge can read the game from the dossier alone.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');

function fail(message) {
  throw new Error(`The Gilded Vault hand-in refused: ${message}`);
}

// The gate refuses more than 4 screenshots or one over 256 KiB, so check
// before copying anything: a bad hand-in should fail loudly here, not
// silently pass the dossier check with a dossier that disagrees.
const shots = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.'))
  : [];
if (shots.length < 3 || shots.length > 4) {
  fail(`expected 3 or 4 screenshots, found ${shots.length}`);
}

mkdirSync(outputDir, { recursive: true });
cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// Caps from the bounty gate: the dossier text is capped at 160 KiB, each
// screenshot at 256 KiB, game/ at 993 entries and 48 MiB, every game path
// at 1000 bytes. buildDossier enforces them and writes the dossier.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
