// Fantasy presentation layer. Collision, scoring, saves, and input stay in game.js.
// Expensive artwork and trail materials are cached; per-frame work is bounded.
const FANTASY_WORLDS = [
    { name: 'Moonlit Lagoon', subtitle: 'Where little rainbows become legends', accent: '#a9eee1', tint: 'none', veil: '#081927' },
    { name: 'Rosewater Glade', subtitle: 'A little pink. A little peril.', accent: '#ffd0e6', tint: 'hue-rotate(68deg)', veil: '#211229' },
    { name: 'Aurora Springs', subtitle: 'Follow the light. Find your flow.', accent: '#bcd8ff', tint: 'hue-rotate(315deg)', veil: '#0c2030' },
];
const fantasyArt = { lagoon: new Image(), pup: new Image(), gallop: new Image() };
let fantasyTime = 0, fantasyEffects = [], fantasyBackground = null, fantasyBackgroundKey = '';
const fantasyTrailStamps = new Map();
fantasyArt.lagoon.onload = () => { fantasyBackgroundKey = ''; };
fantasyArt.lagoon.src = 'assets/fantasy/moonlit-lagoon.png';
fantasyArt.pup.src = 'assets/fantasy/puppy-star.png';
fantasyArt.gallop.src = 'assets/fantasy/unicorn-gallop.png';
function fantasyWorld() {
    const wave = roundRecorded && lastRunStats && [GAME_OVER, WIN, PAUSED].includes(gameState) ? lastRunStats.wave - 1 : currentWave;
    return FANTASY_WORLDS[Math.floor(wave / 3) % FANTASY_WORLDS.length];
}
function resetFantasyEffects() { fantasyTime = 0; fantasyEffects = []; }
function updateFantasyPresentation(delta) {
    if (![COUNTDOWN, PLAYING, GAME_OVER, WIN].includes(gameState)) return;
    if (!reducedMotion) fantasyTime += delta;
    fantasyEffects = fantasyEffects.filter(fx => fantasyTime - fx.time < fx.duration);
}
function fantasyEvent(type, x, y, text, color, character = null) {
    if (reducedMotion) return;
    fantasyEffects.push({ type, x: (x + .5) * GRID_SIZE, y: (y + .5) * GRID_SIZE, text, color, character, time: fantasyTime, duration: type === 'crash' ? 1400 : 1050 });
    if (fantasyEffects.length > 40) fantasyEffects.shift();
}
function rotateFantasyEffects(point, directions) {
    for (const fx of fantasyEffects) {
        [fx.x, fx.y] = point(fx.x, fx.y);
        if (fx.character) fx.character.dir = directions[fx.character.dir];
    }
    fantasyBackgroundKey = '';
}
function fantasyReady(img) { return img && img.complete && img.naturalWidth > 0; }
function fantasyAssetsPending() {
    return [imgCache.classic, fantasyArt.lagoon, fantasyArt.gallop].some(img => img && !img.complete);
}
function fantasyEllipse(g, x, y, rx, ry, color) {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = color; g.fill();
}
function fantasyStar(g, x, y, radius, color, rotation = 0, points = 4) {
    g.save(); g.translate(x, y); g.rotate(rotation); g.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const a = i * Math.PI / points - Math.PI / 2, r = i % 2 ? radius * .32 : radius;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (!i) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fillStyle = color; g.fill(); g.restore();
}
function makeFantasyBackground() {
    const surface = document.createElement('canvas');
    surface.width = CANVAS_WIDTH; surface.height = CANVAS_HEIGHT;
    const g = surface.getContext('2d'), world = fantasyWorld();
    const gradient = g.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#153c4b'); gradient.addColorStop(.55, '#101d35'); gradient.addColorStop(1, '#15313a');
    g.fillStyle = gradient; g.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (fantasyReady(fantasyArt.lagoon)) {
        g.filter = world.tint;
        // Turn the overhead environment in portrait and crop to fill. Preserve
        // the artwork's proportions rather than stretching crystals and ripples.
        const portrait = CANVAS_HEIGHT > CANVAS_WIDTH, image = fantasyArt.lagoon;
        const width = portrait ? CANVAS_HEIGHT : CANVAS_WIDTH, height = portrait ? CANVAS_WIDTH : CANVAS_HEIGHT;
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        g.save(); g.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        if (portrait) g.rotate(Math.PI / 2);
        g.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2, image.naturalWidth * scale, image.naturalHeight * scale);
        g.restore(); g.filter = 'none';
        g.fillStyle = 'rgba(5, 15, 30, .29)'; g.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    const vignette = g.createRadialGradient(CANVAS_WIDTH * .5, CANVAS_HEIGHT * .5, Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * .08, CANVAS_WIDTH * .5, CANVAS_HEIGHT * .5, Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * .65);
    vignette.addColorStop(0, '#07132200'); vignette.addColorStop(1, '#060d2690');
    g.fillStyle = vignette; g.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // A luminous edge marks the actual collision boundary.
    g.strokeStyle = '#a8e4ed50'; g.lineWidth = 2; g.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);
    return surface;
}
drawBackground = function () {
    const key = `${GRID_SIZE}|${COLS}|${ROWS}|${fantasyWorld().name}|${fantasyReady(fantasyArt.lagoon)}`;
    if (!fantasyBackground || fantasyBackgroundKey !== key) { fantasyBackground = makeFantasyBackground(); fantasyBackgroundKey = key; }
    ctx.drawImage(fantasyBackground, 0, 0);
    if (reducedMotion) return;
    const t = fantasyTime / 1000;
    for (let i = 0; i < (isMobile ? 24 : 40); i++) {
        const x = ((i * 193.17 + Math.sin(t * .17 + i) * 15) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
        const y = (i * 137.31 - t * (2 + i % 3) + CANVAS_HEIGHT * 10) % CANVAS_HEIGHT;
        const alpha = .14 + .2 * (.5 + .5 * Math.sin(t * 1.3 + i * 2));
        ctx.globalAlpha = alpha;
        fantasyStar(ctx, x, y, 1.7 + i % 3, i % 2 ? '#c4f2e7' : '#e5c4ff', t * .12);
    }
    ctx.globalAlpha = 1;
};
function fantasyTrailStamp(hue, fresh) {
    const key = `${GRID_SIZE}|${hue}|${fresh}`;
    if (fantasyTrailStamps.has(key)) return fantasyTrailStamps.get(key);
    const stamp = document.createElement('canvas'); stamp.width = stamp.height = GRID_SIZE * 2;
    const g = stamp.getContext('2d'), s = GRID_SIZE, c = s, r = s * .44;
    if (fresh) {
        const aura = g.createRadialGradient(c, c, 1, c, c, s * .8);
        aura.addColorStop(0, `hsla(${hue},95%,75%,.32)`); aura.addColorStop(1, `hsla(${hue},95%,70%,0)`);
        g.fillStyle = aura; g.fillRect(0, 0, s * 2, s * 2);
        fantasyEllipse(g, c, c, r * .8, r * .8, `hsla(${hue},90%,75%,.23)`);
        g.beginPath(); g.arc(c, c, r * .69, 0, Math.PI * 2); g.strokeStyle = `hsla(${hue},95%,87%,.9)`; g.lineWidth = s * .07; g.stroke();
        fantasyEllipse(g, c - r * .23, c - r * .31, r * .12, r * .09, '#ffffffb0');
    } else {
        fantasyEllipse(g, c, c + r * .74, r * 1.04, r * .46, '#030c1e80');
        const material = g.createLinearGradient(c - r, c - r, c + r, c + r);
        material.addColorStop(0, `hsl(${hue},92%,85%)`); material.addColorStop(.38, `hsl(${hue},87%,67%)`); material.addColorStop(1, `hsl(${hue},66%,40%)`);
        g.shadowColor = `hsla(${hue},85%,70%,.32)`; g.shadowBlur = s * .24;
        // Three soft sculpted layers: unmistakably rainbow poop, without pixel tiles.
        fantasyEllipse(g, c, c + r * .35, r, r * .58, material);
        fantasyEllipse(g, c + r * .02, c - r * .1, r * .76, r * .54, material);
        g.beginPath(); g.moveTo(c - r * .48, c - r * .13);
        g.bezierCurveTo(c - r * .62, c - r * .7, c + r * .38, c - r * .51, c + r * .12, c - r * 1.07);
        g.bezierCurveTo(c + r * .75, c - r * .54, c + r * .6, c - r * .06, c + r * .43, c + r * .12);
        g.closePath(); g.fillStyle = material; g.fill(); g.shadowBlur = 0;
        g.beginPath(); g.ellipse(c - r * .19, c + r * .28, r * .6, r * .21, -.12, Math.PI, Math.PI * 1.85);
        g.strokeStyle = '#ffffff65'; g.lineWidth = s * .055; g.stroke();
        fantasyEllipse(g, c - r * .14, c - r * .34, r * .22, r * .12, '#ffffff70');
    }
    fantasyTrailStamps.set(key, stamp); return stamp;
}
drawTrails = function () {
    for (const u of unicorns) {
        const fade = u.alive ? 1 : Math.max(0, 1 - (gameTime - u.deathTime) / TRAIL_FADE_DURATION);
        if (fade <= 0) continue;
        ctx.globalAlpha = fade;
        for (const seg of u.trail) {
            const hue = Math.round(Number(seg.color.match(/hsl\((\d+)/)?.[1] || 0) / 20) * 20;
            const fresh = gameTime - seg.time < FRESH_POOP_DURATION;
            ctx.drawImage(fantasyTrailStamp(hue, fresh), seg.x * GRID_SIZE - GRID_SIZE / 2, seg.y * GRID_SIZE - GRID_SIZE / 2);
        }
    }
    ctx.globalAlpha = 1;
    if (lastCrash) {
        const x = (Math.max(0, Math.min(COLS - 1, lastCrash.x)) + .5) * GRID_SIZE;
        const y = (Math.max(0, Math.min(ROWS - 1, lastCrash.y)) + .5) * GRID_SIZE;
        ctx.save(); ctx.strokeStyle = '#ffb0ca'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, GRID_SIZE * .75, 0, Math.PI * 2); ctx.stroke();
        fantasyStar(ctx, x, y, GRID_SIZE * .28, '#ffb0ca'); ctx.restore();
    }
};
function drawFantasyAccessory(g, id, size) {
    if (!id || id === 'none') return;
    g.save(); g.translate(size * .23, -size * .12); g.scale(size / 100, size / 100);
    g.lineJoin = 'round'; g.lineCap = 'round';
    const gold = g.createLinearGradient(-20, -20, 18, 5); gold.addColorStop(0, '#fff2a8'); gold.addColorStop(.5, '#eac76c'); gold.addColorStop(1, '#b57b35');
    if (id === 'crown') {
        g.beginPath(); g.moveTo(-15, -12); g.lineTo(-19, -28); g.lineTo(-9, -21); g.lineTo(-2, -34); g.lineTo(6, -21); g.lineTo(16, -28); g.lineTo(13, -12); g.closePath(); g.fillStyle = gold; g.fill();
        fantasyEllipse(g, -1, -18, 3, 3, '#ff9db8'); g.strokeStyle = '#fff5c7'; g.lineWidth = 2; g.stroke();
    } else if (id === 'halo') {
        g.shadowBlur = 14; g.shadowColor = '#fff2b4'; g.strokeStyle = '#ffecaf'; g.lineWidth = 3;
        g.beginPath(); g.ellipse(0, -33, 21, 5, -.1, 0, Math.PI * 2); g.stroke();
    } else if (id.includes('sunglasses')) {
        g.fillStyle = '#252a47'; roundRect(g, -9, -1, 16, 11, 4); g.fill(); roundRect(g, 10, -1, 15, 11, 4); g.fill();
        g.strokeStyle = '#ecceaa'; g.lineWidth = 2; g.beginPath(); g.moveTo(5, 2); g.lineTo(12, 2); g.stroke();
        g.strokeStyle = '#c6eff0'; g.beginPath(); g.moveTo(-6, 2); g.lineTo(0, 2); g.moveTo(13, 2); g.lineTo(19, 2); g.stroke();
    } else if (id.includes('headphones')) {
        const color = id.includes('pink') ? '#e697c3' : '#8eb9f3';
        g.beginPath(); g.arc(0, -4, 20, Math.PI, Math.PI * 1.94); g.strokeStyle = color; g.lineWidth = 5; g.stroke();
        fantasyEllipse(g, -18, -1, 6, 10, color); fantasyEllipse(g, 17, -1, 6, 10, color);
    } else if (id === 'flower_crown') {
        for (let i = -2; i <= 2; i++) fantasyStar(g, i * 7, -22 - Math.cos(i) * 3, 6, ['#ffdbe6', '#f3cbff', '#fff2b9'][Math.abs(i) % 3], .3, 5);
    } else if (id === 'bow') {
        g.translate(-38, 12); fantasyEllipse(g, -7, 0, 9, 6, '#ec91bd'); fantasyEllipse(g, 7, 0, 9, 6, '#ec91bd'); fantasyEllipse(g, 0, 0, 4, 4, '#fff0d0');
    } else if (id === 'helmet') {
        g.beginPath(); g.arc(0, -14, 19, Math.PI, 0); g.lineTo(19, -10); g.lineTo(-19, -10); g.closePath();
        g.fillStyle = '#b8d1df'; g.fill(); g.strokeStyle = '#edf7ff'; g.lineWidth = 2; g.stroke();
    } else if (id === 'cape_red') {
        g.translate(-35, 10); g.beginPath(); g.moveTo(0, -3); g.quadraticCurveTo(-23, 4, -37, 15); g.quadraticCurveTo(-15, 35, 4, 21); g.closePath(); g.fillStyle = '#e2739b'; g.fill();
    } else if (id === 'top_hat' || id === 'pirate_hat') {
        g.fillStyle = '#252943'; roundRect(g, -14, -34, 28, 21, 4); g.fill(); fantasyEllipse(g, 0, -12, 24, 5, '#373755');
        g.fillStyle = '#d99ab9'; g.fillRect(-14, -20, 28, 5);
    } else {
        g.beginPath(); g.moveTo(-17, -12); g.quadraticCurveTo(-10, -28, 0, -43); g.quadraticCurveTo(4, -25, 17, -12); g.closePath();
        g.fillStyle = id === 'party_hat' ? '#e5a0cb' : '#8275c5'; g.fill(); fantasyEllipse(g, 0, -11, 22, 4, '#c4b6ed'); fantasyStar(g, 0, -26, 5, '#fff3ba');
    }
    g.restore();
}
drawSpriteUnicorn = function (avatarId, accessoryId, x, y, dir, size, trot, g = ctx) {
    const image = imgCache[avatarId] || imgCache.classic;
    if (!fantasyReady(image)) {
        // Keep the player visible if artwork fails or takes too long to arrive.
        g.save(); g.translate(x, y); g.scale(dir === 'left' || dir === 'up' ? -1 : 1, 1);
        fantasyEllipse(g, -size * .06, 0, size * .28, size * .17, '#e9e1ef');
        fantasyEllipse(g, size * .19, -size * .2, size * .13, size * .18, '#fff6ee');
        for (const leg of [-.2, -.04, .11]) { g.fillStyle = '#ded6ea'; roundRect(g, size * leg, size * .06, size * .065, size * .23, size * .025); g.fill(); }
        fantasyEllipse(g, size * .09, -size * .2, size * .07, size * .18, '#ba9de1');
        g.beginPath(); g.moveTo(size * .2, -size * .32); g.lineTo(size * .3, -size * .52); g.lineTo(size * .28, -size * .3); g.closePath(); g.fillStyle = '#ffe2a5'; g.fill();
        fantasyEllipse(g, size * .245, -size * .23, size * .022, size * .027, '#57446e'); g.restore(); return;
    }
    const meta = UNICORN_AVATARS.find(a => a.id === avatarId) || UNICORN_AVATARS[0];
    const moving = gameState === PLAYING, runningPose = moving || gameState === PAUSED;
    const phase = runningPose && !reducedMotion ? trot : 0;
    const idlePhase = gameState === CUSTOMIZE ? performance.now() * .002 : fantasyTime * .002;
    const bob = reducedMotion ? 0 : runningPose ? Math.sin(phase * 1.4) * size * .014 : Math.sin(idlePhase) * size * .01;
    const turnAge = performance.now() - lastDirChangeTime;
    const collectAge = performance.now() - lastCollectTime;
    const turnLean = moving && !reducedMotion && turnAge < 180 ? Math.sin(turnAge / 180 * Math.PI) * .08 : 0;
    const collectHop = moving && !reducedMotion && collectAge < 260 ? Math.sin(collectAge / 260 * Math.PI) * size * .08 : 0;
    const facing = dir === 'left' || dir === 'up' ? -1 : 1;
    // Upright billboards preserve a readable 3D character rather than rotating it sideways.
    g.save(); g.translate(x, y + bob - collectHop);
    g.rotate(!reducedMotion && runningPose ? Math.sin(phase) * .018 + turnLean + (dir === 'up' ? -.07 : dir === 'down' ? .07 : 0) : 0);
    const breath = !runningPose && !reducedMotion ? Math.sin(idlePhase) * .014 : 0;
    g.scale(facing * (1 + Math.sin(phase) * .012 - breath), 1 - Math.sin(phase) * .012 + breath);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.filter = meta.filter;
    if (runningPose && !reducedMotion && fantasyReady(fantasyArt.gallop)) {
        const frame = Math.floor(phase / (Math.PI * 2 / 8)) % 8;
        const sw = fantasyArt.gallop.naturalWidth / 4, sh = fantasyArt.gallop.naturalHeight / 2;
        g.drawImage(fantasyArt.gallop, (frame % 4) * sw, Math.floor(frame / 4) * sh, sw, sh, -size * .5, -size * .56, size, size);
    } else g.drawImage(image, -size * .5, -size * .56, size, size);
    g.filter = 'none'; drawFantasyAccessory(g, accessoryId, size); g.restore();
};
drawUnicorn = function (u) {
    if (!u.alive) return;
    const pos = visualPosition(u), size = GRID_SIZE * (u.isBoss ? 3.7 : u.isPlayer ? 3.0 : 2.65);
    const avatar = u.isPlayer ? selectedAvatarId : u.avatarId || (u.isBoss ? 'shadow' : 'candy');
    ctx.save();
    fantasyEllipse(ctx, pos.x, pos.y + size * .25, size * .3, size * .12, '#020d2090');
    const accent = gameTime < u.invulnerableUntil ? '#a8fff0' : '#ffedb9';
    if (u.isPlayer) {
        ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(pos.x, pos.y + size * .22, size * .35, size * .14, 0, 0, Math.PI * 2); ctx.stroke();
        const { dx, dy } = dirToDelta(u.dir);
        ctx.save(); ctx.translate(pos.x + dx * size * .49, pos.y + dy * size * .49); ctx.rotate(Math.atan2(dy, dx));
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-3, -5); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fillStyle = accent; ctx.fill(); ctx.restore();
    }
    if (u.isPlayer && burstActive && !reducedMotion) {
        const { dx, dy } = dirToDelta(u.dir);
        for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = .17 / i;
            drawSpriteUnicorn(avatar, 'none', pos.x - dx * i * GRID_SIZE * .43, pos.y - dy * i * GRID_SIZE * .43, u.dir, size, u.trotPhase);
        }
        ctx.globalAlpha = 1;
    }
    if (u.isPlayer && activePowerup?.type.id === 'ghost') ctx.globalAlpha = .65;
    drawSpriteUnicorn(avatar, u.isPlayer ? selectedAccessoryId : 'none', pos.x, pos.y, u.dir, size, u.trotPhase);
    ctx.globalAlpha = 1;
    if (u.isPlayer && survivalTimer < 5000) {
        ctx.font = `700 ${Math.max(14, GRID_SIZE * .53)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = accent; ctx.shadowColor = '#071827'; ctx.shadowBlur = 5;
        ctx.fillText('YOU', pos.x, pos.y - size * .55); ctx.shadowBlur = 0;
    }
    ctx.restore();
};
const fallbackCompanion = drawCompanion;
drawCompanion = function (id, x, y, dir, trot, scale, g = ctx) {
    if (!fantasyReady(fantasyArt.pup)) { fallbackCompanion(id, x, y, dir, trot, scale, g); return; }
    const size = scale * 24, dog = getEquippedDog();
    const phase = [PLAYING, PAUSED].includes(gameState) && !reducedMotion ? trot : 0;
    const bounce = Math.abs(Math.sin(phase * 1.2)) * size * .035;
    g.save(); g.translate(x, y - bounce); g.rotate(Math.sin(phase * 1.2) * .035); g.scale(dir === 'left' || dir === 'up' ? -1 : 1, 1 + Math.sin(phase * 1.2) * .025);
    g.filter = dog.id === 'speed_pup' ? 'hue-rotate(165deg)' : dog.id === 'ghost_pup' ? 'hue-rotate(260deg)' : dog.id === 'shield_pup' ? 'saturate(1.5)' : 'none';
    g.imageSmoothingEnabled = true; g.drawImage(fantasyArt.pup, -size / 2, -size * .6, size, size); g.restore();
};
drawAllUnicorns = function () {
    // Back-to-front sorting gives characters depth when they pass one another.
    for (const u of [...unicorns].filter(u => u.alive).sort((a, b) => a.y - b.y)) drawUnicorn(u);
    if (player?.alive && companionVisuals.length) {
        const cv = companionVisuals[0], size = GRID_SIZE * 1.5;
        fantasyEllipse(ctx, cv.x, cv.y + size * .22, size * .25, size * .1, '#03102065');
        drawCompanion('dog_brown', cv.x, cv.y, cv.dir, player.trotPhase, size / 24);
    }
};
drawCollectibles = function () {
    for (const c of collectibles) {
        const x = (c.x + .5) * GRID_SIZE, y = (c.y + .5) * GRID_SIZE;
        const bob = reducedMotion ? 0 : Math.sin(fantasyTime * .0025 + c.x) * GRID_SIZE * .1;
        const r = GRID_SIZE * .48;
        ctx.save(); ctx.translate(x, y + bob);
        fantasyEllipse(ctx, 0, r * .95 - bob, r * .65, r * .2, '#06142e80');
        ctx.shadowColor = c.type.color; ctx.shadowBlur = GRID_SIZE * .45;
        const light = ctx.createLinearGradient(-r, -r, r, r); light.addColorStop(0, '#fff9de'); light.addColorStop(.45, c.type.color); light.addColorStop(1, '#a478c7');
        if (c.type.id === 'heart') {
            ctx.beginPath(); ctx.moveTo(0, r * .8); ctx.bezierCurveTo(-r * 1.6, -r * .2, -r * .6, -r * 1.3, 0, -r * .45); ctx.bezierCurveTo(r * .6, -r * 1.3, r * 1.6, -r * .2, 0, r * .8); ctx.fillStyle = light; ctx.fill();
        } else if (c.type.id === 'gem' || c.type.id === 'widener') {
            ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .8, -.2 * r); ctx.lineTo(.6 * r, .5 * r); ctx.lineTo(0, r); ctx.lineTo(-.6 * r, .5 * r); ctx.lineTo(-.8 * r, -.2 * r); ctx.closePath(); ctx.fillStyle = light; ctx.fill();
            ctx.strokeStyle = '#ffffff85'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-.3 * r, 0); ctx.lineTo(0, r); ctx.moveTo(-.8 * r, -.2 * r); ctx.lineTo(.8 * r, -.2 * r); ctx.stroke();
        } else fantasyStar(ctx, 0, 0, r, light, Math.sin(fantasyTime * .001 + c.y) * .12, 5);
        ctx.shadowBlur = 0; fantasyEllipse(ctx, -r * .22, -r * .25, r * .12, r * .08, '#fffbee'); ctx.restore();
    }
};
drawPowerups = function () {
    for (const p of powerups) {
        const x = (p.x + .5) * GRID_SIZE, y = (p.y + .5) * GRID_SIZE, r = GRID_SIZE * .7;
        ctx.save(); ctx.translate(x, y); ctx.rotate(reducedMotion ? 0 : fantasyTime * .001);
        ctx.strokeStyle = p.type.color; ctx.lineWidth = 2; ctx.shadowColor = p.type.color; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        fantasyStar(ctx, 0, 0, r * .9, p.type.color); ctx.rotate(reducedMotion ? 0 : -fantasyTime * .001);
        ctx.font = `${GRID_SIZE * .65}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText(p.type.symbol, 0, 1); ctx.restore();
    }
};
function drawFantasyEffects() {
    if (reducedMotion) return;
    for (const fx of fantasyEffects) {
        const age = Math.max(0, (fantasyTime - fx.time) / fx.duration), alpha = Math.pow(1 - age, 2);
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(fx.x, fx.y);
        if (fx.character && age < .55) {
            const c = fx.character;
            ctx.save(); ctx.globalAlpha *= 1 - age / .55; ctx.translate(0, -age * GRID_SIZE);
            ctx.rotate(age * (c.dir === 'left' ? -.55 : .55));
            drawSpriteUnicorn(c.avatar, c.accessory, 0, 0, c.dir, c.size * (1 - age * .2), c.trot);
            ctx.restore();
        }
        ctx.strokeStyle = fx.color; ctx.lineWidth = 2 * (1 - age) + .5;
        ctx.beginPath(); ctx.arc(0, 0, GRID_SIZE * (.3 + age * (fx.type === 'splat' ? 4 : 2.5)), 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + age * .6, r = GRID_SIZE * (.4 + age * 2);
            fantasyStar(ctx, Math.cos(a) * r, Math.sin(a) * r * .65, 4 * (1 - age) + 1, fx.color, a);
        }
        if (fx.text) {
            ctx.font = `800 ${GRID_SIZE * .7}px system-ui`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff7e7'; ctx.shadowColor = '#091527'; ctx.shadowBlur = 6;
            ctx.fillText(fx.text, 0, -GRID_SIZE * (1.7 + age * 1.6));
        }
        ctx.restore();
    }
}
drawCountdownScreen = function () { drawBackground(); drawCollectibles(); drawAllUnicorns(); drawHUD(); };
const fallbackParticles = drawParticles;
drawParticles = function (particles) { if (!reducedMotion) fallbackParticles(particles); };
const fallbackActivePowerup = drawActivePowerup, fallbackBossBar = drawBossHealthBar;
drawActivePowerup = function () { if (typeof syncGameUI !== 'function') fallbackActivePowerup(); };
drawBossHealthBar = function () { if (typeof syncGameUI !== 'function') fallbackBossBar(); };

