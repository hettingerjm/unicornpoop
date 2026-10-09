const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');

// Run the real engine in isolation; browser drawing/audio are the only mocked surfaces.
function engine() {
    const clock = { now: 10000 }, saved = {};
    const gradient = { addColorStop() {} };
    const ctx = new Proxy({}, { get: (target, key) => target[key] || (key.startsWith('create') ? () => gradient : () => {}), set: (target, key, value) => (target[key] = value, true) });
    const canvas = { style: {}, addEventListener() {}, getContext: () => ctx };
    const context = vm.createContext({
        console, Math, JSON, performance: { now: () => clock.now },
        window: { innerWidth: 1280, innerHeight: 720, addEventListener() {} }, navigator: { maxTouchPoints: 0 },
        document: { getElementById: id => id === 'gameCanvas' ? canvas : { style: {} }, documentElement: { clientWidth: 1280, clientHeight: 720 }, body: { classList: { add() {}, remove() {} } }, addEventListener() {} },
        localStorage: { getItem: key => saved[key] || null, setItem: (key, value) => saved[key] = value },
        Image: class { constructor() { this.complete = true; this.naturalWidth = this.width = 120; this.height = 110; } },
        requestAnimationFrame() {}, setTimeout() {},
    });
    vm.runInContext(source, context);
    const run = code => vm.runInContext(code, context);
    run('soundEnabled = false; startCountdown(); gameState = PLAYING; collectibles = []; powerups = [];');
    return { run, clock, saved };
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
    assert.equal(e.run('movementInterval(unicorns[1])'), 110);
    assert.equal(e.run('movementInterval(player)'), 104.5);
});
test('Burst uses the shared ghost and wide-trail rules', () => {
    const e = engine();
    e.run("addTrailCell(unicorns[1], player.x + 1, player.y, true); activePowerup = { type: POWERUP_TYPES[1], remaining: 3000 }; let startX = player.x; triggerBurst();");
    advance(e, 70);
    assert.equal(e.run('player.x - startX'), 1);
    assert.equal(e.run('player.trail.length'), 3);
    assert.equal(e.run('player.alive'), true);
});
test('Burst crashes into walls using the same collision rule as ordinary movement', () => {
    const e = engine(); e.run('player.x = COLS - 1; triggerBurst();'); advance(e, 70);
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
