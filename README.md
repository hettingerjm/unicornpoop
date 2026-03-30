# Unicorn Poop

A rainbow trail game for the whole family! Control a magical unicorn and outlast the NPC unicorns while avoiding all the rainbow poop trails.

## How to Run

### macOS
Double-click `index.html` or run:
```bash
open index.html
```
If that has issues, use a local server:
```bash
cd "Unicorn Poop"
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Mobile (iPhone / Android)
Serve the files from your Mac and open on your phone:
```bash
cd "Unicorn Poop"
python3 -m http.server 8000 --bind 0.0.0.0
```
Then on your phone, open `http://<your-mac-ip>:8000` (both devices must be on the same Wi-Fi). The game auto-detects touch and shows an on-screen d-pad.

## How to Play

- **You** are the white unicorn with the golden glow
- Move around and leave rainbow poop behind you
- **Avoid** hitting any poop trail (yours or theirs) and the walls
- **Outlast** all NPC unicorns to win!
- When an NPC crashes, its trail fades away

## Controls

### Keyboard (desktop)
| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move |
| Esc / P | Pause |
| M | Toggle sound |
| F | Toggle fullscreen |
| Enter / Space | Start game / Return to menu |
| R | Quick restart (from game over or win) |

### Touch (mobile)
| Action | How |
|--------|-----|
| Move | D-pad (bottom-left) or swipe anywhere |
| Start / Restart | Tap the screen |
| Pause | Tap the pause button (top-right) |
| Resume | Tap anywhere |
| Toggle sound | Tap the sound button (top-right) |

## Project Structure

```
index.html  - HTML shell with canvas element
style.css   - Layout, centering, fullscreen support
game.js     - All game logic (~700 lines)
README.md   - This file
```

## Tweaking Gameplay

Open `game.js` and edit the **SETTINGS** section at the very top:

```js
const GRID_SIZE = 16;             // Cell size in pixels (smaller = more cells)
const MOVE_INTERVAL = 100;        // Ms between moves (lower = faster)
const NPC_COUNT = 3;              // Number of NPC unicorns (1-4)
const COUNTDOWN_SECONDS = 3;      // Pre-game countdown length
const TRAIL_FADE_DURATION = 1500; // How long dead NPC trails take to fade (ms)
const NPC_LOOKAHEAD = 5;          // How smart NPCs are (higher = smarter)
const NPC_MISTAKE_CHANCE = 0.04;  // How often NPCs make random moves (0-1)
```

## Tech

- Pure HTML + CSS + vanilla JavaScript
- Canvas API for rendering
- Web Audio API for sound effects (no audio files)
- Responsive layout with mobile touch support (d-pad + swipe)
- No frameworks, no build step, no dependencies
