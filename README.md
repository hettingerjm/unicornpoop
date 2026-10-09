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
- Explore the larger world with a smooth camera that looks ahead of your unicorn. The minimap shows the whole arena, your camera view, rivals, and hearts; arrows point toward offscreen rivals. Avoid arena edges and other unicorns' heads. Dead rivals' trails fade out.
- Clear every rival **or survive the wave timer** to advance. Regular waves last 35–55 seconds; boss waves require defeating the boss. After a loss, retry the same wave, or choose an unlocked starting wave on the home screen.
- Hearts bank a **spare life**, up to three per round. A crash spends one and gives **1.4 seconds of safety** to cross solid poop; boundary crashes turn you toward an escape. Hearts work alongside Ghost Mode and equipment perks. Stars and gems build score and multiplier. Every three pickups earn a Rainbow Point; winning gives extra points.
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

## Difficulty and bosses

Early waves raise one main challenge at a time: two rivals in waves 1–2, then three in waves 3–4. Five-wave chapters build toward a boss and ease the movement pace afterward. Classic movement interval decreases from 110ms toward a floor of 86ms before device and mode scaling; rival count caps at six, lookahead at eight, and mistakes at a nonzero floor. Later chapters vary rival personalities. Rivals forecast fresh poop hardening along a path and avoid stepping into a stationary head. Starting rivals no longer spawn on a direct collision course with the player.

Every fifth Classic/Chill/Speed wave is a boss encounter. Boss Rush alternates Charger and Phantom every wave. Health rises from two to six rather than eventually requiring twelve hits. Bosses pursue the player, display a warning for 1.2 seconds, commit to an attack, then offer a 1.8-second recovery window. Larger bosses accelerate their cycles below half health without shortening the warning.

- **Charger:** a marked lane shows its locked charge direction. Dodge or bait it into hardened poop or the arena boundary. Patrols turn at the boundary without losing health.
- **Phantom:** a violet ring announces its landing. It lands at least seven grid steps from you in a clear patch, rechecks safety before committing, and cancels unsafe warps. Teleporting resets interpolation so the sprite does not streak across the world.
- **Splat:** hits a boss within three cells of the splat center, two cells behind you. Boss hits stun, open a small escape pocket, and have a 0.9-second cooldown so one blocked cell cannot drain several health points instantly.

The camera framing work draws on [Squirrel Eiserloh's GDC camera session](https://www.gdcvault.com/play/1023557/Math-for-Game-Programmers-Juicing). The boss warning → attack → recovery structure follows the encounter-design pattern in [Beca Vessal's GDC slides](https://media.gdcvault.com/gdc2023/Slides/CraftingEpicBoss_Vessal_Beca.pdf). Specific timings and mechanics here are this game's own tuning decisions.

The larger arena initially caused some early automated rounds to remain unresolved at 90 seconds. Survival objectives now cap regular waves at 35–55 seconds while retaining faster clears through defeating rivals. `node tests/balance.cjs` runs 40 deterministic seeds at each of ten representative waves with a simple space-seeking bot. This is a pacing/stability stress check, not a human win-rate study; real difficulty still benefits from player feedback. Boss encounters deliberately have no automatic survival win.

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
tests/game.test.cjs    Engine and presentation regression checks
tests/harness.cjs      Seeded browser/audio mock around the real engine
tests/balance.cjs      400-run deterministic pacing stress check
```

The engine uses a fixed simulation clock and independent movement timers for each unicorn. Visual interpolation smooths movement without changing the collision grid. Pausing freezes trail aging; speed perks affect only the player. Burst shares ordinary movement's collision and perk rules. The world is 66×44 cells in landscape and 44×66 in portrait on every device. The camera shows 24 cells on a phone's short side and 30 on desktop, with intervals scaled for cell size. Characters are slightly smaller within that view, preserving readability while making room for movement. Camera interpolation uses elapsed time, stays inside the world, freezes on pause, and follows bursts. Rotation preserves hazards, hearts, queued turns, boss warnings, and teleport destinations. The canvas uses the full viewport and caps its backing resolution at 2× device pixels.

The fantasy presentation uses transparent 3D-rendered sprites on a 2D canvas, an eight-frame gallop, idle breathing, turn lean, pickup hops, dash echoes, companion bounce, sculpted trail materials, and soft bell sounds. Three world palettes change every three waves. Offscreen trails and characters are culled. Arena textures and trail stamps are cached; transient effects are capped at 40. Reduced motion disables decorative animation and gives immediate results. Read the [art direction and generation prompts](assets/fantasy/README.md).

## Development checks

Optional: with Node.js installed, run:

```bash
node --test tests/game.test.cjs
```

The 49 tests exercise the actual engine and fantasy renderer with browser drawing/audio mocked: refresh-rate-independent scoring, paused trail aging, loop prevention, buffered turns, head collisions, burst/ghost interactions, crash saves, bosses, Score Attack, practice, save migration, larger mobile worlds, bounded camera motion, timed wave objectives, heart lives and rescue windows, AI trail-hardening predictions, boss attack warnings, safe Phantom landings, damage cooldowns, Splat damage, reversible live rotation, immediate swipe steering, finger-sized D-pad geometry, atlas cropping, reduced motion, bounded effect caches, and artwork loading recovery.

Static assets have a version query in `index.html`; bump it when shipping changes so browsers fetch a consistent set of scripts and styles.
