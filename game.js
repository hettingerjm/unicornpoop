// ============================================
//  UNICORN POOP - A Rainbow Trail Game
//  A father-daughter project
// ============================================

// ---- SETTINGS (tweak these!) ----
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GRID_SIZE = 16;               // pixels per grid cell
const MOVE_INTERVAL = 100;          // ms between moves (lower = faster)
const NPC_COUNT = 3;                // number of NPC unicorns
const COUNTDOWN_SECONDS = 3;        // "Ready, Set, Go" duration
const TRAIL_FADE_DURATION = 1500;   // ms for dead NPC trail to fade out
const NPC_LOOKAHEAD = 5;            // how far NPCs look ahead
const NPC_MISTAKE_CHANCE = 0.04;    // chance NPC picks a random direction
const SOUND_ENABLED_DEFAULT = true;
const BG_COLOR = '#2d1b4e';         // dark purple background
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.03)';

// ---- UNICORN DRAWING SETTINGS (tweak these!) ----
const PLAYER_SCALE = 1.5;           // player unicorn visual scale
const NPC_SCALE = 1.15;             // NPC unicorn visual scale
const BODY_LENGTH = 13;             // torso length (half-width of body shape)
const BODY_HEIGHT = 6;              // torso height (half-height of body shape)
const HEAD_LENGTH = 7;              // head oval horizontal radius
const HEAD_HEIGHT = 4.5;            // head oval vertical radius
const NECK_LENGTH = 6;              // neck length
const HORN_LENGTH = 11;             // horn length
const HORN_BASE_W = 2.2;            // horn base half-width
const LEG_UPPER = 5;                // upper leg segment length
const LEG_LOWER = 5;                // lower leg segment length
const LEG_WIDTH = 1.8;              // leg thickness
const HOOF_SIZE = 2.2;              // hoof width
const TAIL_LENGTH = 12;             // tail length
const MANE_STRANDS = 7;             // number of mane strands
const MANE_LENGTH = 6;              // mane strand length
const EYE_RADIUS = 1.5;             // eye size
const TROT_SPEED = 0.012;           // leg animation speed (radians per ms)

// ---- CUSTOMIZATION: PLAYER COLORS ----
const PLAYER_COLORS = [
    { id: 'white',   label: 'Snow',      body: '#FFFFFF', belly: '#FFF8F0', border: '#E0E0E0', hoofColor: '#CCCCCC' },
    { id: 'pink',    label: 'Bubblegum', body: '#FFB6D9', belly: '#FFD6EB', border: '#FF69B4', hoofColor: '#FF69B4' },
    { id: 'purple',  label: 'Grape',     body: '#D1A3FF', belly: '#E8D0FF', border: '#9B59B6', hoofColor: '#9B59B6' },
    { id: 'blue',    label: 'Sky',       body: '#A3D5FF', belly: '#D0EBFF', border: '#4A90D9', hoofColor: '#4A90D9' },
    { id: 'mint',    label: 'Mint',      body: '#A3FFD6', belly: '#D0FFE8', border: '#2ECC71', hoofColor: '#2ECC71' },
    { id: 'yellow',  label: 'Sunshine',  body: '#FFF3A3', belly: '#FFFBD0', border: '#F1C40F', hoofColor: '#F1C40F' },
    { id: 'coral',   label: 'Coral',     body: '#FFB3A3', belly: '#FFD6CC', border: '#E74C3C', hoofColor: '#E74C3C' },
    { id: 'gold',    label: 'Gold',      body: '#FFD700', belly: '#FFE866', border: '#DAA520', hoofColor: '#B8860B' },
];

// ---- CUSTOMIZATION: HATS ----
const RARITY_COLORS = {
    common:    '#AAAAAA',
    rare:      '#4FC3F7',
    epic:      '#C77DFF',
    legendary: '#FFD700',
};

const HATS = [
    { id: 'none',       label: 'None',         rarity: 'common',    unlockRounds: 0,  buff: null, buffDesc: '' },
    { id: 'party',      label: 'Party Hat',     rarity: 'common',    unlockRounds: 3,  buff: null, buffDesc: 'Just for fun!' },
    { id: 'crown',      label: 'Crown',         rarity: 'common',    unlockRounds: 0,  buff: { scoreMult: 0.10 }, buffDesc: '+10% score' },
    { id: 'cowboy',     label: 'Cowboy Hat',     rarity: 'rare',      unlockRounds: 8,  buff: { freeHit: true }, buffDesc: '1 free collision' },
    { id: 'wizard',     label: 'Wizard Hat',     rarity: 'rare',      unlockRounds: 15, buff: { speedResist: 0.15 }, buffDesc: 'Slower speed scaling' },
    { id: 'tophat',     label: 'Top Hat',        rarity: 'epic',      unlockRounds: 25, buff: { poopValue: 0.15 }, buffDesc: '+15% pickup value' },
    { id: 'sunglasses', label: 'Sunglasses',     rarity: 'epic',      unlockRounds: 35, buff: { graceMs: 150 }, buffDesc: 'Turn grace window' },
    { id: 'halo',       label: 'Halo',           rarity: 'legendary', unlockRounds: 50, buff: { scoreMult: 0.15 }, buffDesc: '+15% score' },
    { id: 'rainbow',    label: 'Rainbow Crown',  rarity: 'legendary', unlockRounds: 75, buff: { scoreMult: 0.10, speedBonus: 0.10 }, buffDesc: '+10% score & speed' },
];

// ---- PROGRESSIVE DIFFICULTY (wave system) ----
// Each wave: { npcCount, moveInterval (ms), npcLookahead, npcMistakeChance }
const WAVES = [
    { npcCount: 2, moveInterval: 110, lookahead: 4, mistakeChance: 0.06 },   // Wave 1 (easy)
    { npcCount: 3, moveInterval: 100, lookahead: 5, mistakeChance: 0.04 },   // Wave 2
    { npcCount: 3, moveInterval: 90,  lookahead: 6, mistakeChance: 0.03 },   // Wave 3
    { npcCount: 4, moveInterval: 85,  lookahead: 6, mistakeChance: 0.025 },  // Wave 4
    { npcCount: 4, moveInterval: 80,  lookahead: 7, mistakeChance: 0.02 },   // Wave 5
    { npcCount: 5, moveInterval: 75,  lookahead: 7, mistakeChance: 0.015 },  // Wave 6
    { npcCount: 5, moveInterval: 70,  lookahead: 8, mistakeChance: 0.01 },   // Wave 7
    { npcCount: 6, moveInterval: 65,  lookahead: 9, mistakeChance: 0.008 },  // Wave 8+
];

// ---- MANE CUSTOMIZATION ----
const MANE_COLOR_PALETTE = [
    '#FF69B4', '#FF1493', '#C71585',   // pinks
    '#C77DFF', '#9B59B6', '#7B68EE',   // purples
    '#4FC3F7', '#0288D1', '#01579B',   // blues
    '#66BB6A', '#2ECC71', '#1B5E20',   // greens
    '#FFD700', '#FFA726', '#F1C40F',   // yellows/golds
    '#FF6B6B', '#E74C3C', '#FF4500',   // reds
    '#FFFFFF', '#CCCCCC', '#333333',   // neutrals
];

const HAIRSTYLES = [
    { id: 'flowing',  label: 'Flowing'  },
    { id: 'curly',    label: 'Curly'    },
    { id: 'spiky',    label: 'Spiky'    },
    { id: 'braided',  label: 'Braided'  },
    { id: 'short',    label: 'Short'    },
];

// ---- COMPANIONS ----
const COMPANION_FOLLOW_DELAY = 8;        // grid steps behind player in history
const COMPANION_OFFSET_PX = 12;          // perpendicular offset in pixels
const COMPANION_LERP_SPEED = 0.18;       // interpolation smoothing (0-1)
const COMPANION_SCORE_BONUS = 0.05;      // +5% score multiplier per companion

const COMPANIONS = [
    { id: 'none',      label: 'None',        type: 'none'  },
    { id: 'pony_pink', label: 'Pink Pony',   type: 'pony', bodyColor: '#FFB6D9', maneColor: '#FF69B4' },
    { id: 'pony_blue', label: 'Blue Pony',   type: 'pony', bodyColor: '#A3D5FF', maneColor: '#4A90D9' },
    { id: 'pony_mint', label: 'Mint Pony',   type: 'pony', bodyColor: '#A3FFD6', maneColor: '#2ECC71' },
    { id: 'cat_orange', label: 'Orange Cat', type: 'cat',  bodyColor: '#FFB74D', stripeColor: '#E65100' },
    { id: 'cat_gray',   label: 'Gray Cat',   type: 'cat',  bodyColor: '#BDBDBD', stripeColor: '#616161' },
    { id: 'dog_brown',  label: 'Brown Dog',  type: 'dog',  bodyColor: '#A1887F', earColor: '#5D4037' },
    { id: 'dog_golden', label: 'Golden Dog',  type: 'dog',  bodyColor: '#FFD54F', earColor: '#F9A825' },
];

// Dog unlock thresholds (rounds played)
const DOG_UNLOCK_THRESHOLDS = [
    { rounds: 3,  count: 1, label: 'Dog Unlocked!' },
    { rounds: 6,  count: 2, label: 'Second Dog!' },
    { rounds: 10, count: 3, label: 'Dog Pack!' },
];

function getUnlockedDogCount() {
    let count = 0;
    for (const t of DOG_UNLOCK_THRESHOLDS) {
        if (roundsPlayed >= t.rounds) count = t.count;
    }
    return count;
}

// ---- SCORING SYSTEM ----
const SCORE_PER_SECOND = 10;             // base score per second survived
const SCORE_PER_KILL = 500;              // score for eliminating an NPC
const MULTIPLIER_GROWTH_INTERVAL = 5000; // ms between multiplier ticks
const MULTIPLIER_INCREMENT = 0.5;        // multiplier increase per tick
const MAX_MULTIPLIER = 10;

// ---- COLLECTIBLES ----
const COLLECTIBLE_SPAWN_INTERVAL = 1200; // ms between spawns (fast!)
const COLLECTIBLE_TYPES = [
    { id: 'star',    label: 'Star',     score: 200,  color: '#FFD700', symbol: '\u2605', multiplierBoost: 0.5 },
    { id: 'gem',     label: 'Gem',      score: 500,  color: '#C77DFF', symbol: '\u25C6', multiplierBoost: 1.0 },
    { id: 'heart',   label: 'Heart',    score: 100,  color: '#FF69B4', symbol: '\u2665', multiplierBoost: 0.25 },
];

// ---- POWER-UP SYSTEM ----
const POWERUP_SPAWN_INTERVAL = 12000;    // ms between power-up spawns
const POWERUP_TYPES = [
    { id: 'speed',   label: 'Speed Boost', duration: 4000, color: '#00E5FF', symbol: '\u26A1' },
    { id: 'ghost',   label: 'Ghost Mode',  duration: 3000, color: '#E0E0FF', symbol: '\uD83D\uDC7B' },
    { id: 'cleanse', label: 'Cleanse',     duration: 0,    color: '#66BB6A', symbol: '\u2728' },
];
const CLEANSE_RADIUS = 5;                // grid cells cleared around player

// ---- BOSS SYSTEM ----
const BOSS_WAVE_INTERVAL = 5;            // boss every N waves
const BOSS_TYPES = [
    { id: 'charger',    label: 'The Charger',     health: 5, speed: 0.7, color: '#FF1744', bodyColor: '#8B0000',
      border: '#FF5252', hornGradient: ['#FF1744','#D50000','#B71C1C'], maneColors: ['#FF5252','#FF1744','#D50000'],
      tailColors: ['#FF5252','#FF1744'], eyeColor: '#FFEB3B', belly: '#FF8A80', hoofColor: '#D50000' },
    { id: 'phantom',    label: 'The Phantom',      health: 4, speed: 1.0, color: '#7C4DFF', bodyColor: '#311B92',
      border: '#B388FF', hornGradient: ['#7C4DFF','#651FFF','#6200EA'], maneColors: ['#B388FF','#7C4DFF','#651FFF'],
      tailColors: ['#B388FF','#7C4DFF'], eyeColor: '#FF4081', belly: '#9575CD', hoofColor: '#651FFF' },
];

// ---- NPC PERSONALITY TYPES ----
const NPC_PERSONALITIES = [
    { id: 'normal',     label: 'Normal',    aggressiveness: 0, mistakeMod: 1.0, lookaheadMod: 1.0 },
    { id: 'aggressive', label: 'Aggressive', aggressiveness: 0.4, mistakeMod: 1.2, lookaheadMod: 0.8 },
    { id: 'defensive',  label: 'Defensive',  aggressiveness: -0.3, mistakeMod: 0.5, lookaheadMod: 1.5 },
    { id: 'chaotic',    label: 'Chaotic',    aggressiveness: 0.1, mistakeMod: 3.0, lookaheadMod: 0.6 },
];

// ---- XP / LEVEL SYSTEM ----
const XP_PER_SECOND = 1;
const XP_PER_KILL = 50;
const XP_PER_WIN = 200;
const XP_LEVEL_BASE = 100;              // XP needed for level 1
const XP_LEVEL_SCALE = 1.4;             // each level requires more
const MAX_LEVEL = 50;

// ---- GAME MODES ----
const GAME_MODES = [
    { id: 'classic',     label: 'Classic',      desc: 'Normal waves',         speedMod: 1.0, timeLimitMs: 0 },
    { id: 'speed',       label: 'Speed',        desc: 'Everything faster!',   speedMod: 0.65, timeLimitMs: 0 },
    { id: 'chill',       label: 'Chill',        desc: 'Relax and survive',    speedMod: 1.4, timeLimitMs: 0 },
    { id: 'bossrush',    label: 'Boss Rush',    desc: 'Only bosses!',         speedMod: 1.0, timeLimitMs: 0 },
    { id: 'scoreattack', label: 'Score Attack', desc: '60 second sprint',     speedMod: 1.0, timeLimitMs: 60000 },
];

// ---- ACHIEVEMENTS ----
const ACHIEVEMENTS = [
    { id: 'first_win',     label: 'First Victory',     desc: 'Win your first game', icon: '\uD83C\uDFC6' },
    { id: 'wave5',         label: 'Wave Rider',         desc: 'Reach wave 5',        icon: '\uD83C\uDF0A' },
    { id: 'wave10',        label: 'Unstoppable',        desc: 'Reach wave 10',       icon: '\uD83D\uDD25' },
    { id: 'kill10',        label: 'Unicorn Hunter',     desc: 'Defeat 10 unicorns',  icon: '\u2694\uFE0F' },
    { id: 'score5000',     label: 'High Scorer',        desc: 'Score 5000+ in a run', icon: '\u2B50' },
    { id: 'score25000',    label: 'Score Legend',        desc: 'Score 25000+',         icon: '\uD83D\uDCAB' },
    { id: 'boss_kill',     label: 'Boss Slayer',        desc: 'Defeat a boss',        icon: '\uD83D\uDC09' },
    { id: 'collect20',     label: 'Collector',          desc: 'Collect 20 items',      icon: '\uD83D\uDC8E' },
    { id: 'survive60',     label: 'Survivor',           desc: 'Survive 60 seconds',   icon: '\u23F1\uFE0F' },
    { id: 'all_modes',     label: 'Mode Master',        desc: 'Win in every mode',    icon: '\uD83C\uDFAE' },
];

// ---- SCREEN SHAKE ----
const SHAKE_INTENSITY = 6;
const SHAKE_DURATION = 300;              // ms

// ---- CONSTANTS (derived) ----
const COLS = CANVAS_WIDTH / GRID_SIZE;   // 80
const ROWS = CANVAS_HEIGHT / GRID_SIZE;  // 45

const TITLE = 'TITLE';
const COUNTDOWN = 'COUNTDOWN';
const PLAYING = 'PLAYING';
const PAUSED = 'PAUSED';
const GAME_OVER = 'GAME_OVER';
const WIN = 'WIN';
const CUSTOMIZE = 'CUSTOMIZE';
const MODE_SELECT = 'MODE_SELECT';
const RUN_SUMMARY = 'RUN_SUMMARY';

const DIR_DELTA = {
    up:    { dx:  0, dy: -1 },
    down:  { dx:  0, dy:  1 },
    left:  { dx: -1, dy:  0 },
    right: { dx:  1, dy:  0 },
};

const OPPOSITES = { up: 'down', down: 'up', left: 'right', right: 'left' };

// ---- DEFAULT PLAYER THEME (modified at runtime by customization) ----
let playerTheme = {
    body: '#FFFFFF',
    belly: '#FFF8F0',
    border: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.35)',
    hornGradient: ['#FF69B4', '#FFD700', '#FF1493'],
    maneColors: ['#FF69B4', '#C77DFF', '#7B68EE', '#4FC3F7', '#66BB6A', '#FFD700'],
    tailColors: ['#FF69B4', '#C77DFF', '#7B68EE'],
    hoofColor: '#FFD700',
    eyeColor: '#6B21A8',
    label: 'YOU',
};

const NPC_THEMES = [
    {
        body: '#FFB3D9', belly: '#FFD6E8', border: '#FF69B4', glow: null,
        hornGradient: ['#FF69B4', '#FF1493', '#C71585'],
        maneColors: ['#FF1493', '#FF69B4', '#C71585'],
        tailColors: ['#FF1493', '#FF69B4'],
        hoofColor: '#FF69B4', eyeColor: '#880E4F', label: 'NPC',
    },
    {
        body: '#B3E5FC', belly: '#E1F5FE', border: '#4FC3F7', glow: null,
        hornGradient: ['#4FC3F7', '#0288D1', '#01579B'],
        maneColors: ['#0288D1', '#4FC3F7', '#01579B'],
        tailColors: ['#0288D1', '#4FC3F7'],
        hoofColor: '#4FC3F7', eyeColor: '#01579B', label: 'NPC',
    },
    {
        body: '#C8E6C9', belly: '#E8F5E9', border: '#66BB6A', glow: null,
        hornGradient: ['#66BB6A', '#388E3C', '#1B5E20'],
        maneColors: ['#388E3C', '#66BB6A', '#1B5E20'],
        tailColors: ['#388E3C', '#66BB6A'],
        hoofColor: '#66BB6A', eyeColor: '#1B5E20', label: 'NPC',
    },
    {
        body: '#FFE0B2', belly: '#FFF3E0', border: '#FFA726', glow: null,
        hornGradient: ['#FFA726', '#F57C00', '#E65100'],
        maneColors: ['#F57C00', '#FFA726', '#E65100'],
        tailColors: ['#F57C00', '#FFA726'],
        hoofColor: '#FFA726', eyeColor: '#E65100', label: 'NPC',
    },
];

