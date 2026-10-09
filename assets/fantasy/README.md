# Fantasy art direction

The aim is a cohesive, tactile fantasy arena: pearl ceramic characters, soft gold highlights, pastel mane colors, moonlit water, and sculpted rainbow trails. The artwork is rendered 3D imagery used on a 2D canvas; the game is not a realtime 3D engine.

## Research applied

- [Designing Game Feel: A Survey](https://arxiv.org/abs/2011.09201) organizes game feel around physicality, amplification, and support. The implementation preserves responsive buffered steering and interpolation, then adds gallop poses, turn lean, pickup reactions, dash echoes, and native cooldown feedback.
- [GDC: Juice It or Lose It](https://www.gdcvault.com/play/1016487/Juice-It-or-Lose) describes polish through animation, sound, and particles. Pickups now have brief star rings and score text, abilities have expanding accents, and soft bell harmonics match the visual materials.
- [GDC: Game Feel—Why Your Death Animation Sucks](https://www.gdcvault.com/play/1022759/Game-Feel-Why-Your-Death) emphasizes responsive feedback and death presentation. A brief character dissolve and crash marker precede the results by 700 ms, with immediate results for reduced motion. Recording rewards remains immediate and idempotent.
- [GDC: Fluid and Powerful Animation within Frame Restrictions](https://www.gdcvault.com/play/1020017/Animation-Bootcamp-Fluid-and-Powerful) describes strong poses and timing under tight frame budgets. An eight-frame gallop changes the actual leg poses; animation speeds up during Burst. We reviewed the public session summaries, not the full recordings.
- [Riot VFX Style Guide](https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/) balances clarity, clutter, theme, and delight. Fresh trails use hollow rings; hazardous trails use solid swirls; the player has a gold ground ring and heading arrow. Motes, effects, and material variants are bounded, with subdued background contrast.

Mobile play uses the whole viewport with a larger world and a smooth following camera. Rotation transforms cell ownership, trail ages, heads, pickups, queued input, companions, and effects together; a live round pauses so the player can reorient. Portrait and landscape were checked in the browser at 390×844 and 844×390. These checks do not substitute for testing Safari on a physical iPhone.

## Assets

Generated with the built-in image generation tool. Original PNG outputs are copied unchanged; gameplay crops the animation atlases at runtime. The master unicorn, atlases, and puppy have transparent backgrounds. Six saved player avatar IDs retain palette filters on the pearl character so existing saves remain compatible. Enemies instead use six independent models with different silhouettes, materials, and gallop poses. Enemy atlases are 1774×887 RGBA images, four columns by two rows, loaded as each wave needs them. The new assets used built-in imagegen edit mode with `unicorn-gallop.png` as their reference and a transparent background.

| File | Use |
|---|---|
| unicorn-pearl.png | Home, wardrobe, idle and reduced-motion pose |
| unicorn-gallop.png | Eight gameplay frames, four columns and two rows |
| puppy-star.png | Companion portrait and following puppy |
| moonlit-lagoon.png | Cached overhead arena texture; three palette treatments |
| rival-sprout.png | Shaggy woodland rival; eight gallop frames |
| rival-frost.png | Faceted ice-crystal rival; eight gallop frames |
| rival-ember.png | Armored fire rival and Charger boss; eight gallop frames |
| rival-luna.png | Celestial rival and Phantom boss; eight gallop frames |
| rival-bubble.png | Plush candy-cloud rival; eight gallop frames |
| rival-clockwork.png | Brass robot rival; eight gallop frames |

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


### Six rival gallop atlases

Reference for every edit: `unicorn-gallop.png`. Each exact prompt is the shared prefix below followed by the corresponding character suffix, including the separating space. Tool mode: built-in imagegen edit; transparent background.

Shared prefix:

Use case: style-transfer. Asset type: production-ready transparent eight-frame character animation atlas for a mobile fantasy arena game. Edit the attached animation atlas: preserve its premium 3D rendering, right-facing slightly overhead side view, eight-frame 4-column by 2-row structure, and distinct successive gallop poses, but replace the unicorn in EVERY cell with the new enemy design described below. This must be a different character silhouette and materials, not a color-filter variant of the pearl unicorn. Exactly eight characters, one complete character inside each square cell, with the same body center and scale. Give every cell at least 10% transparent padding around the entire horn, tail, hooves, and gear; nothing may cross cell boundaries. Four equal columns and two equal rows in one landscape 2:1 image, no drawn dividers. Preserve real alpha transparency. Soft upper-left lighting, polished premium stylized 3D game render, exceptionally readable at small mobile sizes, charming rather than scary. No checkerboard, floor, cast shadow outside the character, scenery, text, frame numbers, UI, pixel art, or outlines.

#### Sprout → rival-sprout.png

New character: SPROUT, a round shaggy little woodland unicorn pony, cream-caramel body covered in soft short velvety fur, noticeably stockier and more plush than the reference, tufts around thick hooves, enormous moss-green fluffy curled mane and bushy tail with tiny sculpted pale-green leaves. A small branched wooden horn shaped like a single budding twig, cheerful emerald eyes, freckles, tiny leaf-shaped ears and a woven-vine collar. Strong compact fluffy silhouette and green mane, warm natural organic materials, no pink/lilac flowing mane, no white ceramic body. Gallop legs must visibly move through all eight frames.

#### Frost → rival-frost.png

New character: FROST, a slender long-legged ice-crystal unicorn with a sleek angular pale-azure translucent glass body, a faceted sapphire chest and icy fetlock cuffs, a short upright spiky turquoise crystal mane and short jagged shard tail rather than flowing hair. Tall swept-back geometric silver horn, small alert deep-blue eyes, sharper long muzzle, a crystalline shoulder fin. Strong lean geometric silhouette, icy blue and frosted silver materials with controlled highlights. No fluffy fur, no curly mane, no pink/lilac mane, no white ceramic pony. All eight frames show this same distinct crystalline unicorn galloping.

#### Ember → rival-ember.png

New character: EMBER, a sturdy russet-red armored unicorn knight, short powerful legs and broad muscular chest, dark copper satin body, sculpted bronze shoulder armor, bronze hoof boots, a thick swept-back charcoal horn with a glowing amber tip. A short swept flame-red spiky mohawk and compact fiery plume tail, bright golden eyes, confident determined friendly face with a square muzzle. Strong bulky knight silhouette and red-orange/copper palette, polished metal armor clearly different from the fluffy pearl reference. No flowing pastel hair, no ivory body, no scary teeth, no weapon. Same distinct armored unicorn through all eight gallop frames.

#### Luna → rival-luna.png

New character: LUNA, an elegant midnight-indigo celestial winged unicorn, sleek velvet-blue body with a few tiny silver star speckles, a short swept-back silver crescent-shaped horn, bright icy silver eyes, narrow regal muzzle, straight swept silver-blue mane and slender comet tail. Two small folded feathered wings on the shoulders, clearly feather shapes but compact enough to fit each frame with padding; no huge flying wings. Slim graceful dark silhouette and silver accents, distinct from the white pearl pony. An elegant silver crescent collar. Same character in all eight gallop frames. No pink/lilac curls, no white ceramic body.

#### Bubble → rival-bubble.png

New character: BUBBLE, a very round, squat candy-cloud unicorn pony with a soft dusty-pink plush body, very short legs, puffy bubble-shaped hooves, a single tiny twisted candy-cane horn in cream and coral. A giant rounded cotton-candy cloud mane in blush-pink and cream, fluffy pompom tail, tiny oval mint-green eyes and a tiny button-like muzzle. A pastel candy-bead collar. Completely different marshmallow-shaped silhouette, soft flocked toy material, no flowing lilac/blue mane, no white ceramic body. Preserve all eight running poses with visibly moving short legs, broad rounded clouds and a small horn wholly inside each frame.

#### Clockwork → rival-clockwork.png

New character: CLOCKWORK, an adorable brass automaton unicorn with a mechanical geometric body, articulated rounded metal legs with visible circular joints, broad bronze hoof plates, a brushed-gold rectangular chest with a small engraved gear motif, a short conical polished brass horn. A segmented teal metal fin mane and jointed brass-and-teal tail rather than hair, a single large luminous aqua lens eye and compact rounded-square muzzle. Small rivets, brass/teal metallic material, rounded friendly toy robot design, clearly mechanical in silhouette. No ivory fur or ceramic body, no curly or flowing pastel hair, no real horse flesh. Preserve the same robot design in eight visibly different mechanical gallop poses. All full bodies, horns and tails fit inside equal cells.

## Practical limits

Sprites remain right-facing billboards, flipped for left/up travel, with a heading arrow for the player's actual direction. The puppy uses procedural bounce and tilt rather than an eight-frame leg cycle. The generated atlas has slight pose variation in body placement; the crop grid and full loop are verified by tests. The three worlds share one base texture with palette changes. A future realtime 3D version would need a rigged mesh and a new renderer.
