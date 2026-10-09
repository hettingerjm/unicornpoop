const { test } = require('node:test');
const assert = require('node:assert/strict');
const { engine, advance } = require('./harness.cjs');

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
test('Score Attack uses returning rivals even when starting from an unlocked boss wave', () => {
    const e=engine(); e.run("selectedGameMode='scoreattack'; currentWave=4; startCountdown();");
    assert.equal(e.run('isBossWave'),false); assert.equal(e.run('boss'),null); assert.equal(e.run('survivalGoal()'),0);
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
for (const [width, height] of [[390, 844], [844, 390]]) test(`phone arena fills ${width}×${height} with a larger world and 24 visible cells on its short side`, () => {
    const e = engine({ width, height, touch: true, dpr: 3 });
    assert.equal(e.canvas.style.width, `${width}px`); assert.equal(e.canvas.style.height, `${height}px`);
    assert.equal(e.canvas.width, width * 2); assert.equal(e.canvas.height, height * 2);
    assert.equal(e.run('Math.min(COLS, ROWS)'), 44);
    assert.equal(e.run('Math.min(VIEW_WIDTH, VIEW_HEIGHT) / GRID_SIZE'), 24);
    assert.ok(e.run('CANVAS_WIDTH > VIEW_WIDTH && CANVAS_HEIGHT > VIEW_HEIGHT'));
    assert.ok(Math.abs(e.run('VIEW_WIDTH / VIEW_HEIGHT') - width / height) < .02);
    assert.equal(e.run('movementInterval(player)'), 220);
});
test('rotation preserves hazards, trail ages, interpolation, queued turns, and rewards', () => {
    const e = engine({ width: 844, height: 390, touch: true, render: true });
    e.run("addTrailCell(player, 7, 8, true); turnQueue = ['down', 'left']; playerPosHistory = [{px: 100, py: 200, dir: 'right'}]; companionVisuals = [{x: 90, y: 180, dir: 'right'}]; fantasyEvent('collect', 9, 10, '+50', '#fff');");
    const before = e.run('JSON.stringify({cols:COLS,rows:ROWS,player,occupiedGrid,trailTimeGrid,turnQueue,playerPosHistory,companionVisuals,fantasyEffects,roundsPlayed,gameTime})');
    e.run('window.innerWidth = 390; window.innerHeight = 844; resizeCanvas();');
    assert.equal(e.run('gameState'), 'PAUSED'); assert.equal(e.run('COLS'), 44);
    assert.equal(e.run('occupiedGrid[35][7]'), 'player');
    assert.equal(e.run('trailTimeGrid[35][7]'), -900);
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
    assert.equal(e.run('dpadCenterX * window.innerWidth / VIEW_WIDTH'), 104);
    assert.equal(e.run('dpadRadius * window.innerWidth / VIEW_WIDTH'), 60);
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

test('a heart banks a spare life, crosses a solid wall, then expires without spending another life', () => {
    const e = engine();
    e.run("collectibles = [{x: player.x, y: player.y, type: COLLECTIBLE_TYPES[2]}]; checkCollectiblePickup(); addTrailCell(unicorns[1], player.x + 1, player.y, true); let wallX = player.x + 1; moveAllUnicorns([player]);");
    assert.equal(e.run('heartLives'), 0); assert.equal(e.run('player.x'), e.run('wallX')); assert.equal(e.run('player.alive'), true);
    e.run('addTrailCell(unicorns[1], player.x + 1, player.y, true); moveAllUnicorns([player]);'); assert.equal(e.run('player.alive'), true);
    e.run('gameTime = heartRescueUntil; addTrailCell(unicorns[1], player.x + 1, player.y, true); moveAllUnicorns([player]);'); assert.equal(e.run('player.alive'), false);
});
test('heart lives cap at three, stack separately from Ghost, freeze on pause, and reset each round', () => {
    const e = engine();
    e.run('for (let i=0; i<5; i++) { collectibles = [{x:player.x,y:player.y,type:COLLECTIBLE_TYPES[2]}]; checkCollectiblePickup(); } activePowerup = {type:POWERUP_TYPES[1],remaining:3000}; addTrailCell(unicorns[1],player.x+1,player.y,true); moveAllUnicorns([player]);');
    assert.equal(e.run('heartLives'), 3);
    e.run('activePowerup=null; killUnicorn(player); togglePause();'); const remaining=e.run('heartRescueUntil-gameTime');
    advance(e, 5000); assert.equal(e.run('heartRescueUntil-gameTime'), remaining);
    e.run('startCountdown();'); assert.equal(e.run('heartLives'), 0); assert.equal(e.run('heartRescueUntil'), 0);
});
test('heart also rescues a boundary crash and turns toward a valid escape', () => {
    const e = engine(); e.run('heartLives=1; player.x=COLS-1; moveAllUnicorns([player]);');
    assert.equal(e.run('player.alive'), true); assert.equal(e.run('heartLives'), 0); assert.notEqual(e.run('player.nextDir'), 'right');
});
test('early waves give the player three seconds without a scripted head-on crash', () => {
    for (const [width,height] of [[390,844],[844,390],[1280,720]]) {
        const e=engine({width,height}); advance(e,3000);
        assert.equal(e.run('player.alive'),true);
    }
});
test('survival clears a regular wave at its deadline once, while boss waves still require a defeat', () => {
    const e=engine(); e.run('moveAllUnicorns=()=>{};'); advance(e,35000,100);
    assert.equal(e.run('gameState'),'WIN'); assert.equal(e.run('survivalTimer'),35000); assert.equal(e.run('roundsPlayed'),1);
    e.run('recordRound(true);'); assert.equal(e.run('roundsPlayed'),1);
    e.run("selectedGameMode='bossrush'; startCountdown(); gameState=PLAYING; updateBoss=()=>{};"); advance(e,60000,100);
    assert.equal(e.run('gameState'),'PLAYING'); assert.equal(e.run('boss.alive'),true);
});
test('AI forecasts trail hardening and avoids a stationary unicorn head', () => {
    const e=engine();
    e.run("let npc=unicorns[1]; npc.x=20; npc.y=20; npc.dir='right'; npc.personality=NPC_PERSONALITIES[0]; waveMistakeChance=0; gameTime=800; addTrailCell(player,22,20); trailTimeGrid[22][20]=1;");
    assert.equal(e.run("scoreDirection(20,20,'right',4)"),1);
    e.run('player.x=21; player.y=20;'); assert.notEqual(e.run('chooseNPCDirection(npc)'), 'right');
});
test('wave progression varies in chapters while keeping speed, AI, and crowd sizes bounded', () => {
    const e=engine();
    assert.equal(e.run('waveConfig(0).npcCount'),e.run('waveConfig(1).npcCount'));
    assert.ok(e.run('waveConfig(5).moveInterval > waveConfig(3).moveInterval'));
    for (let i=0;i<1000;i++) {
        const w=e.run(`waveConfig(${i})`);
        assert.ok(w.moveInterval>=86 && w.moveInterval<=110); assert.ok(w.npcCount>=2 && w.npcCount<=6); assert.ok(w.lookahead<=8); assert.ok(w.mistakeChance>=.018);
    }
});
test('the following camera stays inside the world, follows bursts, and freezes on pause', () => {
    const e=engine({width:390,height:844,touch:true});
    e.run('player.x=COLS-5; player.y=ROWS-5; player.previousX=player.x; player.previousY=player.y; updateCamera(1000);');
    assert.ok(e.run('camera.x >= 0 && camera.x + VIEW_WIDTH <= CANVAS_WIDTH && camera.y >= 0 && camera.y + VIEW_HEIGHT <= CANVAS_HEIGHT'));
    assert.ok(e.run('visualPosition(player).x-camera.x >= 0 && visualPosition(player).x-camera.x <= VIEW_WIDTH'));
    const position=e.run('JSON.stringify(camera)'); e.run('togglePause(); updateCamera(1000);'); assert.equal(e.run('JSON.stringify(camera)'),position);
    e.run('togglePause(); player.x=0; player.y=0; player.previousX=0; player.previousY=0; updateCamera(1000);');
    assert.equal(e.run('camera.x'),0); assert.equal(e.run('camera.y'),0);
});
test('camera smoothing is independent of refresh rate with a stationary target', () => {
    const samples=[];
    for (const fps of [30,60,120,144]) {
        const e=engine(); e.run('player.x=35; player.y=25; player.previousX=35; player.previousY=25; resetCamera(); camera.x-=100;');
        for(let i=0;i<fps;i++) e.run(`updateCamera(${1000/fps});`);
        samples.push(e.run('camera.x'));
    }
    assert.ok(Math.max(...samples)-Math.min(...samples)<.1);
});
test('boss rush alternates encounters, caps health, and classic starts with the Charger', () => {
    const e=engine(); const ids=[];
    for(let i=0;i<6;i++){e.run(`selectedGameMode='bossrush'; currentWave=${i}; startCountdown();`);ids.push(e.run('boss.bossType.id'));}
    assert.equal(ids.join(','),'charger,phantom,charger,phantom,charger,phantom');
    e.run("currentWave=999; startCountdown();"); assert.equal(e.run('boss.maxHealth'),6);
    e.run("selectedGameMode='classic'; currentWave=4; startCountdown();"); assert.equal(e.run('boss.bossType.id'),'charger'); assert.equal(e.run('boss.maxHealth'),2);
});
test('Charger gives a full warning, commits a direction, then offers a recovery window', () => {
    const e=engine(); e.run("selectedGameMode='bossrush'; startCountdown(); gameState=PLAYING; updateBoss(3800);");
    assert.equal(e.run('boss.phase'),'telegraph'); const dir=e.run('boss.attackDir');
    e.run('updateBoss(1190);'); assert.equal(e.run('boss.phase'),'telegraph');
    e.run('updateBoss(10); player.x=0; player.y=0;'); assert.equal(e.run('boss.phase'),'attack'); assert.equal(e.run('chooseBossDirection()'),dir);
    e.run('updateBoss(950);'); assert.equal(e.run('boss.phase'),'recover'); assert.equal(e.run('boss.phaseTimer'),1800);
});
test('Phantom warns, lands away from heads and trails, and resets interpolation', () => {
    const e=engine(); e.run("selectedGameMode='bossrush'; currentWave=1; startCountdown(); gameState=PLAYING; updateBoss(3800);");
    assert.equal(e.run('boss.phase'),'telegraph'); assert.ok(e.run('safePhantomLanding(boss.teleportTarget.x,boss.teleportTarget.y)'));
    const target=e.run('JSON.stringify(boss.teleportTarget)'); e.run('updateBoss(1200);');
    assert.equal(e.run('JSON.stringify({x:boss.x,y:boss.y})'),target); assert.equal(e.run('boss.previousX'),e.run('boss.x')); assert.equal(e.run('boss.previousY'),e.run('boss.y'));
});
test('Phantom cancels a warp when its warned landing becomes unsafe', () => {
    const e=engine(); e.run("selectedGameMode='bossrush'; currentWave=1; startCountdown(); gameState=PLAYING; updateBoss(3800); let oldBossX=boss.x; let oldBossY=boss.y; player.x=boss.teleportTarget.x; player.y=boss.teleportTarget.y; updateBoss(1200);");
    assert.equal(e.run('boss.x'),e.run('oldBossX')); assert.equal(e.run('boss.y'),e.run('oldBossY')); assert.equal(e.run('boss.teleportTarget'),null);
});
test('boss collision damage cannot drain health repeatedly in a blocked cell', () => {
    const e=engine(); e.run("selectedGameMode='bossrush'; currentWave=5; startCountdown(); gameState=PLAYING; let initialHealth=boss.health; killUnicorn(boss); killUnicorn(boss); killUnicorn(boss);");
    assert.equal(e.run('boss.health'),e.run('initialHealth-1')); assert.equal(e.run('boss.phase'),'recover');
    e.run('gameTime+=900; damageBoss(1);'); assert.equal(e.run('boss.health'),e.run('initialHealth-2'));
});
test('a boss patrol turns at the arena edge while a committed charge takes damage', () => {
    const e=engine(); e.run("selectedGameMode='bossrush'; startCountdown(); gameState=PLAYING; boss.x=COLS-1; boss.dir=boss.nextDir='right'; chooseBossDirection=()=> 'right'; let healthBefore=boss.health; moveAllUnicorns([boss]);");
    assert.equal(e.run('boss.health'),e.run('healthBefore')); assert.notEqual(e.run('boss.nextDir'),'right');
    e.run("boss.phase='attack'; moveAllUnicorns([boss]);"); assert.equal(e.run('boss.health'),e.run('healthBefore-1'));
});
test('rotation preserves a boss warning and landing target through a round trip', () => {
    const e=engine({width:844,height:390,touch:true}); e.run("selectedGameMode='bossrush'; currentWave=1; startCountdown(); gameState=PLAYING; updateBoss(3800);");
    const before=e.run('JSON.stringify({boss,gameTime,heartLives,heartRescueUntil})');
    e.run('window.innerWidth=390; window.innerHeight=844; resizeCanvas(); window.innerWidth=844; window.innerHeight=390; resizeCanvas();');
    assert.equal(e.run('JSON.stringify({boss,gameTime,heartLives,heartRescueUntil})'),before);
});
test('Splat can damage a nearby boss behind the player without harming a distant boss', () => {
    const e=engine(); e.run("selectedGameMode='bossrush'; startCountdown(); gameState=PLAYING; let initialHealth=boss.health; triggerSplatter();");
    assert.equal(e.run('boss.health'),e.run('initialHealth'));
    e.run("splatterCooldownTimer=0; boss.x=player.x-3; boss.y=player.y; triggerSplatter();"); assert.equal(e.run('boss.health'),e.run('initialHealth-1'));
});
test('rendering the camera world, boss warnings, radar and minimap handles both orientations', () => {
    for(const [width,height] of [[390,844],[844,390]]) {
        const e=engine({width,height,touch:true,render:true});
        e.run("selectedGameMode='bossrush'; currentWave=1; startCountdown(); gameState=PLAYING; updateBoss(3800); drawArenaWorld(); drawMinimap(ctx,264,176);");
        assert.ok(e.drawCalls.length>0);
    }
});
