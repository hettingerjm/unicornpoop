// Native menus keep text sharp and controls comfortably sized at every screen width.
const menuUI = document.getElementById('menuUI');
const liveHUD = document.getElementById('liveHUD');
const arenaOverlay = document.getElementById('arenaOverlay');
const importInput = document.getElementById('saveImport');
let uiKey = '', uiNotice = '', lastScene = '', renderedState = '';
let inspectCrash = false;
const modeDetails = {
    classic: { icon: '✦', title: 'Classic', desc: 'Outlast your rivals, one rainbow wave at a time.', tag: 'The original' },
    chill: { icon: '☁', title: 'Chill', desc: 'A slower pace. A little more room to find your groove.', tag: 'Take it easy' },
    speed: { icon: 'ϟ', title: 'Speed', desc: 'Quick turns and faster rivals. Stay on your hooves.', tag: 'Extra speedy' },
    bossrush: { icon: '♛', title: 'Boss Rush', desc: 'Big unicorns. Bigger trouble. Every wave is a boss.', tag: 'Bring your courage' },
    scoreattack: { icon: '◷', title: 'Score Attack', desc: 'One minute, returning rivals, and a score to beat.', tag: '60 seconds' },
};
function escapeUI(text) { return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function action(label, name, className = 'secondary', attrs = '') { return `<button class="${className}" data-action="${name}" ${attrs}>${label}</button>`; }
function header() {
    return `<header class="header"><button class="brand" data-action="home" aria-label="Unicorn Poop home"><span class="brand-mark" aria-hidden="true">✦</span>unicorn poop</button><nav class="header-actions" aria-label="Game options">${action('How to play', 'help', 'text-button')}${action(soundEnabled ? '♫' : '♪', 'sound', 'icon-button', `aria-label="${soundEnabled ? 'Mute' : 'Unmute'} sound" aria-pressed="${soundEnabled}"`)}${action('⚙', 'settings', 'icon-button', 'aria-label="Settings and saves"')}</nav></header>`;
}
function footer() { return `<footer class="footer"><span>A little rainbow universe by Sophia + John</span>${action('Your progress, saved locally ↗', 'settings')}</footer>`; }
function shell(content, back = true) { return `<div class="shell">${header()}${back ? action('← Back', 'home', 'text-button back-button') : ''}<section class="screen">${content}</section>${footer()}</div>`; }
function heading(title, desc, eyebrow) { return `<div class="screen-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${desc}</p></div>`; }
function nextDog() { return DOGS.find(d => !isDogUnlocked(d)); }
function homeScreen() {
    const mode = modeDetails[selectedGameMode], dog = nextDog(), avatar = UNICORN_AVATARS.find(a => a.id === selectedAvatarId);
    const dogCopy = dog ? `${roundsPlayed} of ${dog.matches} matches · ${dog.label} is up next` : 'All six pups unlocked. Quite the little pack.';
    return `<div class="shell">${header()}<section class="hero screen"><div class="hero-text"><p class="eyebrow">The rainbow trail arena</p><h1>UNICORN<span class="rainbow-word">POOP.</span></h1><p class="hero-copy">Leave a little magic.<br>Try not to step in it.</p><div class="actions">${action(`Play wave ${currentWave + 1} &nbsp; ↗`, 'play', 'primary')}${action('Make it yours', 'customize')}</div><p class="key-hint">${isTouchDevice ? 'Swipe to steer · Tap your abilities' : '<kbd>Enter</kbd> to play &nbsp; <kbd>↑ ↓ ← →</kbd> to steer'}</p></div><div class="hero-art" aria-label="Your unicorn and rainbow friends"><div class="hero-orbit"></div><span class="hero-star one" aria-hidden="true">✧</span><span class="hero-star two" aria-hidden="true">✦</span><img class="hero-unicorn" src="${avatar.path}" alt="${avatar.label} unicorn"><img class="mini-unicorn candy" src="assets/unicorns/candy.png" alt=""><img class="mini-unicorn ice" src="assets/unicorns/ice.png" alt=""><span class="art-caption">a tiny game with a colorful attitude</span></div></section><div class="home-bottom"><div class="info-card"><div class="card-icon" aria-hidden="true">${mode.icon}</div><div class="info-copy"><p class="eyebrow">Your next adventure</p><h3>${mode.title}${bestScores[selectedGameMode] ? ` · Best ${bestScores[selectedGameMode].toLocaleString()}` : ''}</h3><p>${mode.desc}</p>${highestWave > 0 ? `<div class="wave-picker">Starting wave ${currentWave + 1} &nbsp; ${action('−', 'wave-down', 'arrow-button', 'aria-label="Previous wave"')}${action('+', 'wave-up', 'arrow-button', 'aria-label="Next unlocked wave"')}</div>` : ''}</div>${action('↗', 'modes', 'arrow-button', 'aria-label="Choose game mode"')}</div><div class="info-card"><div class="card-icon" aria-hidden="true">🐾</div><div class="info-copy"><p class="eyebrow">Good things come with paws</p><h3>${getEquippedDog().label} is coming along</h3><p>${dogCopy}</p><div class="progress-track"><span style="width:${dog ? Math.min(100, roundsPlayed / dog.matches * 100) : 100}%"></span></div></div>${action('↗', 'dogs', 'arrow-button', 'aria-label="Choose your dog"')}</div></div>${footer()}</div>`;
}
function modesScreen() {
    return shell(heading('Pick your kind of chaos.', 'Same rainbow trails. Five different ways to play.', 'A mood for every unicorn') + `<div class="mode-grid">${GAME_MODES.map(mode => {
        const d = modeDetails[mode.id];
        return `<button class="mode-card ${mode.id === selectedGameMode ? 'selected' : ''}" data-action="mode" data-id="${mode.id}" aria-pressed="${mode.id === selectedGameMode}"><span class="card-icon" aria-hidden="true">${d.icon}</span><h3>${d.title}</h3><p>${d.desc}</p><span class="badge">${mode.id === selectedGameMode ? 'Selected' : d.tag}</span></button>`;
    }).join('')}</div>`);
}
function customizeScreen() {
    const avatar = UNICORN_AVATARS.find(a => a.id === selectedAvatarId), accessory = ACCESSORIES.find(a => a.id === selectedAccessoryId);
    let cards;
    if (customizeTab === 'avatar') cards = UNICORN_AVATARS.map(a => `<button class="item-card ${a.id === selectedAvatarId ? 'selected' : ''}" data-action="avatar" data-id="${a.id}" aria-pressed="${a.id === selectedAvatarId}"><img src="${a.path}" alt=""><h3>${a.label}</h3><span class="badge">${a.id === selectedAvatarId ? 'Your unicorn' : 'Choose me'}</span></button>`).join('');
    else if (customizeTab === 'accessory') cards = ACCESSORIES.map(a => {
        const shop = ACCESSORY_SHOP[a.id], owned = isAccessoryOwned(a.id), selected = a.id === selectedAccessoryId;
        return `<button class="item-card accessory ${selected ? 'selected' : ''}" data-action="accessory" data-id="${a.id}" aria-pressed="${selected}" ${!owned && rainbowPoints < shop.cost ? 'disabled' : ''}>${a.path ? `<img src="${a.path}" alt="">` : '<span class="dog-preview" aria-hidden="true">✧</span>'}<h3>${a.label}</h3><p>${shop.buffDesc || 'A little less is lovely, too.'}</p><span class="badge">${selected ? 'Equipped' : owned ? 'Owned · Equip' : `${shop.cost} rainbow points`}</span></button>`;
    }).join('');
    else cards = DOGS.map(d => {
        const unlocked = isDogUnlocked(d), selected = equippedDogId === d.id;
        return `<button class="item-card ${selected ? 'selected' : ''}" data-action="dog" data-id="${d.id}" aria-pressed="${selected}" ${unlocked ? '' : 'disabled'}><span class="dog-preview" style="--dog-color:${d.bodyColor}35" aria-hidden="true">🐶</span><h3>${d.label}</h3><p>${d.buffDesc}</p><span class="badge">${selected ? 'Your sidekick' : unlocked ? 'Choose me' : `${roundsPlayed} / ${d.matches} matches`}</span></button>`;
    }).join('');
    return shell(heading('A little more you.', 'Pick a unicorn, add some sparkle, and bring a friend.', 'The dress-up corner') + `<div class="wardrobe"><aside class="preview-card"><canvas id="wardrobePreview" width="340" height="300" role="img" aria-label="Your ${avatar.label} unicorn wearing ${accessory.label}"></canvas><div><p class="eyebrow">Your little lineup</p><h3>${avatar.label}</h3><p>${accessory.label === 'None' ? 'Naturally magical' : accessory.label}<br>${getEquippedDog().label} by your side</p><span class="badge">${rainbowPoints} rainbow points</span></div></aside><div><div class="tabs" role="group" aria-label="Customization category">${[['avatar', 'Unicorns'], ['accessory', 'Accessories'], ['dogs', 'Dogs']].map(([id, label]) => `<button class="${customizeTab === id ? 'selected' : ''}" data-action="tab" data-id="${id}" aria-pressed="${customizeTab === id}">${label}</button>`).join('')}</div><div class="item-grid">${cards}</div></div></div>`);
}
function helpScreen() {
    return shell(heading('A little magic. A few rules.', 'You keep moving. Your job is to choose where.', 'How to play') + `<div class="help-grid"><article class="help-card"><div class="trail-demo"><span class="trail-sample fresh">◦</span><span class="trail-sample fresh">◦</span><span class="trail-sample">╲</span><span class="trail-sample">╲</span></div><h3>Soft dots → solid tiles</h3><p>Fresh poop stays soft for 0.9 seconds. You can cross it while it’s dotted. Once it becomes a solid tile, keep clear—even of your own trail. Circling back doesn’t refresh it.</p></article><article class="help-card"><h3>Outlast the others</h3><p>Your unicorn has a gold ring and a YOU label. Stay inside the arena and avoid other unicorns’ heads. Win a wave to advance. A loss lets you retry the same wave.</p></article><article class="help-card"><h3>Steer, burst, splat</h3><p>${isTouchDevice ? 'Swipe in a direction to turn. Enable the D-pad in Settings if you prefer.' : '<kbd>Arrows</kbd> or <kbd>WASD</kbd> to turn. You can queue two quick turns.'} Burst speeds you up and widens your trail. Splat drops hardened poop behind you and triggers Burst when it’s ready. ${isTouchDevice ? 'Tap the ability buttons.' : '<kbd>Space</kbd> = Burst · <kbd>X</kbd> = Splat · <kbd>Esc</kbd> = Pause.'}</p></article><article class="help-card"><h3>Collect a little happiness</h3><p>Stars, gems, and hearts build your score and multiplier. Every three pickups earn a Rainbow Point. Play matches to unlock dogs; equip one for its special perk. Points buy accessories.</p></article></div><div class="actions">${action('Try the practice arena ↗', 'practice', 'primary')}${action('I’m ready to play', 'play')}</div>`);
}
function settingsScreen() {
    return shell(heading('Make yourself comfortable.', 'A few small things that make the game feel like home.', 'Settings & saves') + `${uiNotice ? `<p class="notice" role="status">${escapeUI(uiNotice)}</p>` : ''}${saveError ? '<p class="notice">This browser could not read or store your progress. Export a save to keep it safe.</p>' : ''}<div class="settings-card"><h3>Play your way</h3><label class="setting"><input type="checkbox" data-setting="motion" ${reducedMotion ? 'checked' : ''}>Reduce motion and screen shake</label><label class="setting"><input type="checkbox" data-setting="dpad" ${showDpad ? 'checked' : ''}>Show the on-screen D-pad</label></div><div class="settings-card"><h3>Take your progress with you</h3><p>Your unlocks, points, and best scores stay in this browser. Export a save to move them to another computer. Loading a save replaces this browser’s game progress.</p><div class="actions">${action('Export my save ↓', 'export', 'primary')}${action('Load a save ↑', 'import')}</div></div><div class="settings-card"><h3>A little refresher</h3><p>Practice is safe: crashes don’t end the session, and your match progress stays untouched.</p>${action('Open practice arena', 'practice')}</div>`);
}
function summaryScreen() {
    const s = lastRunStats;
    if (!s) return homeScreen();
    const stats = [['Score', s.score.toLocaleString()], ['Time', formatTime(s.time)], ['Rivals defeated', s.kills], ['Treasures collected', s.collectibles]];
    return shell(heading(s.won ? 'A little victory dance.' : 'Every rainbow has a detour.', s.won ? 'Nice hoofwork. Your rewards are ready.' : `${s.reason || 'A rainbow roadblock'}. Your wave is ready for another try.`, `${modeDetails[s.mode].title} · Wave ${s.wave}`) + `${s.newBest ? '<span class="badge">✦ A new personal best</span>' : ''}<div class="summary-grid">${stats.map(([label, value]) => `<div class="summary-stat"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><div class="reward-row"><span class="reward">+${s.rpEarned} Rainbow Points</span><span class="reward">+${s.xpEarned} XP · Level ${playerLevel}</span><span class="reward">${nextDog() ? `${Math.max(0, nextDog().matches - roundsPlayed)} matches until ${nextDog().label}` : 'All pups unlocked'}</span></div><div class="actions">${action(s.won && s.mode !== 'scoreattack' ? `Play wave ${currentWave + 1} ↗` : 'Play again ↗', 'play', 'primary')}${action('Visit the dress-up corner', 'customize')}</div>`);
}
function createHUD() {
    liveHUD.innerHTML = `<div class="live-top"><div class="arena-brand"><span class="brand-mark">✦</span><span class="brand-text">rainbow arena</span></div><div class="live-stats"><div class="live-stat score"><small>Score</small><strong id="hudScore">0</strong></div><div class="live-stat"><small id="hudTimeLabel">Time</small><strong id="hudTime">0.0s</strong></div><div class="live-stat"><small id="hudWaveLabel">Wave 1</small><strong id="hudRivals">2 rivals</strong></div></div><div>${action('Ⅱ', 'pause', 'game-button', 'aria-label="Pause or resume"')}${action('⌂', 'leave', 'game-button', 'aria-label="Return to menu"')}</div></div><div class="arena-controls"><div class="steering-hint" id="steeringHint"></div><div class="ability-controls"><button class="ability" data-action="burst" id="burstButton"><strong>ϟ Burst <span id="burstKey"></span></strong><small id="burstStatus">Ready</small></button><button class="ability splat" data-action="splat" id="splatButton"><strong>✦ Splat <span id="splatKey"></span></strong><small id="splatStatus">Ready</small></button></div></div><div class="practice-tip" id="practiceTip" hidden></div>`;
}
function textIfChanged(id, text) { const el = document.getElementById(id); if (el && el.textContent !== String(text)) el.textContent = text; }
function updateHUD() {
    textIfChanged('hudScore', Math.floor(score).toLocaleString());
    textIfChanged('hudTime', selectedGameMode === 'scoreattack' && !practiceActive ? formatTime(Math.max(0, 60000 - scoreAttackTimer)) : formatTime(survivalTimer));
    textIfChanged('hudTimeLabel', selectedGameMode === 'scoreattack' && !practiceActive ? 'Time left' : 'Time');
    textIfChanged('hudWaveLabel', practiceActive ? 'Practice' : isBossWave ? 'Boss wave' : `Wave ${roundRecorded && lastRunStats ? lastRunStats.wave : currentWave + 1}`);
    const rivals = unicorns.filter(u => !u.isPlayer && u.alive).length;
    textIfChanged('hudRivals', practiceActive ? 'Safe arena' : `${rivals} ${rivals === 1 ? 'rival' : 'rivals'}`);
    textIfChanged('burstKey', isTouchDevice ? '' : '· Space'); textIfChanged('splatKey', isTouchDevice ? '' : '· X');
    const steering = document.getElementById('steeringHint');
    const guide = practiceActive ? action('Play for real ↗', 'finish-practice', 'game-button') : isTouchDevice ? 'Swipe to steer<br>Soft dots are safe. Solid tiles are deadly.' : '<kbd>↑ ↓ ← →</kbd> / WASD to steer<br>Soft dots are safe. Solid tiles are deadly.';
    if (steering.dataset.guide !== guide) { steering.innerHTML = guide; steering.dataset.guide = guide; }
    for (const [name, timer, duration] of [['burst', burstCooldownTimer, BURST_COOLDOWN], ['splat', splatterCooldownTimer, SPLATTER_COOLDOWN]]) {
        const button = document.getElementById(`${name}Button`);
        button.disabled = gameState !== PLAYING || timer > 0;
        button.style.setProperty('--ready', `${Math.max(0, 100 * (1 - timer / duration))}%`);
        textIfChanged(`${name}Status`, timer > 0 ? `${(timer / 1000).toFixed(1)}s recharge` : 'Ready');
    }
    const tip = document.getElementById('practiceTip'); tip.hidden = !practiceActive;
    if (practiceActive) {
        const p = practiceProgress;
        const step = !p.collected ? [1, 'Collect the star ahead of you.'] : !p.turns ? [2, isTouchDevice ? 'Swipe to make a turn.' : 'Press an arrow key to make a turn.'] : !p.burst ? [3, isTouchDevice ? 'Tap Burst to pick up speed.' : 'Press Space to try Burst.'] : !p.splat ? [4, isTouchDevice ? 'Tap Splat to leave a surprise behind.' : 'Press X to try Splat.'] : [4, 'You’ve got it! Choose “Play for real” when you’re ready.'];
        const html = `<small>Practice · ${step[0]} of 4 · Crashes are safe</small>${step[1]}`;
        if (tip.innerHTML !== html) tip.innerHTML = html;
    }
}
function overlayScreen() {
    if (gameState === PAUSED) return `<div class="modal" role="dialog" aria-label="Game paused"><p class="eyebrow">Take a little breather</p><h2>Magic on pause.</h2><p>Your unicorn—and every trail—will wait right here.</p><div class="actions">${action('Keep going ↗', 'pause', 'primary')}</div>${action('Back to the menu', 'leave', 'text-button')}</div>`;
    const s = lastRunStats;
    if (inspectCrash && !s.won) return `<div class="modal crash-inspection" role="status"><p>${s.reason}.<br><strong>The pink square marks the crash.</strong></p>${action('Try again ↗', 'play', 'primary')}${action('My rewards', 'summary')}</div>`;
    return `<div class="modal" role="dialog" aria-label="${s.won ? 'Wave complete' : 'Round over'}"><p class="eyebrow">${s.won ? 'A little victory dance' : 'A rainbow roadblock'}</p><h2>${s.won ? 'Beautiful hoofwork.' : 'Oops. A little detour.'}</h2><p>${s.won ? (s.mode === 'scoreattack' ? 'One minute of rainbow magic. Here’s your score.' : `Wave ${s.wave} complete. Your next adventure is ready.`) : `${s.reason || 'A trail collision'}. Your wave is ready for another try.`}</p>${s.newBest ? '<span class="badge">✦ New personal best</span>' : ''}<div class="modal-stats"><div><strong>${s.score.toLocaleString()}</strong><span>score</span></div><div><strong>${formatTime(s.time)}</strong><span>survived</span></div></div><div class="actions">${action(s.won && s.mode !== 'scoreattack' ? 'Next wave ↗' : 'Try again ↗', 'play', 'primary')}${action('My rewards', 'summary')}</div>${s.won ? '' : action('Show me the crash', 'inspect-crash', 'text-button')}${action('Back to the menu', 'home', 'text-button')}</div>`;
}
function drawWardrobePreview() {
    const preview = document.getElementById('wardrobePreview');
    if (!preview) return;
    const drawing = preview.getContext('2d');
    drawing.clearRect(0, 0, 340, 300);
    drawSpriteUnicorn(selectedAvatarId, selectedAccessoryId, 170, 135, 'right', 240, performance.now() * TROT_SPEED, drawing);
    drawCompanion('dog_brown', 60, 260, 'right', performance.now() * TROT_SPEED, 4, drawing);
}
function syncGameUI() {
    const arena = [PLAYING, COUNTDOWN, PAUSED, GAME_OVER, WIN].includes(gameState), scene = arena ? 'game' : 'menu';
    if (gameState !== GAME_OVER) inspectCrash = false;
    arenaOverlay.dataset.inspect = String(inspectCrash);
    document.body.dataset.scene = scene; document.body.dataset.reducedMotion = String(reducedMotion);
    menuUI.hidden = arena; liveHUD.hidden = !arena;
    if (lastScene !== scene) { lastScene = scene; resizeCanvas(); }
    if (arena && syncGameUI.boundsDirty) {
        const rect = canvas.getBoundingClientRect();
        for (const [key, value] of Object.entries({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })) document.documentElement.style.setProperty(`--arena-${key}`, `${value}px`);
        syncGameUI.boundsDirty = false;
    }
    if (arena) updateHUD();
    arenaOverlay.hidden = ![PAUSED, GAME_OVER, WIN].includes(gameState);
    const key = [gameState, customizeTab, selectedAvatarId, selectedAccessoryId, equippedDogId, rainbowPoints, roundsPlayed, currentWave, selectedGameMode, soundEnabled, reducedMotion, showDpad, uiNotice, saveError, inspectCrash].join('|');
    if (gameState === CUSTOMIZE) drawWardrobePreview();
    if (uiKey === key) return;
    uiKey = key;
    if (!arena) menuUI.innerHTML = gameState === CUSTOMIZE ? customizeScreen() : gameState === MODE_SELECT ? modesScreen() : gameState === INSTRUCTIONS ? helpScreen() : gameState === 'SETTINGS' ? settingsScreen() : gameState === RUN_SUMMARY ? summaryScreen() : homeScreen();
    else if (!arenaOverlay.hidden) arenaOverlay.innerHTML = overlayScreen();
    if (renderedState !== gameState) { renderedState = gameState; window.scrollTo(0, 0); }
    if (gameState === CUSTOMIZE) drawWardrobePreview();
}
document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || button.disabled) return;
    const name = button.dataset.action, id = button.dataset.id;
    initAudio();
    switch (name) {
        case 'home': resetToTitle(); break;
        case 'leave': if (practiceActive) finishPractice(); else resetToTitle(); break;
        case 'play': if (practiceActive) finishPractice(); startCountdown(); break;
        case 'help': gameState = INSTRUCTIONS; break;
        case 'settings': gameState = 'SETTINGS'; uiNotice = ''; break;
        case 'customize': gameState = CUSTOMIZE; break;
        case 'dogs': customizeTab = 'dogs'; gameState = CUSTOMIZE; break;
        case 'modes': gameState = MODE_SELECT; break;
        case 'mode': if (GAME_MODES.some(m => m.id === id)) { selectedGameMode = id; saveSaveData(); gameState = TITLE; } break;
        case 'sound': soundEnabled = !soundEnabled; break;
        case 'wave-down': currentWave = Math.max(0, currentWave - 1); break;
        case 'wave-up': currentWave = Math.min(highestWave, currentWave + 1); break;
        case 'tab': customizeTab = id; break;
        case 'avatar': selectedAvatarId = id; saveSaveData(); break;
        case 'accessory': {
            const shop = ACCESSORY_SHOP[id]; if (!shop) break;
            if (!isAccessoryOwned(id)) { if (rainbowPoints < shop.cost) break; rainbowPoints -= shop.cost; ownedAccessories.push(id); playSound('unlock'); }
            selectedAccessoryId = id; saveSaveData(); break;
        }
        case 'dog': if (DOGS.some(d => d.id === id && isDogUnlocked(d))) { equippedDogId = id; saveSaveData(); } break;
        case 'practice': startPractice(); break;
        case 'finish-practice': finishPractice(); startCountdown(); break;
        case 'pause': if (gameState === PLAYING || gameState === PAUSED) togglePause(); break;
        case 'burst': if (gameState === PLAYING) triggerBurst(); break;
        case 'splat': if (gameState === PLAYING) triggerSplatter(); break;
        case 'summary': gameState = RUN_SUMMARY; break;
        case 'inspect-crash': inspectCrash = true; break;
        case 'export': {
            const blob = new Blob([JSON.stringify(getSaveData(), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob), link = document.createElement('a');
            link.href = url; link.download = 'unicorn-poop-save.json'; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            uiNotice = 'Save download requested. Keep the JSON file for your next computer.'; break;
        }
        case 'import': importInput.click(); break;
    }
    syncGameUI();
});
document.addEventListener('change', event => {
    if (event.target.dataset.setting === 'motion') reducedMotion = event.target.checked;
    else if (event.target.dataset.setting === 'dpad') showDpad = event.target.checked;
    else return;
    saveSaveData(); syncGameUI();
});
importInput.addEventListener('change', async () => {
    const file = importInput.files[0]; if (!file) return;
    try {
        if (file.size > 100000) throw new Error('That file is too large to be a game save.');
        const data = normalizeSaveData(JSON.parse(await file.text()));
        applySaveData(data); currentWave = 0; saveSaveData();
        uiNotice = 'Welcome back. Your unicorn, unlocks, and best scores are here.';
    } catch (error) { uiNotice = 'Could not load that save. Choose an exported Unicorn Poop JSON file.'; }
    importInput.value = ''; gameState = 'SETTINGS'; syncGameUI();
});
document.addEventListener('keydown', event => { if (gameState === 'SETTINGS' && event.key === 'Escape') { resetToTitle(); syncGameUI(); } });
createHUD(); syncGameUI();
