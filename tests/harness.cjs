const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
const renderer = fs.readFileSync(path.join(__dirname, '..', 'render.js'), 'utf8');

// Run the real engine in isolation; browser drawing/audio are the only mocked surfaces.
function engine({ width = 1280, height = 720, touch = false, render = false, dpr = 1, seed = 1 } = {}) {
    const clock = { now: 10000 }, saved = {};
    const canvasEvents = {}, drawCalls = [];
    const gradient = { addColorStop() {} };
    const ctx = new Proxy({}, { get: (target, key) => target[key] || (key.startsWith('create') ? () => gradient : () => {}), set: (target, key, value) => (target[key] = value, true) });
    ctx.drawImage = (...args) => drawCalls.push(args);
    const canvas = { style: {}, addEventListener: (name, handler) => canvasEvents[name] = handler, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width, height }) };
    let randomState = seed >>> 0;
    const randomMath = Object.create(Math);
    randomMath.random = () => { randomState = (Math.imul(1664525, randomState) + 1013904223) >>> 0; return randomState / 4294967296; };
    const context = vm.createContext({
        console, Math: randomMath, JSON, performance: { now: () => clock.now },
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

module.exports = { engine, advance };