// Soft bell harmonics and short filtered sweeps replace harsh retro oscillators.
playSound = function (type) {
    if (!soundEnabled || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    const now = audioCtx.currentTime;
    const notes = type === 'win' ? [523.25, 659.25, 783.99, 1046.5] : type === 'unlock' ? [659.25, 783.99, 987.77] : type === 'collect' ? [880, 1318.51] : type === 'go' ? [523.25, 783.99] : type === 'countdown' ? [523.25] : type === 'powerup' ? [440, 659.25, 880] : type === 'death' ? [220, 164.81] : type === 'npc_death' ? [392, 523.25] : [330, 440];
    notes.forEach((frequency, i) => {
        const start = now + i * .07, duration = type === 'countdown' ? .25 : .42;
        const oscillator = audioCtx.createOscillator(), overtone = audioCtx.createOscillator(), gain = audioCtx.createGain(), overtoneGain = audioCtx.createGain();
        oscillator.type = 'sine'; overtone.type = 'sine'; oscillator.frequency.value = frequency; overtone.frequency.value = frequency * 2.003;
        oscillator.connect(gain); overtone.connect(overtoneGain); overtoneGain.connect(gain); overtoneGain.gain.value = .2; gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.055, start + .015); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.start(start); overtone.start(start); oscillator.stop(start + duration); overtone.stop(start + duration);
        oscillator.onended = () => { oscillator.disconnect(); overtone.disconnect(); gain.disconnect(); overtoneGain.disconnect(); };
    });
};
