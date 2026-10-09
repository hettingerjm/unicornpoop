# Fantasy art direction

The aim is a cohesive, tactile fantasy arena: pearl ceramic characters, soft gold highlights, pastel mane colors, moonlit water, and sculpted rainbow trails. The artwork is rendered 3D imagery used on a 2D canvas; the game is not a realtime 3D engine.

## Research applied

- [Designing Game Feel: A Survey](https://arxiv.org/abs/2011.09201) organizes game feel around physicality, amplification, and support. The implementation preserves responsive buffered steering and interpolation, then adds gallop poses, turn lean, pickup reactions, dash echoes, and native cooldown feedback.
- [GDC: Juice It or Lose It](https://www.gdcvault.com/play/1016487/Juice-It-or-Lose) describes polish through animation, sound, and particles. Pickups now have brief star rings and score text, abilities have expanding accents, and soft bell harmonics match the visual materials.
- [GDC: Game Feel—Why Your Death Animation Sucks](https://www.gdcvault.com/play/1022759/Game-Feel-Why-Your-Death) emphasizes responsive feedback and death presentation. A brief character dissolve and crash marker precede the results by 700 ms, with immediate results for reduced motion. Recording rewards remains immediate and idempotent.
- [GDC: Fluid and Powerful Animation within Frame Restrictions](https://www.gdcvault.com/play/1020017/Animation-Bootcamp-Fluid-and-Powerful) describes strong poses and timing under tight frame budgets. An eight-frame gallop changes the actual leg poses; animation speeds up during Burst. We reviewed the public session summaries, not the full recordings.
- [Riot VFX Style Guide](https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/) balances clarity, clutter, theme, and delight. Fresh trails use hollow rings; hazardous trails use solid swirls; the player has a gold ground ring and heading arrow. Motes, effects, and material variants are bounded, with subdued background contrast.

Mobile play uses the whole viewport and a board sized for the screen. Rotation transforms cell ownership, trail ages, heads, pickups, queued input, companions, and effects together; a live round pauses so the player can reorient. Portrait and landscape were checked in the browser at 390×844 and 844×390. These checks do not substitute for testing Safari on a physical iPhone.

## Assets

Generated with the built-in image generation tool. Original PNG outputs are copied unchanged; gameplay crops the animation atlas at runtime. The master unicorn, atlas, and puppy have transparent backgrounds. Six saved avatar IDs are retained, using palette filters on the same character so existing saves remain compatible.

| File | Use |
|---|---|
| unicorn-pearl.png | Home, wardrobe, idle and reduced-motion pose |
| unicorn-gallop.png | Eight gameplay frames, four columns and two rows |
| puppy-star.png | Companion portrait and following puppy |
| moonlit-lagoon.png | Cached overhead arena texture; three palette treatments |

## Exact generation prompts

### Unicorn master

Use case: stylized-concept. Asset type: production-ready transparent game character sprite for a polished mobile fantasy arcade game called Unicorn Poop. Create ONE adorable premium stylized 3D unicorn, in a clear right-facing side view with a slight overhead angle, full body and every hoof visible. Pearlescent ivory rounded body, large glossy violet expressive eye, small blush cheeks, a sculpted flowing lilac-pink-turquoise mane and tail, small warm gold spiral horn and subtly lavender hooves. Charming handcrafted toy-like 3D material, silky ceramic highlights, ambient occlusion, exceptionally clean silhouette. A lively forward galloping pose, short stout legs, beautiful readable at small sizes. Center the entire unicorn in the square image with 12% empty transparent margin; unicorn fills about 78% of width. Lighting is soft studio upper left. Genuinely transparent alpha background, no floor, no shadow outside the character, no text, no UI, no pixel art, no outlines, no accessories, no scenery, no second character. This is a character asset, not a mockup. Make it delightful and expensive looking.

### Lagoon

Use case: stylized-concept. Asset type: seamless-feeling premium fantasy mobile game arena background, landscape 16:9. A directly overhead orthographic view of a magical moonlit lagoon, polished stylized 3D game art. Deep midnight teal and indigo opalescent water floor in the central 85% of the image, spacious, calm, dark and intentionally uncluttered so colorful characters and glowing rainbow trails are very readable over it. Fine subtle watery caustics, soft gradients, atmospheric reflected aurora light. Along the extreme edges only: exquisitely sculpted lavender crystal clusters, tiny luminous flowers, rounded mossy stones, frosted lilac foliage, delicate scattered gold star motes. No horizon, no perspective vanishing point, no sky. Stronger highlights at upper left, misty jewel tones, refined cozy fantasy atmosphere. No buildings, no characters, no UI, no text, no grid, no tiles, no paths or obstacles through the playable center. This is the real background texture for an arcade game, not a screenshot or mockup. Premium art direction, lush edges, beautifully quiet center.

### Puppy

Use case: stylized-concept. Asset type: transparent companion character sprite for a premium cozy fantasy mobile game. One adorable small golden cream puppy, full-body right-facing side view with a slight overhead angle, all paws visible, playful mid-run pose with floppy ears and a wagging curled tail, tiny cheerful open mouth and pink tongue, oversized glossy chocolate eyes. A small lilac collar with a polished golden star charm. Rounded sculpted toy-like premium 3D game aesthetic, soft luxurious fur material with smooth readable contours, pearlescent warm highlights and gentle ambient occlusion. Same visual world as a pearl white unicorn with pastel lilac/pink/teal mane. Centered in a square canvas with 12% transparent margin. Genuinely transparent alpha background. No floor, no cast shadow outside the character, no scenery, no text, no UI, no pixel art, no outlines, no extra characters. Clear silhouette readable as a tiny game companion, delightful polished 3D render.

### Gallop atlas

Reference: unicorn-pearl.png

Use case: stylized-concept. Asset type: an actual 8-frame transparent sprite sheet for an animated game character. Use the attached unicorn as the exact character reference: keep its pearlescent ivory body, gold horn, violet eye, pastel sculpted mane, proportions and polished 3D shading consistent. Output ONE landscape image with EXACTLY FOUR equal columns and TWO equal rows, eight identical-sized square frame cells, no drawn dividers. Each cell contains the full unicorn, facing RIGHT in the same side-view camera, centered at the exact same body position and same scale. Body occupies 78% of each cell width, with full transparent margin, all hooves and horn inside the cell. Read in order left to right, top row then bottom row: eight successive phases of a loopable gallop: 1 forelegs reaching forward hindlegs pushing backward; 2 legs landing; 3 legs under body; 4 legs folded tuck; 5 compact flight suspension; 6 forelegs unfolding forward hindlegs unfolding back; 7 fully extended leap; 8 hindlegs begin landing. Legs MUST visibly change between frames, plus flowing mane/tail follow-through; keep head/body size and placement perfectly stable. Real alpha transparent background in every cell, NO checkerboard, NO shadows on a floor, NO text or labels, NO scenery, NO UI. This will be cropped automatically by a game engine at the exact 4x2 grid boundaries. High quality soft 3D character animation sprite atlas, not pixel art. Do not repeat identical poses.

## Practical limits

Sprites remain right-facing billboards, flipped for left/up travel, with a heading arrow for the player's actual direction. The puppy uses procedural bounce and tilt rather than an eight-frame leg cycle. The generated atlas has slight pose variation in body placement; the crop grid and full loop are verified by tests. The three worlds share one base texture with palette changes. A future realtime 3D version would need a rigged mesh and a new renderer.