// ---- GAME STATE ----
let gameState = TITLE;
let unicorns = [];
let player = null;
let occupiedGrid = [];
let survivalTimer = 0;
let countdownTimer = 0;
let countdownPhase = 0;
let moveAccumulator = 0;
let soundEnabled = SOUND_ENABLED_DEFAULT;
let isFullscreen = false;
let lastTimestamp = 0;
let deathParticles = [];
let winParticles = [];
let titleHue = 0;
let blinkTimer = 0;

// ---- WAVE STATE ----
let currentWave = 0;             // 0-indexed, resets on loss
let waveNpcCount = 2;
let waveMoveInterval = 110;
let waveLookahead = 4;
let waveMistakeChance = 0.06;

function applyWave() {
    const w = WAVES[Math.min(currentWave, WAVES.length - 1)];
    waveNpcCount = w.npcCount;
    waveMoveInterval = w.moveInterval;
    waveLookahead = w.lookahead;
    waveMistakeChance = w.mistakeChance;
}

// ---- CUSTOMIZATION STATE ----
let selectedColorIndex = 0;
let selectedHatId = 'crown';
let roundsPlayed = 0;
let customizePreviewTrot = 0;
let selectedCompanionId = 'none';
let selectedHairstyle = 'flowing';
let selectedManeColors = ['#FF69B4', '#C77DFF', '#7B68EE', '#4FC3F7', '#66BB6A', '#FFD700', '#FFFFFF'];
let customizeTab = 'body';  // 'body' | 'mane' | 'hats' | 'companions'
let maneEditStrand = 0;     // which strand index is selected for color editing

// ---- SCORING STATE ----
let score = 0;
let scoreMultiplier = 1.0;
let multiplierTimer = 0;
let runKills = 0;
let runCollectibles = 0;

// ---- COLLECTIBLE STATE ----
let collectibles = [];      // [{x, y, type, spawnTime}]
let collectibleTimer = 0;
let collectParticles = [];  // sparkle particles when collected

// ---- POWER-UP STATE ----
let powerups = [];           // on-grid items [{x, y, type, spawnTime}]
let powerupTimer = 0;
let activePowerup = null;    // {type, remaining}
let powerupFlashTimer = 0;

// ---- BOSS STATE ----
let isBossWave = false;
let boss = null;             // special unicorn object with .health, .maxHealth, .bossType
let bossHitFlash = 0;

// ---- GAME MODE STATE ----
let selectedGameMode = 'classic';
let scoreAttackTimer = 0;

// ---- XP / LEVEL STATE ----
let playerXP = 0;
let playerLevel = 1;
let totalKills = 0;
let modesWon = [];          // mode ids won at least once

// ---- ACHIEVEMENTS STATE ----
let unlockedAchievements = [];
let achievementPopup = null; // {achievement, timer}

// ---- SCREEN SHAKE STATE ----
let shakeTimer = 0;
let shakeIntensity = 0;

// ---- COMPANION FOLLOWING STATE ----
let playerPosHistory = [];    // array of {px, py, dir} in pixel coords
let companionVisuals = [];    // [{x, y, dir}] smoothed positions for each dog
let freeHitUsed = false;      // for cowboy hat one-free-collision
let unlockPopup = null;       // {text, timer}

// ---- INSTRUCTIONS STATE ----
const INSTRUCTIONS = 'INSTRUCTIONS';

// ---- RUN SUMMARY STATE ----
let lastRunStats = null;     // {score, time, kills, wave, collectibles, xpEarned}

// Load saved customization from localStorage
function loadSaveData() {
    try {
        const data = JSON.parse(localStorage.getItem('unicornPoop'));
        if (data) {
            if (typeof data.colorIndex === 'number' && data.colorIndex < PLAYER_COLORS.length) selectedColorIndex = data.colorIndex;
            if (typeof data.hatId === 'string') selectedHatId = data.hatId;
            if (typeof data.rounds === 'number') roundsPlayed = data.rounds;
            if (typeof data.companionId === 'string') selectedCompanionId = data.companionId;
            if (typeof data.hairstyle === 'string') selectedHairstyle = data.hairstyle;
            if (Array.isArray(data.maneColors) && data.maneColors.length >= MANE_STRANDS) {
                selectedManeColors = data.maneColors;
            }
            if (typeof data.xp === 'number') playerXP = data.xp;
            if (typeof data.level === 'number') playerLevel = data.level;
            if (typeof data.totalKills === 'number') totalKills = data.totalKills;
            if (Array.isArray(data.achievements)) unlockedAchievements = data.achievements;
            if (Array.isArray(data.modesWon)) modesWon = data.modesWon;
            if (typeof data.gameMode === 'string') selectedGameMode = data.gameMode;
        }
    } catch (e) {}
    applyPlayerColor();
    applyManeColors();
}

function saveSaveData() {
    try {
        localStorage.setItem('unicornPoop', JSON.stringify({
            colorIndex: selectedColorIndex,
            hatId: selectedHatId,
            rounds: roundsPlayed,
            companionId: selectedCompanionId,
            hairstyle: selectedHairstyle,
            maneColors: selectedManeColors,
            xp: playerXP,
            level: playerLevel,
            totalKills: totalKills,
            achievements: unlockedAchievements,
            modesWon: modesWon,
            gameMode: selectedGameMode,
        }));
    } catch (e) {}
}

function applyManeColors() {
    // Ensure array is long enough for all strands + forelock
    while (selectedManeColors.length < MANE_STRANDS + 3) {
        selectedManeColors.push(selectedManeColors[selectedManeColors.length - 1] || '#FF69B4');
    }
    playerTheme.maneColors = selectedManeColors.slice();
    playerTheme.tailColors = [selectedManeColors[0], selectedManeColors[1], selectedManeColors[2]];
}

function applyPlayerColor() {
    const c = PLAYER_COLORS[selectedColorIndex];
    playerTheme.body = c.body;
    playerTheme.belly = c.belly;
    // Keep gold glow/border for white, use the color's border for others
    if (c.id === 'white') {
        playerTheme.border = '#FFD700';
        playerTheme.glow = 'rgba(255, 215, 0, 0.35)';
        playerTheme.hoofColor = '#FFD700';
    } else {
        playerTheme.border = c.border;
        playerTheme.glow = c.border.replace(')', ', 0.3)').replace('rgb', 'rgba');
        // Simple glow from border hex
        const r = parseInt(c.border.slice(1,3), 16);
        const g = parseInt(c.border.slice(3,5), 16);
        const b = parseInt(c.border.slice(5,7), 16);
        playerTheme.glow = `rgba(${r}, ${g}, ${b}, 0.30)`;
        playerTheme.hoofColor = c.hoofColor;
    }
}

function isHatUnlocked(hat) {
    return roundsPlayed >= hat.unlockRounds;
}

function getHatBuff() {
    const hat = HATS.find(h => h.id === selectedHatId);
    return (hat && hat.buff) || {};
}

function getCompanionScoreBonus() {
    if (!selectedCompanionId || selectedCompanionId === 'none') return 0;
    const comp = COMPANIONS.find(c => c.id === selectedCompanionId);
    if (!comp || comp.type === 'none') return 0;
    const dogCount = (comp.type === 'dog') ? Math.min(getUnlockedDogCount(), 1) : 0;
    // Each active companion gives a bonus; dogs give extra per unlocked dog
    return COMPANION_SCORE_BONUS * (dogCount > 0 ? getUnlockedDogCount() : 1);
}

// ---- MOBILE / TOUCH STATE ----
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
let isMobile = isTouchDevice && (window.innerWidth <= 900 || window.innerHeight <= 500);

// D-pad layout (in canvas coordinates, set in drawTouchControls)
const DPAD_RADIUS = 60;
const DPAD_BTN_SIZE = 44;
const DPAD_OPACITY = 0.30;
const DPAD_ACTIVE_OPACITY = 0.55;
let dpadCenterX = 0;
let dpadCenterY = 0;
let activeTouchDir = null;
let touchPauseBtn = { x: 0, y: 0, r: 28 };
let touchSoundBtn = { x: 0, y: 0, r: 28 };

// ---- CANVAS SETUP ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ---- HELPERS ----
function dirToDelta(dir) {
    return DIR_DELTA[dir];
}

function isOutOfBounds(x, y) {
    return x < 0 || x >= COLS || y < 0 || y >= ROWS;
}

function getPossibleDirections(currentDir) {
    const opp = OPPOSITES[currentDir];
    return Object.keys(DIR_DELTA).filter(d => d !== opp);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
}

// ---- AUDIO ----
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }
}

function playSound(type) {
    if (!soundEnabled || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    if (type === 'countdown') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square'; osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'go') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square'; osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'death') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'npc_death') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'win') {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.type = 'triangle'; osc.frequency.value = freq;
            const t = now + i * 0.12;
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        });
    } else if (type === 'collect') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.setValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'powerup') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'boss_hit') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(100, now + 0.05);
        osc.frequency.setValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'unlock') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        osc.frequency.setValueAtTime(1100, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    }
}

// ---- GRID ----
function initGrid() {
    occupiedGrid = Array.from({ length: COLS }, () => Array(ROWS).fill(null));
}

function removeTrailFromGrid(unicorn) {
    for (const seg of unicorn.trail) {
        if (occupiedGrid[seg.x] && occupiedGrid[seg.x][seg.y] === unicorn.id) {
            occupiedGrid[seg.x][seg.y] = null;
        }
    }
}

// ---- UNICORN CREATION ----
function createUnicorn(id, x, y, direction, isPlayer, hueStart, theme) {
    return {
        id, x, y,
        dir: direction,
        nextDir: direction,
        isPlayer,
        alive: true,
        hueStart,
        trail: [],
        deathTime: null,
        theme,
        trailCleared: false,
        trotPhase: Math.random() * Math.PI * 2,
        personality: isPlayer ? null : NPC_PERSONALITIES[Math.floor(Math.random() * NPC_PERSONALITIES.length)],
        isBoss: false,
    };
}

function spawnUnicorns() {
    unicorns = [];
    collectibles = [];
    powerups = [];
    activePowerup = null;
    boss = null;
    score = 0;
    scoreMultiplier = 1.0;
    multiplierTimer = 0;
    collectibleTimer = 0;
    powerupTimer = 0;
    runKills = 0;
    runCollectibles = 0;
    bossHitFlash = 0;
    scoreAttackTimer = 0;
    shakeTimer = 0;
    playerPosHistory = [];
    companionVisuals = [];
    freeHitUsed = false;

    applyPlayerColor();
    applyManeColors();
    applyWave();

    // Apply game mode speed modifier
    const mode = GAME_MODES.find(m => m.id === selectedGameMode) || GAME_MODES[0];
    waveMoveInterval = Math.round(waveMoveInterval * mode.speedMod);

    const px = Math.floor(COLS * 0.15);
    const py = Math.floor(ROWS * 0.25);
    player = createUnicorn('player', px, py, 'right', true, 0, playerTheme);
    unicorns.push(player);

    // Determine if this is a boss wave
    isBossWave = (selectedGameMode === 'bossrush') ||
                 ((currentWave + 1) % BOSS_WAVE_INTERVAL === 0 && currentWave > 0);

    if (isBossWave) {
        spawnBoss();
    } else {
        const spawnPoints = [
            { x: Math.floor(COLS * 0.85), y: Math.floor(ROWS * 0.25), dir: 'left' },
            { x: Math.floor(COLS * 0.15), y: Math.floor(ROWS * 0.75), dir: 'right' },
            { x: Math.floor(COLS * 0.85), y: Math.floor(ROWS * 0.75), dir: 'left' },
            { x: Math.floor(COLS * 0.50), y: Math.floor(ROWS * 0.50), dir: 'up' },
            { x: Math.floor(COLS * 0.50), y: Math.floor(ROWS * 0.15), dir: 'down' },
            { x: Math.floor(COLS * 0.50), y: Math.floor(ROWS * 0.85), dir: 'up' },
        ];

        const npcCount = waveNpcCount;
        for (let i = 0; i < npcCount && i < spawnPoints.length; i++) {
            const sp = spawnPoints[i];
            const hueStart = (i + 1) * 70;
            const npc = createUnicorn(`npc${i}`, sp.x, sp.y, sp.dir, false, hueStart, NPC_THEMES[i % NPC_THEMES.length]);
            unicorns.push(npc);
        }
    }

    // Pre-seed the map with collectibles so it feels lively from the start
    for (let i = 0; i < 6; i++) spawnCollectible();
}

// ---- INPUT HANDLING ----
document.addEventListener('keydown', (e) => {
    initAudio();

    if (e.key === 'm' || e.key === 'M') { soundEnabled = !soundEnabled; return; }
    if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); return; }

    switch (gameState) {
        case TITLE:
            if (e.key === 'Enter' || e.key === ' ') startCountdown();
            if (e.key === 'c' || e.key === 'C') { gameState = CUSTOMIZE; customizePreviewTrot = 0; }
            if (e.key === 'g' || e.key === 'G') { gameState = MODE_SELECT; }
            if (e.key === 'h' || e.key === 'H' || e.key === '?') { gameState = INSTRUCTIONS; }
            break;
        case INSTRUCTIONS:
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace') gameState = TITLE;
            break;
        case MODE_SELECT:
            if (e.key === 'Escape' || e.key === 'Backspace') gameState = TITLE;
            for (let mi = 0; mi < GAME_MODES.length; mi++) {
                if (e.key === String(mi + 1)) { selectedGameMode = GAME_MODES[mi].id; saveSaveData(); gameState = TITLE; }
            }
            break;
        case CUSTOMIZE:
            if (e.key === 'Escape' || e.key === 'Backspace') gameState = TITLE;
            break;
        case PLAYING:
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { togglePause(); return; }
            setPlayerDirection(e.key);
            break;
        case PAUSED:
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause();
            break;
        case GAME_OVER:
        case WIN:
            if (e.key === 'Enter' || e.key === ' ') { gameState = RUN_SUMMARY; }
            if (e.key === 'r' || e.key === 'R') startCountdown();
            break;
        case RUN_SUMMARY:
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') resetToTitle();
            if (e.key === 'r' || e.key === 'R') startCountdown();
            break;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

function setPlayerDirection(key) {
    const keyMap = {
        'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
        'w': 'up', 'W': 'up', 's': 'down', 'S': 'down',
        'a': 'left', 'A': 'left', 'd': 'right', 'D': 'right',
    };
    const newDir = keyMap[key];
    if (!newDir || !player || !player.alive) return;
    if (newDir === OPPOSITES[player.dir]) return;
    player.nextDir = newDir;
}

function togglePause() {
    if (gameState === PLAYING) {
        gameState = PAUSED;
    } else if (gameState === PAUSED) {
        gameState = PLAYING;
        lastTimestamp = performance.now();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Try standard Fullscreen API (works on Android/desktop)
        const el = document.documentElement;
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (rfs) {
            rfs.call(el).catch(() => {});
            document.body.classList.add('fullscreen');
            isFullscreen = true;
        }
    } else {
        const efs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (efs) efs.call(document).catch(() => {});
        document.body.classList.remove('fullscreen');
        isFullscreen = false;
    }
    setTimeout(resizeCanvas, 200);
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen');
        isFullscreen = false;
    }
});

// ---- TOUCH INPUT ----
function screenToCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}

function handleTouchDirection(canvasX, canvasY) {
    const dx = canvasX - dpadCenterX;
    const dy = canvasY - dpadCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < DPAD_RADIUS * 1.8) {
        let dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        activeTouchDir = dir;
        if (player && player.alive && gameState === PLAYING) {
            if (dir !== OPPOSITES[player.dir]) player.nextDir = dir;
        }
        return true;
    }
    return false;
}

function handleTouchButton(canvasX, canvasY) {
    const pdx = canvasX - touchPauseBtn.x;
    const pdy = canvasY - touchPauseBtn.y;
    if (pdx * pdx + pdy * pdy < touchPauseBtn.r * touchPauseBtn.r * 4) {
        if (gameState === PLAYING || gameState === PAUSED) togglePause();
        return true;
    }
    const sdx = canvasX - touchSoundBtn.x;
    const sdy = canvasY - touchSoundBtn.y;
    if (sdx * sdx + sdy * sdy < touchSoundBtn.r * touchSoundBtn.r * 4) {
        soundEnabled = !soundEnabled;
        return true;
    }
    return false;
}

