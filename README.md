# Unicorn Poop

A rainbow trail arena by Sophia and John. Pick your unicorn, bring a pup, and outlast your rivals.

**[Play the published game](https://hettingerjm.github.io/unicornpoop/)**

## Run on a new computer

The game has no dependencies or build step. From this folder, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser. Keep using the same browser and address to keep your local progress. GitHub authentication is only needed to publish code changes.

For a phone on the same Wi-Fi, serve with `python3 -m http.server 8000 --bind 0.0.0.0` and open `http://<your-mac-ip>:8000`. The arena fills the screen in portrait and landscape. Rotation pauses and rotates the existing board without losing your round. Use the fill-screen button where supported, or add the published game to your phone's home screen.

## Play

- Your unicorn has a gold ring, direction arrow, and a **YOU** label at the start. The character artwork extends beyond its collision cell; the arrow shows its heading.
- Fresh trails show soft rings and can be crossed for **0.9 seconds**. Solid rainbow swirls are dangerous. Revisiting a trail does not refresh its safe window.
- Avoid walls and other unicorns' heads. Dead rivals' trails fade out.
- Win to advance. After a loss, retry the same wave, or choose an unlocked starting wave on the home screen.
- Collect stars, gems, and hearts for score and multiplier boosts. Every three pickups earn a Rainbow Point. Winning gives extra points.
- Dogs unlock through matches and each has its own perk. Accessories are purchased with Rainbow Points.

Open **How to play → Practice arena** for a guided, nonlethal introduction. Practice does not award match rewards or spend your progress.

## Controls

| Keyboard | Action |
|---|---|
| Arrow keys / WASD | Steer; queue up to two turns |
| Space / Shift | Burst: faster movement and a wide trail |
| X / Z | Splat: hardened poop behind you, plus Burst when ready |
| Esc / P | Pause / resume |
| M | Toggle sound |
| F | Toggle fullscreen |
| Enter | Start / view rewards / return home |
| R | Retry or play the next wave after a round |

On touchscreens, swipe to steer and tap the ability buttons. An optional D-pad is available in Settings. Switching away from the game automatically pauses it.

## Modes

- **Classic:** progressive waves.
- **Chill:** slower movement.
- **Speed:** faster movement.
- **Boss Rush:** a boss every wave.
- **Score Attack:** survive for 60 seconds; defeated rivals return. Personal bests are saved per mode.

## Saves and comfort

In **Settings & saves**, export a JSON save and load it on another computer. This includes unlocks, currency, selected equipment, highest unlocked wave, and personal bests. Loading replaces the receiving browser's game progress. Older game saves migrate automatically. Invalid imported files leave existing progress intact.

Settings also offers reduced motion and an optional touch D-pad. Saves are local to your browser; there is no account or cloud sync.

## Project

```text
index.html             HTML shell and menu surfaces
style.css              Responsive menus, arena controls, and visual design
game.js                Simulation, collisions, input, and save data; fallback presentation
render.js              Fantasy artwork, gallop animation, cached materials, effects, and audio
ui.js                  Native menus, practice guide, live HUD, and save transfer
assets/fantasy/        Generated character atlas, companion, arena art, and art direction notes
assets/                Original unicorn and accessory artwork
tests/game.test.cjs    Engine regression checks
```

The engine uses a fixed simulation clock and independent movement timers for each unicorn. Visual interpolation smooths movement without changing the collision grid. Pausing freezes trail aging; speed perks affect only the player. Burst shares ordinary movement's collision and perk rules. Adaptive boards have 20 cells on a phone's short side and 30 on desktop, with intervals scaled for cell size. The canvas uses the full viewport and caps its backing resolution at 2× device pixels.

The fantasy presentation uses transparent 3D-rendered sprites on a 2D canvas, an eight-frame gallop, idle breathing, turn lean, pickup hops, dash echoes, companion bounce, sculpted trail materials, and soft bell sounds. Three world palettes change every three waves. Arena textures and trail stamps are cached; transient effects are capped at 40. Reduced motion disables decorative animation and gives immediate results. Read the [art direction and generation prompts](assets/fantasy/README.md).

## Development checks

Optional: with Node.js installed, run:

```bash
node --test tests/game.test.cjs
```

The 30 tests exercise the actual engine and fantasy renderer with browser drawing/audio mocked: refresh-rate-independent scoring, paused trail aging, loop prevention, buffered turns, head collisions, burst/ghost interactions, crash saves, bosses, Score Attack, practice, save migration, mobile geometry, reversible live rotation, immediate swipe steering, finger-sized D-pad geometry, atlas cropping, reduced motion, bounded effect caches, and artwork loading recovery.

Static assets have a version query in `index.html`; bump it when shipping changes so browsers fetch a consistent set of scripts and styles.
