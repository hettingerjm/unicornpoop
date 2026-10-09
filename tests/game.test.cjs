const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
const renderer = fs.readFileSync(path.join(__dirname, '..', 'render.js'), 'utf8');

// Run the real engine in isolation; browser drawing/audio are the only mocked surfaces.
function engine({ width = 1280, height = 720, touch = false, render = false, dpr = 1 } = {}) {
    const clock = { now: 10000 }, saved = {};
    const canvasEvents = {}, drawCalls = [];
    const gradient = { addColorStop() {} };
    const ctx = new Proxy({}, { get: (target, key) => target[key] || (key.startsWith('create') ? () => gradient : () => {}), set: (target, key, value) => (target[key] = value, true) });
    ctx.drawImage = (...args) => drawCalls.push(args);
    const canvas = { style: {}, addEventListener: (name, handler) => canvasEvents[name] = handler, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) };
    const context = vm.createContext({
        console, Math, JSON, performance: { now: () => clock.now },
        window: { innerWidth: width, innerHeight: height, devicePixelRatio: dpr, addEventListener() {} }, navigator: { maxTouchPoints: touch ? 5 : 0 },
        document: { createElement: () => ({ getContext: () => ctx }), getElementById: id => id === 'gameCanvas' ? canvas : { style: {} }, documentElement: { clientWidth: width, clientHeight: height }, body: { classList: { add() {}, remove() {} } }, addEventListener() {} },
        localStorage: { getItem: key => saved[key] || null, setItem: (key, value) => saved[key] = value },
        Image: class { constructor() { this.complete = true; this.naturalWidth = this.width = 120; this.naturalHeight = this.height = 110; } },
        requestAnimationFrame() {}, setTimeout() {},
    });
    vm.runInContext(source, context);
    if (render) vm.runInContext(renderer, context);
    const run = code => vm.runInContext(code, context);
    run('soundEnabled = false; startCountdown(); gameState = PLAYING; collectibles = []; powerups = [];');
    return { run, clock, saved, canvas, canvasEvents, drawCalls };
}
function advance(e, ms, frame = 20) { for (let t = 0; t < ms; t += frame) e.run(`updateGame(${Math.min(frame, ms - t)});`); }