let swipeStartX = 0, swipeStartY = 0, swipeStartTime = 0;
const SWIPE_THRESHOLD = 30;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const touch = e.changedTouches[0];
    const pos = screenToCanvas(touch.clientX, touch.clientY);
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    swipeStartTime = performance.now();

    if (gameState === PLAYING) {
        if (handleTouchButton(pos.x, pos.y)) return;
        if (isMobile && handleTouchDirection(pos.x, pos.y)) return;
    }
    if (gameState === PAUSED) {
        if (handleTouchButton(pos.x, pos.y)) return;
        togglePause();
        return;
    }
    if (gameState === TITLE) {
        handleTitleTouch(pos.x, pos.y);
        return;
    }
    if (gameState === CUSTOMIZE) {
        handleCustomizeTouch(pos.x, pos.y);
        return;
    }
    if (gameState === GAME_OVER || gameState === WIN) {
        gameState = RUN_SUMMARY;
        return;
    }
    if (gameState === RUN_SUMMARY) {
        resetToTitle();
        return;
    }
    if (gameState === MODE_SELECT) {
        handleModeSelectTouch(pos.x, pos.y);
        return;
    }
    if (gameState === INSTRUCTIONS) {
        gameState = TITLE;
        return;
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState !== PLAYING || !isMobile) return;
    const touch = e.changedTouches[0];
    const pos = screenToCanvas(touch.clientX, touch.clientY);
    handleTouchDirection(pos.x, pos.y);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    activeTouchDir = null;
    if (gameState === PLAYING) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - swipeStartX;
        const dy = touch.clientY - swipeStartY;
        const elapsed = performance.now() - swipeStartTime;
        if (elapsed < 300 && (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD)) {
            let dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            if (player && player.alive && dir !== OPPOSITES[player.dir]) player.nextDir = dir;
        }
    }
}, { passive: false });

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Handle mouse clicks for customization on desktop
canvas.addEventListener('click', (e) => {
    initAudio();
    const pos = screenToCanvas(e.clientX, e.clientY);
    if (gameState === TITLE) {
        handleTitleTouch(pos.x, pos.y);
    } else if (gameState === CUSTOMIZE) {
        handleCustomizeTouch(pos.x, pos.y);
    } else if (gameState === MODE_SELECT) {
        handleModeSelectTouch(pos.x, pos.y);
    }
});

// ---- RESPONSIVE SCALING ----
// Internal resolution stays 1280x720 always.
// Display size scales to fit screen, maintaining 16:9 aspect ratio.
const rotateOverlay = document.getElementById('rotateOverlay');

function resizeCanvas() {
    // Use screen dimensions as fallback (more reliable on iOS)
    const screenW = document.documentElement.clientWidth || window.innerWidth;
    const screenH = document.documentElement.clientHeight || window.innerHeight;
    isMobile = isTouchDevice;

    const isPortrait = screenH > screenW * 1.1; // 10% tolerance

    // Show rotate overlay on touch devices in portrait
    if (isMobile && isPortrait && rotateOverlay) {
        rotateOverlay.style.display = 'flex';
        canvas.style.display = 'none';
        return;
    }
    if (rotateOverlay) rotateOverlay.style.display = 'none';
    canvas.style.display = 'block';

    const targetRatio = CANVAS_WIDTH / CANVAS_HEIGHT; // 1.778

    // Always scale to fit while preserving aspect ratio
    let displayW, displayH;
    const availW = isMobile ? screenW : screenW - 30;
    const availH = isMobile ? screenH : screenH - 30;

    if (availW / availH > targetRatio) {
        // Screen is wider than 16:9 — constrain by height
        displayH = availH;
        displayW = Math.floor(availH * targetRatio);
    } else {
        // Screen is taller/narrower — constrain by width
        displayW = availW;
        displayH = Math.floor(availW / targetRatio);
    }

    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';

    if (isMobile) {
        canvas.style.border = 'none';
        canvas.style.borderRadius = '0';
        canvas.style.boxShadow = 'none';
    } else {
        canvas.style.border = '3px solid #444';
        canvas.style.borderRadius = '8px';
        canvas.style.boxShadow = '0 0 30px rgba(255, 100, 200, 0.2)';
    }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    resizeCanvas();
    setTimeout(resizeCanvas, 100);
    setTimeout(resizeCanvas, 300);
    setTimeout(resizeCanvas, 600);
});
resizeCanvas();
// iOS needs multiple checks as viewport settles
setTimeout(resizeCanvas, 50);
setTimeout(resizeCanvas, 200);
setTimeout(resizeCanvas, 1000);

// ---- TITLE SCREEN TOUCH/CLICK HANDLING ----
// Button hit areas (set during draw)
let titleStartBtn = { x: 0, y: 0, w: 0, h: 0 };
let titleModeBtn = { x: 0, y: 0, w: 0, h: 0 };
let titleCustomBtn = { x: 0, y: 0, w: 0, h: 0 };
let titleHelpBtn = { x: 0, y: 0, w: 0, h: 0 };

function handleTitleTouch(cx, cy) {
    if (hitTest(cx, cy, titleStartBtn)) { startCountdown(); return; }
    if (hitTest(cx, cy, titleModeBtn)) { gameState = MODE_SELECT; return; }
    if (hitTest(cx, cy, titleCustomBtn)) { gameState = CUSTOMIZE; customizePreviewTrot = 0; return; }
    if (hitTest(cx, cy, titleHelpBtn)) { gameState = INSTRUCTIONS; return; }
}

// ---- CUSTOMIZE SCREEN TOUCH/CLICK HANDLING ----
let customBtns = [];      // generic: [{x, y, w, h, action, ...}]
let customBackBtn = { x: 0, y: 0, w: 0, h: 0 };
let customTabBtns = [];   // [{x, y, w, h, tab}]

function hitTest(cx, cy, btn) {
    return cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h;
}

function handleCustomizeTouch(cx, cy) {
    // Back button
    if (hitTest(cx, cy, customBackBtn)) {
        gameState = TITLE; saveSaveData(); return;
    }
    // Tab buttons
    for (const tb of customTabBtns) {
        if (hitTest(cx, cy, tb)) { customizeTab = tb.tab; return; }
    }
    // Generic buttons
    for (const btn of customBtns) {
        if (!hitTest(cx, cy, btn)) continue;
        if (btn.action === 'color') { selectedColorIndex = btn.index; applyPlayerColor(); saveSaveData(); }
        else if (btn.action === 'hat') {
            const hat = HATS.find(h => h.id === btn.hatId);
            if (hat && isHatUnlocked(hat)) { selectedHatId = btn.hatId; saveSaveData(); }
        }
        else if (btn.action === 'maneStrand') { maneEditStrand = btn.index; }
        else if (btn.action === 'maneColor') {
            selectedManeColors[maneEditStrand] = btn.color;
            applyManeColors(); saveSaveData();
        }
        else if (btn.action === 'hairstyle') { selectedHairstyle = btn.styleId; saveSaveData(); }
        else if (btn.action === 'companion') { selectedCompanionId = btn.companionId; saveSaveData(); }
        return;
    }
}

// ---- COLLECTIBLE SYSTEM ----
function spawnCollectible() {
    if (collectibles.length >= 8) return;
    const type = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
    for (let attempt = 0; attempt < 50; attempt++) {
        const x = randomInt(2, COLS - 3);
        const y = randomInt(2, ROWS - 3);
        if (occupiedGrid[x][y] === null) {
            collectibles.push({ x, y, type, spawnTime: performance.now() });
            return;
        }
    }
}

function checkCollectiblePickup() {
    if (!player || !player.alive) return;
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const c = collectibles[i];
        if (c.x === player.x && c.y === player.y) {
            const poopMult = 1 + (getHatBuff().poopValue || 0);
            score += Math.floor(c.type.score * scoreMultiplier * poopMult);
            scoreMultiplier = Math.min(MAX_MULTIPLIER, scoreMultiplier + c.type.multiplierBoost);
            runCollectibles++;
            playSound('collect');
            // Sparkle particles
            const px = c.x * GRID_SIZE + GRID_SIZE / 2;
            const py = c.y * GRID_SIZE + GRID_SIZE / 2;
            for (let j = 0; j < 8; j++) {
                const a = (Math.PI * 2 * j) / 8;
                collectParticles.push({ x: px, y: py, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, life: 1, color: c.type.color, size: 3 });
            }
            collectibles.splice(i, 1);
        }
    }
}

function drawCollectibles() {
    const now = performance.now();
    for (const c of collectibles) {
        const cx = c.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = c.y * GRID_SIZE + GRID_SIZE / 2;
        const pulse = 0.8 + 0.2 * Math.sin(now * 0.005 + c.x);
        const bob = Math.sin(now * 0.003 + c.y) * 2;
        ctx.save();
        ctx.translate(cx, cy + bob);
        ctx.scale(pulse, pulse);
        // Glow
        ctx.beginPath();
        ctx.arc(0, 0, GRID_SIZE * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = c.type.color.replace(')', ', 0.2)').replace('rgb', 'rgba') || `rgba(255,215,0,0.2)`;
        const r = parseInt(c.type.color.slice(1,3),16), g = parseInt(c.type.color.slice(3,5),16), b = parseInt(c.type.color.slice(5,7),16);
        ctx.fillStyle = `rgba(${r},${g},${b},0.2)`;
        ctx.fill();
        // Symbol
        ctx.font = `bold ${GRID_SIZE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = c.type.color;
        ctx.fillText(c.type.symbol, 0, 0);
        ctx.restore();
    }
}

// ---- POWER-UP SYSTEM ----
function spawnPowerup() {
    if (powerups.length >= 1) return;
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    for (let attempt = 0; attempt < 50; attempt++) {
        const x = randomInt(3, COLS - 4);
        const y = randomInt(3, ROWS - 4);
        if (occupiedGrid[x][y] === null) {
            powerups.push({ x, y, type, spawnTime: performance.now() });
            return;
        }
    }
}

function checkPowerupPickup() {
    if (!player || !player.alive) return;
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (p.x === player.x && p.y === player.y) {
            playSound('powerup');
            if (p.type.id === 'cleanse') {
                // Immediately clear trails in a radius around player
                for (let dx = -CLEANSE_RADIUS; dx <= CLEANSE_RADIUS; dx++) {
                    for (let dy = -CLEANSE_RADIUS; dy <= CLEANSE_RADIUS; dy++) {
                        const cx = player.x + dx, cy = player.y + dy;
                        if (!isOutOfBounds(cx, cy) && occupiedGrid[cx][cy] !== null && occupiedGrid[cx][cy] !== 'player') {
                            occupiedGrid[cx][cy] = null;
                            // Remove from unicorn trail arrays
                            for (const u of unicorns) {
                                u.trail = u.trail.filter(s => !(s.x === cx && s.y === cy));
                            }
                        }
                    }
                }
                // Cleanse particles
                for (let j = 0; j < 12; j++) {
                    const a = (Math.PI * 2 * j) / 12;
                    collectParticles.push({ x: player.x * GRID_SIZE + 8, y: player.y * GRID_SIZE + 8,
                        vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, life: 1, color: '#66BB6A', size: 4 });
                }
            } else {
                activePowerup = { type: p.type, remaining: p.type.duration };
            }
            powerups.splice(i, 1);
        }
    }
}

function updatePowerup(delta) {
    if (activePowerup) {
        activePowerup.remaining -= delta;
        powerupFlashTimer += delta;
        if (activePowerup.remaining <= 0) {
            activePowerup = null;
            powerupFlashTimer = 0;
        }
    }
}

function drawPowerups() {
    const now = performance.now();
    for (const p of powerups) {
        const cx = p.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = p.y * GRID_SIZE + GRID_SIZE / 2;
        const pulse = 0.9 + 0.1 * Math.sin(now * 0.006);
        const bob = Math.sin(now * 0.004 + p.x) * 2;
        ctx.save();
        ctx.translate(cx, cy + bob);
        ctx.scale(pulse, pulse);
        // Outer glow
        ctx.beginPath();
        ctx.arc(0, 0, GRID_SIZE, 0, Math.PI * 2);
        const pr = parseInt(p.type.color.slice(1,3),16), pg = parseInt(p.type.color.slice(3,5),16), pb = parseInt(p.type.color.slice(5,7),16);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},0.25)`;
        ctx.fill();
        // Background circle
        ctx.beginPath();
        ctx.arc(0, 0, GRID_SIZE * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},0.5)`;
        ctx.fill();
        // Symbol
        ctx.font = `bold ${GRID_SIZE * 1.1}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(p.type.symbol, 0, 1);
        ctx.restore();
    }
}

function drawActivePowerup() {
    if (!activePowerup) return;
    const barW = 160, barH = 10;
    const barX = CANVAS_WIDTH / 2 - barW / 2;
    const barY = 10;
    const pct = activePowerup.remaining / activePowerup.type.duration;
    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 15);
    // Label
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = activePowerup.type.color;
    ctx.fillText(activePowerup.type.label, CANVAS_WIDTH / 2, barY + barH + 10);
    // Bar
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = activePowerup.type.color;
    ctx.fillRect(barX, barY, barW * pct, barH);
}

// ---- BOSS SYSTEM ----
function spawnBoss() {
    const bossIdx = Math.floor(currentWave / BOSS_WAVE_INTERVAL) % BOSS_TYPES.length;
    const bt = BOSS_TYPES[bossIdx];
    const theme = {
        body: bt.bodyColor, belly: bt.belly, border: bt.border, glow: `rgba(255,23,68,0.3)`,
        hornGradient: bt.hornGradient, maneColors: bt.maneColors, tailColors: bt.tailColors,
        hoofColor: bt.hoofColor, eyeColor: bt.eyeColor, label: 'BOSS',
    };
    const spawnX = Math.floor(COLS * 0.5);
    const spawnY = Math.floor(ROWS * 0.5);
    boss = createUnicorn('boss', spawnX, spawnY, 'left', false, 0, theme);
    boss.isBoss = true;
    boss.bossType = bt;
    boss.health = bt.health;
    boss.maxHealth = bt.health;
    unicorns.push(boss);
}

function damageBoss(amount) {
    if (!boss || !boss.alive) return;
    boss.health -= amount;
    bossHitFlash = 200;
    triggerShake(4, 200);
    playSound('boss_hit');
    if (boss.health <= 0) {
        killUnicorn(boss);
        score += 2000;
        runKills++;
        checkAchievement('boss_kill');
    }
}

function drawBossHealthBar() {
    if (!boss || !boss.alive) return;
    const barW = 300, barH = 16;
    const barX = CANVAS_WIDTH / 2 - barW / 2;
    const barY = 42;
    const pct = boss.health / boss.maxHealth;
    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, barX - 4, barY - 4, barW + 8, barH + 22, 6);
    ctx.fill();
    // Label
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = boss.bossType.color;
    ctx.fillText(boss.bossType.label, CANVAS_WIDTH / 2, barY + barH + 14);
    // Bar background
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.fill();
    // Bar fill
    const flashAlpha = bossHitFlash > 0 ? 0.5 + 0.5 * Math.sin(bossHitFlash * 0.05) : 1;
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = pct > 0.5 ? '#FF1744' : pct > 0.25 ? '#FF6D00' : '#FF3D00';
    roundRect(ctx, barX, barY, barW * pct, barH, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function chooseBossDirection() {
    if (!boss || !boss.alive || !player || !player.alive) return chooseNPCDirection(boss);
    const bt = boss.bossType;

    if (bt.id === 'phantom' && Math.random() < 0.03) {
        // Teleport: move to a random open cell
        for (let attempt = 0; attempt < 30; attempt++) {
            const nx = randomInt(3, COLS - 4), ny = randomInt(3, ROWS - 4);
            if (occupiedGrid[nx][ny] === null) {
                boss.x = nx; boss.y = ny;
                playSound('powerup');
                // Teleport particles
                for (let j = 0; j < 10; j++) {
                    const a = (Math.PI * 2 * j) / 10;
                    collectParticles.push({ x: nx * GRID_SIZE + 8, y: ny * GRID_SIZE + 8,
                        vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, life: 1, color: '#B388FF', size: 4 });
                }
                break;
            }
        }
    }

    // Charger: lean toward player more aggressively
    const possible = getPossibleDirections(boss.dir);
    let best = []; let bestScore = -Infinity;
    for (const dir of possible) {
        const { dx, dy } = dirToDelta(dir);
        const nx = boss.x + dx, ny = boss.y + dy;
        if (isOutOfBounds(nx, ny) || occupiedGrid[nx][ny] !== null) {
            if (-1 > bestScore) { bestScore = -1; best = [dir]; }
            else if (-1 === bestScore) best.push(dir);
            continue;
        }
        let sc = scoreDirection(boss.x, boss.y, dir, waveLookahead);
        // Aggressive: bonus for moving toward player
        if (bt.id === 'charger' && player.alive) {
            const distBefore = Math.abs(boss.x - player.x) + Math.abs(boss.y - player.y);
            const distAfter = Math.abs(nx - player.x) + Math.abs(ny - player.y);
            if (distAfter < distBefore) sc += 3;
        }
        if (sc > bestScore) { bestScore = sc; best = [dir]; }
        else if (sc === bestScore) best.push(dir);
    }
    return best[Math.floor(Math.random() * best.length)];
}

// ---- SCREEN SHAKE ----
function triggerShake(intensity, duration) {
    shakeIntensity = intensity || SHAKE_INTENSITY;
    shakeTimer = duration || SHAKE_DURATION;
}

function applyShake() {
    if (shakeTimer > 0) {
        const ox = (Math.random() - 0.5) * shakeIntensity * 2;
        const oy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(ox, oy);
        return true;
    }
    return false;
}

// ---- XP / LEVEL SYSTEM ----
function xpForLevel(lvl) {
    return Math.floor(XP_LEVEL_BASE * Math.pow(XP_LEVEL_SCALE, lvl - 1));
}

function addXP(amount) {
    playerXP += amount;
    while (playerLevel < MAX_LEVEL && playerXP >= xpForLevel(playerLevel)) {
        playerXP -= xpForLevel(playerLevel);
        playerLevel++;
        playSound('unlock');
    }
}

// ---- ACHIEVEMENT SYSTEM ----
function checkAchievement(id) {
    if (unlockedAchievements.includes(id)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    unlockedAchievements.push(id);
    achievementPopup = { achievement: ach, timer: 3000 };
    playSound('unlock');
    saveSaveData();
}

function checkAchievements() {
    if (currentWave >= 5) checkAchievement('wave5');
    if (currentWave >= 10) checkAchievement('wave10');
    if (score >= 5000) checkAchievement('score5000');
    if (score >= 25000) checkAchievement('score25000');
    if (totalKills >= 10) checkAchievement('kill10');
    if (survivalTimer >= 60000) checkAchievement('survive60');
    if (runCollectibles >= 20) checkAchievement('collect20');
    if (modesWon.length >= GAME_MODES.length) checkAchievement('all_modes');
}

function drawAchievementPopup(delta) {
    if (!achievementPopup) return;
    achievementPopup.timer -= delta;
    if (achievementPopup.timer <= 0) { achievementPopup = null; return; }
    const a = achievementPopup.achievement;
    const alpha = Math.min(1, achievementPopup.timer / 500, (3000 - (3000 - achievementPopup.timer)) / 500);
    ctx.globalAlpha = Math.min(1, alpha);
    const bw = 280, bh = 50;
    const bx = CANVAS_WIDTH / 2 - bw / 2, by = CANVAS_HEIGHT - 80;
    roundRect(ctx, bx, by, bw, bh, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`${a.icon} ${a.label} Unlocked!`, CANVAS_WIDTH / 2, by + bh / 2);
    ctx.globalAlpha = 1;
}

// ---- NPC AI ----
function scoreDirection(x, y, dir, depth) {
    const { dx, dy } = dirToDelta(dir);
    let score = 0;
    for (let i = 1; i <= depth; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (isOutOfBounds(nx, ny) || occupiedGrid[nx][ny] !== null) break;
        score++;
    }
    return score;
}

function chooseNPCDirection(npc) {
    const p = npc.personality || NPC_PERSONALITIES[0];
    const lookahead = Math.max(2, Math.round(waveLookahead * p.lookaheadMod));
    const mistake = waveMistakeChance * p.mistakeMod;

    const possible = getPossibleDirections(npc.dir);
    let best = [];
    let bestScore = -Infinity;

    for (const dir of possible) {
        const { dx, dy } = dirToDelta(dir);
        const nx = npc.x + dx;
        const ny = npc.y + dy;
        if (isOutOfBounds(nx, ny) || occupiedGrid[nx][ny] !== null) {
            if (-1 > bestScore) { bestScore = -1; best = [dir]; }
            else if (-1 === bestScore) best.push(dir);
            continue;
        }
        let sc = scoreDirection(npc.x, npc.y, dir, lookahead);
        // Aggressive personality: bonus for moving toward player
        if (p.aggressiveness > 0 && player && player.alive) {
            const distBefore = Math.abs(npc.x - player.x) + Math.abs(npc.y - player.y);
            const distAfter = Math.abs(nx - player.x) + Math.abs(ny - player.y);
            if (distAfter < distBefore) sc += lookahead * p.aggressiveness;
        }
        // Defensive: bonus for moving away from all threats
        if (p.aggressiveness < 0) {
            sc += lookahead * 0.3; // prefer open space more
        }
        if (sc > bestScore) { bestScore = sc; best = [dir]; }
        else if (sc === bestScore) best.push(dir);
    }

    if (Math.random() < mistake) {
        const safe = possible.filter(dir => {
            const { dx, dy } = dirToDelta(dir);
            const nx = npc.x + dx;
            const ny = npc.y + dy;
            return !isOutOfBounds(nx, ny) && occupiedGrid[nx][ny] === null;
        });
        if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];
    }

    return best[Math.floor(Math.random() * best.length)];
}

// ---- MOVEMENT & COLLISION ----
function killUnicorn(unicorn) {
    if (!unicorn.alive) return;

    // Boss takes damage instead of dying instantly
    if (unicorn.isBoss && unicorn.health > 1) {
        damageBoss(1);
        return;
    }

    // Hat buff: cowboy hat gives one free collision per run
    if (unicorn.isPlayer && !freeHitUsed && getHatBuff().freeHit) {
        freeHitUsed = true;
        triggerShake(3, 150);
        playSound('collect');
        // Flash effect
        for (let j = 0; j < 8; j++) {
            const a = (Math.PI * 2 * j) / 8;
            collectParticles.push({ x: unicorn.x * GRID_SIZE + 8, y: unicorn.y * GRID_SIZE + 8,
                vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, life: 1, color: '#FFD700', size: 4 });
        }
        return; // Saved!
    }

    unicorn.alive = false;
    unicorn.deathTime = performance.now();

    // Track kills and score for NPC deaths
    if (!unicorn.isPlayer) {
        runKills++;
        totalKills++;
        score += Math.floor(SCORE_PER_KILL * scoreMultiplier);
    }

    const cx = unicorn.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = unicorn.y * GRID_SIZE + GRID_SIZE / 2;
    const pScale = unicorn.isPlayer ? PLAYER_SCALE : NPC_SCALE;
    const particleCount = Math.floor(16 * pScale);
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = (1.5 + Math.random() * 2.5) * pScale * 0.6;
        deathParticles.push({
            x: cx + Math.cos(angle) * BODY_LENGTH * pScale * 0.3,
            y: cy + Math.sin(angle) * BODY_HEIGHT * pScale * 0.3,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: `hsl(${Math.random() * 360}, 100%, 70%)`,
            size: (3 + Math.random() * 4) * pScale * 0.5,
        });
    }

    if (unicorn.isPlayer) {
        playSound('death');
        triggerShake(SHAKE_INTENSITY, SHAKE_DURATION);
    } else {
        playSound('npc_death');
        triggerShake(3, 150);
    }
}

