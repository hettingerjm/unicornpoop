# Unicorn Poop

A rainbow trail arena by Sophia and John. Pick your unicorn, bring a pup, and outlast your rivals.

## Run on a new computer

The game has no dependencies or build step. From this folder, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser. Keep using the same browser and address to keep your local progress. GitHub authentication is only needed to publish code changes.

For a phone on the same Wi-Fi, serve with `python3 -m http.server 8000 --bind 0.0.0.0` and open `http://<your-mac-ip>:8000`. Menus work in portrait; rotate to landscape for the arena.

## Play

- Your unicorn has a gold ring and a **YOU** label at the start.
- Fresh trails show soft dots and can be crossed for **0.9 seconds**. Solid tiles are dangerous. Revisiting a trail does not refresh its safe window.
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
game.js                Simulation, collisions, rendering, audio, and save data
ui.js                  Native menus, practice guide, live HUD, and save transfer
assets/                Unicorn and accessory artwork
tests/game.test.cjs    Engine regression checks
```

The engine uses a fixed simulation clock and independent movement timers for each unicorn. Visual interpolation smooths movement without changing the collision grid. Pausing freezes trail aging; speed perks affect only the player. Burst shares ordinary movement's collision and perk rules.

## Development checks

Optional: with Node.js installed, run:

```bash
node --test tests/game.test.cjs
```

The tests exercise the actual engine with drawing/audio mocked: refresh-rate-independent scoring, paused trail aging, loop prevention, buffered turns, head collisions, burst/ghost interactions, crash saves, bosses, Score Attack, practice, and save migration.

Static assets have a version query in `index.html`; bump it when shipping changes so browsers fetch a consistent set of scripts and styles.