for (const fps of [30, 60, 120, 144]) test(`equal survival scoring at ${fps} FPS`, () => {
    const e = engine();
    e.run('scoreMultiplier = 10; moveAllUnicorns = () => {}; spawnCollectible = () => {}; spawnPowerup = () => {};');
    for (let i = 0; i < fps * 10; i++) e.run(`updateGame(${1000 / fps});`);
    assert.ok(Math.abs(e.run('score') - 1000) < 0.0001);
    assert.equal(e.run('survivalTimer'), 10000);
});
test('pause freezes fresh trails even while wall time advances', () => {
    const e = engine();
    e.run('addTrailCell(unicorns[1], player.x + 1, player.y); togglePause();');
    const time = e.run('gameTime'); e.clock.now += 5000;
    e.run('updateGame(100);'); assert.equal(e.run('gameTime'), time);
    e.run('togglePause(); moveAllUnicorns([player]);'); assert.equal(e.run('player.alive'), true);
});
test('re-entering a fresh trail does not refresh its age or permit endless loops', () => {
    const e = engine();
    e.run('player.x = 10; player.y = 10; chooseNPCDirection = () => cycle; let cycle = "right";');
    for (let i = 0; i < 20 && e.run('player.alive'); i++) e.run(`gameTime += 110; cycle = '${['right', 'down', 'left', 'up'][i % 4]}'; player.nextDir = cycle; moveAllUnicorns([player]);`);
    assert.equal(e.run('player.alive'), false);
    assert.equal(e.run('occupiedGrid[10][10]'), 'player');
    assert.equal(e.run('player.trail.length'), 4);
});
test('Speed Pup changes player speed without speeding up rivals', () => {
    const e = engine(); e.run("equippedDogId = 'speed_pup'; chooseNPCDirection = npc => npc.dir;");
    assert.equal(e.run('movementInterval(unicorns[1])'), 165);
    assert.equal(e.run('movementInterval(player)'), 156.75);
});
test('Burst uses the shared ghost and wide-trail rules', () => {
    const e = engine();
    e.run("addTrailCell(unicorns[1], player.x + 1, player.y, true); activePowerup = { type: POWERUP_TYPES[1], remaining: 3000 }; let startX = player.x; triggerBurst();");
    advance(e, 100);
    assert.equal(e.run('player.x - startX'), 1);
    assert.equal(e.run('player.trail.length'), 3);
    assert.equal(e.run('player.alive'), true);
});
test('Burst crashes into walls using the same collision rule as ordinary movement', () => {
    const e = engine(); e.run('player.x = COLS - 1; triggerBurst();'); advance(e, 100);
    assert.equal(e.run('gameState'), 'GAME_OVER'); assert.equal(e.run('lastCrash.reason'), 'The arena wall');
});
test('two rapid turns are buffered and applied on separate grid moves', () => {
    const e = engine(); e.run("setPlayerDirection('ArrowDown'); setPlayerDirection('ArrowLeft');");
    e.run('moveAllUnicorns([player]);'); assert.equal(e.run('player.dir'), 'down');
    e.run('moveAllUnicorns([player]);'); assert.equal(e.run('player.dir'), 'left');
});
test('direct reversals cannot be queued', () => {
    const e = engine(); e.run("setPlayerDirection('ArrowLeft');"); assert.equal(e.run('turnQueue.length'), 0);
});
test('head swaps crash both unicorns', () => {
    const e = engine(); e.run("unicorns = [player, unicorns[1]]; player.x = 10; player.y = 10; unicorns[1].x = 11; unicorns[1].y = 10; unicorns[1].dir = 'left'; chooseNPCDirection = () => 'left'; moveAllUnicorns();");
    assert.equal(e.run('player.alive'), false); assert.equal(e.run('unicorns[1].alive'), false);
});
test('three heads arriving at the same cell all crash', () => {
    const e = engine();
    e.run("player.x = 10; player.y = 10; unicorns[1].x = 12; unicorns[1].y = 10; unicorns[1].dir = 'left'; unicorns[2].x = 11; unicorns[2].y = 11; unicorns[2].dir = 'up'; chooseNPCDirection = npc => npc.dir; moveAllUnicorns();");
    assert.equal(e.run('unicorns.filter(u => u.alive).length'), 0);
});
test('Halo grants one crash save on every tenth wave', () => {
    const e = engine(); e.run("currentWave = 9; selectedAccessoryId = 'halo'; killUnicorn(player);"); assert.equal(e.run('player.alive'), true);
    e.run('gameTime += 601; killUnicorn(player);'); assert.equal(e.run('player.alive'), false);
});
test('Halo does not grant a crash save on ordinary waves', () => {
    const e = engine(); e.run("selectedAccessoryId = 'halo'; killUnicorn(player);"); assert.equal(e.run('player.alive'), false);
});
test('shield rescues a wall crash and finds a valid escape direction', () => {
    const e = engine(); e.run("equippedDogId = 'shield_pup'; player.x = COLS - 1; moveAllUnicorns([player]);");
    assert.equal(e.run('player.alive'), true); assert.notEqual(e.run('player.nextDir'), 'right');
});
test('boss deaths award one kill, including the boss bonus', () => {
    const e = engine(); e.run("currentWave = 4; startCountdown(); gameState = PLAYING; boss.health = 1; killUnicorn(boss);");
    assert.equal(e.run('runKills'), 1); assert.equal(e.run('totalKills'), 1); assert.equal(e.run('score'), 2500);
});
test('Score Attack continues after all rivals die and respawns them', () => {
    const e = engine(); e.run("selectedGameMode = 'scoreattack'; unicorns[1].alive = unicorns[2].alive = false; unicorns[1].deathTime = unicorns[2].deathTime = gameTime; moveAllUnicorns([player]);");
    assert.equal(e.run('gameState'), 'PLAYING');
    e.run('gameTime += 1600; updateTrailFades(); respawnScoreAttackRivals();');
    assert.equal(e.run('unicorns.filter(u => !u.isPlayer && u.alive).length'), 2);
});
test('Score Attack completes at 60 seconds and records exactly one round', () => {
    const e = engine(); e.run("selectedGameMode = 'scoreattack'; moveAllUnicorns = () => {};"); advance(e, 60000, 100);
    assert.equal(e.run('gameState'), 'WIN'); assert.equal(e.run('scoreAttackTimer'), 60000); assert.equal(e.run('roundsPlayed'), 1);
    e.run('recordRound(true);'); assert.equal(e.run('roundsPlayed'), 1);
});
test('practice is nonlethal and never awards match progression', () => {
    const e = engine(); e.run('startPractice(); gameState = PLAYING; player.x = COLS - 1; moveAllUnicorns([player]); recordRound(true);');
    assert.equal(e.run('player.alive'), true); assert.equal(e.run('roundsPlayed'), 0); assert.equal(e.run('rainbowPoints'), 0); assert.equal(e.run('unlockedAchievements.length'), 0);
});
test('old saves migrate, invalid IDs fall back, and malformed saves leave progress intact', () => {
    const e = engine(); e.run("applySaveData({ rounds: 20, colorIndex: -9, avatarId: 'bad', accessoryId: 'halo', ownedAccessories: ['none'], gameMode: 'bad', highestWave: 3, equippedDogId: 'shield_pup' });");
    assert.equal(e.run('selectedColorIndex'), 0); assert.equal(e.run('selectedAvatarId'), 'classic'); assert.equal(e.run('selectedAccessoryId'), 'none'); assert.equal(e.run('selectedGameMode'), 'classic'); assert.equal(e.run('equippedDogId'), 'shield_pup');
    assert.throws(() => e.run('applySaveData({ anything: true });'));
    assert.equal(e.run('roundsPlayed'), 20);
    e.run('saveSaveData();'); const save = JSON.parse(e.saved.unicornPoop); assert.equal(save.version, 2); assert.equal(save.rounds, 20);
});
test('draw path handles player, rivals, trails, and the equipped dog', () => {
    const e = engine(); advance(e, 120); e.run('drawBackground(); drawTrails(); drawCollectibles(); drawAllUnicorns(); drawHUD();');
    assert.equal(e.run('companionVisuals.length'), 1);
});
for (const [width, height] of [[390, 844], [844, 390]]) test(`phone arena fills ${width}×${height} with twenty cells on its short side`, () => {
    const e = engine({ width, height, touch: true, dpr: 3 });
    assert.equal(e.canvas.style.width, `${width}px`); assert.equal(e.canvas.style.height, `${height}px`);
    assert.equal(e.canvas.width, width * 2); assert.equal(e.canvas.height, height * 2);
    assert.equal(e.run('Math.min(COLS, ROWS)'), 20);
    assert.ok(Math.abs(e.run('CANVAS_WIDTH / CANVAS_HEIGHT') - width / height) < .02);
    assert.equal(e.run('movementInterval(player)'), 220);
});
test('rotation preserves hazards, trail ages, interpolation, queued turns, and rewards', () => {
    const e = engine({ width: 844, height: 390, touch: true, render: true });
    e.run("addTrailCell(player, 7, 8, true); turnQueue = ['down', 'left']; playerPosHistory = [{px: 100, py: 200, dir: 'right'}]; companionVisuals = [{x: 90, y: 180, dir: 'right'}]; fantasyEvent('collect', 9, 10, '+50', '#fff');");
    const before = e.run('JSON.stringify({cols:COLS,rows:ROWS,player,occupiedGrid,trailTimeGrid,turnQueue,playerPosHistory,companionVisuals,fantasyEffects,roundsPlayed,gameTime})');
    e.run('window.innerWidth = 390; window.innerHeight = 844; resizeCanvas();');
    assert.equal(e.run('gameState'), 'PAUSED'); assert.equal(e.run('COLS'), 20);
    assert.equal(e.run('occupiedGrid[11][7]'), 'player');
    assert.equal(e.run('trailTimeGrid[11][7]'), -900);
    assert.equal(e.run('turnQueue.join()'), 'left,up');
    e.run('window.innerWidth = 844; window.innerHeight = 390; resizeCanvas();');
    assert.equal(e.run('JSON.stringify({cols:COLS,rows:ROWS,player,occupiedGrid,trailTimeGrid,turnQueue,playerPosHistory,companionVisuals,fantasyEffects,roundsPlayed,gameTime})'), before);
    e.run('togglePause(); resizeCanvas();'); assert.equal(e.run('gameState'), 'PLAYING');
});
test('a swipe turns on touchmove exactly once, without waiting for the finger to lift', () => {
    const e = engine({ width: 390, height: 844, touch: true });
    const event = (x, y) => ({ preventDefault() {}, changedTouches: [{ clientX: x, clientY: y }] });
    e.canvasEvents.touchstart(event(200, 300));
    e.canvasEvents.touchmove(event(200, 350));
    assert.equal(e.run('turnQueue.join()'), 'down');
    e.canvasEvents.touchmove(event(100, 350)); e.canvasEvents.touchend(event(100, 350));
    assert.equal(e.run('turnQueue.join()'), 'down');
});
test('optional D-pad stays finger sized on a portrait phone', () => {
    const e = engine({ width: 390, height: 844, touch: true });
    e.run('showDpad = true; drawTouchControls();');
    assert.equal(e.run('dpadCenterX * window.innerWidth / CANVAS_WIDTH'), 104);
    assert.equal(e.run('dpadRadius * window.innerWidth / CANVAS_WIDTH'), 60);
    assert.equal(e.run("handleTouchDirection(dpadCenterX, dpadCenterY + dpadRadius * .7); turnQueue.join()"), 'down');
});
test('fantasy renderer uses eight different gallop frames and an idle pose with reduced motion', () => {
    const e = engine({ render: true }); e.drawCalls.length = 0;
    for (let i = 0; i < 8; i++) e.run(`drawSpriteUnicorn('classic', 'none', 100, 100, 'right', 72, ${i * Math.PI / 4 + .01});`);
    const crops = e.drawCalls.map(call => [call[1], call[2]].join(','));
    assert.equal(new Set(crops).size, 8); assert.ok(e.drawCalls.every(call => call.length === 9));
    e.run("reducedMotion = true; drawSpriteUnicorn('classic', 'none', 100, 100, 'right', 72, 3);");
    assert.equal(e.drawCalls.at(-1).length, 5);
});
test('presentation pauses, effects expire, and dense trails reuse bounded cached materials', () => {
    const e = engine({ render: true });
    e.run("fantasyEvent('collect', 5, 5, '+50', '#fff'); updateFantasyPresentation(100); togglePause(); updateFantasyPresentation(900);");
    assert.equal(e.run('fantasyTime'), 100); assert.equal(e.run('fantasyEffects.length'), 1);
    e.run('togglePause(); updateFantasyPresentation(1100);'); assert.equal(e.run('fantasyEffects.length'), 0);
    e.run('for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) addTrailCell(player, x, y, true); drawBackground(); drawTrails(); drawCollectibles(); drawAllUnicorns(); drawFantasyEffects();');
    assert.ok(e.run('fantasyTrailStamps.size') <= 19);
    const count = e.run('fantasyTrailStamps.size'); e.run('drawTrails();'); assert.equal(e.run('fantasyTrailStamps.size'), count);
    e.run("for (let i = 0; i < 100; i++) fantasyEvent('collect', 1, 1, '', '#fff');"); assert.equal(e.run('fantasyEffects.length'), 40);
});
test('a cold start waits for artwork and recovers with a visible fallback after eight seconds', () => {
    const e = engine({ render: true });
    e.run('startCountdown(); imgCache.classic.complete = false; updateCountdown(1000);');
    assert.equal(e.run('countdownTimer'), 0); assert.equal(e.run('gameState'), 'COUNTDOWN');
    e.run('updateCountdown(7000);'); assert.equal(e.run('gameState'), 'PLAYING');
    e.run("imgCache.classic.complete = true; imgCache.classic.naturalWidth = 0; drawSpriteUnicorn('classic', 'none', 100, 100, 'right', 72, 0);");
});