function moveAllUnicorns() {
    const aliveUnicorns = unicorns.filter(u => u.alive);
    for (const u of aliveUnicorns) {
        if (u.isBoss) u.nextDir = chooseBossDirection();
        else if (!u.isPlayer) u.nextDir = chooseNPCDirection(u);
    }

    const moves = aliveUnicorns.map(u => {
        const { dx, dy } = dirToDelta(u.nextDir);
        return { unicorn: u, newX: u.x + dx, newY: u.y + dy };
    });

    // Head-to-head check
    for (let i = 0; i < moves.length; i++) {
        for (let j = i + 1; j < moves.length; j++) {
            if (moves[i].newX === moves[j].newX && moves[i].newY === moves[j].newY) {
                killUnicorn(moves[i].unicorn);
                killUnicorn(moves[j].unicorn);
            }
        }
    }

    const isGhost = activePowerup && activePowerup.type.id === 'ghost';

    for (const m of moves) {
        if (!m.unicorn.alive) continue;
        const u = m.unicorn;
        u.dir = u.nextDir;
        if (isOutOfBounds(m.newX, m.newY)) { killUnicorn(u); continue; }
        const occupied = occupiedGrid[m.newX][m.newY];
        if (occupied !== null) {
            // Ghost mode: player passes through trails
            if (u.isPlayer && isGhost) {
                // Pass through — don't die
            } else {
                killUnicorn(u);
                continue;
            }
        }
        const hue = (u.hueStart + u.trail.length * 8) % 360;
        const color = `hsl(${hue}, 100%, 60%)`;
        u.trail.push({ x: u.x, y: u.y, color });
        occupiedGrid[u.x][u.y] = u.id;
        u.x = m.newX;
        u.y = m.newY;
    }

    // Check collectible/powerup pickups after movement
    checkCollectiblePickup();
    checkPowerupPickup();

    if (player && !player.alive) { gameState = GAME_OVER; recordRound(false); return; }
    const aliveNPCs = unicorns.filter(u => !u.isPlayer && u.alive);
    if (aliveNPCs.length === 0) { gameState = WIN; recordRound(true); playSound('win'); spawnWinParticles(); }
}

// ---- ROUND TRACKING ----
function recordRound(won) {
    roundsPlayed++;

    // Calculate XP earned
    const timeXP = Math.floor(survivalTimer / 1000) * XP_PER_SECOND;
    const killXP = runKills * XP_PER_KILL;
    const winXP = won ? XP_PER_WIN : 0;
    const xpEarned = timeXP + killXP + winXP;
    addXP(xpEarned);

    // Save run summary
    lastRunStats = {
        score, time: survivalTimer, kills: runKills, wave: currentWave + 1,
        collectibles: runCollectibles, xpEarned, won, mode: selectedGameMode,
    };

    if (won) {
        currentWave++;
        checkAchievement('first_win');
        if (!modesWon.includes(selectedGameMode)) {
            modesWon.push(selectedGameMode);
        }
    } else {
        currentWave = 0;
    }

    checkAchievements();
    saveSaveData();
}

// ---- PARTICLES ----
function updateParticles(delta) {
    const dt = delta / 16;
    for (let i = deathParticles.length - 1; i >= 0; i--) {
        const p = deathParticles[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= 0.02 * dt;
        if (p.life <= 0) deathParticles.splice(i, 1);
    }
    for (let i = winParticles.length - 1; i >= 0; i--) {
        const p = winParticles[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.02 * dt; p.life -= 0.005 * dt;
        if (p.life <= 0) winParticles.splice(i, 1);
    }
}

function spawnWinParticles() {
    for (let i = 0; i < 60; i++) {
        winParticles.push({
            x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 400,
            y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 4, vy: -1 - Math.random() * 3,
            life: 0.5 + Math.random() * 0.5,
            color: `hsl(${Math.random() * 360}, 100%, 70%)`,
            size: 3 + Math.random() * 5,
        });
    }
}

function drawParticles(particles) {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ---- TRAIL FADE MANAGEMENT ----
function updateTrailFades() {
    const now = performance.now();
    for (const u of unicorns) {
        if (!u.alive && u.deathTime && !u.trailCleared) {
            if (now - u.deathTime >= TRAIL_FADE_DURATION) {
                removeTrailFromGrid(u);
                u.trail = [];
                u.trailCleared = true;
            }
        }
    }
}

// ---- DRAWING ----
function drawBackground() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }
}

function drawTrails() {
    const now = performance.now();
    for (const unicorn of unicorns) {
        if (unicorn.trail.length === 0) continue;
        let alpha = 1;
        if (!unicorn.alive && unicorn.deathTime) {
            alpha = Math.max(0, 1 - (now - unicorn.deathTime) / TRAIL_FADE_DURATION);
            if (alpha <= 0) continue;
        }
        const trailLen = unicorn.trail.length;
        for (let si = 0; si < trailLen; si++) {
            const seg = unicorn.trail[si];
            // Newer trail segments pulse subtly
            const age = trailLen - si;
            const pulse = age < 5 ? (0.85 + 0.15 * Math.sin(performance.now() * 0.008 + si)) : 1;
            ctx.globalAlpha = alpha * pulse;
            ctx.fillStyle = seg.color;
            const x = seg.x * GRID_SIZE + 1, y = seg.y * GRID_SIZE + 1;
            const w = GRID_SIZE - 2, h = GRID_SIZE - 2, r = 3;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * alpha})`;
            ctx.beginPath();
            ctx.arc(x + w * 0.35, y + h * 0.35, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;
}

// ---- HAT DRAWING ----
// Draws a hat at the given position in local unicorn space (facing right).
// headX, headY = center of head circle; hr = head radius; s = overall scale
function drawHat(hatId, headX, headY, hr, s, trot) {
    if (!hatId || hatId === 'none') return;

    const bounce = Math.sin((trot || 0) * 2) * 0.5;

    if (hatId === 'crown') {
        const cx = headX - hr * 0.1;
        const cy = headY - hr * 1.0 + bounce;
        const cw = hr * 0.7, ch = hr * 0.4;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(cx - cw, cy + ch);
        ctx.lineTo(cx - cw, cy);
        ctx.lineTo(cx - cw * 0.5, cy + ch * 0.4);
        ctx.lineTo(cx, cy - ch * 0.3);
        ctx.lineTo(cx + cw * 0.5, cy + ch * 0.4);
        ctx.lineTo(cx + cw, cy);
        ctx.lineTo(cx + cw, cy + ch);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = Math.max(0.5, 0.5 * s);
        ctx.stroke();
        // Gems
        ctx.fillStyle = '#FF1493';
        ctx.beginPath(); ctx.arc(cx - cw * 0.5, cy + ch * 0.15, hr * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4FC3F7';
        ctx.beginPath(); ctx.arc(cx, cy - ch * 0.05, hr * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#66BB6A';
        ctx.beginPath(); ctx.arc(cx + cw * 0.5, cy + ch * 0.15, hr * 0.1, 0, Math.PI * 2); ctx.fill();
    }

    if (hatId === 'party') {
        const cx = headX;
        const cy = headY - hr * 0.85 + bounce;
        const bw = hr * 0.6, th = hr * 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - th);
        ctx.lineTo(cx - bw, cy);
        ctx.lineTo(cx + bw, cy);
        ctx.closePath();
        const grad = ctx.createLinearGradient(cx, cy - th, cx, cy);
        grad.addColorStop(0, '#FF1493');
        grad.addColorStop(0.5, '#FFD700');
        grad.addColorStop(1, '#4FC3F7');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = Math.max(0.3, 0.3 * s);
        ctx.stroke();
        // Pom pom
        ctx.beginPath();
        ctx.arc(cx, cy - th, hr * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
    }

    if (hatId === 'cowboy') {
        const cx = headX;
        const cy = headY - hr * 0.7 + bounce;
        // Brim
        ctx.beginPath();
        ctx.ellipse(cx, cy + hr * 0.15, hr * 1.3, hr * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#8B4513';
        ctx.fill();
        ctx.strokeStyle = '#5C2E00';
        ctx.lineWidth = Math.max(0.5, 0.4 * s);
        ctx.stroke();
        // Crown
        ctx.beginPath();
        ctx.ellipse(cx, cy - hr * 0.2, hr * 0.6, hr * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#A0522D';
        ctx.fill();
        ctx.strokeStyle = '#5C2E00';
        ctx.stroke();
        // Band
        ctx.beginPath();
        ctx.rect(cx - hr * 0.6, cy - hr * 0.05, hr * 1.2, hr * 0.12);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
    }

    if (hatId === 'wizard') {
        const cx = headX;
        const cy = headY - hr * 0.8 + bounce;
        const bw = hr * 0.8, th = hr * 1.6;
        // Brim
        ctx.beginPath();
        ctx.ellipse(cx, cy, hr * 1.0, hr * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2C1066';
        ctx.fill();
        // Cone
        ctx.beginPath();
        ctx.moveTo(cx, cy - th);
        ctx.quadraticCurveTo(cx + bw * 0.3, cy - th * 0.3, cx + bw, cy);
        ctx.lineTo(cx - bw, cy);
        ctx.quadraticCurveTo(cx - bw * 0.3, cy - th * 0.3, cx, cy - th);
        ctx.closePath();
        const grad = ctx.createLinearGradient(cx, cy - th, cx, cy);
        grad.addColorStop(0, '#6A0DAD');
        grad.addColorStop(1, '#2C1066');
        ctx.fillStyle = grad;
        ctx.fill();
        // Stars
        ctx.fillStyle = '#FFD700';
        ctx.font = `${Math.max(6, hr * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u2605', cx - bw * 0.2, cy - th * 0.4);
        ctx.fillText('\u2605', cx + bw * 0.3, cy - th * 0.6);
        // Tip sparkle
        ctx.beginPath();
        ctx.arc(cx, cy - th, hr * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
    }

    if (hatId === 'tophat') {
        const cx = headX;
        const cy = headY - hr * 0.7 + bounce;
        // Brim
        ctx.beginPath();
        ctx.ellipse(cx, cy + hr * 0.1, hr * 1.1, hr * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = Math.max(0.4, 0.3 * s);
        ctx.stroke();
        // Crown
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - hr * 0.55, cy - hr * 0.9, hr * 1.1, hr * 1.0);
        // Top ellipse
        ctx.beginPath();
        ctx.ellipse(cx, cy - hr * 0.9, hr * 0.55, hr * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        // Band
        ctx.fillStyle = '#C77DFF';
        ctx.fillRect(cx - hr * 0.55, cy - hr * 0.15, hr * 1.1, hr * 0.15);
    }

    if (hatId === 'sunglasses') {
        const cy = headY + hr * 0.0 + bounce;
        const lensW = hr * 0.55, lensH = hr * 0.35;
        // Bridge
        ctx.beginPath();
        ctx.moveTo(headX - hr * 0.1, cy);
        ctx.lineTo(headX + hr * 0.1, cy);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = Math.max(1, hr * 0.08);
        ctx.stroke();
        // Left lens
        roundRect(ctx, headX + hr * 0.1, cy - lensH / 2, lensW, lensH, lensH * 0.3);
        ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = Math.max(0.5, hr * 0.06);
        ctx.stroke();
        // Glare
        ctx.beginPath();
        ctx.arc(headX + hr * 0.3, cy - lensH * 0.15, lensH * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();
        // Arm (goes back)
        ctx.beginPath();
        ctx.moveTo(headX - hr * 0.1, cy);
        ctx.lineTo(headX - hr * 0.7, cy + hr * 0.15);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = Math.max(0.5, hr * 0.06);
        ctx.stroke();
    }

    if (hatId === 'halo') {
        const cx = headX;
        const cy = headY - hr * 1.1 + bounce;
        ctx.beginPath();
        ctx.ellipse(cx, cy, hr * 0.7, hr * 0.2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = Math.max(1.5, hr * 0.15);
        ctx.stroke();
        // Inner glow
        ctx.beginPath();
        ctx.ellipse(cx, cy, hr * 0.7, hr * 0.2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.4)';
        ctx.lineWidth = Math.max(3, hr * 0.3);
        ctx.stroke();
    }

    if (hatId === 'rainbow') {
        const cx = headX - hr * 0.1;
        const cy = headY - hr * 1.0 + bounce;
        const cw = hr * 0.75, ch = hr * 0.4;
        // Crown shape
        ctx.beginPath();
        ctx.moveTo(cx - cw, cy + ch);
        ctx.lineTo(cx - cw, cy);
        ctx.lineTo(cx - cw * 0.5, cy + ch * 0.4);
        ctx.lineTo(cx, cy - ch * 0.3);
        ctx.lineTo(cx + cw * 0.5, cy + ch * 0.4);
        ctx.lineTo(cx + cw, cy);
        ctx.lineTo(cx + cw, cy + ch);
        ctx.closePath();
        // Rainbow gradient fill
        const rcGrad = ctx.createLinearGradient(cx - cw, cy, cx + cw, cy);
        const hueOff = (performance.now() * 0.1) % 360;
        rcGrad.addColorStop(0, `hsl(${hueOff}, 100%, 60%)`);
        rcGrad.addColorStop(0.2, `hsl(${(hueOff + 60) % 360}, 100%, 60%)`);
        rcGrad.addColorStop(0.4, `hsl(${(hueOff + 120) % 360}, 100%, 60%)`);
        rcGrad.addColorStop(0.6, `hsl(${(hueOff + 180) % 360}, 100%, 60%)`);
        rcGrad.addColorStop(0.8, `hsl(${(hueOff + 240) % 360}, 100%, 60%)`);
        rcGrad.addColorStop(1, `hsl(${(hueOff + 300) % 360}, 100%, 60%)`);
        ctx.fillStyle = rcGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = Math.max(0.5, 0.5 * s);
        ctx.stroke();
    }
}

// ---- UNICORN DRAWING ----
function drawUnicorn(unicorn) {
    if (!unicorn.alive) return;

    const theme = unicorn.theme;
    const scale = unicorn.isPlayer ? PLAYER_SCALE : NPC_SCALE;
    const trot = unicorn.trotPhase || 0;
    const hatId = unicorn.isPlayer ? selectedHatId : null;

    // Grid center position (collision point)
    const cx = unicorn.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = unicorn.y * GRID_SIZE + GRID_SIZE / 2;

    const DIR_ANGLES = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    const angle = DIR_ANGLES[unicorn.dir];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    drawUnicornBody(theme, scale, trot, hatId);

    ctx.restore();
}

// Draws unicorn body in local space (facing right, centered at origin).
// Realistic horse anatomy: curved body, jointed legs, long snout, flowing mane/tail.
function drawUnicornBody(theme, scale, trot, hatId) {
    const s = scale;
    const bl = BODY_LENGTH * s;
    const bh = BODY_HEIGHT * s;
    const hdL = HEAD_LENGTH * s;     // head horizontal radius
    const hdH = HEAD_HEIGHT * s;     // head vertical radius
    const nkL = NECK_LENGTH * s;
    const hl = HORN_LENGTH * s;
    const hbw = HORN_BASE_W * s;
    const lu = LEG_UPPER * s;
    const ll = LEG_LOWER * s;
    const lw = LEG_WIDTH * s;
    const hf = HOOF_SIZE * s;
    const tl = TAIL_LENGTH * s;
    const er = EYE_RADIUS * s;
    const bounce = Math.sin(trot * 2) * 0.6 * s;

    // Key reference points
    const bodyY = 0;                         // body center Y
    const shoulderX = bl * 0.45;             // front of body
    const haunchX = -bl * 0.45;              // back of body
    const backTopY = bodyY - bh * 0.85;      // top of back
    const bellyY = bodyY + bh * 0.7;         // bottom of belly
    const legAttachY = bodyY + bh * 0.5 + bounce;  // where legs join body

    // ---- Player glow ----
    if (theme.glow) {
        ctx.beginPath();
        ctx.ellipse(0, bodyY + bounce, bl + 5, bh + 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = theme.glow;
        ctx.fill();
    }

    // ---- Tail (flowing strands behind body) ----
    const tailBaseX = haunchX - bl * 0.1;
    const tailBaseY = bodyY - bh * 0.3 + bounce;
    const tailWag = Math.sin(trot * 1.3) * 0.25;
    ctx.save();
    ctx.translate(tailBaseX, tailBaseY);
    ctx.rotate(-0.4 + tailWag);
    const tailStrands = 5;
    for (let i = 0; i < tailStrands; i++) {
        const spread = (i - (tailStrands - 1) / 2) * tl * 0.12;
        const wave1 = Math.sin(trot * 1.2 + i * 0.6) * tl * 0.15;
        const wave2 = Math.sin(trot * 0.9 + i * 0.9) * tl * 0.1;
        const colorIdx = i % theme.tailColors.length;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            -tl * 0.35, spread + wave1,
            -tl * 0.7 + wave2, spread * 1.5 + wave1,
            -tl, spread * 2 + wave2
        );
        ctx.strokeStyle = theme.tailColors[colorIdx];
        ctx.lineWidth = Math.max(1, lw * 0.8 * (1 - i * 0.08));
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();

    // ---- Helper: draw one jointed leg ----
    function drawLeg(attachX, trotOffset, isFront, isShadow) {
        const swing = Math.sin(trot + trotOffset) * 0.4;
        const upperAngle = Math.PI / 2 + swing * (isFront ? 1 : 0.8);
        // Upper leg
        const kneeX = attachX + Math.cos(upperAngle) * lu;
        const kneeY = legAttachY + Math.sin(upperAngle) * lu;
        // Lower leg (slight backward angle at knee)
        const lowerAngle = Math.PI / 2 - swing * 0.3 + 0.1;
        const hoofX = kneeX + Math.cos(lowerAngle) * ll;
        const hoofY = kneeY + Math.sin(lowerAngle) * ll;

        const legColor = isShadow ? theme.border : theme.body;
        const lineW = Math.max(0.5, lw * (isShadow ? 0.9 : 1));

        // Upper segment
        ctx.beginPath();
        ctx.moveTo(attachX, legAttachY);
        ctx.lineTo(kneeX, kneeY);
        ctx.strokeStyle = legColor;
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Knee joint
        ctx.beginPath();
        ctx.arc(kneeX, kneeY, lw * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = legColor;
        ctx.fill();

        // Lower segment
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(hoofX, hoofY);
        ctx.strokeStyle = legColor;
        ctx.lineWidth = lineW * 0.9;
        ctx.stroke();

        // Hoof (trapezoidal)
        ctx.beginPath();
        ctx.moveTo(hoofX - hf * 0.3, hoofY);
        ctx.lineTo(hoofX + hf * 0.5, hoofY);
        ctx.lineTo(hoofX + hf * 0.4, hoofY + hf * 0.5);
        ctx.lineTo(hoofX - hf * 0.4, hoofY + hf * 0.5);
        ctx.closePath();
        ctx.fillStyle = theme.hoofColor;
        ctx.fill();
    }

    // ---- Back legs (drawn behind body) ----
    drawLeg(haunchX * 0.5, 0, false, true);             // far back leg (shadow)
    drawLeg(haunchX * 0.8, Math.PI, false, true);       // far back leg 2

    // ---- Body shape (realistic curved silhouette) ----
    ctx.beginPath();
    // Start at chest (front-bottom)
    ctx.moveTo(shoulderX, bellyY + bounce);
    // Belly curve (front to back)
    ctx.quadraticCurveTo(bl * 0.1, bellyY + bh * 0.15 + bounce, haunchX, bellyY - bh * 0.1 + bounce);
    // Haunch curve up
    ctx.quadraticCurveTo(haunchX - bl * 0.2, bodyY + bounce, haunchX - bl * 0.05, backTopY + bounce);
    // Back line (back to front) with slight dip
    ctx.quadraticCurveTo(0, backTopY + bh * 0.1 + bounce, shoulderX * 0.5, backTopY - bh * 0.05 + bounce);
    // Shoulder/wither bump
    ctx.quadraticCurveTo(shoulderX * 0.8, backTopY - bh * 0.15 + bounce, shoulderX, backTopY + bh * 0.2 + bounce);
    // Chest curve down
    ctx.quadraticCurveTo(shoulderX + bl * 0.08, bodyY + bounce, shoulderX, bellyY + bounce);
    ctx.closePath();

    // Body fill with subtle gradient
    const bodyGrad = ctx.createLinearGradient(0, backTopY + bounce, 0, bellyY + bounce);
    bodyGrad.addColorStop(0, theme.body);
    bodyGrad.addColorStop(0.6, theme.body);
    bodyGrad.addColorStop(1, theme.belly);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = Math.max(0.5, 0.7 * s);
    ctx.stroke();

    // ---- Front legs (drawn in front of body) ----
    drawLeg(shoulderX * 0.6, Math.PI, true, false);     // far front leg
    drawLeg(shoulderX * 0.85, 0, true, false);           // near front leg

    // ---- Neck (muscular curve) ----
    const neckBaseX = shoulderX * 0.7;
    const neckBaseTopY = backTopY - bh * 0.05 + bounce;
    const neckBaseBotY = bodyY - bh * 0.1 + bounce;
    const neckTopX = neckBaseX + nkL * 0.7;
    const neckTopY = neckBaseTopY - nkL * 0.9;

    ctx.beginPath();
    // Back of neck
    ctx.moveTo(neckBaseX - bl * 0.1, neckBaseTopY);
    ctx.bezierCurveTo(
        neckBaseX, neckBaseTopY - nkL * 0.5,
        neckTopX - nkL * 0.3, neckTopY + nkL * 0.2,
        neckTopX, neckTopY
    );
    // Throat (front of neck)
    ctx.bezierCurveTo(
        neckTopX - nkL * 0.1, neckTopY + nkL * 0.4,
        neckBaseX + nkL * 0.2, neckBaseBotY - nkL * 0.1,
        neckBaseX + bl * 0.05, neckBaseBotY
    );
    ctx.closePath();
    ctx.fillStyle = theme.body;
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = Math.max(0.4, 0.5 * s);
    ctx.stroke();

    // ---- Head (elongated horse head) ----
    const headCX = neckTopX + hdL * 0.5;
    const headCY = neckTopY - hdH * 0.1;

    // Jaw / head shape using bezier curves
    ctx.beginPath();
    const snoutX = headCX + hdL * 1.0;
    const snoutY = headCY + hdH * 0.3;
    // Top of head
    ctx.moveTo(headCX - hdL * 0.3, headCY - hdH * 0.5);
    ctx.quadraticCurveTo(headCX + hdL * 0.3, headCY - hdH * 0.8, snoutX - hdL * 0.2, headCY - hdH * 0.2);
    // Nose curve
    ctx.quadraticCurveTo(snoutX + hdL * 0.15, headCY, snoutX, snoutY);
    // Chin / jaw line
    ctx.quadraticCurveTo(snoutX - hdL * 0.1, snoutY + hdH * 0.3, headCX + hdL * 0.1, headCY + hdH * 0.5);
    // Throat connection
    ctx.quadraticCurveTo(headCX - hdL * 0.2, headCY + hdH * 0.3, headCX - hdL * 0.3, headCY - hdH * 0.5);
    ctx.closePath();

    const headGrad = ctx.createRadialGradient(headCX, headCY, 0, headCX, headCY, hdL * 1.2);
    headGrad.addColorStop(0, theme.body);
    headGrad.addColorStop(1, theme.belly);
    ctx.fillStyle = headGrad;
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = Math.max(0.4, 0.5 * s);
    ctx.stroke();

    // ---- Ears (two pointed, slightly forward) ----
    const earBaseX = headCX + hdL * 0.05;
    const earBaseY = headCY - hdH * 0.55;
    for (let ei = 0; ei < 2; ei++) {
        const eOff = ei * hdL * 0.15;  // slight spread
        const eTipX = earBaseX + eOff + hdH * 0.05;
        const eTipY = earBaseY - hdH * 0.65;
        ctx.beginPath();
        ctx.moveTo(earBaseX + eOff - hdH * 0.15, earBaseY);
        ctx.quadraticCurveTo(eTipX, eTipY, earBaseX + eOff + hdH * 0.18, earBaseY);
        ctx.closePath();
        ctx.fillStyle = theme.body;
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = Math.max(0.3, 0.4 * s);
        ctx.stroke();
        // Inner ear
        ctx.beginPath();
        ctx.moveTo(earBaseX + eOff - hdH * 0.08, earBaseY - hdH * 0.05);
        ctx.quadraticCurveTo(eTipX, eTipY + hdH * 0.15, earBaseX + eOff + hdH * 0.1, earBaseY - hdH * 0.05);
        ctx.closePath();
        ctx.fillStyle = theme.hornGradient[0];
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // ---- Horn (spiraling, on forehead) ----
    const hornBaseX = headCX + hdL * 0.15;
    const hornBaseY = headCY - hdH * 0.65;
    const hornTipX = hornBaseX + hl * 0.45;
    const hornTipY = hornBaseY - hl * 0.9;

    // Horn body (tapered with slight curve)
    ctx.beginPath();
    ctx.moveTo(hornTipX, hornTipY);
    ctx.bezierCurveTo(
        hornBaseX + hbw * 0.5, hornBaseY - hl * 0.5,
        hornBaseX + hbw * 1.5, hornBaseY - hl * 0.2,
        hornBaseX + hbw, hornBaseY
    );
    ctx.lineTo(hornBaseX - hbw, hornBaseY);
    ctx.bezierCurveTo(
        hornBaseX - hbw * 0.5, hornBaseY - hl * 0.2,
        hornBaseX - hbw * 0.3, hornBaseY - hl * 0.5,
        hornTipX, hornTipY
    );
    ctx.closePath();
    const hornGrad = ctx.createLinearGradient(hornBaseX, hornBaseY, hornTipX, hornTipY);
    hornGrad.addColorStop(0, theme.hornGradient[0]);
    hornGrad.addColorStop(0.5, theme.hornGradient[1]);
    hornGrad.addColorStop(1, theme.hornGradient[2]);
    ctx.fillStyle = hornGrad;
    ctx.fill();

    // Spiral grooves on horn
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(0.3, 0.4 * s);
    for (let i = 1; i <= 5; i++) {
        const t = i / 6;
        const gx = hornBaseX + (hornTipX - hornBaseX) * t;
        const gy = hornBaseY + (hornTipY - hornBaseY) * t;
        const gw = hbw * (1 - t) * 0.9;
        ctx.beginPath();
        ctx.moveTo(gx - gw, gy + gw * 0.3);
        ctx.lineTo(gx + gw, gy - gw * 0.3);
        ctx.stroke();
    }

    // ---- Mane (style-dependent, per-strand colors) ----
    const maneAnchorX = neckBaseX + nkL * 0.1;
    const maneAnchorY = neckBaseTopY - nkL * 0.2;
    const maneDirX = neckTopX - neckBaseX;
    const maneDirY = neckTopY - neckBaseTopY;
    const maneLen = MANE_LENGTH * s;
    const style = (theme === playerTheme) ? selectedHairstyle : 'flowing';

    for (let i = 0; i < MANE_STRANDS; i++) {
        const t = i / (MANE_STRANDS - 1);
        const ax = maneAnchorX + maneDirX * t * 0.9;
        const ay = maneAnchorY + maneDirY * t * 0.8;
        const wave = Math.sin(trot * 1.5 + i * 0.7) * maneLen * 0.25;
        const col = theme.maneColors[i % theme.maneColors.length];
        const lw = Math.max(1, s * 1.1 * (1 - t * 0.2));
        ctx.lineCap = 'round';

        if (style === 'flowing') {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.bezierCurveTo(ax - maneLen * 0.3, ay + maneLen * 0.4 + wave, ax - maneLen * 0.6 + wave * 0.5, ay + maneLen * 0.7, ax - maneLen * 0.5 + wave, ay + maneLen * 1.0);
            ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
        } else if (style === 'curly') {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            const curl1 = Math.sin(trot + i * 1.2) * maneLen * 0.2;
            const curl2 = Math.cos(trot + i * 0.9) * maneLen * 0.2;
            ctx.bezierCurveTo(ax - maneLen * 0.15 + curl1, ay + maneLen * 0.25, ax - maneLen * 0.35 + curl2, ay + maneLen * 0.35 + curl1, ax - maneLen * 0.2 + curl1, ay + maneLen * 0.55);
            ctx.bezierCurveTo(ax - maneLen * 0.4 + curl2, ay + maneLen * 0.65, ax - maneLen * 0.25 + curl1, ay + maneLen * 0.8, ax - maneLen * 0.3 + curl2, ay + maneLen * 0.95);
            ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
        } else if (style === 'spiky') {
            const spike = maneLen * 0.7;
            const sAngle = -Math.PI * 0.6 + t * 0.3 + Math.sin(trot * 2 + i) * 0.15;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + Math.cos(sAngle) * spike, ay + Math.sin(sAngle) * spike);
            ctx.strokeStyle = col; ctx.lineWidth = lw * 1.3; ctx.stroke();
        } else if (style === 'braided') {
            const braid = maneLen * 0.9;
            const bWave = Math.sin(trot * 0.8 + i * 0.5) * maneLen * 0.05;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            for (let j = 1; j <= 4; j++) {
                const bt = j / 4;
                const bx = ax - braid * bt * 0.4 + ((j % 2) ? maneLen * 0.08 : -maneLen * 0.08) + bWave;
                const by = ay + braid * bt;
                ctx.lineTo(bx, by);
            }
            ctx.strokeStyle = col; ctx.lineWidth = lw * 0.9; ctx.stroke();
        } else if (style === 'short') {
            const shortLen = maneLen * 0.4;
            const sw = Math.sin(trot * 1.8 + i * 0.6) * shortLen * 0.1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.quadraticCurveTo(ax - shortLen * 0.3 + sw, ay + shortLen * 0.5, ax - shortLen * 0.2 + sw, ay + shortLen);
            ctx.strokeStyle = col; ctx.lineWidth = lw * 1.2; ctx.stroke();
        }
    }
    // Forelock (bangs)
    for (let i = 0; i < 3; i++) {
        const fx = headCX + hdL * 0.1 + i * hdL * 0.1;
        const fy = headCY - hdH * 0.45;
        const fw = Math.sin(trot * 1.3 + i) * maneLen * 0.15;
        const col = theme.maneColors[(MANE_STRANDS + i) % theme.maneColors.length];
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        if (style === 'spiky') {
            ctx.lineTo(fx + fw, fy + maneLen * 0.5);
            ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, s * 1.0); ctx.lineCap = 'round'; ctx.stroke();
        } else {
            ctx.bezierCurveTo(fx - maneLen * 0.3 + fw, fy + maneLen * 0.3, fx - maneLen * 0.4, fy + maneLen * 0.5 + fw, fx - maneLen * 0.2 + fw, fy + maneLen * 0.7);
            ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.8, s * 0.8); ctx.lineCap = 'round'; ctx.stroke();
        }
    }

    // ---- Eye ----
    const eyeX = headCX + hdL * 0.4;
    const eyeY = headCY - hdH * 0.05;
    // Eye socket shadow
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, er * 1.8, er * 2.0, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fill();
    // Sclera
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, er * 1.4, er * 1.7, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = Math.max(0.3, 0.3 * s);
    ctx.stroke();
    // Iris
    ctx.beginPath();
    ctx.arc(eyeX + er * 0.15, eyeY, er * 1.0, 0, Math.PI * 2);
    ctx.fillStyle = theme.eyeColor;
    ctx.fill();
    // Pupil
    ctx.beginPath();
    ctx.ellipse(eyeX + er * 0.25, eyeY, er * 0.5, er * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    // Primary highlight
    ctx.beginPath();
    ctx.arc(eyeX + er * 0.55, eyeY - er * 0.45, er * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    // Secondary highlight
    ctx.beginPath();
    ctx.arc(eyeX - er * 0.1, eyeY + er * 0.4, er * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    // Eyelashes (top)
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = Math.max(0.4, 0.4 * s);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
        const la = -0.8 - i * 0.4;
        const lx = eyeX + Math.cos(la) * er * 1.5;
        const ly = eyeY + Math.sin(la) * er * 1.8;
        const ltx = eyeX + Math.cos(la) * er * 2.3;
        const lty = eyeY + Math.sin(la) * er * 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(ltx, lty);
        ctx.stroke();
    }

    // ---- Nostrils ----
    const nostrilX = snoutX - hdL * 0.08;
    const nostrilY = snoutY - hdH * 0.05;
    ctx.beginPath();
    ctx.ellipse(nostrilX, nostrilY, er * 0.45, er * 0.6, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(nostrilX - hdL * 0.12, nostrilY + hdH * 0.05, er * 0.35, er * 0.5, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // ---- Mouth line ----
    ctx.beginPath();
    ctx.moveTo(snoutX - hdL * 0.05, snoutY + hdH * 0.15);
    ctx.quadraticCurveTo(headCX + hdL * 0.5, snoutY + hdH * 0.25, headCX + hdL * 0.2, snoutY + hdH * 0.1);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = Math.max(0.3, 0.4 * s);
    ctx.stroke();

    // ---- Subtle body shading ----
    // Top highlight along back
    ctx.beginPath();
    ctx.moveTo(haunchX, backTopY + bh * 0.05 + bounce);
    ctx.quadraticCurveTo(0, backTopY + bh * 0.15 + bounce, shoulderX * 0.5, backTopY + bh * 0.02 + bounce);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = Math.max(1, bh * 0.15);
    ctx.lineCap = 'round';
    ctx.stroke();

    // ---- Hat (drawn on top of everything) ----
    // Pass head center as reference for hat placement
    drawHat(hatId, headCX, headCY, hdH, s, trot);
}

// ---- COMPANION DRAWING ----
// Draws a companion at a position in canvas space, facing a direction.
// companionScale controls height (should be roughly leg-height of the unicorn).
function drawCompanion(companionId, cx, cy, dir, trot, companionScale) {
    const comp = COMPANIONS.find(c => c.id === companionId);
    if (!comp || comp.type === 'none') return;

    const DIR_ANGLES = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    const angle = DIR_ANGLES[dir] || 0;
    const cs = companionScale || 0.6;
    const bounce = Math.sin(trot * 2.5) * 0.8 * cs;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (comp.type === 'pony') {
        // Mini pony: small oval body, head, tiny legs, mane, tail
        const bl = 7 * cs, bh = 3.5 * cs, ll = 3.5 * cs, lw = 1.2 * cs;
        const hr = 3 * cs;
        // Legs
        const legY = bh * 0.5 + bounce;
        for (let i = 0; i < 4; i++) {
            const lx = -bl * 0.35 + i * bl * 0.25;
            const swing = Math.sin(trot + i * Math.PI / 2) * ll * 0.2;
            ctx.beginPath();
            ctx.moveTo(lx, legY); ctx.lineTo(lx + swing, legY + ll);
            ctx.strokeStyle = comp.bodyColor; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
        }
        // Body
        ctx.beginPath(); ctx.ellipse(0, bounce, bl, bh, 0, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Head
        ctx.beginPath(); ctx.arc(bl * 0.7, -bh * 0.4 + bounce, hr, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Eye
        ctx.beginPath(); ctx.arc(bl * 0.85, -bh * 0.5 + bounce, hr * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#111'; ctx.fill();
        // Ear
        ctx.beginPath();
        ctx.moveTo(bl * 0.65, -bh * 0.4 - hr * 0.7 + bounce);
        ctx.lineTo(bl * 0.7, -bh * 0.4 - hr * 1.2 + bounce);
        ctx.lineTo(bl * 0.8, -bh * 0.4 - hr * 0.6 + bounce);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Mane
        for (let i = 0; i < 3; i++) {
            const mx = bl * 0.4 - i * bl * 0.2;
            const my = -bh * 0.7 + bounce;
            const mw = Math.sin(trot * 1.5 + i) * hr * 0.15;
            ctx.beginPath(); ctx.moveTo(mx, my);
            ctx.quadraticCurveTo(mx - hr * 0.3 + mw, my + hr * 0.5, mx - hr * 0.2 + mw, my + hr * 0.9);
            ctx.strokeStyle = comp.maneColor; ctx.lineWidth = Math.max(0.8, cs * 1.0); ctx.lineCap = 'round'; ctx.stroke();
        }
        // Tail
        const tw = Math.sin(trot * 1.3) * hr * 0.2;
        ctx.beginPath(); ctx.moveTo(-bl * 0.8, -bh * 0.1 + bounce);
        ctx.bezierCurveTo(-bl - hr * 0.3, -bh * 0.3 + bounce + tw, -bl - hr * 0.5 + tw, bh * 0.1 + bounce, -bl - hr * 0.3, bh * 0.3 + bounce + tw);
        ctx.strokeStyle = comp.maneColor; ctx.lineWidth = Math.max(1, cs * 1.2); ctx.lineCap = 'round'; ctx.stroke();
    }

    if (comp.type === 'cat') {
        const bl = 6 * cs, bh = 3 * cs, ll = 3 * cs, lw = 1.1 * cs;
        const hr = 3 * cs;
        // Legs
        const legY = bh * 0.4 + bounce;
        for (let i = 0; i < 4; i++) {
            const lx = -bl * 0.35 + i * bl * 0.25;
            const swing = Math.sin(trot * 1.3 + i * Math.PI / 2) * ll * 0.15;
            ctx.beginPath(); ctx.moveTo(lx, legY); ctx.lineTo(lx + swing, legY + ll);
            ctx.strokeStyle = comp.bodyColor; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
            // Paw
            ctx.beginPath(); ctx.arc(lx + swing, legY + ll, lw * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = comp.bodyColor; ctx.fill();
        }
        // Body
        ctx.beginPath(); ctx.ellipse(0, bounce, bl, bh, 0, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Stripes
        ctx.strokeStyle = comp.stripeColor; ctx.lineWidth = Math.max(0.5, cs * 0.6);
        for (let i = 0; i < 3; i++) {
            const sx = -bl * 0.2 + i * bl * 0.25;
            ctx.beginPath(); ctx.moveTo(sx, -bh * 0.6 + bounce); ctx.lineTo(sx, bh * 0.3 + bounce); ctx.stroke();
        }
        // Head (round)
        ctx.beginPath(); ctx.arc(bl * 0.65, -bh * 0.3 + bounce, hr, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Ears (triangles)
        for (let ei = -1; ei <= 1; ei += 2) {
            ctx.beginPath();
            ctx.moveTo(bl * 0.55 + ei * hr * 0.4, -bh * 0.3 - hr * 0.7 + bounce);
            ctx.lineTo(bl * 0.55 + ei * hr * 0.1, -bh * 0.3 - hr * 1.3 + bounce);
            ctx.lineTo(bl * 0.75 + ei * hr * 0.1, -bh * 0.3 - hr * 0.7 + bounce);
            ctx.fillStyle = comp.bodyColor; ctx.fill();
            // Inner ear
            ctx.beginPath();
            ctx.moveTo(bl * 0.57 + ei * hr * 0.3, -bh * 0.3 - hr * 0.75 + bounce);
            ctx.lineTo(bl * 0.57 + ei * hr * 0.15, -bh * 0.3 - hr * 1.1 + bounce);
            ctx.lineTo(bl * 0.7 + ei * hr * 0.1, -bh * 0.3 - hr * 0.75 + bounce);
            ctx.fillStyle = '#FFB6C1'; ctx.fill();
        }
        // Eyes
        ctx.beginPath(); ctx.ellipse(bl * 0.75, -bh * 0.35 + bounce, hr * 0.22, hr * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#4CAF50'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(bl * 0.75, -bh * 0.35 + bounce, hr * 0.1, hr * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#111'; ctx.fill();
        // Nose
        ctx.beginPath();
        ctx.moveTo(bl * 0.85, -bh * 0.2 + bounce);
        ctx.lineTo(bl * 0.82, -bh * 0.15 + bounce);
        ctx.lineTo(bl * 0.88, -bh * 0.15 + bounce);
        ctx.fillStyle = '#FF69B4'; ctx.fill();
        // Whiskers
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = Math.max(0.3, cs * 0.3);
        for (let wi = -1; wi <= 1; wi += 2) {
            ctx.beginPath(); ctx.moveTo(bl * 0.85, -bh * 0.18 + bounce); ctx.lineTo(bl + hr * 0.5, -bh * 0.2 + wi * hr * 0.2 + bounce); ctx.stroke();
        }
        // Tail (curled up)
        const tw = Math.sin(trot * 1.1) * bl * 0.1;
        ctx.beginPath(); ctx.moveTo(-bl * 0.7, -bh * 0.05 + bounce);
        ctx.bezierCurveTo(-bl - hr * 0.4, -bh * 0.4 + bounce, -bl - hr * 0.2 + tw, -bh - hr * 0.3 + bounce, -bl + hr * 0.1, -bh - hr * 0.1 + bounce);
        ctx.strokeStyle = comp.bodyColor; ctx.lineWidth = Math.max(1, cs * 1.3); ctx.lineCap = 'round'; ctx.stroke();
    }

    if (comp.type === 'dog') {
        const bl = 7 * cs, bh = 3.2 * cs, ll = 3.5 * cs, lw = 1.2 * cs;
        const hr = 3 * cs;
        // Legs
        const legY = bh * 0.5 + bounce;
        for (let i = 0; i < 4; i++) {
            const lx = -bl * 0.35 + i * bl * 0.25;
            const swing = Math.sin(trot * 1.2 + i * Math.PI / 2) * ll * 0.2;
            ctx.beginPath(); ctx.moveTo(lx, legY); ctx.lineTo(lx + swing, legY + ll);
            ctx.strokeStyle = comp.bodyColor; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
            ctx.beginPath(); ctx.arc(lx + swing, legY + ll, lw * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = comp.bodyColor; ctx.fill();
        }
        // Body
        ctx.beginPath(); ctx.ellipse(0, bounce, bl, bh, 0, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Head (slight oval)
        ctx.beginPath(); ctx.ellipse(bl * 0.65, -bh * 0.3 + bounce, hr * 1.1, hr, 0, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Snout
        ctx.beginPath(); ctx.ellipse(bl * 0.9, -bh * 0.15 + bounce, hr * 0.5, hr * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = comp.bodyColor; ctx.fill();
        // Nose
        ctx.beginPath(); ctx.arc(bl * 1.05, -bh * 0.2 + bounce, hr * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = '#333'; ctx.fill();
        // Eyes
        ctx.beginPath(); ctx.arc(bl * 0.7, -bh * 0.45 + bounce, hr * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#5D4037'; ctx.fill();
        ctx.beginPath(); ctx.arc(bl * 0.72, -bh * 0.47 + bounce, hr * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF'; ctx.fill();
        // Floppy ears
        for (let ei = -1; ei <= 1; ei += 2) {
            const earWag = Math.sin(trot * 1.5 + ei) * hr * 0.1;
            ctx.beginPath();
            ctx.ellipse(bl * 0.45 + ei * hr * 0.15, -bh * 0.1 + bounce + earWag, hr * 0.35, hr * 0.7, ei * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = comp.earColor; ctx.fill();
        }
        // Tail (wagging)
        const tw = Math.sin(trot * 3) * bl * 0.15;
        ctx.beginPath(); ctx.moveTo(-bl * 0.8, -bh * 0.2 + bounce);
        ctx.bezierCurveTo(-bl - hr * 0.2, -bh * 0.6 + bounce + tw, -bl - hr * 0.3, -bh - hr * 0.2 + bounce + tw, -bl - hr * 0.1, -bh - hr * 0.4 + bounce + tw);
        ctx.strokeStyle = comp.bodyColor; ctx.lineWidth = Math.max(1.2, cs * 1.5); ctx.lineCap = 'round'; ctx.stroke();
        // Tongue (hanging out when moving)
        ctx.beginPath();
        ctx.moveTo(bl * 0.95, -bh * 0.05 + bounce);
        ctx.quadraticCurveTo(bl * 1.05, bh * 0.1 + bounce, bl * 0.95, bh * 0.15 + bounce);
        ctx.strokeStyle = '#FF69B4'; ctx.lineWidth = Math.max(0.8, cs * 0.8); ctx.lineCap = 'round'; ctx.stroke();
    }

    ctx.restore();
}

function updateCompanionPositions() {
    if (!player || !player.alive) return;

    // Record player pixel position in history
    const px = player.x * GRID_SIZE + GRID_SIZE / 2;
    const py = player.y * GRID_SIZE + GRID_SIZE / 2;
    playerPosHistory.push({ px, py, dir: player.dir });
    // Keep history bounded
    if (playerPosHistory.length > 200) playerPosHistory.shift();

    const comp = COMPANIONS.find(c => c.id === selectedCompanionId);
    if (!comp || comp.type === 'none') return;

    // How many companions to draw (dogs get multiple based on unlocks)
    const count = (comp.type === 'dog') ? getUnlockedDogCount() : 1;
    if (count === 0) return;

    // Ensure visual state array is right size
    while (companionVisuals.length < count) {
        companionVisuals.push({ x: px, y: py, dir: player.dir });
    }

    // Update each companion via delayed history + perpendicular offset + lerp
    for (let i = 0; i < count; i++) {
        const delay = COMPANION_FOLLOW_DELAY * (1 + i * 0.7);
        const histIdx = Math.max(0, playerPosHistory.length - 1 - Math.floor(delay));
        const target = playerPosHistory[histIdx] || { px, py, dir: player.dir };

        // Perpendicular offset: alternate left/right
        const side = (i % 2 === 0) ? 1 : -1;
        const offset = COMPANION_OFFSET_PX * side;
        const { dx, dy } = dirToDelta(target.dir);
        // Perpendicular is (-dy, dx)
        const offX = target.px + (-dy) * offset;
        const offY = target.py + (dx) * offset;

        // Smooth interpolation
        const cv = companionVisuals[i];
        cv.x += (offX - cv.x) * COMPANION_LERP_SPEED;
        cv.y += (offY - cv.y) * COMPANION_LERP_SPEED;
        cv.dir = target.dir;
    }
}

function drawAllUnicorns() {
    for (const u of unicorns) {
        if (!u.isPlayer) drawUnicorn(u);
    }
    if (player) {
        drawUnicorn(player);
        // Draw companions using history-based following
        if (selectedCompanionId && selectedCompanionId !== 'none' && player.alive) {
            const comp = COMPANIONS.find(c => c.id === selectedCompanionId);
            const count = (comp && comp.type === 'dog') ? getUnlockedDogCount() : (comp && comp.type !== 'none' ? 1 : 0);
            const compScale = PLAYER_SCALE * 0.55;
            const now = performance.now();

            for (let i = 0; i < Math.min(count, companionVisuals.length); i++) {
                const cv = companionVisuals[i];
                // Subtle bounce animation
                const bounce = Math.sin(now * 0.005 + i * 2) * 1.5;
                // Shadow
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(cv.x, cv.y + 8 * compScale, 6 * compScale, 2 * compScale, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                // Subtle glow
                ctx.beginPath();
                ctx.arc(cv.x, cv.y + bounce, 10 * compScale, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 200, 0.08)';
                ctx.fill();
                // Draw the companion
                drawCompanion(selectedCompanionId, cv.x, cv.y + bounce, cv.dir, player.trotPhase + i * 0.5, compScale);
            }
        }
    }
}

function drawHUD() {
    ctx.save();

    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(8, 8, 140, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText(`Time: ${formatTime(survivalTimer)}`, 16, 14);

    // Score + multiplier (second row)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(8, 30, 200, 22);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 16, 36);
    if (scoreMultiplier > 1) {
        ctx.fillStyle = '#6BCB77';
        ctx.fillText(`x${scoreMultiplier.toFixed(1)}`, 130, 36);
    }

    const aliveNPCs = unicorns.filter(u => !u.isPlayer && u.alive).length;
    const totalNPCs = unicorns.filter(u => !u.isPlayer).length;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(CANVAS_WIDTH - 220, 8, 212, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    const waveLabel = isBossWave ? `BOSS` : `Wave ${currentWave + 1}`;
    ctx.fillText(`${waveLabel}  |  ${aliveNPCs}/${totalNPCs}`, CANVAS_WIDTH - 16, 14);

    // Score attack timer
    if (selectedGameMode === 'scoreattack') {
        const mode = GAME_MODES.find(m => m.id === 'scoreattack');
        const remaining = Math.max(0, mode.timeLimitMs - scoreAttackTimer);
        ctx.textAlign = 'center';
        ctx.fillStyle = remaining < 10000 ? '#FF4444' : '#FFD700';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${formatTime(remaining)}`, CANVAS_WIDTH / 2, 14);
    }

    // Level badge + hat buff
    ctx.textAlign = 'right';
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(`Lv.${playerLevel}`, CANVAS_WIDTH - 16, 36);

    // Active hat buff indicator
    const activeHat = HATS.find(h => h.id === selectedHatId);
    if (activeHat && activeHat.buffDesc) {
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(199,125,255,0.5)';
        ctx.fillText(`${activeHat.label}: ${activeHat.buffDesc}${freeHitUsed ? ' (used)' : ''}`, CANVAS_WIDTH - 16, 48);
    }

    ctx.shadowBlur = 0;

    if (isMobile) {
        drawTouchControls();
    } else {
        ctx.font = '14px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        const soundLabel = soundEnabled ? 'Sound ON' : 'Sound OFF';
        ctx.fillText(`[M] ${soundLabel}  [F] Fullscreen  [Esc] Pause`, CANVAS_WIDTH - 12, CANVAS_HEIGHT - 10);
    }

    ctx.restore();
}

// ---- TOUCH CONTROLS ----
function drawTouchControls() {
    if (gameState !== PLAYING) return;

    dpadCenterX = 120;
    dpadCenterY = CANVAS_HEIGHT - 120;
    const r = DPAD_RADIUS;
    const btnR = DPAD_BTN_SIZE / 2;

    ctx.beginPath();
    ctx.arc(dpadCenterX, dpadCenterY, r * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    const dirs = [
        { dir: 'up',    ox: 0,  oy: -r * 0.7, label: '\u25B2' },
        { dir: 'down',  ox: 0,  oy:  r * 0.7, label: '\u25BC' },
        { dir: 'left',  ox: -r * 0.7, oy: 0,  label: '\u25C0' },
        { dir: 'right', ox:  r * 0.7, oy: 0,  label: '\u25B6' },
    ];

    for (const d of dirs) {
        const bx = dpadCenterX + d.ox;
        const by = dpadCenterY + d.oy;
        const isActive = activeTouchDir === d.dir;
        const alpha = isActive ? DPAD_ACTIVE_OPACITY : DPAD_OPACITY;
        ctx.beginPath();
        ctx.arc(bx, by, btnR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(50, 0, 80, ${alpha + 0.2})`;
        ctx.fillText(d.label, bx, by);
    }

    touchPauseBtn.x = CANVAS_WIDTH - 50;
    touchPauseBtn.y = 60;
    ctx.beginPath();
    ctx.arc(touchPauseBtn.x, touchPauseBtn.y, touchPauseBtn.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('II', touchPauseBtn.x, touchPauseBtn.y);

    touchSoundBtn.x = CANVAS_WIDTH - 50;
    touchSoundBtn.y = 120;
    ctx.beginPath();
    ctx.arc(touchSoundBtn.x, touchSoundBtn.y, touchSoundBtn.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = soundEnabled ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 100, 100, 0.6)';
    ctx.fillText(soundEnabled ? '\u266B' : '\u2715', touchSoundBtn.x, touchSoundBtn.y);
}

// ---- SCREENS ----
function drawTitleScreen() {
    drawBackground();

    titleHue = (titleHue + 0.5) % 360;
    for (let i = 0; i < 30; i++) {
        const x = ((i * 47 + titleHue * 2) % CANVAS_WIDTH);
        const y = ((i * 31 + titleHue) % CANVAS_HEIGHT);
        ctx.fillStyle = `hsla(${(titleHue + i * 12) % 360}, 100%, 65%, 0.15)`;
        const sz = GRID_SIZE - 2;
        ctx.beginPath();
        ctx.arc(x + sz / 2, y + sz / 2, sz / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title
    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('UNICORN POOP', CANVAS_WIDTH / 2 + 3, CANVAS_HEIGHT * 0.22 + 3);
    const titleGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 300, 0, CANVAS_WIDTH / 2 + 300, 0);
    for (let i = 0; i < 6; i++) {
        titleGrad.addColorStop(i / 5, `hsl(${(titleHue + i * 60) % 360}, 100%, 70%)`);
    }
    ctx.fillStyle = titleGrad;
    ctx.fillText('UNICORN POOP', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.22);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#E0B0FF';
    ctx.fillText('A Rainbow Trail Game', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.29);

    ctx.font = 'italic 16px sans-serif';
    ctx.fillStyle = 'rgba(224, 176, 255, 0.6)';
    ctx.fillText('A Game Project by Sophia and John H', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.34);

    // Instructions box
    const boxY = CANVAS_HEIGHT * 0.35;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, CANVAS_WIDTH / 2 - 280, boxY, 560, 160, 12);
    ctx.fill();

    ctx.font = '17px sans-serif';
    const instructions = isMobile ? [
        'You are a magical unicorn leaving rainbow poop!',
        'Avoid all poop trails or you lose!',
        'Outlast the other unicorns to win!',
        '',
        'Use the D-pad or swipe to move',
    ] : [
        'You are a magical unicorn leaving rainbow poop!',
        'Avoid all poop trails or you lose!',
        'Outlast the other unicorns to win!',
        '',
        'Arrow Keys / WASD to move  |  Esc to pause',
    ];
    instructions.forEach((line, i) => {
        ctx.fillStyle = i < 3 ? '#FFD700' : '#CCCCCC';
        ctx.fillText(line, CANVAS_WIDTH / 2, boxY + 24 + i * 26);
    });

    // Rounds played badge
    ctx.font = '15px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(`Wave ${currentWave + 1}  |  Rounds: ${roundsPlayed}`, CANVAS_WIDTH / 2, boxY + 155);

    // ---- Buttons (2 rows of 2) ----
    const btnW = 250, btnH = 46, btnGap = 16;
    const row1Y = CANVAS_HEIGHT * 0.66;
    const row2Y = row1Y + btnH + btnGap;
    const leftX = CANVAS_WIDTH / 2 - btnW - btnGap / 2;
    const rightX = CANVAS_WIDTH / 2 + btnGap / 2;

    function drawBtn(bx, by, color, stroke, label) {
        roundRect(ctx, bx, by, btnW, btnH, 12);
        ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, bx + btnW / 2, by + btnH / 2);
    }

    // Play
    titleStartBtn = { x: leftX, y: row1Y, w: btnW, h: btnH };
    drawBtn(leftX, row1Y, '#6BCB77', '#4a9c5a', isMobile ? 'Play' : 'Play  [Enter]');

    // Mode
    titleModeBtn = { x: rightX, y: row1Y, w: btnW, h: btnH };
    const modeLabel = GAME_MODES.find(m => m.id === selectedGameMode);
    drawBtn(rightX, row1Y, '#4FC3F7', '#0288D1', isMobile ? modeLabel.label : `Mode [G]`);
    ctx.font = '11px sans-serif'; ctx.fillStyle = '#4FC3F7';
    ctx.fillText(modeLabel.label, rightX + btnW / 2, row1Y + btnH + 12);

    // Customize
    titleCustomBtn = { x: leftX, y: row2Y, w: btnW, h: btnH };
    drawBtn(leftX, row2Y, '#C77DFF', '#9B59B6', isMobile ? 'Customize' : 'Custom [C]');

    // Instructions
    titleHelpBtn = { x: rightX, y: row2Y, w: btnW, h: btnH };
    drawBtn(rightX, row2Y, '#FF69B4', '#C71585', isMobile ? 'How to Play' : 'Help [H]');

    // Blinking hint
    blinkTimer = (blinkTimer + 0.03) % (Math.PI * 2);
    ctx.globalAlpha = 0.3 + 0.3 * Math.sin(blinkTimer);
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#FFFFFF';
    ctx.fillText(isMobile ? 'Tap a button above' : 'Enter = Play  |  G = Mode  |  C = Custom  |  H = Help', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.90);
    ctx.globalAlpha = 1;

    ctx.restore();
}

// ---- CUSTOMIZE SCREEN ----
function drawCustomizeScreen(delta) {
    customizePreviewTrot += TROT_SPEED * (delta || 16);
    drawBackground();
    customBtns = [];
    customTabBtns = [];

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Header
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#E0B0FF';
    ctx.fillText('Customize Your Unicorn', CANVAS_WIDTH / 2, 35);

    // ---- Live preview ----
    ctx.beginPath(); ctx.arc(CANVAS_WIDTH / 2, 130, 55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 130);
    drawUnicornBody(playerTheme, 2.5, customizePreviewTrot, selectedHatId);
    // Also draw companion in preview
    if (selectedCompanionId !== 'none') {
        drawCompanion(selectedCompanionId, -35, 10, 'right', customizePreviewTrot, 0.5 * 2.5);
    }
    ctx.restore();

    // ---- Tabs ----
    const tabs = [
        { id: 'body', label: 'Body' },
        { id: 'mane', label: 'Mane' },
        { id: 'hats', label: 'Hats' },
        { id: 'companions', label: 'Pals' },
    ];
    const tabW = 130, tabH = 34, tabGap = 8;
    const tabTotalW = tabs.length * (tabW + tabGap) - tabGap;
    const tabStartX = (CANVAS_WIDTH - tabTotalW) / 2;
    const tabY = 200;

    for (let i = 0; i < tabs.length; i++) {
        const tx = tabStartX + i * (tabW + tabGap);
        const isSel = customizeTab === tabs[i].id;
        customTabBtns.push({ x: tx, y: tabY, w: tabW, h: tabH, tab: tabs[i].id });
        roundRect(ctx, tx, tabY, tabW, tabH, 8);
        ctx.fillStyle = isSel ? '#C77DFF' : 'rgba(255,255,255,0.1)';
        ctx.fill();
        if (isSel) { ctx.strokeStyle = '#E0B0FF'; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.font = isSel ? 'bold 16px sans-serif' : '15px sans-serif';
        ctx.fillStyle = isSel ? '#FFF' : '#BBB';
        ctx.fillText(tabs[i].label, tx + tabW / 2, tabY + tabH / 2);
    }

    // ---- Content area ----
    const contentY = 250;

    if (customizeTab === 'body') {
        ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = '#FFD700';
        ctx.fillText('Body Color', CANVAS_WIDTH / 2, contentY);
        const cs = 40, cg = 8;
        const totalW = PLAYER_COLORS.length * (cs + cg) - cg;
        const sx = (CANVAS_WIDTH - totalW) / 2;
        for (let i = 0; i < PLAYER_COLORS.length; i++) {
            const bx = sx + i * (cs + cg), by = contentY + 16;
            customBtns.push({ x: bx, y: by, w: cs, h: cs, action: 'color', index: i });
            roundRect(ctx, bx - 2, by - 2, cs + 4, cs + 4, 7);
            ctx.fillStyle = i === selectedColorIndex ? '#FFD700' : 'rgba(255,255,255,0.08)'; ctx.fill();
            roundRect(ctx, bx, by, cs, cs, 5);
            ctx.fillStyle = PLAYER_COLORS[i].body; ctx.fill();
            ctx.strokeStyle = PLAYER_COLORS[i].border; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = '9px sans-serif'; ctx.fillStyle = '#BBB';
            ctx.fillText(PLAYER_COLORS[i].label, bx + cs / 2, by + cs + 11);
        }

        // Rounds played info
        ctx.font = '14px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(`Rounds played: ${roundsPlayed}`, CANVAS_WIDTH / 2, contentY + 90);

    } else if (customizeTab === 'mane') {
        // Strand selector
        ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = '#FFD700';
        ctx.fillText('Select Strand', CANVAS_WIDTH / 2, contentY);
        const strandCount = MANE_STRANDS + 3; // 7 mane + 3 forelock
        const ss = 32, sg = 6;
        const stotalW = strandCount * (ss + sg) - sg;
        const ssx = (CANVAS_WIDTH - stotalW) / 2;
        for (let i = 0; i < strandCount; i++) {
            const bx = ssx + i * (ss + sg), by = contentY + 16;
            customBtns.push({ x: bx, y: by, w: ss, h: ss, action: 'maneStrand', index: i });
            const isSel = maneEditStrand === i;
            roundRect(ctx, bx, by, ss, ss, 5);
            ctx.fillStyle = selectedManeColors[i] || '#FF69B4'; ctx.fill();
            if (isSel) { ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2.5; ctx.stroke(); }
            ctx.font = '8px sans-serif'; ctx.fillStyle = '#FFF';
            ctx.fillText(i < MANE_STRANDS ? `M${i+1}` : `B${i-MANE_STRANDS+1}`, bx + ss / 2, by + ss + 9);
        }

        // Color palette for selected strand
        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#E0B0FF';
        ctx.fillText('Pick Color', CANVAS_WIDTH / 2, contentY + 78);
        const pcs = 28, pcg = 5;
        const colsPerRow = 12;
        for (let i = 0; i < MANE_COLOR_PALETTE.length; i++) {
            const row = Math.floor(i / colsPerRow), col = i % colsPerRow;
            const rowW = Math.min(colsPerRow, MANE_COLOR_PALETTE.length - row * colsPerRow) * (pcs + pcg) - pcg;
            const rx = (CANVAS_WIDTH - rowW) / 2;
            const bx = rx + col * (pcs + pcg), by = contentY + 94 + row * (pcs + pcg);
            customBtns.push({ x: bx, y: by, w: pcs, h: pcs, action: 'maneColor', color: MANE_COLOR_PALETTE[i] });
            roundRect(ctx, bx, by, pcs, pcs, 4);
            ctx.fillStyle = MANE_COLOR_PALETTE[i]; ctx.fill();
            if (selectedManeColors[maneEditStrand] === MANE_COLOR_PALETTE[i]) {
                ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke();
            }
        }

        // Hairstyle selector
        const hsY = contentY + 165;
        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#E0B0FF';
        ctx.fillText('Hairstyle', CANVAS_WIDTH / 2, hsY);
        const hsW = 100, hsH = 36, hsG = 8;
        const hsTotalW = HAIRSTYLES.length * (hsW + hsG) - hsG;
        const hsSx = (CANVAS_WIDTH - hsTotalW) / 2;
        for (let i = 0; i < HAIRSTYLES.length; i++) {
            const bx = hsSx + i * (hsW + hsG), by = hsY + 14;
            const isSel = selectedHairstyle === HAIRSTYLES[i].id;
            customBtns.push({ x: bx, y: by, w: hsW, h: hsH, action: 'hairstyle', styleId: HAIRSTYLES[i].id });
            roundRect(ctx, bx, by, hsW, hsH, 7);
            ctx.fillStyle = isSel ? '#C77DFF' : 'rgba(255,255,255,0.1)'; ctx.fill();
            if (isSel) { ctx.strokeStyle = '#E0B0FF'; ctx.lineWidth = 2; ctx.stroke(); }
            ctx.font = isSel ? 'bold 14px sans-serif' : '14px sans-serif';
            ctx.fillStyle = isSel ? '#FFF' : '#BBB';
            ctx.fillText(HAIRSTYLES[i].label, bx + hsW / 2, by + hsH / 2);
        }

    } else if (customizeTab === 'hats') {
        const hatW = 115, hatH = 85, hatGap = 10;
        const hatsPerRow = 5;
        const totalHatRowW = Math.min(HATS.length, hatsPerRow) * (hatW + hatGap) - hatGap;
        const hatStartX = (CANVAS_WIDTH - totalHatRowW) / 2;

        for (let i = 0; i < HATS.length; i++) {
            const row = Math.floor(i / hatsPerRow), col = i % hatsPerRow;
            const bx = hatStartX + col * (hatW + hatGap);
            const by = contentY + row * (hatH + hatGap + 14);
            const hat = HATS[i];
            const unlocked = isHatUnlocked(hat);
            const isSel = hat.id === selectedHatId;
            customBtns.push({ x: bx, y: by, w: hatW, h: hatH, action: 'hat', hatId: hat.id });

            roundRect(ctx, bx, by, hatW, hatH, 8);
            ctx.fillStyle = isSel ? 'rgba(255, 215, 0, 0.25)' : 'rgba(0, 0, 0, 0.3)'; ctx.fill();
            if (isSel) { ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.stroke(); }
            ctx.fillStyle = RARITY_COLORS[hat.rarity];
            roundRect(ctx, bx, by, hatW, 3, [3, 3, 0, 0]); ctx.fill();

            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (unlocked) {
                if (hat.id !== 'none') {
                    ctx.save(); ctx.translate(bx + hatW / 2, by + 35);
                    drawHat(hat.id, 0, 0, 10, 2.0, customizePreviewTrot);
                    ctx.restore();
                } else {
                    ctx.font = '20px sans-serif'; ctx.fillStyle = '#888';
                    ctx.fillText('--', bx + hatW / 2, by + 35);
                }
                ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textBaseline = 'bottom';
                ctx.fillText(hat.label, bx + hatW / 2, by + hatH - 5);
                if (isSel) { ctx.fillStyle = '#FFD700'; ctx.fillText('EQUIPPED', bx + hatW / 2, by + hatH - 17); }
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, bx, by, hatW, hatH, 8); ctx.fill();
                ctx.font = '18px sans-serif'; ctx.fillStyle = '#888'; ctx.textBaseline = 'middle';
                ctx.fillText('\uD83D\uDD12', bx + hatW / 2, by + 32);
                ctx.font = '10px sans-serif'; ctx.fillStyle = RARITY_COLORS[hat.rarity];
                ctx.fillText(`${hat.unlockRounds} rounds`, bx + hatW / 2, by + 50);
                ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = '#AAA'; ctx.textBaseline = 'bottom';
                ctx.fillText(hat.label, bx + hatW / 2, by + hatH - 5);
            }
        }

    } else if (customizeTab === 'companions') {
        ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = '#FFD700';
        ctx.fillText('Choose a Companion (Free!)', CANVAS_WIDTH / 2, contentY);
        const cw = 130, ch = 110, cg = 12;
        const compPerRow = 4;
        const cTotalW = Math.min(COMPANIONS.length, compPerRow) * (cw + cg) - cg;
        const csx = (CANVAS_WIDTH - cTotalW) / 2;

        for (let i = 0; i < COMPANIONS.length; i++) {
            const row = Math.floor(i / compPerRow), col = i % compPerRow;
            const bx = csx + col * (cw + cg);
            const by = contentY + 20 + row * (ch + cg + 10);
            const comp = COMPANIONS[i];
            const isSel = selectedCompanionId === comp.id;
            customBtns.push({ x: bx, y: by, w: cw, h: ch, action: 'companion', companionId: comp.id });

            roundRect(ctx, bx, by, cw, ch, 8);
            ctx.fillStyle = isSel ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0,0,0,0.3)'; ctx.fill();
            if (isSel) { ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.stroke(); }

            // Preview
            if (comp.type !== 'none') {
                ctx.save(); ctx.translate(bx + cw / 2, by + 45);
                drawCompanion(comp.id, 0, 0, 'right', customizePreviewTrot, 1.5);
                ctx.restore();
            } else {
                ctx.font = '22px sans-serif'; ctx.fillStyle = '#888'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('--', bx + cw / 2, by + 45);
            }
            ctx.font = 'bold 12px sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            ctx.fillText(comp.label, bx + cw / 2, by + ch - 5);
            if (isSel) { ctx.fillStyle = '#FFD700'; ctx.font = 'bold 10px sans-serif';
                ctx.fillText('SELECTED', bx + cw / 2, by + ch - 17); }
        }
    }

    // ---- Back button ----
    const backW = 150, backH = 40;
    const backX = CANVAS_WIDTH / 2 - backW / 2;
    const backY = CANVAS_HEIGHT - 55;
    customBackBtn = { x: backX, y: backY, w: backW, h: backH };
    roundRect(ctx, backX, backY, backW, backH, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText(isMobile ? 'Back' : 'Back  [Esc]', backX + backW / 2, backY + backH / 2);

    ctx.restore();
}

function drawCountdownScreen() {
    drawBackground();
    drawTrails();
    drawAllUnicorns();
    drawHUD();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 96px sans-serif';

    let text, color;
    if (countdownPhase <= 0) { text = 'Ready...'; color = '#FF6B6B'; }
    else if (countdownPhase === 1) { text = 'Set...'; color = '#FFD93D'; }
    else { text = 'GO!'; color = '#6BCB77'; }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText(text, CANVAS_WIDTH / 2 + 3, CANVAS_HEIGHT / 2 + 3);
    ctx.fillStyle = color;
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.restore();
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#CCCCCC';
    const resumeText = isMobile ? 'Tap to Resume' : 'Press Esc or P to Resume';
    ctx.fillText(resumeText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.restore();
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 + 3, CANVAS_HEIGHT / 2 - 57);
    ctx.fillStyle = '#FF4444';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Survived: ${formatTime(survivalTimer)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    const eliminated = unicorns.filter(u => !u.isPlayer && !u.alive).length;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Unicorns defeated: ${eliminated}  |  Wave: ${currentWave + 1}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('Difficulty resets to Wave 1', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 78);

    ctx.font = 'bold 24px sans-serif';
    blinkTimer = (blinkTimer + 0.03) % (Math.PI * 2);
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(blinkTimer);
    ctx.fillStyle = '#FFFFFF';
    const restartText = isMobile ? 'Tap for Summary' : 'Enter = Summary  |  R = Restart';
    ctx.fillText(restartText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 118);
    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawParticles(winParticles);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 72px sans-serif';
    const winGrad = ctx.createLinearGradient(CANVAS_WIDTH / 2 - 200, 0, CANVAS_WIDTH / 2 + 200, 0);
    titleHue = (titleHue + 1) % 360;
    winGrad.addColorStop(0, `hsl(${titleHue}, 100%, 70%)`);
    winGrad.addColorStop(0.33, `hsl(${(titleHue + 120) % 360}, 100%, 70%)`);
    winGrad.addColorStop(0.66, `hsl(${(titleHue + 240) % 360}, 100%, 70%)`);
    winGrad.addColorStop(1, `hsl(${titleHue}, 100%, 70%)`);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2 + 3, CANVAS_HEIGHT / 2 - 57);
    ctx.fillStyle = winGrad;
    ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Survived: ${formatTime(survivalTimer)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#E0B0FF';
    ctx.fillText(`Wave ${currentWave} complete!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#6BCB77';
    const nextW = WAVES[Math.min(currentWave, WAVES.length - 1)];
    ctx.fillText(`Next: Wave ${currentWave + 1} \u2014 ${nextW.npcCount} unicorns, faster!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 75);

    ctx.font = 'bold 24px sans-serif';
    blinkTimer = (blinkTimer + 0.03) % (Math.PI * 2);
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(blinkTimer);
    ctx.fillStyle = '#FFFFFF';
    const restartText = isMobile ? 'Tap for Summary' : 'Enter = Summary  |  R = Next Wave';
    ctx.fillText(restartText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 118);
    ctx.globalAlpha = 1;

    ctx.restore();
}

// ---- UNLOCK POPUP ----
function drawUnlockPopup() {
    if (!unlockPopup) return;
    const alpha = Math.min(1, unlockPopup.timer / 500);
    const scale = 1 + (1 - alpha) * 0.3;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    ctx.scale(scale, scale);
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(unlockPopup.text, 2, 2);
    ctx.fillStyle = '#FFD700';
    ctx.fillText(unlockPopup.text, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
}

// ---- INSTRUCTIONS SCREEN ----
function drawInstructionsScreen() {
    drawBackground();
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    ctx.font = 'bold 42px sans-serif'; ctx.fillStyle = '#E0B0FF';
    ctx.fillText('How To Play', CANVAS_WIDTH / 2, 50);

    const cardW = 700, cardH = 480;
    const cardX = CANVAS_WIDTH / 2 - cardW / 2, cardY = 80;
    roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();

    ctx.textAlign = 'left';
    const x = cardX + 40;
    let y = cardY + 40;
    const section = (title, color) => { ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = color; ctx.fillText(title, x, y); y += 30; };
    const line = (text) => { ctx.font = '16px sans-serif'; ctx.fillStyle = '#DDD'; ctx.fillText(text, x + 10, y); y += 24; };

    section('\u2B50  Objective', '#FFD700');
    line('You are a magical unicorn leaving rainbow poop trails!');
    line('Avoid all poop trails (yours and others) or you lose.');
    line('Outlast the NPC unicorns to win each wave.');
    y += 8;

    section('\uD83D\uDC36  Dogs & Companions', '#4FC3F7');
    line('Unlock dogs by playing more rounds (3, 6, 10 rounds).');
    line('Dogs follow you and give +5% score per dog.');
    line('Ponies and cats also give a score bonus!');
    y += 8;

    section('\uD83C\uDFA9  Hats', '#C77DFF');
    line('Each hat gives a unique gameplay buff.');
    line('Crown: +10% score  |  Cowboy: 1 free collision');
    line('Wizard: slower speed scaling  |  And more!');
    y += 8;

    section('\uD83C\uDFAE  Controls', '#6BCB77');
    line(isMobile ? 'D-pad or swipe to move  |  Tap buttons for menus' : 'Arrow Keys / WASD to move  |  Esc to pause  |  M = sound  |  F = fullscreen');
    y += 8;

    section('\uD83D\uDE80  Progression', '#FF69B4');
    line('Win waves to face harder opponents. Lose = restart at Wave 1.');
    line('Collect stars & gems for score. Grab power-ups for abilities!');

    // Back button
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#AAA';
    ctx.fillText(isMobile ? 'Tap anywhere to go back' : 'Press Esc or Enter to go back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);

    ctx.restore();
}

// ---- MODE SELECT SCREEN ----
let modeSelectBtns = [];

function handleModeSelectTouch(cx, cy) {
    for (const btn of modeSelectBtns) {
        if (hitTest(cx, cy, btn)) {
            selectedGameMode = btn.modeId;
            saveSaveData();
            gameState = TITLE;
            return;
        }
    }
}

function drawModeSelectScreen(delta) {
    drawBackground();
    modeSelectBtns = [];
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    ctx.font = 'bold 42px sans-serif'; ctx.fillStyle = '#4FC3F7';
    ctx.fillText('Game Modes', CANVAS_WIDTH / 2, 60);

    const cardW = 200, cardH = 120, gap = 16;
    const totalW = GAME_MODES.length * (cardW + gap) - gap;
    const sx = (CANVAS_WIDTH - totalW) / 2;
    const cy = CANVAS_HEIGHT / 2 - 20;

    for (let i = 0; i < GAME_MODES.length; i++) {
        const m = GAME_MODES[i];
        const bx = sx + i * (cardW + gap);
        const by = cy - cardH / 2;
        const isSel = selectedGameMode === m.id;
        modeSelectBtns.push({ x: bx, y: by, w: cardW, h: cardH, modeId: m.id });

        roundRect(ctx, bx, by, cardW, cardH, 12);
        ctx.fillStyle = isSel ? 'rgba(79, 195, 247, 0.3)' : 'rgba(0,0,0,0.3)'; ctx.fill();
        if (isSel) { ctx.strokeStyle = '#4FC3F7'; ctx.lineWidth = 2.5; ctx.stroke(); }

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = isSel ? '#4FC3F7' : '#FFF';
        ctx.fillText(m.label, bx + cardW / 2, by + 35);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#BBB';
        ctx.fillText(m.desc, bx + cardW / 2, by + 60);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = isSel ? '#FFD700' : '#666';
        ctx.fillText(isSel ? 'SELECTED' : `Press ${i + 1}`, bx + cardW / 2, by + 90);
    }

    ctx.font = '18px sans-serif'; ctx.fillStyle = '#888';
    ctx.fillText(isMobile ? 'Tap a mode, then go back' : 'Press 1-5 to select  |  Esc to go back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);

    ctx.restore();
}

// ---- RUN SUMMARY SCREEN ----
function drawRunSummaryScreen(delta) {
    drawBackground();
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    const s = lastRunStats;
    if (!s) { gameState = TITLE; ctx.restore(); return; }

    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = s.won ? '#6BCB77' : '#FF4444';
    ctx.fillText(s.won ? 'VICTORY!' : 'GAME OVER', CANVAS_WIDTH / 2, 70);

    // Stats card
    const cardW = 500, cardH = 340;
    const cardX = CANVAS_WIDTH / 2 - cardW / 2, cardY = 110;
    roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.stroke();

    const lines = [
        { label: 'Score', value: String(s.score), color: '#FFD700' },
        { label: 'Time', value: formatTime(s.time), color: '#FFF' },
        { label: 'Wave', value: String(s.wave), color: '#4FC3F7' },
        { label: 'Defeats', value: String(s.kills), color: '#FF6B6B' },
        { label: 'Collected', value: String(s.collectibles), color: '#C77DFF' },
        { label: 'XP Earned', value: `+${s.xpEarned}`, color: '#6BCB77' },
        { label: 'Mode', value: (GAME_MODES.find(m => m.id === s.mode) || {}).label || s.mode, color: '#4FC3F7' },
    ];

    ctx.font = '18px sans-serif';
    const lineH = 38;
    const startY = cardY + 35;
    for (let i = 0; i < lines.length; i++) {
        const ly = startY + i * lineH;
        ctx.textAlign = 'left'; ctx.fillStyle = '#AAA';
        ctx.fillText(lines[i].label, cardX + 60, ly);
        ctx.textAlign = 'right'; ctx.fillStyle = lines[i].color;
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(lines[i].value, cardX + cardW - 60, ly);
        ctx.font = '18px sans-serif';
    }

    // Level info
    ctx.textAlign = 'center';
    ctx.font = '16px sans-serif'; ctx.fillStyle = '#E0B0FF';
    ctx.fillText(`Level ${playerLevel}  \u2014  ${playerXP}/${xpForLevel(playerLevel)} XP`, CANVAS_WIDTH / 2, cardY + cardH + 20);

    // Prompt
    blinkTimer = (blinkTimer + 0.03) % (Math.PI * 2);
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(blinkTimer);
    ctx.font = 'bold 22px sans-serif'; ctx.fillStyle = '#FFF';
    ctx.fillText(isMobile ? 'Tap to continue' : 'Enter = Menu  |  R = Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
    ctx.globalAlpha = 1;

    ctx.restore();
}

// ---- DRAWING HELPERS ----
function roundRect(ctx, x, y, w, h, r) {
    // r can be a number or array [tl, tr, br, bl]
    if (typeof r === 'number') r = [r, r, r, r];
    ctx.beginPath();
    ctx.moveTo(x + r[0], y);
    ctx.lineTo(x + w - r[1], y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    ctx.lineTo(x + w, y + h - r[2]);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    ctx.lineTo(x + r[3], y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    ctx.lineTo(x, y + r[0]);
    ctx.quadraticCurveTo(x, y, x + r[0], y);
    ctx.closePath();
}

// ---- GAME FLOW ----
function resetToTitle() {
    gameState = TITLE;
    deathParticles = [];
    winParticles = [];
}

function startCountdown() {
    initGrid();
    spawnUnicorns();
    survivalTimer = 0;
    moveAccumulator = 0;
    deathParticles = [];
    winParticles = [];
    countdownTimer = 0;
    countdownPhase = -1;
    gameState = COUNTDOWN;
    lastTimestamp = performance.now();
}

function updateCountdown(delta) {
    countdownTimer += delta;
    const phaseLength = (COUNTDOWN_SECONDS * 1000) / 3;
    const newPhase = Math.min(2, Math.floor(countdownTimer / phaseLength));
    if (newPhase !== countdownPhase && newPhase >= 0) {
        countdownPhase = newPhase;
        if (countdownPhase < 2) playSound('countdown');
        else playSound('go');
    }
    if (countdownTimer >= COUNTDOWN_SECONDS * 1000) {
        gameState = PLAYING;
        lastTimestamp = performance.now();
        moveAccumulator = 0;
    }
}

function updateGame(delta) {
    survivalTimer += delta;
    moveAccumulator += delta;

    // Speed boost + hat modifiers
    const wizResist = getHatBuff().speedResist || 0;
    const rainbowSpeed = getHatBuff().speedBonus || 0;
    let effectiveInterval = waveMoveInterval * (1 + wizResist) * (1 - rainbowSpeed);
    if (activePowerup && activePowerup.type.id === 'speed') effectiveInterval *= 0.6;

    for (const u of unicorns) {
        if (u.alive) u.trotPhase += TROT_SPEED * delta;
    }
    while (moveAccumulator >= effectiveInterval) {
        moveAccumulator -= effectiveInterval;
        if (gameState === PLAYING) moveAllUnicorns();
    }

    // Scoring: survival score (hat + companion bonuses)
    const hatBuff = getHatBuff();
    const hatScoreMult = 1 + (hatBuff.scoreMult || 0);
    const compBonus = 1 + getCompanionScoreBonus();
    score += Math.floor(SCORE_PER_SECOND * scoreMultiplier * hatScoreMult * compBonus * delta / 1000);
    multiplierTimer += delta;
    if (multiplierTimer >= MULTIPLIER_GROWTH_INTERVAL) {
        multiplierTimer -= MULTIPLIER_GROWTH_INTERVAL;
        scoreMultiplier = Math.min(MAX_MULTIPLIER, scoreMultiplier + MULTIPLIER_INCREMENT);
    }

    // Collectible spawning
    collectibleTimer += delta;
    if (collectibleTimer >= COLLECTIBLE_SPAWN_INTERVAL) {
        collectibleTimer -= COLLECTIBLE_SPAWN_INTERVAL;
        spawnCollectible();
    }

    // Power-up spawning
    powerupTimer += delta;
    if (powerupTimer >= POWERUP_SPAWN_INTERVAL) {
        powerupTimer -= POWERUP_SPAWN_INTERVAL;
        spawnPowerup();
    }

    updatePowerup(delta);
    updateCompanionPositions();
    updateTrailFades();
    updateParticles(delta);

    // Collect particles
    for (let i = collectParticles.length - 1; i >= 0; i--) {
        const p = collectParticles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        if (p.life <= 0) collectParticles.splice(i, 1);
    }

    // Screen shake
    if (shakeTimer > 0) shakeTimer -= delta;
    // Boss hit flash
    if (bossHitFlash > 0) bossHitFlash -= delta;
    // Unlock popup
    if (unlockPopup) { unlockPopup.timer -= delta; if (unlockPopup.timer <= 0) unlockPopup = null; }

    // Achievement popup
    if (achievementPopup) achievementPopup.timer -= delta;

    // Score attack timer
    if (selectedGameMode === 'scoreattack') {
        scoreAttackTimer += delta;
        const mode = GAME_MODES.find(m => m.id === 'scoreattack');
        if (scoreAttackTimer >= mode.timeLimitMs && player && player.alive) {
            gameState = WIN;
            recordRound(true);
            playSound('win');
            spawnWinParticles();
        }
    }

    checkAchievements();
}

// ---- MAIN LOOP ----
function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    if (lastTimestamp === 0) { lastTimestamp = timestamp; return; }
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const clampedDelta = Math.min(delta, 100);

    switch (gameState) {
        case TITLE:
            drawTitleScreen();
            break;
        case INSTRUCTIONS:
            drawInstructionsScreen();
            break;
        case MODE_SELECT:
            drawModeSelectScreen(clampedDelta);
            break;
        case CUSTOMIZE:
            drawCustomizeScreen(clampedDelta);
            break;
        case COUNTDOWN:
            for (const u of unicorns) u.trotPhase += TROT_SPEED * clampedDelta;
            updateCountdown(clampedDelta);
            drawCountdownScreen();
            break;
        case PLAYING:
            updateGame(clampedDelta);
            ctx.save();
            applyShake();
            drawBackground();
            drawTrails();
            drawCollectibles();
            drawPowerups();
            drawAllUnicorns();
            drawParticles(deathParticles);
            drawParticles(collectParticles);
            ctx.restore();
            drawHUD();
            drawActivePowerup();
            drawBossHealthBar();
            drawAchievementPopup(clampedDelta);
            drawUnlockPopup();
            // Ghost mode visual indicator
            if (activePowerup && activePowerup.type.id === 'ghost' && player && player.alive) {
                ctx.globalAlpha = 0.15 + 0.1 * Math.sin(performance.now() * 0.01);
                ctx.fillStyle = '#E0E0FF';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.globalAlpha = 1;
            }
            break;
        case PAUSED:
            drawBackground();
            drawTrails();
            drawCollectibles();
            drawPowerups();
            drawAllUnicorns();
            drawHUD();
            drawPauseOverlay();
            break;
        case GAME_OVER:
            updateParticles(clampedDelta);
            drawBackground();
            drawTrails();
            drawAllUnicorns();
            drawParticles(deathParticles);
            drawHUD();
            drawGameOverScreen();
            break;
        case WIN:
            updateParticles(clampedDelta);
            updateTrailFades();
            drawBackground();
            drawTrails();
            drawAllUnicorns();
            drawHUD();
            drawWinScreen();
            break;
        case RUN_SUMMARY:
            drawRunSummaryScreen(clampedDelta);
            break;
    }
}

// ---- START ----
loadSaveData();
requestAnimationFrame(gameLoop);
