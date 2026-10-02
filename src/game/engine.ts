import {
  CLASSES,
  ZONES,
  ENEMIES,
  waveComposition,
  ELITE_NAMES,
  STREAKS,
  POWERS,
  SHOP_ITEMS,
  capStackCount,
  getPowerStackCap,
  isPowerAvailable,
  getShopItemStackCap,
  isRarityUnlocked,
  isShopRarityUnlocked,
  rarityOddsForLevel,
  shopRarityOddsForWave,
  xpWithBonus,
  canOpenLevelUp,
  FINAL_WAVE,
  MAX_PLAYER_LEVEL,
  type ClassDef,
  type EnemyKind,
  type PowerDef,
  type PowerId,
  type ShopItemDef,
  type ShopItemId,
  type Rarity,
  type ZoneDef,
} from './data';
import { SFX } from './audio';
import { Music } from './music';
import { legacyFor, type LegacyDef } from './lore';
import { heroBasePower, waveDifficulty, type HeroCombatStats, type WaveDifficulty } from './difficulty';
import { analyzeMovement, BOSS_AIM_TUNING, predictedAim, turnToward, type MovementSample } from './boss-ai';

export type GameState = 'menu' | 'playing' | 'paused' | 'levelup' | 'shop' | 'dying' | 'over';

export interface GameStats {
  score: number;
  wave: number;
  level: number;
  kills: number;
  gold: number;
  timeSec: number;
  classId: string;
  className: string;
  playerName: string;
  profileId: string;
  profileName: string;
  killer: string;
}

export interface FeedMsg {
  id: number;
  text: string;
  color: string;
}

export interface HudData {
  hp: number;
  maxHp: number;
  xp: number;
  xpNext: number;
  level: number;
  score: number;
  gold: number;
  kills: number;
  wave: number;
  zoneName: string;
  zoneCulture: string;
  zoneColor: string;
  threat: string;
  foesLeft: number;
  abilityCd: number;
  abilityCdMax: number;
  dashCd: number;
  dashCdMax: number;
  abilityName: string;
  legacyCd: number;
  legacyCdMax: number;
  legacyName: string;
  legacyActive: string;
  buffT: number;
  combo: number;
  bossHp: number;
  bossMax: number;
  bossName: string;
  hurt: number;
  lowHp: boolean;
  feed: FeedMsg[];
  announce: string;
  announceId: number;
  timeStr: string;
  muted: boolean;
  playerName: string;
  classId: string;
  className: string;
  classColor: string;
}

export interface HudBus {
  listeners: Set<(d: HudData) => void>;
}

export interface LevelUpData {
  level: number;
  choices: PowerDef[];
  rarityOdds: Record<Rarity, number>;
  rerollsLeft: number;
}

export interface ActiveSkillSummary {
  id: PowerId;
  name: string;
  rarity: Rarity;
  count: number;
  valueText: string;
  maxStacks: number | null;
}

export interface MarketplacePowerupSummary {
  name: string;
  effect: string;
  remainingSeconds: number | null;
  count: number;
}

export interface PauseData {
  activeSkills: ActiveSkillSummary[];
  totalBuildStats: { label: string; value: string }[];
  marketplacePowerups: MarketplacePowerupSummary[];
}

export interface ShopData {
  wave: number;
  gold: number;
  nextZoneName: string;
  nextZoneColor: string;
  items: { item: ShopItemDef; sold: boolean; locked: boolean }[];
  rarityOdds: Record<Rarity, number>;
  shopRerollsLeft: number;
}

interface Player {
  x: number; y: number; vx: number; vy: number; r: number;
  hp: number; maxHp: number; speed: number; dmgMul: number;
  attackRate: number; abilityRate: number; dashRate: number; critBonus: number; rangeBonus: number;
  lifesteal: number; coinMult: number; pickupRange: number; armor: number; xpMult: number;
  atkT: number; swingT: number; swingDur: number; swingAim: number; swingApplied: boolean;
  facing: number; aim: number;
  dashT: number; dashCd: number; dashX: number; dashY: number;
  iFrames: number; abilityCd: number; buffT: number;
  combo: number; comboT: number;
  xp: number; level: number; runT: number; hurtT: number;
  stormT: number; stormTick: number;
  legacyCd: number; focusT: number; sureCrits: number; wardT: number; wardTick: number;
  riteT: number; tideT: number; stasisT: number;
  tempestT: number; tempestTick: number; pyreT: number; pyreTick: number;
  slowT: number;
  ownedPowerIds: PowerId[];
  // Archetype & Evolution state
  rangeTier: number;
  speedTier: number;
  hasEvoCrescent: boolean;
  hasEvoPetalStorm: boolean;
  hasEvoRainCutter: boolean;
  hasEvoFrostWave: boolean;
  hasEvoRunicThorns: boolean;
  hasEvoGlacierMaster: boolean;
  hasEvoJaguarSpears: boolean;
  hasEvoPyramidRite: boolean;
  hasEvoFifthSunBorn: boolean;
  hasEvoSandSplit: boolean;
  hasEvoSandVortex: boolean;
  hasEvoSandDuneLord: boolean;
  hasEvoTideBoomerang: boolean;
  hasEvoTidePearlSurge: boolean;
  hasEvoTideOceanMonarch: boolean;
  hasEvoRiftEchoes: boolean;
  hasEvoRiftStasisDoubler: boolean;
  hasEvoRiftUnwrittenVoid: boolean;
  hasEvoStormChainBolt: boolean;
  hasEvoStormSkySmite: boolean;
  hasEvoStormFirstStormLord: boolean;
  hasEvoDrakeFireWave: boolean;
  hasEvoDrakePyreBurst: boolean;
  hasEvoDrakeFirstFlameAvatar: boolean;
  hasPiercingEdge: boolean;
  hasImpactShockwave: boolean;
  hasBouncingBlades: boolean;
  hasEchoSlash: boolean;
  hasKineticKnockback: boolean;
  hasChainArc: boolean;
  hasTerminalBlast: boolean;
  frenzyStacks: number;
  frenzyT: number;
  dead: boolean;
}

interface Decoy { x: number; y: number; t: number; dur: number }

interface Enemy {
  kind: EnemyKind; x: number; y: number; vx: number; vy: number; r: number;
  hp: number; maxHp: number; speed: number; dmg: number;
  flash: number; frozen: number; slow: number; spawn: number;
  atkCd: number; seed: number; elite: boolean; name: string;
  shootT: number; phase: number; windT: number; lungeT: number;
  minionT: number; faceA: number; telegraphed: boolean; launched: boolean;
  variant: number; dashT: number;
  dead: boolean;
}

interface Shot {
  x: number; y: number; vx: number; vy: number; r: number;
  dmg: number; life: number; color: string; from: 'p' | 'e'; pierce: number;
  kind?: 'normal' | 'crescent' | 'chakram' | 'trident' | 'solar' | 'firewave' | 'echo';
  returning?: boolean;
  maxLife?: number;
  startX?: number;
  startY?: number;
  bounces?: number;
  splitOnExpire?: boolean;
  pullsEnemies?: boolean;
}

interface Pickup {
  x: number; y: number; vx: number; vy: number;
  kind: 'coin' | 'potion' | 'rune'; val: number; t: number;
}

type PartKind = 'dot' | 'spark' | 'ring' | 'shard' | 'petal';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  t: number; dur: number; size: number; color: string;
  kind: PartKind; grav: number; drag: number; rot: number; vr: number;
}

interface Floater {
  x: number; y: number; t: number; dur: number;
  text: string; size: number; color: string; crit: boolean;
}

interface Slash {
  x: number; y: number; a0: number; a1: number; r: number;
  t: number; dur: number; color: string;
}

interface Ghost { x: number; y: number; a: number }

type SceneryKind =
  | 'bamboo' | 'sakura' | 'torii'
  | 'emberRock' | 'lavaCrack' | 'deadTree'
  | 'pine' | 'iceShard' | 'runestone'
  | 'palm' | 'ruin' | 'vine'
  | 'dune' | 'obelisk' | 'cactus';

interface SceneryProp {
  x: number;
  y: number;
  kind: SceneryKind;
  scale: number;
  seed: number;
}

const ARENA_W = 2400;
const ARENA_H = 1700;

// Every hostile projectile uses this single hazard color so it can NEVER be
// confused with a boss body, a coin/rune pickup, a telegraphed slam ring, or a
// friendly bolt. Hot magenta-red with a white core — unique across the game.
const HAZARD_COLOR = '#ff2e63';
const HAZARD_CORE = '#ffffff';
const TAU = Math.PI * 2;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const rgbCache = new Map<string, [number, number, number]>();
function hexRgb(hex: string): [number, number, number] {
  let c = rgbCache.get(hex);
  if (!c) {
    const h = hex.replace('#', '');
    c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    rgbCache.set(hex, c);
  }
  return c;
}
function mixHex(a: string, b: string, t: number): string {
  const ca = hexRgb(a);
  const cb = hexRgb(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function rgba(hex: string, a: number): string {
  const c = hexRgb(hex);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
function angDiff(a: number, b: number): number {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return Math.abs(d);
}
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export interface GameOpts {
  onState: (s: GameState, stats?: GameStats) => void;
  bus: HudBus;
}

/** Authoritative weighted rarity pick. Only positive-weight (unlocked) rarities can ever be returned. */
function weightedRandomRarity(odds: Record<Rarity, number>): Rarity {
  const entries = (['legendary', 'epic', 'rare', 'common'] as Rarity[]).filter((r) => odds[r] > 0);
  const total = entries.reduce((sum, r) => sum + odds[r], 0);
  if (!total) return 'common';
  let roll = Math.random() * total;
  for (const rarity of entries) {
    roll -= odds[rarity];
    if (roll < 0) return rarity;
  }
  return entries[entries.length - 1];
}

function normalizeRarityWeights(raw: Record<Rarity, number>): Record<Rarity, number> {
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  if (!total) return { common: 0, rare: 0, epic: 0, legendary: 0 };
  return {
    common: raw.common / total,
    rare: raw.rare / total,
    epic: raw.epic / total,
    legendary: raw.legendary / total,
  };
}

export class Game {
  music = new Music();
  sfx = new SFX();
  state: GameState = 'menu';
  muted = false;
  private legacy: LegacyDef = legacyFor('kensei');
  private decoy: Decoy | null = null;
  private stasisHits: { e: Enemy; dmg: number }[] = [];

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: GameOpts;
  private raf = 0;
  private last = 0;
  private running = true;
  private viewW = 800;
  private viewH = 600;
  private dpr = 1;
  private zoom = 1;
  private ro: ResizeObserver | null = null;

  private cam = { x: ARENA_W / 2, y: ARENA_H / 2, shake: 0 };
  private time = 0;
  private hitstop = 0;
  private slowmoT = 0;
  private dieT = 0;
  private menuT = 0;

  private p: Player | null = null;
  private classDef: ClassDef = CLASSES[0];
  private playerName = 'Hero';
  private profileId = 'local-hero';
  private profileName = 'Wanderer';
  private enemies: Enemy[] = [];
  private shots: Shot[] = [];
  private pickups: Pickup[] = [];
  private parts: Particle[] = [];
  private floaters: Floater[] = [];
  private slashes: Slash[] = [];
  private ghosts: Ghost[] = [];
  private menuParts: Particle[] = [];

  private wave = 0;
  private queue: EnemyKind[] = [];
  private spawnT = 0;
  private waveBreak = 0;
  private score = 0;
  private gold = 0;
  private kills = 0;
  private elapsed = 0;
  private zone: ZoneDef = ZONES[0];
  private killer = 'the Hollow Husks';
  private pendingLevels = 0;
  private levelChoices: PowerDef[] = [];
  private shopItems: ShopItemDef[] = [];
  private shopSold = new Set<ShopItemId>();
  private shopLocked = new Set<ShopItemId>();
  private shopPurchaseCounts = new Map<ShopItemId, number>();
  private powerRerolls = 3;
  private shopRerolls = 3;
  private expectedHeroPower = 1;
  private waveDifficulty: WaveDifficulty = waveDifficulty(1, 1, 1);
  private playerMovementHistory: MovementSample[] = [];

  private feed: FeedMsg[] = [];
  private feedId = 0;
  private announce = '';
  private announceId = 0;
  private announceT = 0;
  private hurtFlash = 0;

  private keys = new Set<string>();
  private attackHeld = false;
  private touchMove = false;
  private tmx = 0;
  private tmy = 0;
  private dashQueued = false;
  private abilityQueued = false;
  private legacyQueued = false;

  private specks: { x: number; y: number; a: number }[] = [];
  private blobs: { x: number; y: number; r: number }[] = [];
  private glowCache = new Map<string, HTMLCanvasElement>();
  private glyphs: { a: number; segs: number[] }[] = [];
  private scenery: SceneryProp[][] = [];

  constructor(canvas: HTMLCanvasElement, opts: GameOpts) {
    this.canvas = canvas;
    this.opts = opts;
    this.ctx = canvas.getContext('2d')!;
    for (let i = 0; i < 300; i++) {
      this.specks.push({ x: rand(0, ARENA_W), y: rand(0, ARENA_H), a: rand(0.02, 0.08) });
    }
    for (let i = 0; i < 16; i++) {
      this.blobs.push({ x: rand(100, ARENA_W - 100), y: rand(100, ARENA_H - 100), r: rand(140, 340) });
    }
    for (let i = 0; i < 8; i++) {
      this.glyphs.push({ a: (i / 8) * TAU, segs: [rand(0.3, 1), rand(0.3, 1), rand(0.3, 1)] });
    }
    this.scenery = ZONES.map((_, zoneIndex) => this.makeScenery(zoneIndex));
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    if (canvas.parentElement) this.ro.observe(canvas.parentElement);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVis);
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('contextmenu', this.onCtx);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    this.running = false;
    this.music.destroy();
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVis);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('contextmenu', this.onCtx);
  }

  /* ------------------------------ input ------------------------------ */

  private onKeyDown = (e: KeyboardEvent) => {
    const code = e.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) e.preventDefault();
    this.keys.add(code);
    this.sfx.ensure();
    if (e.repeat) return;
    if (code === 'Space' || code === 'KeyJ') this.attackHeld = true;
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyK') this.dashQueued = true;
    if (code === 'KeyE') this.abilityQueued = true;
    if (code === 'KeyQ' || code === 'KeyL') this.legacyQueued = true;
    if (code === 'KeyM') this.toggleMuted();
    this.music.ensure();
    if ((code === 'Escape' || code === 'KeyP') && (this.state === 'playing' || this.state === 'paused')) {
      this.togglePause();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    if (e.code === 'Space' || e.code === 'KeyJ') this.attackHeld = false;
  };

  private onBlur = () => {
    if (this.state === 'playing') this.setPaused(true);
  };
  private onVis = () => {
    if (document.hidden && this.state === 'playing') this.setPaused(true);
  };
  private onMouseDown = (e: MouseEvent) => {
    this.sfx.ensure();
    this.music.ensure();
    if (this.state === 'menu') this.music.setScene('menu');
    if (e.button === 0 && this.state === 'playing') this.attackHeld = true;
  };
  private onMouseUp = () => {
    this.attackHeld = false;
  };
  private onCtx = (e: Event) => {
    e.preventDefault();
    if (this.state === 'playing') this.abilityQueued = true;
  };

  setMove(x: number, y: number) {
    this.touchMove = true;
    this.tmx = x;
    this.tmy = y;
  }
  clearMove() {
    this.touchMove = false;
    this.tmx = 0;
    this.tmy = 0;
  }
  touchAttack(v: boolean) {
    this.attackHeld = v;
  }
  touchDash() {
    this.dashQueued = true;
  }
  touchAbility() {
    this.abilityQueued = true;
  }
  touchLegacy() {
    this.legacyQueued = true;
  }

  /** Inject a live world event (real player achievement) into the in-game feed. */
  pushWorldEvent(text: string, color = '#7d8aa0') {
    if (this.state === 'menu') return;
    this.pushFeed(text, color);
  }

  setMusicEnabled(v: boolean) {
    this.music.ensure();
    this.music.setEnabled(v);
  }
  setAudioPageVisible(visible: boolean) {
    this.sfx.setPageVisible(visible);
    this.music.setPageVisible(visible);
  }
  isMusicEnabled() {
    return this.music.isEnabled();
  }
  setVolumes(music: number, sfx: number) {
    this.music.setVolume(music);
    this.sfx.setVolume(sfx);
  }

  /* --------------------------- public control ------------------------ */

  start(classId: string, name: string, profileId = 'local-hero', profileName = 'Wanderer') {
    const cls = CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
    this.classDef = cls;
    this.playerName = name.trim() || 'Wanderer';
    this.profileId = profileId;
    this.profileName = profileName;
    this.p = {
      x: ARENA_W / 2, y: ARENA_H / 2, vx: 0, vy: 0, r: 16,
      hp: cls.hp, maxHp: cls.hp, speed: cls.speed, dmgMul: 1,
      attackRate: 1, abilityRate: 1, dashRate: 1, critBonus: 0, rangeBonus: 0,
      lifesteal: 0, coinMult: 1, pickupRange: 120, armor: 0, xpMult: 1,
      atkT: 0, swingT: -1, swingDur: 0.16, swingAim: 0, swingApplied: true,
      facing: 0, aim: 0,
      dashT: 0, dashCd: 0, dashX: 1, dashY: 0,
      iFrames: 0, abilityCd: 0, buffT: 0,
      combo: 0, comboT: 0,
      xp: 0, level: 1, runT: 0, hurtT: 0,
      stormT: 0, stormTick: 0,
      legacyCd: 0, focusT: 0, sureCrits: 0, wardT: 0, wardTick: 0,
      riteT: 0, tideT: 0, stasisT: 0,
      tempestT: 0, tempestTick: 0, pyreT: 0, pyreTick: 0,
      slowT: 0,
      ownedPowerIds: [],
      rangeTier: 0,
      speedTier: 0,
      hasEvoCrescent: false,
      hasEvoPetalStorm: false,
      hasEvoRainCutter: false,
      hasEvoFrostWave: false,
      hasEvoRunicThorns: false,
      hasEvoGlacierMaster: false,
      hasEvoJaguarSpears: false,
      hasEvoPyramidRite: false,
      hasEvoFifthSunBorn: false,
      hasEvoSandSplit: false,
      hasEvoSandVortex: false,
      hasEvoSandDuneLord: false,
      hasEvoTideBoomerang: false,
      hasEvoTidePearlSurge: false,
      hasEvoTideOceanMonarch: false,
      hasEvoRiftEchoes: false,
      hasEvoRiftStasisDoubler: false,
      hasEvoRiftUnwrittenVoid: false,
      hasEvoStormChainBolt: false,
      hasEvoStormSkySmite: false,
      hasEvoStormFirstStormLord: false,
      hasEvoDrakeFireWave: false,
      hasEvoDrakePyreBurst: false,
      hasEvoDrakeFirstFlameAvatar: false,
      hasPiercingEdge: false,
      hasImpactShockwave: false,
      hasBouncingBlades: false,
      hasEchoSlash: false,
      hasKineticKnockback: false,
      hasChainArc: false,
      hasTerminalBlast: false,
      frenzyStacks: 0,
      frenzyT: 0,
      dead: false,
    };
    this.expectedHeroPower = this.currentHeroPower();
    this.waveDifficulty = waveDifficulty(this.expectedHeroPower, this.expectedHeroPower, 1);
    this.playerMovementHistory = [{ x: this.p.x, y: this.p.y, vx: 0, vy: 0 }];
    this.legacy = legacyFor(cls.id);
    this.decoy = null;
    this.stasisHits = [];
    this.legacyQueued = false;
    this.music.ensure();
    this.music.setScene('zone', 0, false);
    this.enemies = [];
    this.shots = [];
    this.pickups = [];
    this.parts = [];
    this.floaters = [];
    this.slashes = [];
    this.ghosts = [];
    this.wave = 0;
    this.queue = [];
    this.spawnT = 0;
    this.waveBreak = 1.6;
    this.score = 0;
    this.gold = 0;
    this.kills = 0;
    this.elapsed = 0;
    this.feed = [];
    this.killer = 'the Hollow Husks';
    this.pendingLevels = 0;
    this.levelChoices = [];
    this.shopItems = [];
    this.shopSold.clear();
    this.shopLocked.clear();
    this.shopPurchaseCounts.clear();
    this.powerRerolls = 3;
    this.shopRerolls = 3;
    this.hurtFlash = 0;
    this.hitstop = 0;
    this.slowmoT = 0;
    this.dieT = 0;
    this.announce = '';
    this.cam.x = ARENA_W / 2;
    this.cam.y = ARENA_H / 2;
    this.cam.shake = 0;
    this.state = 'playing';
    this.pushFeed(`Welcome to Aetheria, ${this.playerName}. The five realms are watching.`, '#e2b45c');
    this.pushFeed('Hold attack to chain slashes. Dash grants brief immunity.', '#8a94a8');
    this.opts.onState('playing');
  }

  restart() {
    this.start(this.classDef.id, this.playerName, this.profileId, this.profileName);
  }

  setPaused(v: boolean) {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    this.state = v ? 'paused' : 'playing';
    this.music.duck(v);
    this.opts.onState(this.state);
  }
  togglePause() {
    this.setPaused(this.state === 'playing');
  }
  toMenu() {
    this.state = 'menu';
    this.music.duck(false);
    this.music.setScene('menu');
    this.enemies = [];
    this.shots = [];
    this.pickups = [];
    this.floaters = [];
    this.slashes = [];
    this.p = null;
    this.opts.onState('menu');
  }
  toggleMuted(): boolean {
    this.muted = !this.muted;
    this.sfx.ensure();
    this.sfx.setMuted(this.muted);
    return this.muted;
  }

  getStats(): GameStats {
    const p = this.p;
    return {
      score: this.score,
      wave: this.wave,
      level: p?.level ?? 1,
      kills: this.kills,
      gold: this.gold,
      timeSec: Math.floor(this.elapsed),
      classId: this.classDef.id,
      className: this.classDef.name,
      playerName: this.playerName,
      profileId: this.profileId,
      profileName: this.profileName,
      killer: this.killer,
    };
  }

  getLevelUpData(): LevelUpData | null {
    const p = this.p;
    if (!p || this.state !== 'levelup') return null;
    return { level: p.level, choices: this.levelChoices.slice(), rarityOdds: this.rarityOdds(p.level), rerollsLeft: this.powerRerolls };
  }

  rerollPowers(): boolean {
    const p = this.p;
    if (!p || this.state !== 'levelup' || this.powerRerolls <= 0) return false;
    this.powerRerolls--;
    this.levelChoices = this.rollPowers(p.level);
    this.sfx.play('reroll');
    this.pushFeed(`Fates rewoven. ${this.powerRerolls} power reroll${this.powerRerolls === 1 ? '' : 's'} left — boss kills restore them.`, '#d7adff');
    this.opts.onState('levelup');
    return true;
  }

  rerollShop(): boolean {
    if (this.state !== 'shop' || this.shopRerolls <= 0) return false;
    this.shopRerolls--;
    // Both SOLD and LOCKED items are preserved in place across rerolls.
    const kept: ShopItemDef[] = [];
    const replaceable: ShopItemDef[] = [];
    for (const item of this.shopItems) {
      if (this.shopSold.has(item.id) || this.shopLocked.has(item.id)) kept.push(item);
      else replaceable.push(item);
    }
    const exclude = new Set<ShopItemId>([
      ...this.shopSold,
      ...this.shopLocked,
      ...replaceable.map((i) => i.id),
    ]);
    const freshCount = this.shopItems.length - kept.length;
    const fresh = this.rollShopOffers(this.wave, exclude, freshCount);
    let fi = 0;
    const next: ShopItemDef[] = this.shopItems.map((item) =>
      this.shopSold.has(item.id) || this.shopLocked.has(item.id) ? item : (fresh[fi++] ?? item)
    );
    this.shopItems = next;
    this.sfx.play('reroll');
    this.pushFeed(`Merchant restocks. ${this.shopRerolls} market reroll${this.shopRerolls === 1 ? '' : 's'} left — boss kills restore them.`, '#d7adff');
    this.opts.onState('shop');
    return true;
  }

  choosePower(id: PowerId): boolean {
    const p = this.p;
    const power = this.levelChoices.find((choice) => choice.id === id);
    if (!p || this.state !== 'levelup' || !power || !isPowerAvailable(power.id, p.ownedPowerIds)) return false;
    this.applyPower(power.id);
    this.pendingLevels--;
    this.sfx.play('rune');
    this.shake(6);
    this.floater(p.x, p.y - 48, power.name.toUpperCase(), 19, power.color, true);
    this.burst(p.x, p.y, power.color, 18, 260, 'spark');
    this.part(p.x, p.y, 0, 0, 0.65, 32, power.color, 'ring');
    this.pushFeed(`${power.name} attuned. ${power.desc}`, power.color);
    if (this.pendingLevels > 0) {
      this.openLevelUp();
    } else {
      this.levelChoices = [];
      this.state = 'playing';
      this.opts.onState('playing');
    }
    return true;
  }

  getShopData(): ShopData | null {
    if (this.state !== 'shop') return null;
    const nextZone = ZONES[this.wave % ZONES.length];
    return {
      wave: this.wave,
      gold: this.gold,
      nextZoneName: nextZone.name,
      nextZoneColor: nextZone.color,
      items: this.shopItems.map((item) => ({
        item,
        sold: this.shopSold.has(item.id),
        locked: this.shopLocked.has(item.id),
      })),
      rarityOdds: this.shopRarityOdds(this.wave),
      shopRerollsLeft: this.shopRerolls,
    };
  }

  getPauseData(): PauseData | null {
    const p = this.p;
    if (!p) return null;

    const counts = new Map<PowerId, number>();
    for (const id of p.ownedPowerIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const activeSkills: ActiveSkillSummary[] = POWERS.filter((power) => counts.has(power.id)).map((power) => {
      const rawCount = counts.get(power.id) ?? 0;
      const stackCap = getPowerStackCap(power.id);
      const count = capStackCount(rawCount, stackCap);
      const stackCapMatch = power.stacks.match(/capped at\s+(\d+)/i);
      const displayedCap = stackCap ?? (stackCapMatch ? Number(stackCapMatch[1]) : null);
      const valueText = this.describePowerValue(power, count);
      return { id: power.id, name: power.name, rarity: power.rarity, count, valueText, maxStacks: displayedCap };
    }).sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));

    const buildStats = [
      { label: 'Weapon Damage', value: `+${((p.dmgMul - 1) * 100).toFixed(0)}%` },
      { label: 'Weapon Reach', value: `+${Math.round(p.rangeBonus)}` },
      { label: 'Attack Speed', value: `+${(((1 / p.attackRate) - 1) * 100).toFixed(0)}%` },
      { label: 'Critical Chance', value: `${(this.critChance() * 100).toFixed(0)}%` },
      { label: 'Critical Damage', value: 'x2', },
      { label: 'Movement Speed', value: `+${(((p.speed / this.classDef.speed) - 1) * 100).toFixed(0)}%` },
      { label: 'Cooldown Reduction', value: `${((1 - p.abilityRate) * 100).toFixed(0)}%` },
      { label: 'Defense / Armor', value: `${(p.armor * 100).toFixed(0)}%` },
      { label: 'Max Health', value: `+${Math.max(0, p.maxHp - this.classDef.hp)}` },
      { label: 'Lifesteal', value: `+${p.lifesteal.toFixed(0)} HP/kill` },
      { label: 'Pickup Range', value: `+${Math.max(0, p.pickupRange - 120)}` },
    ].filter((stat) => stat.value && stat.value !== 'NaN%');

    const marketPowerups: MarketplacePowerupSummary[] = [];
    for (const [itemId, count] of this.shopPurchaseCounts.entries()) {
      const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
      if (!item) continue;
      const cappedCount = capStackCount(count, getShopItemStackCap(itemId));
      const remainingSeconds = item.id === 'tonic' ? Math.max(0, p.buffT) : null;
      if (item.id === 'tonic' && (remainingSeconds === null || remainingSeconds <= 0)) continue;
      marketPowerups.push({
        name: item.name,
        effect: item.desc,
        remainingSeconds,
        count: cappedCount,
      });
    }
    if (p.buffT > 0 && !marketPowerups.some((entry) => entry.name === 'Sun Tonic')) {
      marketPowerups.push({
        name: 'Sun Tonic',
        effect: '+50% damage',
        remainingSeconds: Math.max(0, p.buffT),
        count: 1,
      });
    }

    return { activeSkills, totalBuildStats: buildStats, marketplacePowerups: marketPowerups };
  }

  private describePowerValue(power: PowerDef, count: number): string {
    switch (power.id) {
      case 'veteran_reach': {
        const reach = 26 * count;
        const damage = (Math.pow(1.12, count) * 100 - 100);
        return `Weapon Reach: +${reach} · Weapon Damage: +${damage.toFixed(0)}%`;
      }
      case 'keen_edge':
        return `Weapon Damage: +${((Math.pow(1.22, count) - 1) * 100).toFixed(0)}%`;
      case 'ironhide':
        return `Max Health: +${25 * count}`;
      case 'windstep':
        return `Movement Speed: +${((Math.pow(1.14, count) - 1) * 100).toFixed(0)}%`;
      case 'precision':
        return `Critical Chance: +${(Math.min(0.85, 0.12 * count) * 100).toFixed(0)}%`;
      case 'longreach':
        return `Weapon Reach: +${22 * count}`;
      case 'siphon':
        return `Lifesteal: +${2 * count} HP/kill`;
      case 'quicksilver':
        return `Attack Speed: +${((Math.pow(1 / 0.82, count) - 1) * 100).toFixed(0)}%`;
      case 'sunward':
        return `Signature Cooldown: -${(Math.max(0, 1 - Math.pow(0.82, count)) * 100).toFixed(0)}%`;
      case 'gilded_hand':
        return `Coin Value: +${(Math.min(1, 0.5 * count) * 100).toFixed(0)}%`;
      case 'wardplate':
        return `Damage Reduction: +${Math.min(65, 12 * count)}%`;
      case 'battle_tempo':
        return `Weapon Damage: +${((Math.pow(1.1, count) * 100) - 100).toFixed(0)}% · Attack Speed: +${((Math.pow(1 / 0.9, count) - 1) * 100).toFixed(0)}%`;
      case 'titan_blood':
        return `Max Health: +${Math.round((1.18 ** count - 1) * 100)}%`;
      case 'blood_harvest':
        return `Lifesteal: +${4 * count} HP/kill · Weapon Damage: +${((Math.pow(1.1, count) - 1) * 100).toFixed(0)}%`;
      case 'astral_echo':
        return `Ability Cooldown: -${(Math.max(0, 1 - Math.pow(0.72, count)) * 100).toFixed(0)}%`;
      case 'predator_instinct':
        return `Critical Chance: +${(Math.min(0.3, 0.1 * count) * 100).toFixed(0)}% · Movement Speed: +${((Math.pow(1.12, count) - 1) * 100).toFixed(0)}% · Weapon Damage: +${((Math.pow(1.1, count) - 1) * 100).toFixed(0)}%`;
      case 'colossus_soul':
        return `Max Health: +${45 * count} · Damage Reduction: +${Math.min(65, 10 * count)}%`;
      case 'death_dealer':
        return `Weapon Damage: +${((Math.pow(1.32, count) - 1) * 100).toFixed(0)}% · Critical Chance: +${(Math.min(0.24, 0.08 * count) * 100).toFixed(0)}%`;
      case 'chronomancer':
        return `Ability Cooldown: -${(Math.max(0, 1 - Math.pow(0.62, count)) * 100).toFixed(0)}%`;
      case 'royal_treasury':
        return `Coin Value: +${(count * 1).toFixed(0)}x · Weapon Damage: +${((Math.pow(1.16, count) - 1) * 100).toFixed(0)}%`;
      case 'aetherborn_form':
        return `Weapon Damage: +${((Math.pow(1.42, count) - 1) * 100).toFixed(0)}% · Movement Speed: +${((Math.pow(1.16, count) - 1) * 100).toFixed(0)}% · Critical Chance: +${(Math.min(0.24, 0.12 * count) * 100).toFixed(0)}%`;
      case 'undying_legend':
        return `Max Health: +${35 * count} · Lifesteal: +${6 * count} HP/kill · Damage Reduction: +${Math.min(65, 15 * count)}%`;
      case 'kinetic_knockback':
        return `Weapon Damage: +${((Math.pow(1.18, count) - 1) * 100).toFixed(0)}%`;
      case 'frenzy_momentum':
        return `Attack Speed: +${Math.min(40, 4 * count)}%`;
      default:
        return power.desc;
    }
  }

  toggleLockShopItem(id: ShopItemId): boolean {
    if (this.state !== 'shop') return false;
    const item = this.shopItems.find((entry) => entry.id === id);
    if (!item || this.shopSold.has(id)) return false;
    if (this.shopLocked.has(id)) {
      this.shopLocked.delete(id);
      this.sfx.play('click');
      this.pushFeed(`Unlocked ${item.name}. It will roll away if unpurchased.`, '#8a94a8');
    } else {
      this.shopLocked.add(id);
      this.sfx.play('rune');
      this.pushFeed(`🔒 Locked ${item.name}! It will be held for future markets until bought or unlocked.`, '#ffd97a');
    }
    this.opts.onState('shop');
    return true;
  }

  buyShopItem(id: ShopItemId): boolean {
    const p = this.p;
    const item = this.shopItems.find((entry) => entry.id === id);
    if (!p || this.state !== 'shop' || !item || this.shopSold.has(id) || this.gold < item.cost) return false;
    const currentStacks = this.shopPurchaseCounts.get(id) ?? 0;
    const stackCap = getShopItemStackCap(id);
    if (stackCap !== null && currentStacks >= stackCap) {
      this.pushFeed(`${item.name} is already at max stacks (${stackCap}).`, item.color);
      return false;
    }
    this.gold -= item.cost;
    this.shopSold.add(id);
    this.shopPurchaseCounts.set(id, currentStacks + 1);
    // Buying an item unlocks it automatically.
    this.shopLocked.delete(id);
    if (id.startsWith('expanded_shop_')) {
      const effect = Number(id.split('_').pop()) % 6;
      if (effect === 0) p.dmgMul *= 1.08;
      else if (effect === 1) p.attackRate *= 0.92;
      else if (effect === 2) p.speed *= 1.1;
      else if (effect === 3) { p.maxHp += 18; p.hp = Math.min(p.maxHp, p.hp + 18); }
      else if (effect === 4) p.critBonus += 0.06;
      else p.coinMult += 0.35;
    }
    switch (id) {
      case 'rations':
        p.hp = Math.min(p.maxHp, p.hp + 48);
        this.sfx.play('potion');
        break;
      case 'tonic':
        p.buffT = Math.max(p.buffT, 18);
        this.sfx.play('rune');
        break;
      case 'steel':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) p.dmgMul *= 1.14;
        this.sfx.play('hit');
        break;
      case 'boots':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) p.speed *= 1.1;
        this.sfx.play('dash');
        break;
      case 'ward':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) {
          p.maxHp += 18;
          p.hp = Math.min(p.maxHp, p.hp + 18);
        }
        this.sfx.play('potion');
        break;
      case 'sigil':
        p.abilityCd = 0;
        this.sfx.play('rune');
        break;
      case 'whetstone':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) {
          p.critBonus += 0.07;
          p.dmgMul *= 1.08;
        }
        this.sfx.play('crit');
        break;
      case 'hourglass':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) p.abilityRate *= 0.86;
        this.sfx.play('stillwater');
        break;
      case 'magnet':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) {
          p.coinMult += 0.5;
          p.pickupRange += 60;
        }
        this.sfx.play('coin');
        break;
      case 'elixir':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) {
          p.maxHp += 20;
          p.hp = p.maxHp;
        }
        this.sfx.play('potion');
        break;
      case 'prism':
        p.abilityCd = 0;
        p.legacyCd = 0;
        this.sfx.play('rune');
        break;
      case 'war_banner':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) {
          p.dmgMul *= 1.18;
          p.speed *= 1.1;
          p.maxHp += 15;
          p.hp = Math.min(p.maxHp, p.hp + 15);
        }
        this.sfx.play('levelup');
        break;
      case 'xp_tome':
        if (capStackCount(currentStacks + 1, stackCap) > currentStacks) p.xpMult += 0.12;
        this.sfx.play('rune');
        break;
    }
    this.shake(3);
    this.floater(p.x, p.y - 34, `${item.name.toUpperCase()}!`, 17, item.color, true);
    this.burst(p.x, p.y, item.color, 12, 190, 'spark');
    this.pushFeed(`Market purchase: ${item.name} (-${item.cost} gold)`, item.color);
    this.opts.onState('shop');
    return true;
  }

  continueFromShop() {
    if (this.state !== 'shop') return;
    this.state = 'playing';
    this.startWave(this.wave + 1);
    this.opts.onState('playing');
  }

  private rarityOdds(level: number): Record<Rarity, number> {
    return rarityOddsForLevel(level);
  }

  private rollPowers(level: number): PowerDef[] {
    const cid = this.classDef.id;
    const ownedPowerIds = this.p?.ownedPowerIds ?? [];
    const chosen: PowerDef[] = [];
    // Categories to ensure variety across offense, defense/sustain, utility/mobility, and archetype evolution
    const usedCategories = new Set<string>();

    const getCategory = (pow: PowerDef) => {
      const k = pow.kicker.toUpperCase();
      if (k.includes('EVO') || k.includes('KATANA') || k.includes('AXE') || k.includes('CHAKRAM') || k.includes('TRIDENT') || k.includes('RIFT') || k.includes('LIGHTNING') || k.includes('DRAGON')) return 'evo';
      if (k.includes('OFFENSE') || k.includes('CRITICAL') || k.includes('ANNIHILATION') || k.includes('HYBRID') || k.includes('PENETRATION') || k.includes('RICOCHET')) return 'offense';
      if (k.includes('VITALITY') || k.includes('DEFENSE') || k.includes('SUSTAIN') || k.includes('IMMORTALITY') || k.includes('FORTRESS')) return 'defense';
      if (k.includes('MOBILITY') || k.includes('TEMPO') || k.includes('TIME') || k.includes('ABILITY') || k.includes('SIGNATURE')) return 'mobility_tempo';
      return 'utility';
    };

    const isValid = (power: PowerDef) => !power.id.startsWith('late_') || level >= 72;

    let attempts = 0;
    while (chosen.length < 3 && attempts < 60) {
      attempts++;
      const baseOdds = this.rarityOdds(level);
      const availableOdds: Record<Rarity, number> = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      };
      for (const candidate of POWERS) {
        if (chosen.some((c) => c.id === candidate.id) || !isValid(candidate) || !isPowerAvailable(candidate.id, ownedPowerIds)) continue;
        if (!isRarityUnlocked(candidate.rarity, level)) continue;
        if (candidate.id.startsWith('evo_') && !candidate.recommended.includes(cid)) continue;
        availableOdds[candidate.rarity] = baseOdds[candidate.rarity];
      }
      const rarity = weightedRandomRarity(normalizeRarityWeights(availableOdds));
      // Priority weighting: legend-specific evolutions have high affinity for that legend
      let pool = POWERS.filter((power) => {
        if (chosen.some((c) => c.id === power.id)) return false;
        if (!isValid(power)) return false;
        if (!isPowerAvailable(power.id, ownedPowerIds)) return false;
        // Locked rarities can never enter the pool, regardless of evo affinity
        if (!isRarityUnlocked(power.rarity, level)) return false;
        // If it's a legend-specific evolution power, strictly only offer to its legend
        return power.rarity === rarity && (!power.id.startsWith('evo_') || power.recommended.includes(cid));
      });

      if (!pool.length) {
        pool = POWERS.filter((power) => {
          if (chosen.some((c) => c.id === power.id)) return false;
          if (!isValid(power)) return false;
          if (!isPowerAvailable(power.id, ownedPowerIds)) return false;
          if (!isRarityUnlocked(power.rarity, level)) return false;
          if (power.id.startsWith('evo_')) return power.recommended.includes(cid);
          return true;
        });
      }

      if (pool.length) {
        // Try to favor varied categories across the 3 choices so players never see 3 identical types
        const varied = pool.filter((pow) => !usedCategories.has(getCategory(pow)));
        const cand = (varied.length > 0 && Math.random() < 0.8)
          ? varied[Math.floor(Math.random() * varied.length)]
          : pool[Math.floor(Math.random() * pool.length)];

        chosen.push(cand);
        usedCategories.add(getCategory(cand));
      }
    }

    // Safety fallback (still restricted to unlocked rarities)
    while (chosen.length < 3) {
      const fallback = POWERS.find((pow) => !chosen.some((c) => c.id === pow.id) && isValid(pow) && isPowerAvailable(pow.id, ownedPowerIds) && (!pow.id.startsWith('evo_') || pow.recommended.includes(cid)) && isRarityUnlocked(pow.rarity, level));
      if (fallback) chosen.push(fallback);
      else break;
    }

    if (import.meta.env.DEV) {
      for (const pow of chosen) {
        if (!isRarityUnlocked(pow.rarity, level)) {
          console.error('BUG: Locked rarity generated', pow.rarity, pow.id, 'level', level);
        }
      }
    }

    return chosen;
  }

  private openLevelUp() {
    const p = this.p;
    if (!p || p.level >= MAX_PLAYER_LEVEL || this.pendingLevels <= 0) {
      this.pendingLevels = 0;
      this.levelChoices = [];
      if (this.state === 'levelup') {
        this.state = 'playing';
        this.music.duck(false);
        this.opts.onState('playing');
      }
      return;
    }
    this.levelChoices = this.rollPowers(p.level);
    if (!canOpenLevelUp(p.level, this.pendingLevels, this.levelChoices.length)) {
      if (p.level >= MAX_PLAYER_LEVEL || this.pendingLevels <= 0) {
        this.pendingLevels = 0;
        this.levelChoices = [];
        this.state = 'playing';
        this.music.duck(false);
        this.opts.onState('playing');
        return;
      }
      this.pendingLevels = Math.max(0, this.pendingLevels - 1);
      this.openLevelUp();
      return;
    }
    this.state = 'levelup';
    this.music.duck(true);
    this.announceSet(`LEVEL ${p.level} · CHOOSE YOUR PATH`);
    this.opts.onState('levelup');
  }

  private applyPower(id: PowerId) {
    const p = this.p!;
    const currentCount = p.ownedPowerIds.filter((ownedId) => ownedId === id).length;
    const stackCap = getPowerStackCap(id);
    const nextCount = currentCount + 1;
    const shouldApply = stackCap === null || capStackCount(nextCount, stackCap) > currentCount;
    p.ownedPowerIds.push(id);
    if (!shouldApply) return;
    if (id.startsWith('expanded_')) {
      const [, category, rawIndex] = id.split('_');
      const index = Number(rawIndex);
      const effect = index % 5;
      if (category === 'offense') {
        if (effect === 0) p.dmgMul *= 1.09;
        else if (effect === 1) p.critBonus += 0.05;
        else if (effect === 2) p.rangeBonus += 18;
        else if (effect === 3) p.attackRate *= 0.93;
        else { p.dmgMul *= 1.12; p.rangeBonus += 8; }
      } else if (category === 'defense') {
        if (effect === 0) { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); }
        else if (effect === 1) p.armor = Math.min(0.65, p.armor + 0.06);
        else if (effect === 2) p.lifesteal += 2;
        else if (effect === 3) { p.maxHp += 12; p.hp = Math.min(p.maxHp, p.hp + 12); p.armor = Math.min(0.65, p.armor + 0.04); }
        else p.speed *= 1.08;
      } else if (category === 'mobility') {
        if (effect === 0) p.speed *= 1.08;
        else if (effect === 1) p.attackRate *= 0.94;
        else if (effect === 2) p.abilityRate *= 0.94;
        else if (effect === 3) p.rangeBonus += 12;
        else { p.critBonus += 0.04; p.speed *= 1.05; }
      } else {
        if (effect === 0) p.xpMult += 0.08;
        else if (effect === 1) p.coinMult += 0.25;
        else if (effect === 2) p.pickupRange += 30;
        else if (effect === 3) { p.maxHp += 10; p.hp = Math.min(p.maxHp, p.hp + 10); p.coinMult += 0.04; }
        else { p.dmgMul *= 1.05; p.xpMult += 0.05; }
      }
      return;
    }
    switch (id) {
      case 'keen_edge':
        p.dmgMul *= 1.22;
        break;
      case 'ironhide':
        p.maxHp += 25;
        p.hp = Math.min(p.maxHp, p.hp + 25);
        break;
      case 'windstep':
        p.speed *= 1.14;
        break;
      case 'precision':
        p.critBonus += 0.12;
        break;
      case 'longreach':
        p.rangeBonus += 22;
        p.rangeTier++;
        break;
      case 'siphon':
        p.lifesteal += 2;
        break;
      case 'quicksilver':
        p.attackRate *= 0.82;
        p.speedTier++;
        break;
      case 'sunward':
        p.abilityRate *= 0.82;
        break;
      case 'gilded_hand':
        p.coinMult += 0.5;
        p.pickupRange += 26;
        break;
      case 'wardplate':
        p.armor = Math.min(0.65, p.armor + 0.12);
        break;
      case 'battle_tempo':
        p.dmgMul *= 1.1;
        p.attackRate *= 0.9;
        break;
      case 'titan_blood': {
        const gained = Math.ceil(p.maxHp * 0.18);
        p.maxHp += gained;
        p.hp = Math.min(p.maxHp, p.hp + gained);
        break;
      }
      case 'veteran_reach':
        p.rangeBonus += 26;
        p.dmgMul *= 1.12;
        p.rangeTier += 2;
        break;
      case 'blood_harvest':
        p.lifesteal += 4;
        p.dmgMul *= 1.1;
        break;
      case 'astral_echo':
        p.abilityRate *= 0.72;
        p.abilityCd = 0;
        p.legacyCd = 0;
        break;
      case 'predator_instinct':
        p.critBonus += 0.1;
        p.speed *= 1.12;
        p.dmgMul *= 1.1;
        break;
      case 'colossus_soul':
        p.maxHp += 45;
        p.hp = Math.min(p.maxHp, p.hp + 45);
        p.armor = Math.min(0.65, p.armor + 0.1);
        break;
      case 'death_dealer':
        p.dmgMul *= 1.32;
        p.critBonus += 0.08;
        break;
      case 'chronomancer':
        p.abilityRate *= 0.62;
        p.dashRate *= 0.78;
        break;
      case 'royal_treasury':
        p.coinMult += 1;
        p.pickupRange += 70;
        p.dmgMul *= 1.16;
        break;
      case 'aetherborn_form':
        p.dmgMul *= 1.42;
        p.speed *= 1.16;
        p.critBonus += 0.12;
        p.maxHp += 25;
        p.hp = Math.min(p.maxHp, p.hp + 25);
        break;
      case 'undying_legend':
        p.maxHp += 35;
        p.hp = Math.min(p.maxHp, p.hp + 35);
        p.lifesteal += 6;
        p.armor = Math.min(0.65, p.armor + 0.15);
        break;
      case 'aether_insight':
        p.xpMult += 0.15;
        break;
      case 'late_aether_surge':
        p.dmgMul *= 1.08;
        p.speed *= 1.08;
        break;
      case 'late_void_horizon':
        p.dmgMul *= 1.1;
        p.critBonus += 0.05;
        break;
      case 'late_starfall':
        p.attackRate *= 0.88;
        p.critBonus += 0.04;
        break;
      // Mechanical Powers
      case 'piercing_edge':
        p.hasPiercingEdge = true;
        p.rangeBonus += 22;
        p.rangeTier++;
        break;
      case 'impact_shockwave':
        p.hasImpactShockwave = true;
        break;
      case 'bouncing_blades':
        p.hasBouncingBlades = true;
        break;
      case 'echo_slash':
        p.hasEchoSlash = true;
        break;
      case 'kinetic_knockback':
        p.hasKineticKnockback = true;
        p.dmgMul *= 1.18;
        break;
      case 'chain_arc':
        p.hasChainArc = true;
        break;
      case 'terminal_blast':
        p.hasTerminalBlast = true;
        break;
      case 'frenzy_momentum':
        p.attackRate *= 0.88;
        p.speedTier++;
        break;
      // Legend Specific Evolutions
      case 'evo_kensei_crescent':
        p.hasEvoCrescent = true;
        p.rangeTier = Math.max(p.rangeTier, 3);
        break;
      case 'evo_kensei_petalstorm':
        p.hasEvoPetalStorm = true;
        break;
      case 'evo_kensei_raincutter':
        p.hasEvoRainCutter = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_shield_frostwave':
        p.hasEvoFrostWave = true;
        p.rangeTier = Math.max(p.rangeTier, 3);
        break;
      case 'evo_shield_runicthorns':
        p.hasEvoRunicThorns = true;
        break;
      case 'evo_shield_glaciermaster':
        p.hasEvoGlacierMaster = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_jaguar_spears':
        p.hasEvoJaguarSpears = true;
        p.rangeTier = Math.max(p.rangeTier, 3);
        break;
      case 'evo_jaguar_pyramidrite':
        p.hasEvoPyramidRite = true;
        break;
      case 'evo_jaguar_fifthsunborn':
        p.hasEvoFifthSunBorn = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_sand_split':
        p.hasEvoSandSplit = true;
        p.rangeTier = Math.max(p.rangeTier, 2);
        break;
      case 'evo_sand_vortex':
        p.hasEvoSandVortex = true;
        break;
      case 'evo_sand_dunelord':
        p.hasEvoSandDuneLord = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_tide_boomerang':
        p.hasEvoTideBoomerang = true;
        p.rangeTier = Math.max(p.rangeTier, 2);
        break;
      case 'evo_tide_pearlsurge':
        p.hasEvoTidePearlSurge = true;
        break;
      case 'evo_tide_oceanmonarch':
        p.hasEvoTideOceanMonarch = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_rift_echoes':
        p.hasEvoRiftEchoes = true;
        p.rangeTier = Math.max(p.rangeTier, 2);
        break;
      case 'evo_rift_stasisdoubler':
        p.hasEvoRiftStasisDoubler = true;
        break;
      case 'evo_rift_unwrittenvoid':
        p.hasEvoRiftUnwrittenVoid = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_storm_chainbolt':
        p.hasEvoStormChainBolt = true;
        p.rangeTier = Math.max(p.rangeTier, 3);
        break;
      case 'evo_storm_skysmite':
        p.hasEvoStormSkySmite = true;
        break;
      case 'evo_storm_firststormlord':
        p.hasEvoStormFirstStormLord = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
      case 'evo_drake_firewave':
        p.hasEvoDrakeFireWave = true;
        p.rangeTier = Math.max(p.rangeTier, 2);
        break;
      case 'evo_drake_pyreburst':
        p.hasEvoDrakePyreBurst = true;
        break;
      case 'evo_drake_firstflameavatar':
        p.hasEvoDrakeFirstFlameAvatar = true;
        p.rangeTier = Math.max(p.rangeTier, 4);
        break;
    }
  }

  /** Wave-scaled shop odds with locked tiers removed before normalization. */
  private shopRarityOdds(wave: number): Record<Rarity, number> {
    return shopRarityOddsForWave(wave);
  }

  private rollShopRarity(wave: number): Rarity {
    return weightedRandomRarity(this.shopRarityOdds(wave));
  }

  /** Roll `count` distinct shop offers by rarity weight, skipping `exclude`. */
  private rollShopOffers(wave: number, exclude: Set<ShopItemId>, count: number): ShopItemDef[] {
    const chosen: ShopItemDef[] = [];
    let guard = 0;
    while (chosen.length < count && guard++ < 40) {
      const rarity = this.rollShopRarity(wave);
      let pool = SHOP_ITEMS.filter(
        (item) => isShopRarityUnlocked(item.rarity, wave) && item.rarity === rarity && !exclude.has(item.id) && !chosen.some((c) => c.id === item.id)
      );
      if (!pool.length) {
        pool = SHOP_ITEMS.filter(
          (item) => isShopRarityUnlocked(item.rarity, wave) && !exclude.has(item.id) && !chosen.some((c) => c.id === item.id)
        );
      }
      if (!pool.length) break;
      chosen.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return chosen;
  }

  private openShop() {
    // Locked items are carried over across waves until bought or explicitly unlocked.
    const rations = SHOP_ITEMS.find((item) => item.id === 'rations')!;
    const carried: ShopItemDef[] = [];
    for (const lockedId of this.shopLocked) {
      const found = SHOP_ITEMS.find((i) => i.id === lockedId);
      if (found) carried.push(found);
    }
    const hasRations = carried.some((i) => i.id === rations.id);
    const guaranteed: ShopItemDef[] = hasRations ? carried : [rations, ...carried];
    // Keep max 4 slots total. If 4 items are locked, all 4 appear.
    const initialSlots = guaranteed.slice(0, 4);
    const exclude = new Set<ShopItemId>(initialSlots.map((i) => i.id));
    const needed = Math.max(0, 4 - initialSlots.length);
    const fresh = this.rollShopOffers(this.wave, exclude, needed);
    this.shopItems = [...initialSlots, ...fresh];
    this.shopSold.clear();
    this.state = 'shop';
    this.music.duck(true);
    this.announceSet('TRAVELING MARKET · THE NEXT WAVE WAITS');
    this.pushFeed('A traveling merchant has opened camp between the realms.', '#ffd97a');
    this.opts.onState('shop');
  }

  /* ------------------------------ helpers ---------------------------- */

  private pushFeed(text: string, color: string) {
    this.feed.push({ id: ++this.feedId, text, color });
    if (this.feed.length > 5) this.feed.shift();
  }

  private announceSet(text: string) {
    this.announce = text;
    this.announceId++;
    this.announceT = 2.4;
  }

  private shake(v: number) {
    this.cam.shake = Math.min(22, this.cam.shake + v);
  }

  private glow(color: string): HTMLCanvasElement {
    let g = this.glowCache.get(color);
    if (!g) {
      g = document.createElement('canvas');
      g.width = 128;
      g.height = 128;
      const gc = g.getContext('2d')!;
      const grad = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, rgba(color, 0.9));
      grad.addColorStop(0.35, rgba(color, 0.35));
      grad.addColorStop(1, rgba(color, 0));
      gc.fillStyle = grad;
      gc.fillRect(0, 0, 128, 128);
      this.glowCache.set(color, g);
    }
    return g;
  }

  private drawGlow(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
    c.globalAlpha = alpha;
    c.drawImage(this.glow(color), x - r, y - r, r * 2, r * 2);
    c.globalAlpha = 1;
  }

  private part(
    x: number, y: number, vx: number, vy: number, dur: number, size: number,
    color: string, kind: PartKind, grav = 0, drag = 1
  ) {
    if (this.parts.length > 420) return;
    this.parts.push({
      x, y, vx, vy, t: 0, dur, size, color, kind, grav, drag,
      rot: rand(0, TAU), vr: rand(-6, 6),
    });
  }

  private burst(x: number, y: number, color: string, n: number, speed: number, kind: PartKind = 'dot') {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * 0.3, speed);
      this.part(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.3, 0.7), rand(2, 5), color, kind, kind === 'shard' ? 300 : 0, 0.9);
    }
  }

  private floater(x: number, y: number, text: string, size: number, color: string, crit = false) {
    if (this.floaters.length > 60) this.floaters.shift();
    this.floaters.push({ x: x + rand(-8, 8), y, t: 0, dur: crit ? 1.0 : 0.8, text, size, color, crit });
  }

  private xpNeed(level: number) {
    return Math.round(45 * Math.pow(level, 1.35));
  }

  private critChance() {
    const p = this.p!;
    return Math.min(0.85, this.classDef.crit + p.critBonus);
  }

  private currentHeroPower() {
    const p = this.p!;
    const stats: HeroCombatStats = {
      baseDamage: this.classDef.dmg,
      attackCooldown: this.classDef.atkCd,
      damageMultiplier: p.dmgMul,
      attackRateMultiplier: 1 / p.attackRate,
      critChance: this.critChance(),
      maxHealth: p.maxHp,
      armor: p.armor,
      movementSpeed: p.speed,
    };
    return heroBasePower(stats);
  }

  private difficulty() {
    return this.waveDifficulty;
  }

  /* ------------------------------- waves ----------------------------- */

  private startWave(n: number) {
    this.wave = Math.min(FINAL_WAVE, n);
    this.waveDifficulty = waveDifficulty(this.currentHeroPower(), this.expectedHeroPower, n);
    this.zone = ZONES[(n - 1) % ZONES.length];
    const comp = waveComposition(n);
    const q: EnemyKind[] = [];
    for (const g of comp) for (let i = 0; i < g.count; i++) q.push(g.kind);
    // interleave-ish shuffle
    for (let i = q.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q[i], q[j]] = [q[j], q[i]];
    }
    // bosses lead their wave
    const bi = q.indexOf('boss');
    if (bi > 0) {
      q.splice(bi, 1);
      q.unshift('boss');
    }
    this.queue = q;
    this.spawnT = 1.4;
    this.sfx.play('wave');
    this.music.duck(false);
    this.music.setScene('zone', (n - 1) % ZONES.length, n % 5 === 0);
    if (n % 5 === 0) {
      this.announceSet(`WAVE ${n} · ${this.zone.boss.toUpperCase()}`);
      this.pushFeed(`⚠ World boss approaching: ${this.zone.boss}`, '#ff8a8a');
      this.sfx.play('boss');
      this.shake(7);
    } else {
      this.announceSet(`WAVE ${n} · ${this.zone.name.toUpperCase()}`);
      this.pushFeed(`Quest: cleanse ${this.zone.name} (${this.zone.culture}) — wave ${n}`, '#8a94a8');
    }
    if (n > 1) {
      const threat = n < 4 ? 'Threat rising' : n < 8 ? 'Dangerous incursion' : 'Relentless assault';
      this.pushFeed(`${threat}: denser ranks, stronger foes, and faster spawns.`, '#ffb36b');
    }
  }

  private spawnEnemy(kind: EnemyKind) {
    const def = ENEMIES[kind];
    const p = this.p!;
    const a = rand(0, TAU);
    const dist = rand(460, 640);
    const difficulty = this.difficulty();
    const hpMul = difficulty.hp;
    const dmgMul = difficulty.dmg;
    const elite = kind !== 'boss' && Math.random() < difficulty.elites;
    const zoneIdx = this.wave > 0 ? (this.wave - 1) % ZONES.length : 0;
    const e: Enemy = {
      kind,
      x: clamp(p.x + Math.cos(a) * dist, 50, ARENA_W - 50),
      y: clamp(p.y + Math.sin(a) * dist, 50, ARENA_H - 50),
      vx: 0, vy: 0,
      r: def.r,
      hp: def.hp * hpMul * (elite ? 2.2 : 1),
      maxHp: def.hp * hpMul * (elite ? 2.2 : 1),
      speed: def.speed * difficulty.speed * (elite ? 1.18 : 1),
      dmg: def.dmg * dmgMul * (elite ? 1.4 : 1),
      flash: 0, frozen: 0, slow: 0, spawn: kind === 'boss' ? 0.8 : 0.45,
      atkCd: rand(0.3, 0.9), seed: rand(0, TAU),
      elite,
      name: kind === 'boss' ? this.zone.boss : elite ? ELITE_NAMES[Math.floor(rand(0, ELITE_NAMES.length))] : def.name,
      shootT: rand(1.0, 2.0), phase: rand(0, 5), windT: 0, lungeT: 0,
      minionT: 6, faceA: 0, telegraphed: false, launched: false,
      variant: zoneIdx, dashT: 0,
      dead: false,
    };
    if (kind === 'boss') {
      e.hp = def.hp * this.waveDifficulty.bossHp;
      e.maxHp = e.hp;
      e.dmg = def.dmg * this.waveDifficulty.bossDmg;
      e.speed *= this.waveDifficulty.bossSpeed;
      e.shootT *= this.waveDifficulty.bossAttackGap;
      e.minionT = this.waveDifficulty.bossMinionGap;
    }
    if (kind === 'dragon') {
      this.sfx.play('dragonroar');
    }
    this.enemies.push(e);
    const spawnCol = kind === 'boss' ? this.zone.bossColor : def.color;
    this.burst(e.x, e.y, spawnCol, kind === 'boss' ? 26 : 10, kind === 'boss' ? 320 : 160, 'spark');
    this.part(e.x, e.y, 0, 0, 0.5, e.r, spawnCol, 'ring');
    if (kind === 'boss') {
      this.shake(8);
    }
  }

  /* ----------------------------- combat ------------------------------ */

  private aimAssist(): number {
    const p = this.p!;
    let best: Enemy | null = null;
    let bd = 340 * 340;
    for (const e of this.enemies) {
      if (e.spawn > 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bd) {
        bd = d2;
        best = e;
      }
    }
    if (best) return Math.atan2(best.y - p.y, best.x - p.x);
    return p.facing;
  }

  private updatePlayerMovementHistory() {
    const p = this.p;
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
    this.playerMovementHistory.push({ x: p.x, y: p.y, vx: p.vx, vy: p.vy });
    if (this.playerMovementHistory.length > BOSS_AIM_TUNING.sampleLimit) this.playerMovementHistory.shift();
  }

  private bossAimAngle(e: Enemy, projectileSpeed: number, predictionStrength = BOSS_AIM_TUNING.predictionStrength) {
    const p = this.p;
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return e.faceA;
    const behavior = analyzeMovement(this.playerMovementHistory, e.x, e.y);
    const target = predictedAim(
      e.x, e.y, p.x, p.y, behavior, projectileSpeed,
      BOSS_AIM_TUNING.reactionDelay,
      BOSS_AIM_TUNING.maxPredictionHorizon,
      predictionStrength,
    );
    const next = turnToward(e.faceA, target, BOSS_AIM_TUNING.turnRate * 0.033);
    return Number.isFinite(next) ? next : Math.atan2(p.y - e.y, p.x - e.x);
  }

  private bossAttackAngle(e: Enemy, projectileSpeed: number, predictionStrength = BOSS_AIM_TUNING.predictionStrength) {
    const aim = this.bossAimAngle(e, projectileSpeed, predictionStrength);
    return aim + rand(-BOSS_AIM_TUNING.aimError, BOSS_AIM_TUNING.aimError);
  }

  private startSwing() {
    const p = this.p!;
    const cls = this.classDef;
    p.atkT = cls.atkCd * p.attackRate * (p.buffT > 0 ? 0.85 : 1);
    p.swingT = 0;
    p.swingDur = 0.16;
    p.swingAim = p.aim;
    p.swingApplied = false;
    p.facing = p.aim;
    this.slashes.push({
      x: p.x, y: p.y,
      a0: p.aim - cls.arc * 0.62, a1: p.aim + cls.arc * 0.62,
      r: (cls.range + p.rangeBonus) * 0.88, t: 0, dur: 0.18, color: cls.color,
    });
    this.sfx.playWeapon(cls.id);
    this.performArchetypeAttack();
  }

  private performArchetypeAttack() {
    const p = this.p!;
    const cls = this.classDef;
    const dmgBase = cls.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1);

    // Kensei: Crescent blade projectile
    if (cls.id === 'kensei' && (p.rangeTier >= 3 || p.hasEvoCrescent || p.hasEvoRainCutter)) {
      const fanCount = p.hasEvoRainCutter ? 3 : p.rangeTier >= 4 ? 3 : 1;
      const pierceCount = (p.hasPiercingEdge ? 4 : 2);
      for (let i = 0; i < fanCount; i++) {
        const spread = fanCount === 1 ? 0 : (i - 1) * 0.22;
        const a = p.aim + spread;
        this.shots.push({
          x: p.x + Math.cos(a) * 26,
          y: p.y + Math.sin(a) * 26,
          vx: Math.cos(a) * 440,
          vy: Math.sin(a) * 440,
          r: 9,
          dmg: dmgBase * 0.95,
          life: 1.2 + p.rangeTier * 0.15,
          color: '#ff8a8a',
          from: 'p',
          pierce: pierceCount,
          kind: 'crescent',
        });
      }
      this.part(p.x, p.y, 0, 0, 0.45, 30, '#ffb7c9', 'ring');
    }

    // Shieldthane: Linear/shockwave frost wave
    if (cls.id === 'shieldthane' && (p.rangeTier >= 2 || p.hasEvoFrostWave || p.hasEvoGlacierMaster)) {
      const a = p.aim;
      const returning = p.rangeTier >= 4;
      this.shots.push({
        x: p.x + Math.cos(a) * 24,
        y: p.y + Math.sin(a) * 24,
        vx: Math.cos(a) * 360,
        vy: Math.sin(a) * 360,
        r: p.hasEvoGlacierMaster ? 22 : 14,
        dmg: dmgBase * 1.1,
        life: 0.9 + p.rangeTier * 0.1,
        color: '#cfe6ff',
        from: 'p',
        pierce: 99,
        kind: 'normal',
        returning,
        maxLife: 0.9 + p.rangeTier * 0.1,
        startX: p.x,
        startY: p.y,
      });
      this.part(p.x, p.y, 0, 0, 0.5, 45, '#9be8ff', 'ring');
    }

    // Jaguar: Solar spears
    if (cls.id === 'jaguar' && (p.rangeTier >= 3 || p.hasEvoJaguarSpears || p.hasEvoFifthSunBorn)) {
      const count = p.hasEvoFifthSunBorn ? 4 : (p.rangeTier >= 4 ? 3 : 1);
      for (let i = 0; i < count; i++) {
        const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 0.2;
        const a = p.aim + spread;
        this.shots.push({
          x: p.x + Math.cos(a) * 24,
          y: p.y + Math.sin(a) * 24,
          vx: Math.cos(a) * 480,
          vy: Math.sin(a) * 480,
          r: 8,
          dmg: dmgBase * 0.85,
          life: 1.1 + p.rangeTier * 0.1,
          color: '#ffd24a',
          from: 'p',
          pierce: 2,
          kind: 'solar',
        });
      }
    }

    // Sandseer: Returning Glass Sand-Chakram
    if (cls.id === 'sandseer') {
      const chakramCount = p.hasEvoSandDuneLord ? 3 : (p.rangeTier >= 3 ? 2 : 1);
      const splitOnExp = p.hasEvoSandSplit || p.hasEvoSandDuneLord;
      for (let i = 0; i < chakramCount; i++) {
        const spread = chakramCount === 1 ? 0 : (i - (chakramCount - 1) / 2) * 0.28;
        const a = p.aim + spread;
        this.shots.push({
          x: p.x + Math.cos(a) * 22,
          y: p.y + Math.sin(a) * 22,
          vx: Math.cos(a) * 420,
          vy: Math.sin(a) * 420,
          r: 11 + p.rangeTier * 1.5,
          dmg: dmgBase * 1.05,
          life: 1.25 + p.rangeTier * 0.15,
          color: '#54c9b4',
          from: 'p',
          pierce: 99,
          kind: 'chakram',
          returning: true,
          maxLife: 1.25 + p.rangeTier * 0.15,
          startX: p.x,
          startY: p.y,
          splitOnExpire: splitOnExp,
        });
      }
      this.sfx.play('mirage');
    }

    // Tidecaller: Piercing and returning Coral Trident
    if (cls.id === 'tidecaller') {
      const spearCount = p.hasEvoTideOceanMonarch ? 3 : (p.rangeTier >= 3 ? 2 : 1);
      const returnTrident = p.hasEvoTideBoomerang || p.rangeTier >= 2;
      for (let i = 0; i < spearCount; i++) {
        const spread = spearCount === 1 ? 0 : (i - (spearCount - 1) / 2) * 0.24;
        const a = p.aim + spread;
        this.shots.push({
          x: p.x + Math.cos(a) * 26,
          y: p.y + Math.sin(a) * 26,
          vx: Math.cos(a) * 460,
          vy: Math.sin(a) * 460,
          r: 12 + p.rangeTier * 1.5,
          dmg: dmgBase * 1.15,
          life: 1.2 + p.rangeTier * 0.12,
          color: '#55d9e8',
          from: 'p',
          pierce: 99,
          kind: 'trident',
          returning: returnTrident,
          maxLife: 1.2 + p.rangeTier * 0.12,
          startX: p.x,
          startY: p.y,
          pullsEnemies: true,
        });
      }
    }

    // Riftblade: Void rift echoes and warp cuts
    if (cls.id === 'riftblade') {
      if (p.hasEvoRiftEchoes || p.rangeTier >= 2) {
        // Spawn delayed dimensional slice
        const a = p.aim;
        const rx = p.x + Math.cos(a) * (cls.range + p.rangeBonus) * 0.5;
        const ry = p.y + Math.sin(a) * (cls.range + p.rangeBonus) * 0.5;
        this.part(rx, ry, 0, 0, 0.4, 28, '#b68cff', 'ring');
        setTimeout(() => {
          if (!this.p || this.p.dead) return;
          this.part(rx, ry, 0, 0, 0.45, 40, '#e8d8ff', 'ring');
          this.burst(rx, ry, '#b68cff', 10, 200, 'shard');
          for (const e of this.enemies) {
            if (e.dead || e.spawn > 0) continue;
            if (Math.hypot(e.x - rx, e.y - ry) < 65 + e.r) {
              const echoDmg = dmgBase * 0.7 * (p.hasEvoRiftStasisDoubler && p.stasisT > 0 ? 2.5 : 1);
              this.damageEnemy(e, echoDmg, Math.cos(a), Math.sin(a), Math.random() < this.critChance(), 180);
            }
          }
        }, 220);
      }
      if (p.rangeTier >= 3) {
        // Blink strike: nudge player slightly forward through targets
        p.x = clamp(p.x + Math.cos(p.aim) * 35, 30, ARENA_W - 30);
        p.y = clamp(p.y + Math.sin(p.aim) * 35, 30, ARENA_H - 30);
      }
    }

    // Stormwarden: Lightning arcs
    if (cls.id === 'stormwarden' && (p.hasEvoStormChainBolt || p.rangeTier >= 3)) {
      const count = p.hasEvoStormFirstStormLord ? 6 : 4;
      const targets = this.enemies
        .filter((e) => !e.dead && e.spawn <= 0)
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
        .slice(0, count);
      let lx = p.x;
      let ly = p.y;
      targets.forEach((e) => {
        const dx = e.x - lx;
        const dy = e.y - ly;
        const d = Math.hypot(dx, dy) || 1;
        this.burst(e.x, e.y, '#6ef3ff', 6, 200, 'spark');
        this.damageEnemy(e, dmgBase * 0.65, dx / d, dy / d, Math.random() < this.critChance(), 150);
        lx = e.x;
        ly = e.y;
      });
      if (targets.length) this.sfx.play('tempest');
    }

    // Drakewarden: Piercing Dragonfire waves
    if (cls.id === 'drakewarden' && (p.rangeTier >= 2 || p.hasEvoDrakeFireWave || p.hasEvoDrakeFirstFlameAvatar)) {
      const waveCount = p.hasEvoDrakeFirstFlameAvatar ? 3 : (p.rangeTier >= 4 ? 2 : 1);
      for (let i = 0; i < waveCount; i++) {
        const spread = waveCount === 1 ? 0 : (i - (waveCount - 1) / 2) * 0.22;
        const a = p.aim + spread;
        this.shots.push({
          x: p.x + Math.cos(a) * 26,
          y: p.y + Math.sin(a) * 26,
          vx: Math.cos(a) * 440,
          vy: Math.sin(a) * 440,
          r: 13 + p.rangeTier * 1.5,
          dmg: dmgBase * 1.0,
          life: 1.1 + p.rangeTier * 0.1,
          color: '#ff5a3c',
          from: 'p',
          pierce: 99,
          kind: 'firewave',
        });
      }
      this.sfx.play('pyre');
    }

    // Echo Slash mechanical power
    if (p.hasEchoSlash) {
      setTimeout(() => {
        if (!this.p || this.p.dead) return;
        this.slashes.push({
          x: p.x, y: p.y,
          a0: p.aim - cls.arc * 0.5, a1: p.aim + cls.arc * 0.5,
          r: (cls.range + p.rangeBonus) * 0.8, t: 0, dur: 0.15, color: '#d7adff',
        });
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < cls.range + p.rangeBonus + e.r) {
            this.damageEnemy(e, dmgBase * 0.5, (e.x - p.x) / d, (e.y - p.y) / d, false, 150);
          }
        }
      }, 220);
    }
  }

  private applySwing() {
    const p = this.p!;
    const cls = this.classDef;
    let hitAny = false;
    for (const e of this.enemies) {
      if (e.dead || e.spawn > 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d > cls.range + p.rangeBonus + e.r) continue;
      if (angDiff(Math.atan2(dy, dx), p.swingAim) > cls.arc / 2 + 0.18) continue;
      let crit = Math.random() < this.critChance();
      if (p.sureCrits > 0) {
        crit = true;
        p.sureCrits--;
      }
      let dmg = cls.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1) * (p.riteT > 0 ? 1.45 : 1) * rand(0.92, 1.08);
      if (crit) dmg *= 2;
      const heavy = e.kind === 'brute' || e.kind === 'boss' || e.kind === 'golem' || e.kind === 'demon' || e.kind === 'dragon' ? 0.3 : 1;
      this.damageEnemy(e, dmg, dx / (d || 1), dy / (d || 1), crit, (crit ? 420 : 240) * heavy);
      hitAny = true;
    }
    if (hitAny) this.hitstop = Math.max(this.hitstop, 0.025);
  }

  private damageEnemy(e: Enemy, dmg: number, nx: number, ny: number, crit: boolean, knock: number) {
    if (e.dead || e.spawn > 0) return;
    if (this.p && this.p.stasisT > 0) this.stasisHits.push({ e, dmg });
    e.hp -= dmg;
    e.flash = 1;
    e.vx += nx * knock;
    e.vy += ny * knock;
    const def = ENEMIES[e.kind];
    this.burst(e.x, e.y, def.color, crit ? 14 : 7, crit ? 300 : 200, crit ? 'spark' : 'dot');
    this.floater(e.x, e.y - e.r - 6, `${Math.round(dmg)}`, crit ? 22 : 14, crit ? '#ffd97a' : '#f5efdd', crit);
    // Mechanical powers on hit
    const p = this.p;
    if (p) {
      // Impact Shockwave
      if (p.hasImpactShockwave) {
        this.part(e.x, e.y, 0, 0, 0.35, 30, '#ffd28a', 'ring');
        for (const other of this.enemies) {
          if (other !== e && !other.dead && other.spawn <= 0) {
            const od = Math.hypot(other.x - e.x, other.y - e.y);
            if (od < 90 + other.r) {
              other.hp -= dmg * 0.6;
              other.flash = 0.6;
              if (other.hp <= 0) this.killEnemy(other, dmg * 0.6);
            }
          }
        }
      }

      // Tesla Conductor Chain
      if (p.hasChainArc) {
        const chainFoes = this.enemies
          .filter((f) => f !== e && !f.dead && f.spawn <= 0 && Math.hypot(f.x - e.x, f.y - e.y) < 220)
          .slice(0, 3);
        let tx = e.x;
        let ty = e.y;
        for (const cf of chainFoes) {
          for (let s = 0; s <= 4; s++) {
            const prog = s / 4;
            this.part(tx + (cf.x - tx) * prog + rand(-8, 8), ty + (cf.y - ty) * prog + rand(-8, 8), 0, 0, 0.2, 2.5, '#6ef3ff', 'spark');
          }
          cf.hp -= dmg * 0.45;
          cf.flash = 0.5;
          if (cf.hp <= 0) this.killEnemy(cf, dmg * 0.45);
          tx = cf.x;
          ty = cf.y;
        }
      }

      // Kensei Petal Storm evolution on crit
      if (crit && p.hasEvoPetalStorm && this.classDef.id === 'kensei') {
        for (let i = 0; i < 6; i++) {
          const pa = rand(0, TAU);
          this.part(e.x, e.y, Math.cos(pa) * 260, Math.sin(pa) * 260, 0.5, 4.5, '#ffb7c9', 'petal');
          this.shots.push({
            x: e.x, y: e.y,
            vx: Math.cos(pa) * 340, vy: Math.sin(pa) * 340,
            r: 6, dmg: dmg * 0.5, life: 0.8, color: '#ffb7c9', from: 'p', pierce: 1,
          });
        }
      }

      // Drakewarden Pyre Burst evolution on crit
      if (crit && p.hasEvoDrakePyreBurst && this.classDef.id === 'drakewarden') {
        this.part(e.x, e.y, 0, 0, 0.6, 50, '#ff5a3c', 'ring');
        this.burst(e.x, e.y, '#ffc46b', 16, 260, 'dot');
        for (const other of this.enemies) {
          if (other !== e && !other.dead && other.spawn <= 0) {
            if (Math.hypot(other.x - e.x, other.y - e.y) < 100 + other.r) {
              other.hp -= dmg * 0.75;
              other.flash = 0.8;
              if (other.hp <= 0) this.killEnemy(other, dmg * 0.75);
            }
          }
        }
      }

      // Frenzy Momentum attack speed stacking
      if (p.speedTier > 0) {
        p.frenzyStacks = Math.min(10, p.frenzyStacks + 1);
        p.frenzyT = 4.0;
      }
    }

    if (crit) {
      this.sfx.play('crit');
      this.shake(5);
      this.hitstop = Math.max(this.hitstop, 0.055);
    } else {
      this.sfx.play('hit');
      this.shake(2.2);
      this.hitstop = Math.max(this.hitstop, 0.03);
    }
    if (e.hp <= 0) this.killEnemy(e, dmg);
  }

  private killEnemy(e: Enemy, _lastHit: number) {
    e.dead = true;
    const p = this.p!;
    const def = ENEMIES[e.kind];
    this.kills++;
    p.combo++;
    p.comboT = 2.6;
    for (const [n, label] of STREAKS) {
      if (p.combo === n) {
        this.floater(p.x, p.y - 70, label, 26, '#ffd97a', true);
        this.sfx.play('streak');
        this.pushFeed(`${label} — ${p.combo}-kill chain`, '#e2b45c');
      }
    }
    const mult = 1 + Math.min(p.combo, 25) * 0.08;
    const gained = Math.round(def.score * mult * (e.elite ? 3 : 1));
    this.score += gained;
    this.floater(e.x, e.y - e.r - 24, `+${gained}`, 13, '#e2b45c');

    // Terminal Detonation mechanical power
    if (p.hasTerminalBlast) {
      this.part(e.x, e.y, 0, 0, 0.45, 55, '#ff6b4a', 'ring');
      this.burst(e.x, e.y, '#ffd24a', 14, 280, 'spark');
      const blastDmg = this.classDef.dmg * p.dmgMul * 0.7;
      for (const other of this.enemies) {
        if (other !== e && !other.dead && other.spawn <= 0) {
          if (Math.hypot(other.x - e.x, other.y - e.y) < 110 + other.r) {
            other.hp -= blastDmg;
            other.flash = 0.7;
            if (other.hp <= 0) this.killEnemy(other, blastDmg);
          }
        }
      }
    }

    const steal = p.lifesteal + (p.riteT > 0 ? 4 : 0);
    if (steal > 0 && p.hp < p.maxHp) {
      const healed = Math.min(steal, Math.ceil(p.maxHp - p.hp));
      p.hp += healed;
      if (this.kills % 3 === 0 || p.riteT > 0) this.floater(p.x, p.y - 28, `+${healed}`, 12, p.riteT > 0 ? '#ffd24a' : '#9defa4');
    }
    this.gainXp(xpWithBonus(def.xp * (e.elite ? 2 : 1), p.xpMult));
    this.burst(e.x, e.y, def.color, e.kind === 'boss' ? 46 : 16, e.kind === 'boss' ? 460 : 280, 'dot');
    this.burst(e.x, e.y, '#ffffff', 6, 240, 'spark');
    this.part(e.x, e.y, 0, 0, 0.45, e.r * 1.4, def.color, 'ring');
    this.sfx.play('kill');
    this.shake(e.kind === 'boss' ? 14 : 3.5);
    if (e.elite) this.pushFeed(`You slew ${e.name} (+${gained} score)`, '#ffd97a');
    // drops
    const coinChance = e.kind === 'boss' ? 1 : 0.8;
    if (Math.random() < coinChance) {
      const nCoins = e.kind === 'boss' ? 8 : e.elite ? 3 : 1;
      for (let i = 0; i < nCoins; i++) {
        this.pickups.push({
          x: e.x + rand(-14, 14), y: e.y + rand(-14, 14),
          vx: rand(-90, 90), vy: rand(-90, 90),
          kind: 'coin', val: e.kind === 'boss' ? 8 : rand(2, 4) | 0, t: rand(0, TAU),
        });
      }
    }
    if (e.kind !== 'boss' && Math.random() < 0.08 && p.hp < p.maxHp * 0.75) {
      this.pickups.push({ x: e.x, y: e.y, vx: 0, vy: 0, kind: 'potion', val: 30, t: 0 });
    }
    if (Math.random() < (e.kind === 'boss' ? 1 : 0.05)) {
      this.pickups.push({ x: e.x, y: e.y, vx: 0, vy: 0, kind: 'rune', val: 0, t: 0 });
    }
    if (e.kind === 'boss') {
      this.slowmoT = 0.55;
      this.powerRerolls = 3;
      this.shopRerolls = 3;
      this.pushFeed(`${this.zone.boss} has fallen! The realm breathes easier.`, '#46c8a8');
      this.pushFeed('The fates smile: power and market rerolls restored to 3 each.', '#d7adff');
      this.floater(p.x, p.y - 70, 'REROLLS RESTORED', 16, '#d7adff', true);
    }
  }

  private gainXp(amount: number) {
    const p = this.p!;
    if (p.level >= MAX_PLAYER_LEVEL) {
      p.xp = 0;
      this.pendingLevels = 0;
      return;
    }
    p.xp += amount;
    while (p.level < MAX_PLAYER_LEVEL && p.xp >= this.xpNeed(p.level)) {
      p.xp -= this.xpNeed(p.level);
      p.level++;
      p.maxHp += 10;
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.22);
      this.pendingLevels++;
      this.sfx.play('levelup');
      this.shake(6);
      this.floater(p.x, p.y - 46, `LEVEL UP!  Lv ${p.level}`, 22, '#ffd97a', true);
      this.part(p.x, p.y, 0, 0, 0.6, 30, '#ffd97a', 'ring');
      this.part(p.x, p.y, 0, 0, 0.8, 50, '#ffffff', 'ring');
      this.burst(p.x, p.y, '#ffd97a', 22, 260, 'spark');
      this.pushFeed(`You reached Lv ${p.level}! Choose a new power.`, '#46c8a8');
    }
    if (p.level >= MAX_PLAYER_LEVEL) p.xp = 0;
    if (this.pendingLevels > 0 && this.state === 'playing') this.openLevelUp();
  }

  private damagePlayer(dmg: number, src: Enemy) {
    const p = this.p!;
    if (p.dead || p.iFrames > 0) return;
    dmg *= 1 - p.armor;
    if (p.wardT > 0) {
      dmg *= 0.3;
      // Oathwall: strike back and hurl the attacker away
      if (src && typeof src.hp === 'number' && !src.dead) {
        const dx = src.x - p.x;
        const dy = src.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        this.damageEnemy(src, this.classDef.dmg * p.dmgMul * 0.9, dx / d, dy / d, false, 520);
        this.burst(p.x + (dx / d) * 20, p.y + (dy / d) * 20, '#bfe6ff', 8, 220, 'shard');
      }
    }
    p.hp -= dmg;
    p.hurtT = 0.35;
    this.hurtFlash = 1;
    p.iFrames = 0.55;
    p.combo = 0;
    const dx = p.x - src.x;
    const dy = p.y - src.y;
    const d = Math.hypot(dx, dy) || 1;
    p.vx += (dx / d) * 380;
    p.vy += (dy / d) * 380;
    this.floater(p.x, p.y - 30, `-${Math.round(dmg)}`, 18, '#ff6b6b');
    this.burst(p.x, p.y, '#ff6b6b', 10, 260);
    this.sfx.play('hurt');
    this.shake(9);
    this.hitstop = Math.max(this.hitstop, 0.05);
    if (p.hp <= 0) {
      p.hp = 0;
      p.dead = true;
      this.killer = src.elite || src.kind === 'boss' ? src.name : ENEMIES[src.kind].name;
      this.state = 'dying';
      this.dieT = 1.15;
      this.music.duck(true);
      this.sfx.play('death');
      this.shake(16);
      this.burst(p.x, p.y, this.classDef.color, 40, 420, 'dot');
      this.burst(p.x, p.y, '#ffffff', 16, 380, 'spark');
      this.part(p.x, p.y, 0, 0, 0.9, 40, this.classDef.color, 'ring');
      this.opts.onState('dying');
    }
  }

  private tryDash() {
    const p = this.p!;
    if (p.dashCd > 0 || p.dashT > 0 || p.dead) return;
    let mx = 0;
    let my = 0;
    const mv = this.moveVec();
    mx = mv[0];
    my = mv[1];
    if (mx === 0 && my === 0) {
      mx = Math.cos(p.facing);
      my = Math.sin(p.facing);
    }
    const d = Math.hypot(mx, my) || 1;
    p.dashX = mx / d;
    p.dashY = my / d;
    p.dashT = 0.22;
    p.dashCd = 1.6 * p.dashRate;
    p.iFrames = Math.max(p.iFrames, 0.3);
    this.sfx.play('dash');
    this.shake(2);
    this.burst(p.x, p.y, this.classDef.color2, 8, 180, 'spark');
  }

  private tryAbility() {
    const p = this.p!;
    const cls = this.classDef;
    if (p.abilityCd > 0 || p.dead) return;
    p.abilityCd = cls.abilityCd * p.abilityRate;
    const dmgBase = cls.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1);
    switch (cls.abilityKind) {
      case 'petals': {
        this.sfx.play('petals');
        this.shake(6);
        this.part(p.x, p.y, 0, 0, 0.5, 40, cls.color, 'ring');
        for (let i = 0; i < 26; i++) {
          const a = rand(0, TAU);
          this.part(p.x, p.y, Math.cos(a) * rand(120, 320), Math.sin(a) * rand(120, 320), rand(0.5, 0.9), rand(3, 6), '#ffb7c9', 'petal', 60, 0.94);
        }
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 155 + e.r) {
            const crit = Math.random() < this.critChance();
            this.damageEnemy(e, dmgBase * 1.6 * (crit ? 2 : 1), (e.x - p.x) / (d || 1), (e.y - p.y) / (d || 1), crit, 360);
          }
        }
        break;
      }
      case 'nova': {
        this.sfx.play('nova');
        this.shake(9);
        this.part(p.x, p.y, 0, 0, 0.6, 60, '#bfe6ff', 'ring');
        this.part(p.x, p.y, 0, 0, 0.8, 90, '#6fb7ff', 'ring');
        this.burst(p.x, p.y, '#bfe6ff', 30, 380, 'shard');
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 195 + e.r) {
            e.frozen = 2.2;
            const crit = Math.random() < this.critChance();
            this.damageEnemy(e, dmgBase * 1.4 * (crit ? 2 : 1), (e.x - p.x) / (d || 1), (e.y - p.y) / (d || 1), crit, 260);
          }
        }
        break;
      }
      case 'bolts': {
        this.sfx.play('bolts');
        this.shake(4);
        for (let i = 0; i < 10; i++) {
          const a = p.facing + (i / 10) * TAU;
          this.shots.push({
            x: p.x + Math.cos(a) * 24, y: p.y + Math.sin(a) * 24,
            vx: Math.cos(a) * 360, vy: Math.sin(a) * 360,
            r: 7, dmg: dmgBase * 0.9, life: 1.5, color: '#ffd24a', from: 'p', pierce: 2,
          });
        }
        this.burst(p.x, p.y, '#ffd24a', 16, 300, 'spark');
        break;
      }
      case 'storm': {
        p.stormT = 4;
        p.stormTick = 0;
        this.sfx.play('storm');
        this.shake(4);
        this.floater(p.x, p.y - 46, cls.abilityName.toUpperCase(), 18, '#e6c26a', true);
        break;
      }
      case 'tide': {
        this.sfx.play('tide');
        this.shake(7);
        this.part(p.x, p.y, 0, 0, 0.7, 64, '#55d9e8', 'ring');
        this.part(p.x, p.y, 0, 0, 0.95, 100, '#d7a6ff', 'ring');
        this.burst(p.x, p.y, '#55d9e8', 28, 310, 'dot');
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const dx = p.x - e.x;
          const dy = p.y - e.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 230 + e.r) {
            e.slow = 1.6;
            e.vx += (dx / d) * 320;
            e.vy += (dy / d) * 320;
            this.damageEnemy(e, dmgBase * 1.55, -dx / d, -dy / d, Math.random() < this.critChance(), 170);
          }
        }
        break;
      }
      case 'tempest': {
        this.sfx.play('tempest');
        this.shake(9);
        // chain lightning: strike nearest foes in sequence
        const targets = this.enemies
          .filter((e) => !e.dead && e.spawn <= 0)
          .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
          .slice(0, 7);
        let lx = p.x;
        let ly = p.y;
        targets.forEach((e, i) => {
          const dmg = dmgBase * (1.9 - i * 0.15);
          const dx = e.x - lx;
          const dy = e.y - ly;
          const d = Math.hypot(dx, dy) || 1;
          // lightning bolt visual
          for (let s = 0; s <= 6; s++) {
            const t = s / 6;
            const jx = rand(-14, 14);
            const jy = rand(-14, 14);
            this.part(lx + dx * t + jx, ly + dy * t + jy, 0, 0, 0.25, 3, '#bff6ff', 'spark');
          }
          this.burst(e.x, e.y, '#6ef3ff', 10, 260, 'spark');
          e.slow = Math.max(e.slow, 1.0);
          this.damageEnemy(e, dmg, dx / d, dy / d, Math.random() < this.critChance(), 200);
          lx = e.x;
          ly = e.y;
        });
        this.part(p.x, p.y, 0, 0, 0.6, 50, '#6ef3ff', 'ring');
        break;
      }
      case 'pyre': {
        this.sfx.play('pyre');
        this.shake(12);
        this.part(p.x, p.y, 0, 0, 0.8, 80, '#ff5a3c', 'ring');
        this.part(p.x, p.y, 0, 0, 1.0, 120, '#ffc46b', 'ring');
        this.burst(p.x, p.y, '#ff5a3c', 36, 420, 'dot');
        this.burst(p.x, p.y, '#ffc46b', 20, 340, 'spark');
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 260 + e.r) {
            e.slow = Math.max(e.slow, 2.0);
            this.damageEnemy(e, dmgBase * 2.2, dx / d, dy / d, Math.random() < this.critChance(), 480);
          }
        }
        break;
      }
      case 'rift': {
        this.sfx.play('rift');
        this.shake(8);
        const ox = p.x;
        const oy = p.y;
        const target = this.enemies
          .filter((e) => !e.dead && e.spawn <= 0)
          .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        const blinkA = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.facing;
        p.x = clamp(p.x + Math.cos(blinkA) * 190, 35, ARENA_W - 35);
        p.y = clamp(p.y + Math.sin(blinkA) * 190, 35, ARENA_H - 35);
        p.iFrames = 0.55;
        this.part(ox, oy, 0, 0, 0.65, 28, '#b68cff', 'ring');
        this.part(p.x, p.y, 0, 0, 0.65, 34, '#e8d8ff', 'ring');
        this.burst(ox, oy, '#b68cff', 18, 280, 'shard');
        this.burst(p.x, p.y, '#e8d8ff', 18, 280, 'spark');
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const dOld = Math.hypot(e.x - ox, e.y - oy);
          const dNew = Math.hypot(e.x - p.x, e.y - p.y);
          if (dOld < 72 + e.r || dNew < 72 + e.r) {
            const dx = e.x - p.x;
            const dy = e.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            this.damageEnemy(e, dmgBase * 1.8, dx / d, dy / d, Math.random() < this.critChance(), 260);
          }
        }
        break;
      }
    }
  }

  /* --------------------------- legacy abilities ---------------------------- */

  private tryLegacy() {
    const p = this.p!;
    const cls = this.classDef;
    if (p.legacyCd > 0 || p.dead) return;
    const L = this.legacy;
    p.legacyCd = L.cd * p.abilityRate;
    const dmgBase = cls.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1);
    this.floater(p.x, p.y - 52, L.name.toUpperCase(), 19, cls.color2, true);
    switch (L.kind) {
      case 'stillwater': {
        p.focusT = 3.5;
        p.sureCrits = 4;
        this.sfx.play('stillwater');
        this.slowmoT = Math.max(this.slowmoT, 0.25);
        this.part(p.x, p.y, 0, 0, 0.9, 60, '#ffffff', 'ring');
        for (let i = 0; i < 20; i++) {
          const a = rand(0, TAU);
          this.part(p.x + Math.cos(a) * 30, p.y + Math.sin(a) * 30, Math.cos(a) * 40, Math.sin(a) * 40 - 60, rand(0.8, 1.4), rand(2, 4), '#dff4ff', 'dot', 40, 0.98);
        }
        this.pushFeed('Still Water: the world slows around your blade.', cls.color);
        break;
      }
      case 'oathwall': {
        p.wardT = 4.5;
        p.wardTick = 0;
        this.sfx.play('oathwall');
        this.shake(5);
        this.part(p.x, p.y, 0, 0, 0.7, 34, '#bfe6ff', 'ring');
        this.burst(p.x, p.y, '#dbeeff', 14, 200, 'shard');
        this.pushFeed('Oathwall raised: the wall does not break.', cls.color);
        break;
      }
      case 'bloodrite': {
        const cost = Math.max(1, Math.floor(p.hp * 0.15));
        if (p.hp - cost < 1) {
          p.legacyCd = 0.8;
          this.floater(p.x, p.y - 30, 'TOO WEAK TO BLEED', 13, '#ff8a8a');
          return;
        }
        p.hp -= cost;
        p.riteT = 6;
        this.sfx.play('bloodrite');
        this.shake(6);
        this.floater(p.x, p.y - 30, `-${cost}`, 15, '#ff6b6b');
        this.burst(p.x, p.y, '#ff4d4d', 18, 240, 'dot');
        this.part(p.x, p.y, 0, 0, 0.8, 40, '#ffd24a', 'ring');
        this.pushFeed('Blood Rite: the sun repays blood with radiance.', cls.color);
        break;
      }
      case 'mirage': {
        this.decoy = { x: p.x, y: p.y, t: 0, dur: 4 };
        this.sfx.play('mirage');
        this.burst(p.x, p.y, '#e6c26a', 22, 160, 'dot');
        p.iFrames = Math.max(p.iFrames, 0.4);
        this.pushFeed('Mirage Step: they hunt footprints you never left.', cls.color);
        break;
      }
      case 'pearltide': {
        p.tideT = 3;
        this.sfx.play('pearltide');
        this.shake(5);
        this.part(p.x, p.y, 0, 0, 0.8, 70, '#55d9e8', 'ring');
        this.part(p.x, p.y, 0, 0, 1.0, 110, '#d7a6ff', 'ring');
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 240 + e.r) {
            e.slow = 2;
            e.vx += (dx / d) * 520;
            e.vy += (dy / d) * 520;
            this.damageEnemy(e, dmgBase * 0.6, dx / d, dy / d, false, 80);
          }
        }
        this.pushFeed('Pearl Tide: the sea takes back your wounds.', cls.color);
        break;
      }
      case 'stasis': {
        p.stasisT = 2;
        this.stasisHits = [];
        this.sfx.play('stasis');
        this.slowmoT = 0;
        this.part(p.x, p.y, 0, 0, 1.2, 80, '#b68cff', 'ring');
        this.burst(p.x, p.y, '#e8d8ff', 24, 300, 'shard');
        this.pushFeed('Heartbeat Stasis: the world pauses politely.', cls.color);
        break;
      }
      case 'stormcall': {
        p.tempestT = 6;
        p.tempestTick = 0;
        this.sfx.play('stormcall');
        this.shake(6);
        this.part(p.x, p.y, 0, 0, 0.9, 60, '#6ef3ff', 'ring');
        this.burst(p.x, p.y, '#fff6a8', 22, 300, 'spark');
        this.pushFeed('Stormcall: you ARE the storm now.', cls.color);
        break;
      }
      case 'pyreheart': {
        p.pyreT = 6;
        p.pyreTick = 0;
        this.sfx.play('pyreheart');
        this.shake(8);
        this.part(p.x, p.y, 0, 0, 0.9, 70, '#ff5a3c', 'ring');
        this.burst(p.x, p.y, '#ffc46b', 24, 320, 'dot');
        this.pushFeed('Pyreheart ignited: burn them, mend yourself.', cls.color);
        break;
      }
    }
  }

  private endStasis() {
    const p = this.p!;
    p.stasisT = 0;
    this.sfx.play('stasisEnd');
    this.shake(10);
    this.hitstop = Math.max(this.hitstop, 0.06);
    const merged = new Map<Enemy, number>();
    for (const h of this.stasisHits) merged.set(h.e, (merged.get(h.e) ?? 0) + h.dmg);
    this.stasisHits = [];
    for (const [e, dmg] of merged) {
      if (e.dead) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      this.part(e.x, e.y, 0, 0, 0.5, e.r * 1.3, '#b68cff', 'ring');
      this.damageEnemy(e, dmg, dx / d, dy / d, false, 200);
    }
  }

  private legacyActiveLabel(): string {
    const p = this.p;
    if (!p) return '';
    if (p.focusT > 0) return `STILL WATER ${p.focusT.toFixed(1)}s · ${p.sureCrits} SURE CRITS`;
    if (p.wardT > 0) return `OATHWALL ${p.wardT.toFixed(1)}s`;
    if (p.riteT > 0) return `BLOOD RITE ${p.riteT.toFixed(1)}s`;
    if (this.decoy) return `MIRAGE ${(this.decoy.dur - this.decoy.t).toFixed(1)}s`;
    if (p.tideT > 0) return `PEARL TIDE ${p.tideT.toFixed(1)}s`;
    if (p.stasisT > 0) return `STASIS ${p.stasisT.toFixed(1)}s`;
    if (p.tempestT > 0) return `STORMCALL ${p.tempestT.toFixed(1)}s`;
    if (p.pyreT > 0) return `PYREHEART ${p.pyreT.toFixed(1)}s`;
    return '';
  }

  private moveVec(): [number, number] {
    let x = 0;
    let y = 0;
    const k = this.keys;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyW') || k.has('ArrowUp')) y -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y += 1;
    if (this.touchMove && (this.tmx !== 0 || this.tmy !== 0)) {
      x = this.tmx;
      y = this.tmy;
    }
    const d = Math.hypot(x, y);
    if (d > 1) {
      x /= d;
      y /= d;
    }
    return [x, y];
  }

  /* ------------------------------ update ----------------------------- */

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const raw = clamp((now - this.last) / 1000 || 0.016, 0.001, 0.033);
    this.last = now;

    let ts = 1;
    if (this.hitstop > 0) {
      this.hitstop -= raw;
      ts = 0.08;
    } else if (this.state === 'dying') {
      ts = 0.3;
      this.dieT -= raw;
      if (this.dieT <= 0) {
        this.state = 'over';
        this.opts.onState('over', this.getStats());
      }
    } else if (this.slowmoT > 0) {
      this.slowmoT -= raw;
      ts = 0.35;
    }
    const dt = raw * ts;
    this.time += dt;
    this.cam.shake = Math.max(0, this.cam.shake - this.cam.shake * 7 * raw - 2 * raw);

    if (this.state === 'menu') {
      this.menuT += raw;
      this.updateMenuParts(raw);
      this.updateFx(dt);
      this.render();
      return;
    }

    if (this.state === 'playing') {
      this.update(dt, raw);
    } else if (this.state === 'dying' || this.state === 'over') {
      this.updateWorld(dt, false);
    }
    this.updateFx(dt);
    this.render();
    this.pushHud();
  };

  private update(dt: number, raw: number) {
    const p = this.p!;
    this.elapsed += dt;

    // timers
    p.atkT -= dt;
    p.dashCd -= dt;
    p.abilityCd -= dt;
    p.iFrames -= dt;
    p.buffT -= dt;
    p.hurtT -= dt;
    p.slowT -= dt;
    p.comboT -= dt;
    if (p.comboT <= 0) p.combo = 0;

    // legacy timers
    p.legacyCd -= dt;
    if (p.focusT > 0) {
      p.focusT -= dt;
      if (p.focusT <= 0) p.sureCrits = 0;
      if (Math.random() < 0.25) {
        const a = rand(0, TAU);
        this.part(p.x + Math.cos(a) * rand(20, 60), p.y + Math.sin(a) * rand(20, 60), 0, -30, 0.8, rand(1.5, 3), '#dff4ff', 'dot', -20, 0.99);
      }
    }
    if (p.wardT > 0) {
      p.wardT -= dt;
      p.wardTick -= dt;
      if (p.wardTick <= 0) {
        p.wardTick = 1;
        if (p.hp < p.maxHp) {
          p.hp = Math.min(p.maxHp, p.hp + 3);
          this.floater(p.x, p.y - 30, '+3', 12, '#bfe6ff');
        }
      }
    }
    if (p.riteT > 0) {
      p.riteT -= dt;
      if (Math.random() < 0.35) this.part(p.x + rand(-10, 10), p.y + rand(-4, 10), rand(-20, 20), rand(-90, -40), 0.6, rand(2, 3.5), Math.random() < 0.5 ? '#ff4d4d' : '#ffd24a', 'dot', 0, 0.97);
    }
    if (p.tideT > 0) {
      p.tideT -= dt;
      const heal = (p.maxHp * 0.24 / 3) * dt;
      p.hp = Math.min(p.maxHp, p.hp + heal);
      if (Math.random() < 0.3) {
        const a = rand(0, TAU);
        this.part(p.x + Math.cos(a) * 24, p.y + Math.sin(a) * 24, Math.cos(a) * 30, Math.sin(a) * 30 - 50, 0.7, rand(2, 3), '#55d9e8', 'dot', 20, 0.98);
      }
    }
    if (p.stasisT > 0) {
      p.stasisT -= dt;
      if (p.stasisT <= 0) this.endStasis();
    }
    if (p.tempestT > 0) {
      p.tempestT -= dt;
      p.tempestTick -= dt;
      if (Math.random() < 0.5) {
        const a = rand(0, TAU);
        this.part(p.x + Math.cos(a) * rand(20, 50), p.y + Math.sin(a) * rand(20, 50), 0, -60, 0.4, rand(2, 3), '#bff6ff', 'spark', 0, 0.98);
      }
      if (p.tempestTick <= 0) {
        p.tempestTick = 0.4;
        const cls = this.classDef;
        const dmgBase = cls.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1);
        const foes = this.enemies.filter((e) => !e.dead && e.spawn <= 0 && Math.hypot(e.x - p.x, e.y - p.y) < 420);
        if (foes.length) {
          const e = foes[Math.floor(Math.random() * foes.length)];
          for (let s = 0; s <= 5; s++) {
            const t = s / 5;
            this.part(p.x + (e.x - p.x) * t + rand(-12, 12), p.y + (e.y - p.y) * t + rand(-12, 12), 0, 0, 0.22, 3, '#bff6ff', 'spark');
          }
          this.burst(e.x, e.y, '#6ef3ff', 8, 240, 'spark');
          this.sfx.play('tempest');
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          this.damageEnemy(e, dmgBase * 1.5, dx / d, dy / d, Math.random() < this.critChance(), 150);
        }
      }
    }
    if (p.pyreT > 0) {
      p.pyreT -= dt;
      p.pyreTick -= dt;
      p.hp = Math.min(p.maxHp, p.hp + (p.maxHp * 0.03) * dt * 2);
      if (Math.random() < 0.5) {
        const a = rand(0, TAU);
        this.part(p.x + Math.cos(a) * rand(10, 30), p.y + Math.sin(a) * rand(10, 30), rand(-20, 20), rand(-80, -40), 0.6, rand(2, 4), Math.random() < 0.5 ? '#ff5a3c' : '#ffc46b', 'dot', 0, 0.97);
      }
      if (p.pyreTick <= 0) {
        p.pyreTick = 0.55;
        const cls = this.classDef;
        const dmgBase = cls.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1);
        this.part(p.x, p.y, 0, 0, 0.5, 60, '#ff5a3c', 'ring');
        this.sfx.play('pyre');
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 170 + e.r) {
            this.damageEnemy(e, dmgBase * 0.9, dx / d, dy / d, false, 220);
          }
        }
      }
    }
    if (this.decoy) {
      this.decoy.t += dt;
      if (Math.random() < 0.4) {
        const a = rand(0, TAU);
        this.part(this.decoy.x + Math.cos(a) * 18, this.decoy.y + Math.sin(a) * 18, Math.cos(a) * 25, Math.sin(a) * 25 - 20, 0.6, rand(1.5, 3), '#e6c26a', 'dot', 30, 0.97);
      }
      if (this.decoy.t >= this.decoy.dur) {
        const d0 = this.decoy;
        this.decoy = null;
        this.sfx.play('storm');
        this.shake(7);
        this.part(d0.x, d0.y, 0, 0, 0.6, 50, '#e6c26a', 'ring');
        this.burst(d0.x, d0.y, '#e6c26a', 30, 340, 'dot');
        const dmgBase = this.classDef.dmg * p.dmgMul * (p.buffT > 0 ? 1.5 : 1);
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const dx = e.x - d0.x;
          const dy = e.y - d0.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 150 + e.r) {
            e.slow = 1.2;
            this.damageEnemy(e, dmgBase * 2.0, dx / d, dy / d, Math.random() < this.critChance(), 320);
          }
        }
      }
    }
    if (this.legacyQueued) {
      this.legacyQueued = false;
      this.tryLegacy();
    }

    // movement
    const mv = this.moveVec();
    const speedMul = (p.riteT > 0 ? 1.25 : 1) * (p.tempestT > 0 ? 1.3 : 1) * (p.slowT > 0 ? 0.6 : 1);
    if (p.dashT > 0) {
      p.dashT -= dt;
      p.vx = p.dashX * 760;
      p.vy = p.dashY * 760;
      this.ghosts.push({ x: p.x, y: p.y, a: 0.5 });
      if (this.ghosts.length > 14) this.ghosts.shift();
    } else {
      const k = 1 - Math.pow(0.0001, dt);
      p.vx += (mv[0] * p.speed * speedMul - p.vx) * k;
      p.vy += (mv[1] * p.speed * speedMul - p.vy) * k;
    }
    p.x = clamp(p.x + p.vx * dt, 26, ARENA_W - 26);
    p.y = clamp(p.y + p.vy * dt, 26, ARENA_H - 26);
    this.updatePlayerMovementHistory();
    if (mv[0] !== 0 || mv[1] !== 0) {
      p.facing = Math.atan2(mv[1], mv[0]);
      p.runT += dt * (Math.hypot(p.vx, p.vy) / p.speed);
    }
    p.aim = this.aimAssist();

    // actions
    if (this.dashQueued) {
      this.dashQueued = false;
      this.tryDash();
    }
    if (this.abilityQueued) {
      this.abilityQueued = false;
      this.tryAbility();
    }
    if ((this.attackHeld) && p.atkT <= 0 && p.dashT <= 0) {
      this.startSwing();
    }

    // swing progression
    if (p.swingT >= 0) {
      p.swingT += dt;
      const prog = p.swingT / p.swingDur;
      if (prog >= 0.35 && !p.swingApplied) {
        p.swingApplied = true;
        this.applySwing();
      }
      if (prog >= 1) p.swingT = -1;
    }

    // sandseer storm
    if (p.stormT > 0) {
      p.stormT -= dt;
      p.stormTick -= dt;
      const cls = this.classDef;
      if (Math.random() < 0.5) {
        const a = rand(0, TAU);
        this.part(p.x + Math.cos(a) * rand(40, 165), p.y + Math.sin(a) * rand(40, 165), Math.cos(a + 1.6) * 120, Math.sin(a + 1.6) * 120, 0.4, rand(2, 4), '#e6c26a', 'dot', 0, 0.96);
      }
      if (p.stormTick <= 0) {
        p.stormTick = 0.28;
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 168 + e.r) {
            e.slow = 0.6;
            this.damageEnemy(e, cls.dmg * p.dmgMul * 0.55, (e.x - p.x) / (d || 1), (e.y - p.y) / (d || 1), false, 60);
          }
        }
      }
    }

    this.updateWorld(dt, true);
    if (this.state !== 'playing') return;

    // camera
    const tx = p.x + Math.cos(p.aim) * 50;
    const ty = p.y + Math.sin(p.aim) * 50;
    this.cam.x += (tx - this.cam.x) * Math.min(1, dt * 5);
    this.cam.y += (ty - this.cam.y) * Math.min(1, dt * 5);
    const halfW = this.viewW / 2 / this.zoom;
    const halfH = this.viewH / 2 / this.zoom;
    this.cam.x = halfW * 2 >= ARENA_W ? ARENA_W / 2 : clamp(this.cam.x, halfW, ARENA_W - halfW);
    this.cam.y = halfH * 2 >= ARENA_H ? ARENA_H / 2 : clamp(this.cam.y, halfH, ARENA_H - halfH);

    // wave flow
    if (this.waveBreak > 0) {
      this.waveBreak -= dt;
      if (this.waveBreak <= 0 && this.wave < FINAL_WAVE) this.startWave(this.wave + 1);
    } else if (this.queue.length && this.enemies.length < this.difficulty().activeCap) {
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = this.difficulty().spawnGap;
        this.spawnEnemy(this.queue.pop()!);
      }
    } else if (!this.queue.length && this.enemies.length === 0) {
      const bonus = 120 + this.wave * 60;
      this.score += bonus;
      this.sfx.play('wave');
      this.pushFeed(`Wave ${this.wave} cleared! +${bonus} score`, '#46c8a8');
      this.announceSet(`WAVE ${this.wave} CLEARED · +${bonus}`);
      if (this.wave >= FINAL_WAVE) {
        this.state = 'over';
        this.music.duck(false);
        this.opts.onState('over', this.getStats());
      } else {
        this.openShop();
      }
      return;
    }

    this.announceT -= dt;
    this.hurtFlash = Math.max(0, this.hurtFlash - raw * 2.4);
  }

  private updateWorld(dt: number, interact: boolean) {
    const p = this.p;
    // enemies
    for (const e of this.enemies) {
      if (e.spawn > 0) {
        e.spawn -= dt;
        continue;
      }
      e.flash = Math.max(0, e.flash - dt * 5);
      if (!p || p.dead) {
        e.vx *= 1 - Math.min(1, dt * 2);
        e.vy *= 1 - Math.min(1, dt * 2);
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        continue;
      }
      // Heartbeat Stasis: the world is frozen, only the player moves
      if (p.stasisT > 0) continue;
      // Mirage Step: everyone hunts the decoy instead of the player
      const target = this.decoy ?? p;
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      if (e.kind !== 'boss') e.faceA = Math.atan2(dy, dx);
      let mx = 0;
      let my = 0;
      const focusSlow = p.focusT > 0 ? 0.32 : 1;
      const spd = e.speed * (e.frozen > 0 ? 0 : e.slow > 0 ? 0.55 : 1) * focusSlow;
      if (e.frozen > 0) e.frozen -= dt;
      if (e.slow > 0) e.slow -= dt;
      e.atkCd -= dt;
      switch (e.kind) {
        case 'husk':
          mx = ux; my = uy;
          break;
        case 'skitter': {
          const w = Math.sin(this.time * 6 + e.seed) * 0.85;
          mx = ux - uy * w;
          my = uy + ux * w;
          break;
        }
        case 'hexer': {
          const dir = d > 300 ? 1 : d < 210 ? -1 : 0;
          const strafe = Math.sin(this.time * 1.1 + e.seed) > 0 ? 1 : -1;
          mx = ux * dir - uy * strafe * 0.7;
          my = uy * dir + ux * strafe * 0.7;
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 460) {
            e.shootT = rand(Math.max(1.25, 2.2 - this.wave * 0.06), Math.max(1.7, 3.0 - this.wave * 0.05));
            this.shots.push({
              x: e.x + ux * 20, y: e.y + uy * 20,
              vx: ux * 200, vy: uy * 200,
              r: 7, dmg: e.dmg, life: 3, color: HAZARD_COLOR, from: 'e', pierce: 0,
            });
            this.burst(e.x + ux * 22, e.y + uy * 22, ENEMIES.hexer.color, 5, 120, 'spark');
            this.sfx.play('shoot');
          }
          break;
        }
        case 'brute': {
          if (e.lungeT > 0) {
            e.lungeT -= dt;
          } else if (e.windT > 0) {
            e.windT -= dt;
            if (e.windT <= 0) {
              e.vx = ux * 560;
              e.vy = uy * 560;
              e.lungeT = 0.32;
              this.burst(e.x, e.y, '#ff7d6b', 8, 200, 'spark');
            }
          } else {
            mx = ux; my = uy;
            if (d < 130) e.windT = 0.6;
          }
          break;
        }
        case 'mage': {
          // keeps mid-range, strafes, fires 3-bolt bursts
          const dir = d > 360 ? 1 : d < 260 ? -1 : 0;
          const strafe = Math.sin(this.time * 1.6 + e.seed) > 0 ? 1 : -1;
          mx = ux * dir - uy * strafe * 0.8;
          my = uy * dir + ux * strafe * 0.8;
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 520) {
            e.shootT = rand(Math.max(1.1, 2.0 - this.wave * 0.04), Math.max(1.6, 2.6 - this.wave * 0.04));
            for (let i = -1; i <= 1; i++) {
              const a = Math.atan2(uy, ux) + i * 0.22;
              this.shots.push({
                x: e.x + Math.cos(a) * 22, y: e.y + Math.sin(a) * 22,
                vx: Math.cos(a) * 240, vy: Math.sin(a) * 240,
                r: 7, dmg: e.dmg, life: 3, color: HAZARD_COLOR, from: 'e', pierce: 0,
              });
            }
            this.burst(e.x + ux * 24, e.y + uy * 24, ENEMIES.mage.color, 6, 140, 'spark');
            this.sfx.play('shoot');
          }
          break;
        }
        case 'demon': {
          // relentless bruiser: walks in, then double-slams
          if (e.lungeT > 0) {
            e.lungeT -= dt;
          } else if (e.windT > 0) {
            e.windT -= dt;
            if (e.windT <= 0) {
              e.vx = ux * 480;
              e.vy = uy * 480;
              e.lungeT = 0.4;
              this.burst(e.x, e.y, '#ff4d3d', 10, 220, 'spark');
              this.sfx.play('dash');
            }
          } else {
            mx = ux; my = uy;
            if (d < 150) e.windT = 0.55;
          }
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 420 && d > 120) {
            e.shootT = rand(2.6, 3.6);
            this.shots.push({
              x: e.x + ux * 22, y: e.y + uy * 22,
              vx: ux * 190, vy: uy * 190,
              r: 9, dmg: e.dmg * 0.8, life: 3.2, color: HAZARD_COLOR, from: 'e', pierce: 0,
            });
            this.sfx.play('shoot');
          }
          break;
        }
        case 'wraith': {
          // blinks: drifts, then sudden dash through the player
          if (e.dashT > 0) {
            e.dashT -= dt;
          } else {
            const w = Math.sin(this.time * 7 + e.seed) * 1.1;
            mx = ux * 0.6 - uy * w;
            my = uy * 0.6 + ux * w;
            e.shootT -= dt;
            if (e.shootT <= 0 && d < 380) {
              e.shootT = rand(1.8, 2.8);
              e.dashT = 0.28;
              e.vx = ux * 620;
              e.vy = uy * 620;
              this.burst(e.x, e.y, '#b9a7ff', 8, 200, 'spark');
            }
          }
          break;
        }
        case 'golem': {
          // siege engine: slow, telegraphed slam with shockwave
          mx = ux * 0.7; my = uy * 0.7;
          if (e.windT > 0) {
            e.windT -= dt;
            mx = 0; my = 0;
            if (e.windT <= 0) {
              this.shake(6);
              this.sfx.play('boss');
              this.part(e.x, e.y, 0, 0, 0.5, e.r, '#c8cfdd', 'ring');
              this.burst(e.x, e.y, '#9aa7b8', 14, 260, 'dot');
              for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU;
                this.shots.push({
                  x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r,
                  vx: Math.cos(a) * 150, vy: Math.sin(a) * 150,
                  r: 8, dmg: e.dmg * 0.6, life: 2, color: HAZARD_COLOR, from: 'e', pierce: 0,
                });
              }
            }
          } else if (d < e.r + p.r + 70) {
            e.windT = 0.7;
            e.telegraphed = true;
          } else {
            e.telegraphed = false;
          }
          break;
        }
        case 'dragon': {
          // swoops in arcs and breathes 5-fire cones
          const w = Math.sin(this.time * 2.2 + e.seed) * 0.9;
          mx = ux * 0.9 - uy * w;
          my = uy * 0.9 + ux * w;
          e.shootT -= dt;
          if (e.shootT <= 0 && d < 480) {
            e.shootT = rand(2.0, 2.8);
            const base = Math.atan2(uy, ux);
            for (let i = -2; i <= 2; i++) {
              const a = base + i * 0.16;
              this.shots.push({
                x: e.x + Math.cos(a) * 30, y: e.y + Math.sin(a) * 30,
                vx: Math.cos(a) * 230, vy: Math.sin(a) * 230,
                r: 8, dmg: e.dmg * 0.7, life: 2.6, color: HAZARD_COLOR, from: 'e', pierce: 0,
              });
            }
            this.burst(e.x + ux * 32, e.y + uy * 32, '#ff9a2e', 8, 200, 'spark');
            this.sfx.play('shoot');
          }
          break;
        }
        case 'boss': {
          e.phase += dt;
          e.minionT -= dt;
          const v = e.variant ?? 0;
          e.faceA = this.bossAimAngle(e, 220, 0.72);
          if (e.minionT <= 0 && this.enemies.length < this.difficulty().activeCap - 3) {
            e.minionT = this.waveDifficulty.bossMinionGap;
            const minionPool: EnemyKind[] = this.wave >= 20
              ? ['husk', 'skitter', 'mage', 'wraith']
              : this.wave >= 10 ? ['husk', 'skitter', 'mage'] : ['husk', 'skitter'];
            for (let i = 0; i < Math.min(5, 2 + Math.floor(this.wave / 4)); i++) {
              const mk = minionPool[Math.floor(Math.random() * minionPool.length)];
              const def = ENEMIES[mk];
              const a = rand(0, TAU);
              const difficulty = this.difficulty();
              this.enemies.push({
                kind: mk,
                x: clamp(e.x + Math.cos(a) * 60, 50, ARENA_W - 50),
                y: clamp(e.y + Math.sin(a) * 60, 50, ARENA_H - 50),
                vx: 0, vy: 0, r: def.r,
                hp: def.hp * difficulty.hp, maxHp: def.hp * difficulty.hp,
                speed: def.speed * difficulty.speed, dmg: def.dmg * difficulty.dmg,
                flash: 0, frozen: 0, slow: 0, spawn: 0.4,
                atkCd: 1, seed: rand(0, TAU), elite: false, name: def.name,
                shootT: 2, phase: 0, windT: 0, lungeT: 0,
                minionT: 99, faceA: 0, telegraphed: false, launched: false,
                variant: 0, dashT: 0, dead: false,
              });
              this.burst(e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 60, def.color, 6, 150, 'spark');
            }
          }
          // variant special attacks on shootT
          e.shootT -= dt;
          if (e.shootT <= 0) {
            if (v === 0) {
              // Mizuchi: tidal ring of 10 bolts
              e.shootT = 3.4;
              for (let i = 0; i < 10; i++) {
                const a = (i / 10) * TAU + this.time;
                this.shots.push({ x: e.x + Math.cos(a) * 50, y: e.y + Math.sin(a) * 50, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, r: 8, dmg: e.dmg * 0.55, life: 3.4, color: HAZARD_COLOR, from: 'e', pierce: 0 });
              }
              this.sfx.play('tide');
            } else if (v === 1) {
              // Khorzun: triple cinder fans
              e.shootT = 2.8;
              const base = this.bossAttackAngle(e, 250, 0.86);
              for (let i = -1; i <= 1; i++) {
                const a = base + i * 0.3;
                this.shots.push({ x: e.x + Math.cos(a) * 50, y: e.y + Math.sin(a) * 50, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, r: 9, dmg: e.dmg * 0.6, life: 3, color: HAZARD_COLOR, from: 'e', pierce: 0 });
              }
              this.sfx.play('shoot');
            } else if (v === 2) {
              // Isbrekk: slowing frost ring
              e.shootT = 3.8;
              for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU;
                this.shots.push({ x: e.x + Math.cos(a) * 50, y: e.y + Math.sin(a) * 50, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, r: 9, dmg: e.dmg * 0.5, life: 4, color: HAZARD_COLOR, from: 'e', pierce: 0 });
              }
              p.slowT = Math.max(p.slowT, 1.2);
              this.sfx.play('nova');
            } else if (v === 3) {
              // Balam: eclipse spiral
              e.shootT = 2.4;
              for (let i = 0; i < 6; i++) {
                const a = e.phase * 2 + (i / 6) * TAU;
                this.shots.push({ x: e.x + Math.cos(a) * 50, y: e.y + Math.sin(a) * 50, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, r: 7, dmg: e.dmg * 0.55, life: 3, color: HAZARD_COLOR, from: 'e', pierce: 0 });
              }
              this.sfx.play('bolts');
            } else {
              // Zar'qun: glass shard cross
              e.shootT = 3.0;
              const aim = this.bossAttackAngle(e, 260, 0.78);
              const aimX = Math.cos(aim);
              const aimY = Math.sin(aim);
              for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
                const shardX = ox * aimX - oy * aimY;
                const shardY = ox * aimY + oy * aimX;
                this.shots.push({ x: e.x + shardX * 50, y: e.y + shardY * 50, vx: shardX * 260 + aimX * 60, vy: shardY * 260 + aimY * 60, r: 8, dmg: e.dmg * 0.6, life: 3, color: HAZARD_COLOR, from: 'e', pierce: 0 });
              }
              this.sfx.play('shoot');
            }
            this.shake(4);
          }
          const pace = v === 1 ? 4.2 : 5; // Khorzun charges more often
          const cyc = e.phase % pace;
          if (cyc < pace - 2.2) {
            mx = ux; my = uy;
            e.telegraphed = false;
            e.launched = false;
          } else if (cyc < pace - 1.6) {
            if (!e.telegraphed) {
              e.telegraphed = true;
              this.shake(4);
            }
          } else if (cyc < pace - 1.3) {
            if (!e.launched) {
              e.launched = true;
              const lunge = v === 1 ? 760 : 640;
                const chargeA = this.bossAttackAngle(e, lunge, 0.58);
                e.vx = Math.cos(chargeA) * lunge;
                e.vy = Math.sin(chargeA) * lunge;
              this.sfx.play('dash');
              this.shake(5);
            }
          } else {
            mx = ux * 0.3;
            my = uy * 0.3;
          }
          break;
        }
      }
      const heavy = e.kind === 'brute' || e.kind === 'boss' || e.kind === 'golem' || e.kind === 'demon' || e.kind === 'dragon';
      const acc = heavy ? 6 : 10;
      e.vx += (mx * spd - e.vx) * Math.min(1, dt * acc);
      e.vy += (my * spd - e.vy) * Math.min(1, dt * acc);
      e.x = clamp(e.x + e.vx * dt, 30, ARENA_W - 30);
      e.y = clamp(e.y + e.vy * dt, 30, ARENA_H - 30);

      // contact damage (always measured against the real player, not the mirage)
      const dp = Math.hypot(p.x - e.x, p.y - e.y);
      if (interact && dp < e.r + p.r + 2 && e.atkCd <= 0) {
        e.atkCd = Math.max(0.55, (0.9 - this.wave * 0.018) / Math.min(1.25, this.waveDifficulty.dmg));
        this.damagePlayer(e.dmg, e);
      }
    }

    // separation
    const es = this.enemies;
    for (let i = 0; i < es.length; i++) {
      for (let j = i + 1; j < es.length; j++) {
        const a = es[i];
        const b = es[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const rr = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.01 && d2 < rr * rr) {
          const d = Math.sqrt(d2);
          const push = (rr - d) / d * 0.5;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    }

    // shots (enemy bolts hang in the air during stasis)
    const frozenWorld = !!p && !p.dead && p.stasisT > 0;
    for (const s of this.shots) {
      if (frozenWorld && s.from === 'e') continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      // Returning projectile behavior (Sand Chakram & Trident Boomerang)
      if (s.from === 'p' && s.returning && s.maxLife && s.startX !== undefined && s.startY !== undefined) {
        const elapsedLife = s.maxLife - s.life;
        if (elapsedLife > s.maxLife * 0.45 && p && !p.dead) {
          // Accelerate back toward player
          const toPlayerX = p.x - s.x;
          const toPlayerY = p.y - s.y;
          const toDist = Math.hypot(toPlayerX, toPlayerY) || 1;
          const returnSpeed = 520;
          s.vx = (toPlayerX / toDist) * returnSpeed;
          s.vy = (toPlayerY / toDist) * returnSpeed;
          // When caught by player
          if (toDist < p.r + s.r + 14) {
            s.life = 0;
            this.burst(p.x, p.y, s.color, 4, 120, 'spark');
            continue;
          }
        }
      }

      if (s.from === 'e' && interact && p && !p.dead) {
        const d = Math.hypot(s.x - p.x, s.y - p.y);
        if (d < s.r + p.r) {
          s.life = 0;
          this.damagePlayer(s.dmg, {
            kind: 'hexer', x: s.x - s.vx, y: s.y - s.vy, elite: false, name: 'a hexbolt',
          } as Enemy);
        }
      } else if (s.from === 'p') {
        for (const e of this.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const d = Math.hypot(s.x - e.x, s.y - e.y);
          if (d < s.r + e.r) {
            const knockForce = (p && p.hasKineticKnockback) ? 280 : 120;
            this.damageEnemy(e, s.dmg, (s.vx || 1) / 360, (s.vy || 1) / 360, false, knockForce);

            // Pull enemies slightly toward tidal projectile path
            if (s.pullsEnemies) {
              const toShotX = s.x - e.x;
              const toShotY = s.y - e.y;
              const toDist = Math.hypot(toShotX, toShotY) || 1;
              e.vx += (toShotX / toDist) * 140;
              e.vy += (toShotY / toDist) * 140;
              e.slow = Math.max(e.slow, 0.6);
            }

            // Ricochet Edge mechanical power: bounce to a second target
            if (p && p.hasBouncingBlades && (s.bounces ?? 0) < 1) {
              s.bounces = (s.bounces ?? 0) + 1;
              const nextFoe = this.enemies.find((f) => f !== e && !f.dead && f.spawn <= 0 && Math.hypot(f.x - e.x, f.y - e.y) < 220);
              if (nextFoe) {
                const bx = nextFoe.x - s.x;
                const by = nextFoe.y - s.y;
                const bd = Math.hypot(bx, by) || 1;
                s.vx = (bx / bd) * 440;
                s.vy = (by / bd) * 440;
                s.life = Math.min(s.life + 0.5, 1.2);
                this.burst(s.x, s.y, '#8fe7ff', 5, 140, 'spark');
                break;
              }
            }

            s.pierce--;
            if (s.pierce < 0) {
              if (s.splitOnExpire) {
                for (let si = 0; si < 4; si++) {
                  const sa = (si / 4) * TAU + rand(-0.2, 0.2);
                  this.shots.push({
                    x: s.x, y: s.y,
                    vx: Math.cos(sa) * 320, vy: Math.sin(sa) * 320,
                    r: 6, dmg: s.dmg * 0.45, life: 0.6, color: '#e6c26a', from: 'p', pierce: 0,
                  });
                }
              }
              s.life = 0;
            }
            break;
          }
        }
      }
    }
    this.shots = this.shots.filter((s) => s.life > 0 && s.x > -80 && s.x < ARENA_W + 80 && s.y > -80 && s.y < ARENA_H + 80);

    // pickups
    if (p && !p.dead) {
      for (const pk of this.pickups) {
        pk.t += dt;
        pk.vx *= 1 - Math.min(1, dt * 4);
        pk.vy *= 1 - Math.min(1, dt * 4);
        const dx = p.x - pk.x;
        const dy = p.y - pk.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < p.pickupRange) {
          pk.vx += (dx / d) * 1400 * dt;
          pk.vy += (dy / d) * 1400 * dt;
        }
        pk.x += pk.vx * dt;
        pk.y += pk.vy * dt;
        if (interact && d < 30) {
          pk.t = -999; // consumed flag
          if (pk.kind === 'coin') {
            const collected = Math.ceil(pk.val * p.coinMult);
            this.gold += collected;
            this.score += collected * 5;
            this.sfx.play('coin');
            this.floater(p.x, p.y - 34, `+${collected * 5}`, 13, '#ffd24a');
            this.burst(pk.x, pk.y, '#ffd24a', 5, 140, 'spark');
          } else if (pk.kind === 'potion') {
            p.hp = Math.min(p.maxHp, p.hp + pk.val);
            this.sfx.play('potion');
            this.floater(p.x, p.y - 34, `+${pk.val} HP`, 15, '#7ddb6f');
            this.burst(pk.x, pk.y, '#7ddb6f', 8, 160);
          } else {
            p.buffT = 8;
            this.sfx.play('rune');
            this.floater(p.x, p.y - 40, 'EMPOWERED!', 20, '#ffd97a', true);
            this.pushFeed('You attuned a Sun Rune — +50% damage for 8s.', '#ffd97a');
            this.part(p.x, p.y, 0, 0, 0.6, 34, '#ffd97a', 'ring');
          }
        }
      }
      this.pickups = this.pickups.filter((pk) => pk.t > -900);
    }

    // cull dead enemies
    if (this.enemies.some((e) => e.dead)) {
      this.enemies = this.enemies.filter((e) => !e.dead);
    }
  }

  private updateFx(dt: number) {
    for (const pt of this.parts) {
      pt.t += dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.pow(pt.drag, dt * 60);
      pt.vy *= Math.pow(pt.drag, dt * 60);
      pt.vy += pt.grav * dt;
      pt.rot += pt.vr * dt;
    }
    this.parts = this.parts.filter((pt) => pt.t < pt.dur);
    for (const f of this.floaters) f.t += dt;
    this.floaters = this.floaters.filter((f) => f.t < f.dur);
    for (const s of this.slashes) s.t += dt;
    this.slashes = this.slashes.filter((s) => s.t < s.dur);
    for (const g of this.ghosts) g.a -= dt * 2.4;
    this.ghosts = this.ghosts.filter((g) => g.a > 0);
  }

  private updateMenuParts(raw: number) {
    if (this.menuParts.length < 60 && Math.random() < 0.3) {
      this.menuParts.push({
        x: rand(0, this.viewW), y: this.viewH + 10,
        vx: rand(-12, 12), vy: rand(-70, -26),
        t: 0, dur: rand(4, 9), size: rand(1.5, 4),
        color: Math.random() < 0.7 ? '#e2b45c' : ZONES[Math.floor(this.menuT / 8) % ZONES.length].color,
        kind: 'dot', grav: 0, drag: 1, rot: 0, vr: 0,
      });
    }
    for (const pt of this.menuParts) {
      pt.t += raw;
      pt.x += pt.vx * raw + Math.sin(pt.t * 2 + pt.size) * 0.3;
      pt.y += pt.vy * raw;
    }
    this.menuParts = this.menuParts.filter((pt) => pt.t < pt.dur && pt.y > -20);
  }

  /* ------------------------------- hud ------------------------------- */

  private pushHud() {
    const p = this.p;
    if (!p) return;
    const boss = this.enemies.find((e) => e.kind === 'boss' && e.spawn <= 0);
    const m = Math.floor(this.elapsed / 60);
    const s = Math.floor(this.elapsed % 60);
    const d: HudData = {
      hp: Math.max(0, Math.ceil(p.hp)), maxHp: p.maxHp,
      xp: p.xp, xpNext: this.xpNeed(p.level), level: p.level,
      score: this.score, gold: this.gold, kills: this.kills,
      wave: this.wave, zoneName: this.zone.name, zoneCulture: this.zone.culture, zoneColor: this.zone.color,
      threat:
        this.wave < 5 ? 'THREAT I' :
        this.wave < 10 ? 'THREAT II' :
        this.wave < 20 ? 'THREAT III' :
        this.wave < 35 ? 'THREAT IV' :
        this.wave < 50 ? 'THREAT V' : 'THREAT VI',
      foesLeft: this.queue.length + this.enemies.length,
      abilityCd: Math.max(0, p.abilityCd), abilityCdMax: this.classDef.abilityCd,
      dashCd: Math.max(0, p.dashCd), dashCdMax: 1.6 * p.dashRate,
      abilityName: this.classDef.abilityName,
      legacyCd: Math.max(0, p.legacyCd), legacyCdMax: this.legacy.cd * p.abilityRate,
      legacyName: this.legacy.name, legacyActive: this.legacyActiveLabel(),
      buffT: Math.max(0, p.buffT), combo: p.combo,
      bossHp: boss ? Math.max(0, boss.hp) : 0, bossMax: boss ? boss.maxHp : 0,
      bossName: boss ? boss.name : '',
      hurt: this.hurtFlash, lowHp: p.hp / p.maxHp < 0.3,
      feed: this.feed.slice(),
      announce: this.announce, announceId: this.announceId,
      timeStr: `${m}:${s.toString().padStart(2, '0')}`,
      muted: this.muted,
      playerName: this.playerName, classId: this.classDef.id,
      className: this.classDef.name, classColor: this.classDef.color,
    };
    for (const fn of this.opts.bus.listeners) fn(d);
  }

  /* ------------------------------ render ----------------------------- */

  private resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const r = parent.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.viewW = Math.max(1, r.width);
    this.viewH = Math.max(1, r.height);
    this.canvas.width = Math.round(this.viewW * this.dpr);
    this.canvas.height = Math.round(this.viewH * this.dpr);
    this.canvas.style.width = `${this.viewW}px`;
    this.canvas.style.height = `${this.viewH}px`;
    this.zoom = clamp(Math.min(this.viewW, this.viewH) / 760, 0.7, 1.15);
  }

  private render() {
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.fillStyle = '#070a10';
    c.fillRect(0, 0, this.viewW, this.viewH);

    const shx = (Math.random() * 2 - 1) * this.cam.shake;
    const shy = (Math.random() * 2 - 1) * this.cam.shake;
    c.save();
    c.translate(this.viewW / 2, this.viewH / 2);
    c.scale(this.zoom, this.zoom);
    c.translate(-this.cam.x + shx, -this.cam.y + shy);

    this.drawGround(c);
    if (this.state === 'menu') {
      this.drawMenuRing(c);
    } else {
      for (const pk of this.pickups) this.drawPickup(c, pk);
      for (const e of this.enemies) this.drawEnemy(c, e);
      this.drawPlayer(c);
      for (const s of this.shots) this.drawShot(c, s);
      for (const s of this.slashes) this.drawSlash(c, s);
    }
    this.drawParticles(c);
    if (this.state !== 'menu') {
      for (const f of this.floaters) this.drawFloater(c, f);
    }
    c.restore();

    if (this.state === 'menu') this.drawMenuOverlayFx(c);

    // Heartbeat Stasis: cold violet wash over the frozen world
    if (this.p && this.p.stasisT > 0 && this.state !== 'menu') {
      c.fillStyle = 'rgba(120,80,200,0.14)';
      c.fillRect(0, 0, this.viewW, this.viewH);
    }
    // Still Water: pale, quiet vignette
    if (this.p && this.p.focusT > 0 && this.state !== 'menu') {
      c.fillStyle = 'rgba(200,230,255,0.06)';
      c.fillRect(0, 0, this.viewW, this.viewH);
    }
  }

  /** Unlock/resume audio from any user gesture (touch controls call this). */
  unlockAudio() {
    this.sfx.ensure();
    this.music.ensure();
    if (this.state === 'menu') this.music.setScene('menu');
  }

  private drawGround(c: CanvasRenderingContext2D) {
    const zoneIndex = this.state === 'menu'
      ? Math.floor(this.menuT / 8) % ZONES.length
      : this.wave > 0 ? (this.wave - 1) % ZONES.length : 0;
    const zoneColor = ZONES[zoneIndex].color;
    const halfW = this.viewW / 2 / this.zoom + 60;
    const halfH = this.viewH / 2 / this.zoom + 60;
    const l = this.cam.x - halfW;
    const t = this.cam.y - halfH;
    // arena floor
    c.fillStyle = mixHex('#0e141c', zoneColor, 0.07);
    c.fillRect(Math.max(0, l), Math.max(0, t), Math.min(ARENA_W, l + halfW * 2) - Math.max(0, l), Math.min(ARENA_H, t + halfH * 2) - Math.max(0, t));
    // glow blobs
    for (const b of this.blobs) {
      if (b.x + b.r < l || b.x - b.r > l + halfW * 2 || b.y + b.r < t || b.y - b.r > t + halfH * 2) continue;
      this.drawGlow(c, b.x, b.y, b.r, zoneColor, 0.09);
    }
    this.drawScenery(c, zoneIndex, l, t, l + halfW * 2, t + halfH * 2);
    // grid
    c.strokeStyle = rgba(zoneColor, 0.07);
    c.lineWidth = 1;
    c.beginPath();
    const g = 130;
    for (let x = Math.max(0, Math.floor(l / g) * g); x <= Math.min(ARENA_W, l + halfW * 2); x += g) {
      c.moveTo(x, Math.max(0, t));
      c.lineTo(x, Math.min(ARENA_H, t + halfH * 2));
    }
    for (let y = Math.max(0, Math.floor(t / g) * g); y <= Math.min(ARENA_H, t + halfH * 2); y += g) {
      c.moveTo(Math.max(0, l), y);
      c.lineTo(Math.min(ARENA_W, l + halfW * 2), y);
    }
    c.stroke();
    // specks
    c.fillStyle = '#cfe3d8';
    for (const s of this.specks) {
      if (s.x < l || s.x > l + halfW * 2 || s.y < t || s.y > t + halfH * 2) continue;
      c.globalAlpha = s.a;
      c.fillRect(s.x, s.y, 2, 2);
    }
    c.globalAlpha = 1;
    // border
    c.strokeStyle = 'rgba(226,180,92,0.22)';
    c.lineWidth = 4;
    c.strokeRect(0, 0, ARENA_W, ARENA_H);
    c.strokeStyle = 'rgba(226,180,92,0.08)';
    c.lineWidth = 2;
    c.strokeRect(10, 10, ARENA_W - 20, ARENA_H - 20);
    // corner runes
    c.strokeStyle = 'rgba(226,180,92,0.3)';
    c.lineWidth = 2;
    for (const [cx, cy] of [[70, 70], [ARENA_W - 70, 70], [70, ARENA_H - 70], [ARENA_W - 70, ARENA_H - 70]] as const) {
      c.beginPath();
      c.arc(cx, cy, 26, 0, TAU);
      c.stroke();
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + this.time * 0.3;
        c.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
        c.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34);
      }
      c.stroke();
    }
  }

  private drawMenuRing(c: CanvasRenderingContext2D) {
    const cx = ARENA_W / 2;
    const cy = ARENA_H / 2;
    c.save();
    c.translate(cx, cy);
    this.drawGlow(c, 0, 0, 320, ZONES[Math.floor(this.menuT / 8) % ZONES.length].color, 0.14);
    c.rotate(this.menuT * 0.12);
    c.strokeStyle = 'rgba(226,180,92,0.35)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, 0, 200, 0, TAU);
    c.stroke();
    c.beginPath();
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      c.moveTo(Math.cos(a) * 190, Math.sin(a) * 190);
      c.lineTo(Math.cos(a) * 210, Math.sin(a) * 210);
    }
    c.stroke();
    for (const gl of this.glyphs) {
      c.save();
      c.rotate(gl.a);
      c.translate(165, 0);
      c.strokeStyle = 'rgba(255,217,122,0.5)';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(-10, -8 * gl.segs[0]);
      c.lineTo(0, 8 * gl.segs[1]);
      c.lineTo(10, -8 * gl.segs[2]);
      c.moveTo(0, 8 * gl.segs[1]);
      c.lineTo(0, -12);
      c.stroke();
      c.restore();
    }
    c.rotate(-this.menuT * 0.26);
    c.setLineDash([14, 22]);
    c.strokeStyle = 'rgba(226,180,92,0.18)';
    c.beginPath();
    c.arc(0, 0, 250, 0, TAU);
    c.stroke();
    c.setLineDash([]);
    c.restore();
    // orbiting spirit orbs, one per culture-class
    for (let i = 0; i < 4; i++) {
      const a = this.menuT * 0.35 + (i / 4) * TAU;
      const ox = cx + Math.cos(a) * 232;
      const oy = cy + Math.sin(a) * 232;
      this.drawGlow(c, ox, oy, 26, CLASSES[i].color, 0.7);
      c.fillStyle = CLASSES[i].color;
      c.beginPath();
      c.arc(ox, oy, 5, 0, TAU);
      c.fill();
    }
  }

  private drawMenuOverlayFx(c: CanvasRenderingContext2D) {
    // screen-space embers
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (const pt of this.menuParts) {
      const k = pt.t / pt.dur;
      c.globalAlpha = Math.sin(Math.PI * Math.min(1, k)) * 0.7;
      c.fillStyle = pt.color;
      c.beginPath();
      c.arc(pt.x, pt.y, pt.size, 0, TAU);
      c.fill();
    }
    c.restore();
    c.globalAlpha = 1;
  }

  private makeScenery(zoneIndex: number): SceneryProp[] {
    const zones: SceneryKind[][] = [
      ['bamboo', 'bamboo', 'sakura', 'sakura', 'torii'],
      ['emberRock', 'emberRock', 'lavaCrack', 'lavaCrack', 'deadTree'],
      ['pine', 'pine', 'iceShard', 'iceShard', 'runestone'],
      ['palm', 'palm', 'ruin', 'ruin', 'vine'],
      ['dune', 'dune', 'obelisk', 'cactus', 'cactus'],
    ];
    const kinds = zones[zoneIndex];
    const out: SceneryProp[] = [];
    for (let i = 0; i < 42; i++) {
      let x = 0;
      let y = 0;
      do {
        x = rand(65, ARENA_W - 65);
        y = rand(65, ARENA_H - 65);
      } while (Math.hypot(x - ARENA_W / 2, y - ARENA_H / 2) < 390);
      out.push({
        x,
        y,
        kind: kinds[Math.floor(rand(0, kinds.length))],
        scale: rand(0.7, 1.32),
        seed: rand(0, TAU),
      });
    }
    return out;
  }

  private drawScenery(c: CanvasRenderingContext2D, zoneIndex: number, l: number, t: number, r: number, b: number) {
    // Broad environmental washes make every realm read as a place, not an empty arena.
    c.save();
    c.globalAlpha = 0.18;
    if (zoneIndex === 0) {
      c.fillStyle = '#1a5260';
      c.fillRect(0, 0, 98, ARENA_H);
      c.fillStyle = '#2d7890';
      for (let y = 0; y < ARENA_H; y += 46) {
        c.beginPath(); c.arc(44 + Math.sin(y * 0.03 + this.time) * 10, y, 24, 0, TAU); c.fill();
      }
    } else if (zoneIndex === 1) {
      c.fillStyle = '#6f2c21';
      for (let x = 80; x < ARENA_W; x += 340) {
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 140, 0); c.lineTo(x + 60, 120); c.closePath(); c.fill();
      }
    } else if (zoneIndex === 2) {
      c.fillStyle = '#38637b';
      c.fillRect(0, 0, ARENA_W, 76);
      c.fillRect(0, ARENA_H - 76, ARENA_W, 76);
    } else if (zoneIndex === 3) {
      c.fillStyle = '#244d35';
      c.fillRect(0, 0, 108, ARENA_H);
      c.fillRect(ARENA_W - 108, 0, 108, ARENA_H);
    } else {
      c.fillStyle = '#6b4b24';
      c.fillRect(0, 0, ARENA_W, 70);
      c.fillRect(0, ARENA_H - 70, ARENA_W, 70);
    }
    c.restore();

    for (const prop of this.scenery[zoneIndex]) {
      const reach = 90 * prop.scale;
      if (prop.x + reach < l || prop.x - reach > r || prop.y + reach < t || prop.y - reach > b) continue;
      this.drawSceneryProp(c, prop);
    }
  }

  private drawSceneryProp(c: CanvasRenderingContext2D, prop: SceneryProp) {
    const s = prop.scale;
    const flutter = Math.sin(this.time * 1.5 + prop.seed) * 0.12;
    c.save();
    c.translate(prop.x, prop.y);
    c.scale(s, s);
    c.globalAlpha = 0.72;
    switch (prop.kind) {
      case 'bamboo': {
        c.strokeStyle = '#397455'; c.lineWidth = 5; c.lineCap = 'round';
        for (const dx of [-8, 0, 8]) {
          c.beginPath(); c.moveTo(dx, 17); c.quadraticCurveTo(dx + flutter * 24, 0, dx + flutter * 48, -30); c.stroke();
          c.strokeStyle = '#9bd27a'; c.lineWidth = 1;
          for (let y = 8; y >= -22; y -= 10) { c.beginPath(); c.moveTo(dx - 3, y); c.lineTo(dx + 3, y); c.stroke(); }
          c.strokeStyle = '#397455'; c.lineWidth = 5;
        }
        c.fillStyle = '#74b866';
        for (let i = 0; i < 8; i++) { const a = prop.seed + i * 0.8; c.beginPath(); c.ellipse(Math.cos(a) * 15, -22 + Math.sin(a) * 10, 8, 2.5, a, 0, TAU); c.fill(); }
        break;
      }
      case 'sakura': {
        c.strokeStyle = '#4c2e2d'; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, 20); c.quadraticCurveTo(-2, -2, 5, -26); c.moveTo(1, -2); c.lineTo(-16, -17); c.moveTo(2, -6); c.lineTo(18, -20); c.stroke();
        c.fillStyle = '#f39aab';
        for (let i = 0; i < 14; i++) { const a = prop.seed + i * 0.45; const d = 8 + (i % 4) * 4; c.beginPath(); c.arc(Math.cos(a) * d, -20 + Math.sin(a) * 10, 4, 0, TAU); c.fill(); }
        break;
      }
      case 'torii': {
        c.fillStyle = '#b44b40'; c.fillRect(-22, -21, 5, 43); c.fillRect(17, -21, 5, 43); c.fillRect(-29, -24, 58, 6); c.fillRect(-24, -17, 48, 4);
        c.fillStyle = '#e8bc62'; c.fillRect(-29, -25, 58, 2); c.fillRect(-1.5, -17, 3, 35);
        break;
      }
      case 'emberRock': {
        c.fillStyle = '#56332d'; c.beginPath(); c.moveTo(-22, 18); c.lineTo(-12, -15); c.lineTo(12, -20); c.lineTo(27, 10); c.lineTo(15, 22); c.closePath(); c.fill();
        c.strokeStyle = '#ff834c'; c.globalAlpha = 0.55; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, 12); c.lineTo(2, 0); c.lineTo(12, 13); c.stroke();
        break;
      }
      case 'lavaCrack': {
        c.strokeStyle = '#ed5e36'; c.lineWidth = 3; c.globalAlpha = 0.55;
        c.beginPath(); c.moveTo(-30, 0); c.lineTo(-8, -5); c.lineTo(3, 8); c.lineTo(30, 2); c.moveTo(-8, -5); c.lineTo(-4, -20); c.moveTo(3, 8); c.lineTo(10, 22); c.stroke();
        break;
      }
      case 'deadTree': {
        c.strokeStyle = '#4a3030'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 22); c.lineTo(-2, -18); c.lineTo(-16, -31); c.moveTo(-3, -2); c.lineTo(13, -16); c.moveTo(0, 8); c.lineTo(17, 4); c.stroke();
        c.strokeStyle = '#a04b39'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(1, 18); c.lineTo(-1, -14); c.stroke();
        break;
      }
      case 'pine': {
        c.fillStyle = '#423b31'; c.fillRect(-3, 12, 6, 17);
        c.fillStyle = '#315d55';
        for (const [y, w] of [[-25, 12], [-13, 18], [0, 24], [12, 29]] as const) { c.beginPath(); c.moveTo(0, y - 12); c.lineTo(-w, y + 12); c.lineTo(w, y + 12); c.closePath(); c.fill(); }
        c.strokeStyle = '#9bd0e0'; c.globalAlpha = 0.35; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-20, 11); c.lineTo(0, -35); c.lineTo(20, 11); c.stroke();
        break;
      }
      case 'iceShard': {
        c.fillStyle = '#92d8ef'; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(-14, 20); c.lineTo(-4, -24); c.lineTo(6, 10); c.lineTo(17, -9); c.lineTo(14, 23); c.closePath(); c.fill();
        c.strokeStyle = '#d5fbff'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-4, -24); c.lineTo(0, 18); c.moveTo(6, 10); c.lineTo(14, 23); c.stroke();
        break;
      }
      case 'runestone': {
        c.fillStyle = '#43515f'; c.beginPath(); c.moveTo(-12, 23); c.lineTo(-10, -18); c.lineTo(0, -27); c.lineTo(11, -18); c.lineTo(13, 23); c.closePath(); c.fill();
        c.strokeStyle = '#7fdfff'; c.globalAlpha = 0.65; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -17); c.lineTo(-4, -7); c.lineTo(4, 0); c.lineTo(-3, 10); c.stroke();
        break;
      }
      case 'palm': {
        c.strokeStyle = '#715635'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 24); c.quadraticCurveTo(-4, -2, 3, -28); c.stroke();
        c.strokeStyle = '#2d7b4d'; c.lineWidth = 5; for (let i = 0; i < 6; i++) { const a = prop.seed + i * TAU / 6; c.beginPath(); c.moveTo(3, -27); c.quadraticCurveTo(Math.cos(a) * 17, -31 + Math.sin(a) * 8, Math.cos(a) * 28, -27 + Math.sin(a) * 16); c.stroke(); }
        break;
      }
      case 'ruin': {
        c.fillStyle = '#5e6a4e'; c.fillRect(-22, 11, 44, 10); c.fillRect(-15, 2, 30, 10); c.fillRect(-9, -8, 18, 10);
        c.fillStyle = '#82906a'; c.fillRect(-17, -28, 9, 22); c.fillRect(8, -28, 9, 22); c.fillRect(-20, -31, 40, 6);
        c.strokeStyle = '#294d37'; c.lineWidth = 2; c.beginPath(); c.moveTo(-16, -20); c.lineTo(-8, -14); c.moveTo(13, -23); c.lineTo(8, -12); c.stroke();
        break;
      }
      case 'vine': {
        c.strokeStyle = '#347146'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -32); c.bezierCurveTo(-21, -11, 19, 0, -4, 28); c.stroke();
        c.fillStyle = '#67a451'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(Math.sin(prop.seed + i) * 9, -17 + i * 10, 5, 2.2, prop.seed + i, 0, TAU); c.fill(); }
        break;
      }
      case 'dune': {
        c.strokeStyle = '#c49a52'; c.globalAlpha = 0.48; c.lineWidth = 4; c.beginPath(); c.arc(0, 12, 34, Math.PI * 1.05, Math.PI * 1.92); c.stroke(); c.beginPath(); c.arc(15, 19, 21, Math.PI * 1.05, Math.PI * 1.9); c.stroke();
        break;
      }
      case 'obelisk': {
        c.fillStyle = '#5c513f'; c.beginPath(); c.moveTo(-8, 27); c.lineTo(-6, -25); c.lineTo(6, -25); c.lineTo(9, 27); c.closePath(); c.fill();
        c.strokeStyle = '#e2bd66'; c.globalAlpha = 0.5; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -18); c.lineTo(-3, -7); c.lineTo(3, 0); c.lineTo(-2, 10); c.stroke();
        break;
      }
      case 'cactus': {
        c.strokeStyle = '#477456'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 24); c.lineTo(0, -25); c.moveTo(0, -2); c.lineTo(-13, -9); c.lineTo(-13, -18); c.moveTo(0, 8); c.lineTo(12, 2); c.lineTo(12, -8); c.stroke();
        c.strokeStyle = '#b9d172'; c.globalAlpha = 0.6; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, 20); c.lineTo(-2, -20); c.stroke();
        break;
      }
    }
    c.restore();
  }

  private drawPickup(c: CanvasRenderingContext2D, pk: Pickup) {
    const bob = Math.sin(pk.t * 5) * 3;
    const y = pk.y + bob;
    if (pk.kind === 'coin') {
      this.drawGlow(c, pk.x, y, 16, '#ffd24a', 0.45);
      c.fillStyle = '#ffd24a';
      c.beginPath();
      c.ellipse(pk.x, y, 6.5, 7.5, 0, 0, TAU);
      c.fill();
      c.strokeStyle = '#a87b1e';
      c.lineWidth = 1.5;
      c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.7)';
      c.beginPath();
      c.arc(pk.x, y, 3.5, -2.2, -0.8);
      c.stroke();
    } else if (pk.kind === 'potion') {
      this.drawGlow(c, pk.x, y, 18, '#ff6b8a', 0.5);
      c.fillStyle = '#e05252';
      c.beginPath();
      c.arc(pk.x, y + 2, 7.5, 0, TAU);
      c.fill();
      c.fillStyle = '#b83e3e';
      c.fillRect(pk.x - 3, y - 10, 6, 7);
      c.fillStyle = '#8a5a2a';
      c.fillRect(pk.x - 4, y - 13, 8, 4);
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.beginPath();
      c.arc(pk.x - 2.5, y, 2, 0, TAU);
      c.fill();
    } else {
      const pulse = 1 + Math.sin(pk.t * 6) * 0.15;
      this.drawGlow(c, pk.x, y, 30 * pulse, '#ffd97a', 0.7);
      c.save();
      c.translate(pk.x, y);
      c.rotate(pk.t * 2);
      c.fillStyle = '#ffd97a';
      c.beginPath();
      c.moveTo(0, -10);
      c.lineTo(7, 0);
      c.lineTo(0, 10);
      c.lineTo(-7, 0);
      c.closePath();
      c.fill();
      c.strokeStyle = '#54c9b4';
      c.lineWidth = 2;
      c.stroke();
      c.restore();
    }
  }

  private drawEnemy(c: CanvasRenderingContext2D, e: Enemy) {
    const def = ENEMIES[e.kind];
    const bossCol = e.kind === 'boss' ? ZONES[(e.variant ?? 0) % ZONES.length].bossColor : def.color;
    let col = e.kind === 'boss' ? bossCol : def.color;
    if (e.frozen > 0) col = mixHex(col, '#bfe6ff', 0.65);
    if (e.flash > 0) col = mixHex(col, '#ffffff', e.flash * 0.85);

    c.save();
    if (e.spawn > 0) {
      const k = 1 - e.spawn / 0.45;
      c.globalAlpha = k * 0.75;
      c.strokeStyle = def.color;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(e.x, e.y, e.r * (2.2 - k * 1.4), 0, TAU);
      c.stroke();
    }
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath();
    c.ellipse(e.x, e.y + e.r * 0.85, e.r * 1.05, e.r * 0.38, 0, 0, TAU);
    c.fill();

    if (e.kind === 'boss') this.drawGlow(c, e.x, e.y, e.r * 1.9, bossCol, 0.35);
    if (e.kind === 'dragon') this.drawGlow(c, e.x, e.y, e.r * 1.6, '#ff9a2e', 0.25);
    if (e.kind === 'wraith') this.drawGlow(c, e.x, e.y, e.r * 1.5, '#b9a7ff', 0.3);

    c.translate(e.x, e.y);
    const windUp = e.windT > 0 || (e.kind === 'boss' && e.telegraphed && !e.launched);
    if (windUp) {
      c.strokeStyle = `rgba(255,90,90,${0.4 + Math.sin(this.time * 30) * 0.3})`;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, e.r + 8, 0, TAU);
      c.stroke();
    }
    if (e.elite) {
      const halo = 1 + Math.sin(this.time * 5 + e.seed) * 0.08;
      this.drawGlow(c, 0, 0, e.r * 1.65 * halo, '#ffd24a', 0.23);
      c.strokeStyle = 'rgba(255,210,74,0.65)'; c.lineWidth = 1.4; c.setLineDash([3, 3]);
      c.beginPath(); c.arc(0, 0, e.r + 5, 0, TAU); c.stroke(); c.setLineDash([]);
    }

    switch (e.kind) {
      case 'husk': {
        const wob = Math.sin(this.time * 5 + e.seed) * 0.08;
        c.fillStyle = mixHex(def.color, '#15231d', 0.6);
        c.beginPath(); c.moveTo(-e.r * 0.8, e.r * 0.9); c.lineTo(-e.r * 0.7, -e.r * 0.1); c.lineTo(0, -e.r * 0.55); c.lineTo(e.r * 0.8, 0); c.lineTo(e.r * 0.6, e.r); c.closePath(); c.fill();
        c.fillStyle = col;
        c.beginPath();
        c.arc(0, 0, e.r * (1 + wob), 0, TAU);
        c.fill();
        c.strokeStyle = mixHex(def.color, '#d0e6bb', 0.35); c.globalAlpha = 0.55; c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(-e.r * 0.65, e.r * 0.1); c.lineTo(-e.r * 0.1, -e.r * 0.1); c.lineTo(e.r * 0.45, e.r * 0.35); c.moveTo(-e.r * 0.25, e.r * 0.7); c.lineTo(e.r * 0.4, e.r * 0.55); c.stroke(); c.globalAlpha = 1;
        c.fillStyle = '#d9d0a2';
        c.beginPath(); c.moveTo(-e.r * 0.7, -e.r * 0.4); c.lineTo(-e.r * 1.05, -e.r * 0.86); c.lineTo(-e.r * 0.38, -e.r * 0.66); c.closePath(); c.moveTo(e.r * 0.65, -e.r * 0.42); c.lineTo(e.r * 0.98, -e.r * 0.8); c.lineTo(e.r * 0.38, -e.r * 0.62); c.closePath(); c.fill();
        c.fillStyle = mixHex(def.color, '#000000', 0.45);
        c.beginPath();
        c.arc(0, e.r * 0.25, e.r * 0.5, 0.2, Math.PI - 0.2);
        c.fill();
        c.fillStyle = '#ff5d5d';
        c.beginPath();
        c.arc(-e.r * 0.35, -e.r * 0.2, 2.6, 0, TAU);
        c.arc(e.r * 0.35, -e.r * 0.2, 2.6, 0, TAU);
        c.fill();
        break;
      }
      case 'skitter': {
        c.rotate(e.faceA);
        c.strokeStyle = mixHex(def.color, '#000000', 0.3);
        c.lineWidth = 2;
        c.beginPath();
        for (let i = 0; i < 4; i++) {
          const lx = -e.r * 0.3 + (i - 1.5) * e.r * 0.35;
          const sw = Math.sin(this.time * 14 + e.seed + i) * 4;
          c.moveTo(lx, -e.r * 0.5);
          c.lineTo(lx + sw, -e.r * 1.2);
          c.moveTo(lx, e.r * 0.5);
          c.lineTo(lx + sw, e.r * 1.2);
        }
        c.stroke();
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(e.r, 0);
        c.lineTo(-e.r * 0.75, e.r * 0.8);
        c.lineTo(-e.r * 0.75, -e.r * 0.8);
        c.closePath();
        c.fill();
        c.strokeStyle = '#6f3318'; c.lineWidth = 1.6;
        for (let i = 0; i < 3; i++) { const x = -e.r * 0.35 + i * e.r * 0.42; c.beginPath(); c.moveTo(x, -e.r * 0.53); c.lineTo(x, e.r * 0.53); c.stroke(); }
        c.strokeStyle = '#4c2413'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-e.r * 0.65, 0); c.quadraticCurveTo(-e.r * 1.35, -e.r * 0.7, -e.r * 1.2, -e.r * 1.25); c.stroke();
        c.fillStyle = '#3a1d0a';
        c.beginPath();
        c.arc(e.r * 0.35, 0, 2.4, 0, TAU);
        c.fill();
        break;
      }
      case 'brute': {
        c.fillStyle = '#472222';
        c.beginPath(); c.ellipse(0, 3, e.r * 1.08, e.r * 0.84, 0, 0, TAU); c.fill();
        c.fillStyle = col;
        c.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU + Math.PI / 6;
          if (i === 0) c.moveTo(Math.cos(a) * e.r, Math.sin(a) * e.r);
          else c.lineTo(Math.cos(a) * e.r, Math.sin(a) * e.r);
        }
        c.closePath();
        c.fill();
        c.strokeStyle = mixHex(def.color, '#000000', 0.4);
        c.lineWidth = 3;
        c.stroke();
        c.strokeStyle = '#9f493e'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(-e.r * 0.6, -e.r * 0.05); c.lineTo(e.r * 0.6, -e.r * 0.05); c.moveTo(-e.r * 0.45, e.r * 0.35); c.lineTo(e.r * 0.45, e.r * 0.35); c.stroke();
        // horns
        c.fillStyle = '#e8d9b0';
        c.beginPath();
        c.moveTo(-e.r * 0.7, -e.r * 0.4);
        c.lineTo(-e.r * 1.25, -e.r * 0.95);
        c.lineTo(-e.r * 0.45, -e.r * 0.75);
        c.closePath();
        c.moveTo(e.r * 0.7, -e.r * 0.4);
        c.lineTo(e.r * 1.25, -e.r * 0.95);
        c.lineTo(e.r * 0.45, -e.r * 0.75);
        c.closePath();
        c.fill();
        c.fillStyle = '#ff5d5d';
        c.beginPath();
        c.arc(-e.r * 0.3, -e.r * 0.1, 3, 0, TAU);
        c.arc(e.r * 0.3, -e.r * 0.1, 3, 0, TAU);
        c.fill();
        c.fillStyle = '#2b1616'; c.beginPath(); c.arc(0, e.r * 0.28, e.r * 0.28, 0.2, Math.PI - 0.2); c.fill();
        break;
      }
      case 'hexer': {
        const bobY = Math.sin(this.time * 3 + e.seed) * 2.5;
        c.fillStyle = '#261a34'; c.beginPath(); c.moveTo(-e.r * 0.95, e.r * 0.75); c.lineTo(0, -e.r); c.lineTo(e.r * 0.95, e.r * 0.75); c.closePath(); c.fill();
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(0, -e.r);
        c.lineTo(e.r * 0.8, bobY);
        c.lineTo(0, e.r);
        c.lineTo(-e.r * 0.8, bobY);
        c.closePath();
        c.fill();
        c.strokeStyle = '#e6c2ff'; c.globalAlpha = 0.5; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -e.r * 0.65); c.lineTo(0, e.r * 0.65); c.moveTo(-e.r * 0.4, e.r * 0.2); c.lineTo(e.r * 0.4, e.r * 0.2); c.stroke(); c.globalAlpha = 1;
        c.fillStyle = '#1c1226';
        c.beginPath();
        c.arc(0, -e.r * 0.25, e.r * 0.45, 0, TAU);
        c.fill();
        c.fillStyle = '#d0b3ff';
        c.beginPath();
        c.arc(-3, -e.r * 0.28, 2, 0, TAU);
        c.arc(3, -e.r * 0.28, 2, 0, TAU);
        c.fill();
        this.drawGlow(c, 0, -e.r - 12 + bobY, 12, def.color, 0.8);
        c.fillStyle = def.color;
        c.beginPath();
        c.arc(0, -e.r - 12 + bobY, 4, 0, TAU);
        c.fill();
        c.strokeStyle = '#6f4b85'; c.lineWidth = 2; c.beginPath(); c.moveTo(-e.r * 0.68, e.r * 0.6); c.lineTo(-e.r * 1.05, -e.r * 0.72 + bobY); c.stroke();
        break;
      }
      case 'mage': {
        const bobY = Math.sin(this.time * 4 + e.seed) * 3;
        // tattered robe
        c.fillStyle = mixHex(def.color, '#0a1420', 0.55);
        c.beginPath(); c.moveTo(-e.r, e.r); c.lineTo(-e.r * 0.3, -e.r * 0.9); c.lineTo(e.r * 0.3, -e.r * 0.9); c.lineTo(e.r, e.r); c.closePath(); c.fill();
        // hood
        c.fillStyle = col;
        c.beginPath(); c.arc(0, -e.r * 0.35 + bobY, e.r * 0.62, 0, TAU); c.fill();
        c.fillStyle = '#0a1420';
        c.beginPath(); c.arc(0, -e.r * 0.3 + bobY, e.r * 0.4, 0, TAU); c.fill();
        // burning eyes
        c.fillStyle = '#dff4ff';
        c.beginPath(); c.arc(-e.r * 0.16, -e.r * 0.32 + bobY, 2.2, 0, TAU); c.arc(e.r * 0.16, -e.r * 0.32 + bobY, 2.2, 0, TAU); c.fill();
        // staff with orb
        c.strokeStyle = '#5a4432'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(e.r * 0.7, e.r * 0.8); c.lineTo(e.r * 1.0, -e.r * 0.9 + bobY); c.stroke();
        this.drawGlow(c, e.r * 1.0, -e.r * 0.95 + bobY, 12, def.color, 0.8);
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(e.r * 1.0, -e.r * 0.95 + bobY, 3.6, 0, TAU); c.fill();
        break;
      }
      case 'demon': {
        c.rotate(e.faceA);
        // bulky horned body
        c.fillStyle = mixHex(def.color, '#200808', 0.4);
        c.beginPath(); c.ellipse(0, 2, e.r * 1.05, e.r * 0.9, 0, 0, TAU); c.fill();
        c.fillStyle = col;
        c.beginPath(); c.ellipse(0, 0, e.r * 0.9, e.r * 0.75, 0, 0, TAU); c.fill();
        // curved horns
        c.strokeStyle = '#f2e3c2'; c.lineWidth = 4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-e.r * 0.5, -e.r * 0.5); c.quadraticCurveTo(-e.r * 1.1, -e.r * 0.9, -e.r * 1.0, -e.r * 1.4); c.stroke();
        c.beginPath(); c.moveTo(e.r * 0.5, -e.r * 0.5); c.quadraticCurveTo(e.r * 1.1, -e.r * 0.9, e.r * 1.0, -e.r * 1.4); c.stroke();
        // molten cracks
        c.strokeStyle = '#ffd24a'; c.lineWidth = 1.6; c.globalAlpha = 0.8;
        c.beginPath(); c.moveTo(-e.r * 0.4, 0); c.lineTo(0, e.r * 0.2); c.lineTo(e.r * 0.35, -e.r * 0.1); c.stroke(); c.globalAlpha = 1;
        // eyes
        c.fillStyle = '#ffe36b';
        c.beginPath(); c.arc(-e.r * 0.28, -e.r * 0.2, 3, 0, TAU); c.arc(e.r * 0.28, -e.r * 0.2, 3, 0, TAU); c.fill();
        break;
      }
      case 'wraith': {
        const flick = 0.55 + Math.sin(this.time * 9 + e.seed) * 0.25;
        c.globalAlpha = flick;
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(0, -e.r * 1.2);
        c.quadraticCurveTo(e.r, -e.r * 0.4, e.r * 0.7, e.r);
        c.lineTo(e.r * 0.3, e.r * 0.6); c.lineTo(0, e.r * 1.05); c.lineTo(-e.r * 0.3, e.r * 0.6); c.lineTo(-e.r * 0.7, e.r);
        c.quadraticCurveTo(-e.r, -e.r * 0.4, 0, -e.r * 1.2);
        c.closePath(); c.fill();
        c.fillStyle = '#0d0a1a';
        c.beginPath(); c.arc(-e.r * 0.22, -e.r * 0.35, e.r * 0.2, 0, TAU); c.arc(e.r * 0.22, -e.r * 0.35, e.r * 0.2, 0, TAU); c.fill();
        c.fillStyle = '#e8e2ff';
        c.beginPath(); c.arc(-e.r * 0.22, -e.r * 0.35, 2, 0, TAU); c.arc(e.r * 0.22, -e.r * 0.35, 2, 0, TAU); c.fill();
        c.globalAlpha = 1;
        break;
      }
      case 'golem': {
        // massive stone slabs
        c.fillStyle = mixHex(def.color, '#1a2029', 0.5);
        c.fillRect(-e.r * 0.9, -e.r * 0.7, e.r * 1.8, e.r * 1.5);
        c.fillStyle = col;
        c.fillRect(-e.r * 0.75, -e.r * 0.55, e.r * 1.5, e.r * 1.2);
        // core
        const pulse = 1 + Math.sin(this.time * 4 + e.seed) * 0.2;
        this.drawGlow(c, 0, 0, 16 * pulse, '#ffb36b', 0.7);
        c.fillStyle = '#ffb36b';
        c.beginPath(); c.arc(0, 0, 6 * pulse, 0, TAU); c.fill();
        // cracks
        c.strokeStyle = mixHex(def.color, '#000000', 0.45); c.lineWidth = 2;
        c.beginPath(); c.moveTo(-e.r * 0.75, -e.r * 0.2); c.lineTo(e.r * 0.75, -e.r * 0.1); c.moveTo(-e.r * 0.4, -e.r * 0.55); c.lineTo(-e.r * 0.3, e.r * 0.65); c.stroke();
        // brow eyes
        c.fillStyle = '#ff5d5d';
        c.beginPath(); c.arc(-e.r * 0.3, -e.r * 0.38, 2.8, 0, TAU); c.arc(e.r * 0.3, -e.r * 0.38, 2.8, 0, TAU); c.fill();
        // telegraphed slam ring
        if (e.windT > 0) {
          c.strokeStyle = `rgba(255,120,80,${0.5 + Math.sin(this.time * 25) * 0.3})`;
          c.lineWidth = 3;
          c.beginPath(); c.arc(0, 0, e.r + 34, 0, TAU); c.stroke();
        }
        break;
      }
      case 'dragon': {
        c.rotate(e.faceA);
        const flap = Math.sin(this.time * 6 + e.seed) * 0.5;
        // wings
        c.fillStyle = mixHex(def.color, '#3d1505', 0.45);
        for (const s of [-1, 1]) {
          c.save();
          c.scale(1, s);
          c.beginPath();
          c.moveTo(0, 0);
          c.quadraticCurveTo(e.r * 0.4, e.r * (1.3 + flap * 0.4), e.r * 1.5, e.r * (0.9 + flap * 0.5));
          c.quadraticCurveTo(e.r * 0.9, e.r * 0.5, e.r * 0.7, 0);
          c.closePath(); c.fill();
          c.restore();
        }
        // serpentine body
        c.fillStyle = col;
        c.beginPath(); c.ellipse(0, 0, e.r * 1.1, e.r * 0.62, 0, 0, TAU); c.fill();
        c.fillStyle = mixHex(def.color, '#fff3c2', 0.45);
        c.beginPath(); c.ellipse(e.r * 0.15, e.r * 0.18, e.r * 0.7, e.r * 0.3, 0, 0, TAU); c.fill();
        // horns + maw glow
        c.fillStyle = '#ffe9c4';
        c.beginPath(); c.moveTo(e.r * 0.7, -e.r * 0.3); c.lineTo(e.r * 1.25, -e.r * 0.6); c.lineTo(e.r * 0.9, -e.r * 0.15); c.closePath(); c.fill();
        this.drawGlow(c, e.r * 1.05, 0, 14, '#ffcf5a', 0.8);
        c.fillStyle = '#fff3c2';
        c.beginPath(); c.arc(e.r * 0.55, -e.r * 0.12, 2.6, 0, TAU); c.fill();
        break;
      }
      case 'boss': {
        const v = e.variant ?? 0;
        c.rotate(Math.sin(this.time * 1.4) * 0.05);
        // crown spikes in boss color
        c.fillStyle = mixHex(bossCol, '#1a0d0d', 0.35);
        const spikes = 8;
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * TAU + this.time * 0.4;
          c.save();
          c.rotate(a);
          c.beginPath();
          c.moveTo(e.r * 0.85, -e.r * 0.22);
          c.lineTo(e.r * 1.35, 0);
          c.lineTo(e.r * 0.85, e.r * 0.22);
          c.closePath();
          c.fill();
          c.restore();
        }
        c.fillStyle = col;
        c.beginPath();
        c.arc(0, 0, e.r, 0, TAU);
        c.fill();
        c.strokeStyle = mixHex(bossCol, '#000000', 0.5);
        c.lineWidth = 4;
        c.stroke();
        // variant sigil ring
        c.strokeStyle = 'rgba(255,255,255,0.45)';
        c.lineWidth = 2;
        c.setLineDash(v % 2 === 0 ? [] : [8, 6]);
        c.beginPath();
        c.arc(0, 0, e.r * 0.62, 0, TAU);
        c.stroke();
        c.setLineDash([]);
        // variant cores: serpent slits / khagan war paint / hollow crown / eclipse eye / glass facets
        if (v === 0) {
          c.strokeStyle = '#0b2b26'; c.lineWidth = 3;
          for (let i = -1; i <= 1; i++) {
            c.beginPath(); c.moveTo(i * 12 - 6, -8); c.lineTo(i * 12 + 6, 10); c.stroke();
          }
          c.fillStyle = '#eafff5';
          c.beginPath(); c.ellipse(-e.r * 0.28, -e.r * 0.2, 6, 3.4, 0.3, 0, TAU); c.ellipse(e.r * 0.28, -e.r * 0.2, 6, 3.4, -0.3, 0, TAU); c.fill();
        } else if (v === 1) {
          c.fillStyle = '#2b0d08';
          c.beginPath(); c.moveTo(-e.r * 0.5, -e.r * 0.25); c.lineTo(e.r * 0.5, -e.r * 0.25); c.lineTo(0, e.r * 0.1); c.closePath(); c.fill();
          c.fillStyle = '#ffd24a';
          c.beginPath(); c.arc(-e.r * 0.25, -e.r * 0.12, 4, 0, TAU); c.arc(e.r * 0.25, -e.r * 0.12, 4, 0, TAU); c.fill();
        } else if (v === 2) {
          c.strokeStyle = '#e8fbff'; c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(-16, -e.r * 0.45); c.lineTo(-8, -e.r * 0.7); c.lineTo(0, -e.r * 0.45); c.lineTo(8, -e.r * 0.7); c.lineTo(16, -e.r * 0.45); c.stroke();
          c.fillStyle = '#0d2433';
          c.beginPath(); c.arc(-e.r * 0.28, 0, 5, 0, TAU); c.arc(e.r * 0.28, 0, 5, 0, TAU); c.fill();
          c.fillStyle = '#bff1ff';
          c.beginPath(); c.arc(-e.r * 0.28, 0, 2.2, 0, TAU); c.arc(e.r * 0.28, 0, 2.2, 0, TAU); c.fill();
        } else if (v === 3) {
          c.fillStyle = '#1d1503';
          c.beginPath(); c.arc(0, -e.r * 0.1, e.r * 0.3, 0, TAU); c.fill();
          c.fillStyle = '#ffe9a8';
          c.beginPath(); c.arc(0, -e.r * 0.1, e.r * 0.3, -0.6, 0.9); c.lineTo(0, -e.r * 0.1); c.closePath(); c.fill();
          c.fillStyle = '#1d1503';
          c.beginPath(); c.arc(-e.r * 0.4, e.r * 0.3, 3, 0, TAU); c.arc(e.r * 0.4, e.r * 0.3, 3, 0, TAU); c.fill();
        } else {
          c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.6;
          for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI;
            c.beginPath(); c.moveTo(Math.cos(a) * -e.r * 0.55, Math.sin(a) * -e.r * 0.55); c.lineTo(Math.cos(a) * e.r * 0.55, Math.sin(a) * e.r * 0.55); c.stroke();
          }
          c.fillStyle = '#3d2c10';
          c.beginPath(); c.arc(-e.r * 0.22, -e.r * 0.15, 4.5, 0, TAU); c.arc(e.r * 0.22, -e.r * 0.15, 4.5, 0, TAU); c.arc(0, e.r * 0.28, 3.4, 0, TAU); c.fill();
        }
        break;
      }
    }
    c.restore();

    // frozen crystals
    if (e.frozen > 0) {
      c.fillStyle = 'rgba(191,230,255,0.85)';
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + 0.5;
        const fx = e.x + Math.cos(a) * e.r * 0.7;
        const fy = e.y + Math.sin(a) * e.r * 0.7 - 4;
        c.beginPath();
        c.moveTo(fx, fy - 6);
        c.lineTo(fx + 4, fy + 3);
        c.lineTo(fx - 4, fy + 3);
        c.closePath();
        c.fill();
      }
    }

    // hp bar + nameplate
    if (e.spawn <= 0 && e.hp < e.maxHp) {
      const w = e.r * 2;
      const pct = clamp(e.hp / e.maxHp, 0, 1);
      c.fillStyle = 'rgba(0,0,0,0.6)';
      c.fillRect(e.x - w / 2, e.y - e.r - 12, w, 4.5);
      c.fillStyle = pct > 0.5 ? '#7ddb6f' : pct > 0.25 ? '#ffd24a' : '#ff6b5d';
      c.fillRect(e.x - w / 2, e.y - e.r - 12, w * pct, 4.5);
    }
    if (e.elite || e.kind === 'boss') {
      c.font = '700 11px Cinzel, Georgia, serif';
      c.textAlign = 'center';
      c.fillStyle = 'rgba(0,0,0,0.7)';
      c.fillText(e.name, e.x + 1, e.y - e.r - 17);
      c.fillStyle = '#ffd97a';
      c.fillText(e.name, e.x, e.y - e.r - 18);
    }
  }

  private drawPlayer(c: CanvasRenderingContext2D) {
    const p = this.p;
    if (!p) return;
    const cls = this.classDef;
    if (p.dead) return;

    // dash ghosts
    for (const g of this.ghosts) {
      c.globalAlpha = g.a * 0.5;
      c.fillStyle = cls.color;
      c.beginPath();
      c.arc(g.x, g.y, p.r * 0.9, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;

    // storm aura
    if (p.stormT > 0) {
      c.save();
      c.strokeStyle = 'rgba(230,194,106,0.35)';
      c.lineWidth = 3;
      c.setLineDash([16, 14]);
      c.lineDashOffset = -this.time * 90;
      c.beginPath();
      c.arc(p.x, p.y, 168, 0, TAU);
      c.stroke();
      c.setLineDash([]);
      this.drawGlow(c, p.x, p.y, 150, '#e6c26a', 0.12);
      c.restore();
    }

    // legacy ability visuals
    if (this.decoy) {
      const d0 = this.decoy;
      const k = d0.t / d0.dur;
      c.save();
      c.globalAlpha = 0.55 + Math.sin(this.time * 9) * 0.15;
      this.drawGlow(c, d0.x, d0.y, 46, '#e6c26a', 0.5);
      c.fillStyle = 'rgba(230,194,106,0.55)';
      c.beginPath();
      c.arc(d0.x, d0.y, p.r, 0, TAU);
      c.fill();
      c.strokeStyle = '#ffe9a8';
      c.lineWidth = 2;
      c.setLineDash([4, 5]);
      c.beginPath();
      c.arc(d0.x, d0.y, p.r + 8 + k * 6, 0, TAU);
      c.stroke();
      c.setLineDash([]);
      c.restore();
    }
    if (p.wardT > 0) {
      c.save();
      c.strokeStyle = `rgba(191,230,255,${0.55 + Math.sin(this.time * 8) * 0.2})`;
      c.lineWidth = 4;
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + this.time * 0.8;
        const x = p.x + Math.cos(a) * (p.r + 16);
        const y = p.y + Math.sin(a) * (p.r + 16);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.stroke();
      this.drawGlow(c, p.x, p.y, 44, '#6fb7ff', 0.35);
      c.restore();
    }
    if (p.riteT > 0) this.drawGlow(c, p.x, p.y, 48 + Math.sin(this.time * 10) * 5, '#ff6b3c', 0.5);
    if (p.tideT > 0) {
      c.save();
      c.strokeStyle = 'rgba(85,217,232,0.5)';
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(p.x, p.y, p.r + 12 + Math.sin(this.time * 5) * 3, 0, TAU);
      c.stroke();
      c.restore();
    }
    if (p.focusT > 0) {
      c.save();
      c.strokeStyle = 'rgba(223,244,255,0.75)';
      c.lineWidth = 1.5;
      c.setLineDash([2, 6]);
      c.beginPath();
      c.arc(p.x, p.y, 155, 0, TAU);
      c.stroke();
      c.setLineDash([]);
      c.restore();
    }
    if (p.stasisT > 0) {
      c.save();
      c.strokeStyle = 'rgba(182,140,255,0.6)';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(p.x, p.y, 40 + (2 - p.stasisT) * 900, 0, TAU);
      c.stroke();
      c.restore();
    }
    if (p.tempestT > 0) {
      c.save();
      c.strokeStyle = `rgba(110,243,255,${0.5 + Math.sin(this.time * 14) * 0.25})`;
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(p.x, p.y, p.r + 14 + Math.sin(this.time * 10) * 4, 0, TAU);
      c.stroke();
      this.drawGlow(c, p.x, p.y, 52, '#6ef3ff', 0.35);
      c.restore();
    }
    if (p.pyreT > 0) {
      this.drawGlow(c, p.x, p.y, 60 + Math.sin(this.time * 9) * 7, '#ff5a3c', 0.5);
      c.save();
      c.strokeStyle = 'rgba(255,196,107,0.6)';
      c.lineWidth = 2.5;
      c.setLineDash([10, 7]);
      c.lineDashOffset = -this.time * 60;
      c.beginPath();
      c.arc(p.x, p.y, 170, 0, TAU);
      c.stroke();
      c.setLineDash([]);
      c.restore();
    }

    // buff aura
    if (p.buffT > 0) {
      const pulse = 1 + Math.sin(this.time * 6) * 0.12;
      this.drawGlow(c, p.x, p.y, 40 * pulse, '#ffd97a', 0.4);
    }

    const moving = Math.hypot(p.vx, p.vy) > 30;
    const bob = moving ? Math.sin(p.runT * 11) * 1.8 : Math.sin(this.time * 2.4) * 0.8;

    // shadow
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath();
    c.ellipse(p.x, p.y + p.r * 0.9, p.r * 1.1, p.r * 0.4, 0, 0, TAU);
    c.fill();

    c.save();
    if (p.iFrames > 0 && p.dashT <= 0) {
      c.globalAlpha = 0.55 + 0.45 * Math.sin(this.time * 42);
    }
    c.translate(p.x, p.y + bob);

    // weapon (under body for behind-look on backswing)
    const weaponAng = this.weaponAngle();
    this.drawWeapon(c, weaponAng);

    // Class silhouettes are drawn facing right, then rotated into the hero's direction.
    c.save();
    c.rotate(p.facing);
    const stride = moving ? Math.sin(p.runT * 11) * 2 : 0;
    // A shared trailing cloak gives each hero a readable moving silhouette.
    c.fillStyle = mixHex(cls.color, '#090c13', 0.62);
    c.beginPath();
    c.moveTo(-3, -12);
    c.quadraticCurveTo(-19, -9 + stride, -18, 0);
    c.quadraticCurveTo(-17, 11 - stride, -2, 13);
    c.quadraticCurveTo(-10, 2, -3, -12);
    c.closePath();
    c.fill();

    if (cls.id === 'kensei') {
      // Layered traveling kimono, headband, and topknot.
      c.fillStyle = '#3d1828';
      c.beginPath();
      c.moveTo(-7, -11); c.lineTo(7, -11); c.lineTo(12, 0); c.lineTo(5, 12); c.lineTo(-8, 10); c.closePath();
      c.fill();
      c.fillStyle = cls.color;
      c.beginPath();
      c.moveTo(-3, -12); c.lineTo(8, -10); c.lineTo(11, 0); c.lineTo(4, 10); c.lineTo(-6, 8); c.closePath();
      c.fill();
      c.fillStyle = '#ffd9a0';
      c.fillRect(-2, -10, 4, 19);
      c.fillStyle = '#24111a';
      c.fillRect(-4, -1, 12, 3);
      c.fillStyle = '#f3c494';
      c.beginPath(); c.arc(10, 0, 7, 0, TAU); c.fill();
      c.fillStyle = '#18121c';
      c.beginPath(); c.arc(8, -4, 7, Math.PI * 0.6, Math.PI * 1.72); c.fill();
      c.beginPath(); c.arc(4, -7, 3.4, 0, TAU); c.fill();
      c.strokeStyle = '#ffdfdf'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(5, -2.5); c.lineTo(14, -2.5); c.stroke();
      c.fillStyle = '#ff6b6b'; c.fillRect(5, -7.5, 10, 2.2);
    } else if (cls.id === 'shieldthane') {
      // Broad rune-plate with a fur mantle and a horned iron helm.
      c.fillStyle = '#5a4432';
      c.beginPath(); c.ellipse(-1, 0, 14, 13, 0, 0, TAU); c.fill();
      c.fillStyle = '#49627d';
      c.beginPath();
      c.moveTo(-7, -12); c.lineTo(7, -12); c.lineTo(13, -5); c.lineTo(11, 8); c.lineTo(-8, 10); c.lineTo(-12, 2); c.closePath();
      c.fill();
      c.strokeStyle = '#b9d8f5'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-4, -9); c.lineTo(-4, 8); c.moveTo(2, -10); c.lineTo(2, 9); c.moveTo(8, -7); c.lineTo(8, 6); c.stroke();
      c.fillStyle = '#26384e';
      c.beginPath(); c.arc(10, 0, 8, 0, TAU); c.fill();
      c.strokeStyle = '#dbeeff'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#dbeeff';
      c.beginPath(); c.moveTo(5, -5); c.lineTo(1, -10); c.lineTo(8, -7); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(13, -6); c.lineTo(17, -11); c.lineTo(17, -4); c.closePath(); c.fill();
      c.fillStyle = '#172331'; c.fillRect(6, -3, 9, 5);
      c.fillStyle = '#6fb7ff'; c.fillRect(11, -2, 2, 1.4);
    } else if (cls.id === 'jaguar') {
      // Feather mantle and a jaguar mask with obsidian spots.
      c.fillStyle = '#1d4b3b';
      for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.ellipse(-7 + i * 3, i * 2.2, 7, 3.8, i * 0.25, 0, TAU); c.fill();
      }
      c.fillStyle = '#c07024';
      c.beginPath();
      c.moveTo(-6, -12); c.lineTo(7, -12); c.lineTo(12, -2); c.lineTo(7, 11); c.lineTo(-8, 9); c.lineTo(-10, -3); c.closePath();
      c.fill();
      c.fillStyle = '#2e281c';
      [[-2, -7], [3, -3], [-4, 2], [2, 6], [7, 2]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); });
      c.fillStyle = '#d99b3d';
      c.beginPath(); c.arc(10, 0, 8, 0, TAU); c.fill();
      c.fillStyle = '#2a2418';
      c.beginPath(); c.moveTo(4, -5); c.lineTo(7, -9); c.lineTo(10, -5); c.closePath(); c.moveTo(10, -5); c.lineTo(14, -9); c.lineTo(17, -4); c.closePath(); c.fill();
      c.fillStyle = '#d6ff72'; c.beginPath(); c.arc(11, -2.5, 1.6, 0, TAU); c.arc(15, -2.5, 1.6, 0, TAU); c.fill();
      c.strokeStyle = '#2a2418'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(11, 3); c.lineTo(17, 3); c.stroke();
    } else if (cls.id === 'tidecaller') {
      // Nacre armor, a pearl crown, and a translucent mantle that reads at speed.
      c.fillStyle = '#244f61';
      c.beginPath(); c.moveTo(-8, -11); c.lineTo(6, -12); c.lineTo(12, 5); c.lineTo(4, 12); c.lineTo(-10, 8); c.closePath(); c.fill();
      c.fillStyle = '#55d9e8';
      c.beginPath(); c.moveTo(-4, -10); c.lineTo(8, -8); c.lineTo(9, 7); c.lineTo(-6, 8); c.closePath(); c.fill();
      c.strokeStyle = '#d7a6ff'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-3, -8); c.lineTo(3, 6); c.moveTo(4, -8); c.lineTo(-2, 6); c.stroke();
      c.fillStyle = '#d8b8e8'; c.beginPath(); c.arc(10, 0, 7.5, 0, TAU); c.fill();
      c.fillStyle = '#55d9e8'; c.beginPath(); c.arc(8, -8, 3, 0, TAU); c.arc(14, -7, 2.4, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(125,235,245,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-7, -10); c.quadraticCurveTo(-21, -2, -8, 8); c.stroke();
      c.fillStyle = '#1a7891'; c.beginPath(); c.arc(11, -2, 1.6, 0, TAU); c.arc(15, -2, 1.6, 0, TAU); c.fill();
    } else if (cls.id === 'riftblade') {
      // Angular void leathers and a fractured star-mask.
      c.fillStyle = '#271b45';
      c.beginPath(); c.moveTo(-10, -13); c.lineTo(4, -12); c.lineTo(12, 2); c.lineTo(4, 13); c.lineTo(-12, 8); c.closePath(); c.fill();
      c.strokeStyle = '#b68cff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-8, -8); c.lineTo(7, 8); c.moveTo(5, -8); c.lineTo(-6, 7); c.stroke();
      c.fillStyle = '#e8d8ff'; c.beginPath(); c.moveTo(4, -10); c.lineTo(16, -4); c.lineTo(12, 7); c.lineTo(3, 4); c.closePath(); c.fill();
      c.fillStyle = '#25183d'; c.beginPath(); c.moveTo(7, -5); c.lineTo(16, -3); c.lineTo(10, 0); c.closePath(); c.fill();
      c.fillStyle = '#b68cff'; c.beginPath(); c.arc(12, -2, 1.8, 0, TAU); c.fill();
      c.strokeStyle = '#d3b5ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -13); c.lineTo(-1, -19); c.lineTo(3, -12); c.stroke();
    } else if (cls.id === 'stormwarden') {
      // Copper coil plate crackling with stormlight, lightning-crest helm.
      c.fillStyle = '#1d3a44';
      c.beginPath(); c.moveTo(-8, -12); c.lineTo(7, -12); c.lineTo(13, 0); c.lineTo(6, 12); c.lineTo(-9, 10); c.closePath(); c.fill();
      c.strokeStyle = '#6ef3ff'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-5, -9); c.lineTo(-1, -2); c.lineTo(-5, 5); c.moveTo(3, -9); c.lineTo(7, -1); c.lineTo(3, 7); c.stroke();
      c.fillStyle = '#fff6a8';
      c.beginPath(); c.moveTo(8, -13); c.lineTo(12, -19); c.lineTo(15, -11); c.closePath(); c.fill();
      c.fillStyle = '#274b56'; c.beginPath(); c.arc(10, 0, 7.5, 0, TAU); c.fill();
      c.strokeStyle = '#bff6ff'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = '#bff6ff'; c.beginPath(); c.arc(11, -2.5, 1.7, 0, TAU); c.arc(15, -2.5, 1.7, 0, TAU); c.fill();
      c.strokeStyle = '#fff6a8'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6, 4); c.lineTo(16, 4); c.stroke();
    } else if (cls.id === 'drakewarden') {
      // Ashen scale-mail with a furnace core and drake-horn helm.
      c.fillStyle = '#4a1a10';
      c.beginPath(); c.moveTo(-9, -12); c.lineTo(6, -13); c.lineTo(13, 2); c.lineTo(5, 13); c.lineTo(-11, 9); c.closePath(); c.fill();
      c.fillStyle = '#7a2b18';
      c.beginPath(); c.moveTo(-4, -10); c.lineTo(8, -9); c.lineTo(9, 8); c.lineTo(-7, 8); c.closePath(); c.fill();
      c.strokeStyle = '#ffc46b'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-4, -4); c.lineTo(8, -4); c.moveTo(-4, 2); c.lineTo(8, 2); c.stroke();
      const pulse = 1 + Math.sin(this.time * 5) * 0.2;
      this.drawGlow(c, 2, -1, 9 * pulse, '#ff5a3c', 0.7);
      c.fillStyle = '#ffd9a0'; c.beginPath(); c.arc(2, -1, 2.6 * pulse, 0, TAU); c.fill();
      c.fillStyle = '#2b120b'; c.beginPath(); c.arc(11, 0, 7.5, 0, TAU); c.fill();
      c.fillStyle = '#ffe9c4';
      c.beginPath(); c.moveTo(6, -5); c.lineTo(2, -11); c.lineTo(9, -8); c.closePath(); c.moveTo(14, -6); c.lineTo(18, -12); c.lineTo(18, -4); c.closePath(); c.fill();
      c.fillStyle = '#ff8a3d'; c.beginPath(); c.arc(11, -1.5, 1.8, 0, TAU); c.arc(15, -1.5, 1.8, 0, TAU); c.fill();
    } else {
      // Flowing desert robes, wrapped hood, and a luminous veil jewel.
      c.fillStyle = '#6e5630';
      c.beginPath();
      c.moveTo(-9, -12); c.lineTo(6, -12); c.lineTo(13, 10); c.lineTo(-13, 10); c.closePath(); c.fill();
      c.fillStyle = '#e6c26a';
      c.beginPath();
      c.moveTo(-4, -12); c.lineTo(7, -10); c.lineTo(10, 7); c.lineTo(-9, 7); c.closePath(); c.fill();
      c.fillStyle = '#54c9b4'; c.fillRect(-6, -1, 16, 2.6);
      c.fillStyle = '#c89362'; c.beginPath(); c.arc(10, 0, 7.5, 0, TAU); c.fill();
      c.fillStyle = '#e6c26a'; c.beginPath(); c.arc(9, -2, 8.5, Math.PI * 0.7, Math.PI * 1.9); c.fill();
      c.fillStyle = '#382c25'; c.fillRect(6, -1, 11, 4.5);
      c.fillStyle = '#54c9b4'; c.beginPath(); c.arc(12, -6, 2.2, 0, TAU); c.fill();
      this.drawGlow(c, 12, -6, 7, '#54c9b4', 0.6);
    }
    c.restore();

    // Shieldthane carries a layered round shield that swings independently from their stance.
    if (cls.id === 'shieldthane') {
      const sa = p.facing + 2.5;
      c.save();
      c.translate(Math.cos(sa) * (p.r + 7), Math.sin(sa) * (p.r + 7));
      c.fillStyle = '#2c3d55';
      c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
      c.strokeStyle = '#cfe6ff'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = '#6fb7ff'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.moveTo(0, -10); c.lineTo(0, 10); c.stroke();
      c.fillStyle = '#dbeeff'; c.beginPath(); c.arc(0, 0, 3.3, 0, TAU); c.fill();
      c.restore();
    }
    c.restore();

    // hurt ring
    if (p.hurtT > 0) {
      c.strokeStyle = `rgba(255,90,90,${p.hurtT * 2})`;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(p.x, p.y, p.r + 8, 0, TAU);
      c.stroke();
    }
  }

  private weaponAngle(): number {
    const p = this.p!;
    const cls = this.classDef;
    if (p.swingT >= 0) {
      const prog = clamp(p.swingT / p.swingDur, 0, 1);
      const a0 = p.swingAim - cls.arc * 0.62;
      const sweep = cls.arc * 1.24;
      return a0 + sweep * easeOut(prog);
    }
    return p.facing + 0.55 + Math.sin(this.time * 2.4) * 0.06;
  }

  private drawWeapon(c: CanvasRenderingContext2D, ang: number) {
    const cls = this.classDef;
    const L = (cls.range + this.p!.rangeBonus) * 0.9;
    c.save();
    c.rotate(ang);
    c.translate(6, 0);
    switch (cls.id) {
      case 'kensei': {
        c.strokeStyle = 'rgba(255,107,107,0.45)';
        c.lineWidth = 7;
        c.beginPath();
        c.moveTo(8, 0);
        c.lineTo(L, 0);
        c.stroke();
        c.strokeStyle = '#eef3ff';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(8, 0);
        c.lineTo(L, -3);
        c.stroke();
        c.fillStyle = '#8a6a22';
        c.fillRect(4, -4, 4, 8);
        break;
      }
      case 'shieldthane': {
        c.strokeStyle = '#c8a06a';
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(6, 0);
        c.lineTo(L * 0.78, 0);
        c.stroke();
        c.fillStyle = '#cfd8ea';
        c.beginPath();
        c.moveTo(L * 0.55, 0);
        c.quadraticCurveTo(L * 1.02, -L * 0.3, L * 0.95, -L * 0.02);
        c.quadraticCurveTo(L * 1.05, L * 0.12, L * 0.55, L * 0.14);
        c.closePath();
        c.fill();
        c.strokeStyle = '#6fb7ff';
        c.lineWidth = 1.5;
        c.stroke();
        break;
      }
      case 'jaguar': {
        c.strokeStyle = '#8a5a2a';
        c.lineWidth = 7;
        c.beginPath();
        c.moveTo(6, 0);
        c.lineTo(L * 0.88, 0);
        c.stroke();
        c.fillStyle = '#16211a';
        for (let i = 0; i < 5; i++) {
          const tx = L * 0.24 + i * L * 0.14;
          c.beginPath();
          c.moveTo(tx, -4.5);
          c.lineTo(tx + 6, -9.5);
          c.lineTo(tx + 10, -4.5);
          c.closePath();
          c.fill();
        }
        c.fillStyle = '#8ce07a';
        c.beginPath();
        c.arc(L * 0.88, 0, 3, 0, TAU);
        c.fill();
        break;
      }
      case 'tidecaller': {
        c.strokeStyle = '#d7a6ff'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(7, 0); c.lineTo(L * 0.72, 0); c.stroke();
        c.strokeStyle = '#55d9e8'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(L * 0.62, 0); c.lineTo(L * 0.95, -10); c.moveTo(L * 0.62, 0); c.lineTo(L * 0.95, 0); c.moveTo(L * 0.62, 0); c.lineTo(L * 0.95, 10); c.stroke();
        c.fillStyle = '#d7a6ff'; c.beginPath(); c.arc(8, 0, 3.5, 0, TAU); c.fill();
        break;
      }
      case 'riftblade': {
        c.strokeStyle = 'rgba(182,140,255,0.42)'; c.lineWidth = 8;
        c.beginPath(); c.moveTo(7, 0); c.lineTo(L, -2); c.stroke();
        c.strokeStyle = '#e8d8ff'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(7, 0); c.lineTo(L, -2); c.stroke();
        c.strokeStyle = '#b68cff'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(L * 0.45, -6); c.lineTo(L * 0.66, 4); c.moveTo(L * 0.68, -7); c.lineTo(L * 0.85, 3); c.stroke();
        break;
      }
      case 'stormwarden': {
        c.strokeStyle = '#8a6a4a'; c.lineWidth = 5;
        c.beginPath(); c.moveTo(6, 0); c.lineTo(L * 0.7, 0); c.stroke();
        c.fillStyle = '#3d5a66';
        c.beginPath(); c.moveTo(L * 0.62, -11); c.lineTo(L * 0.98, -11); c.lineTo(L * 0.98, 11); c.lineTo(L * 0.62, 11); c.closePath(); c.fill();
        c.strokeStyle = '#6ef3ff'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(L * 0.7, -11); c.lineTo(L * 0.78, 0); c.lineTo(L * 0.7, 11); c.stroke();
        c.fillStyle = '#fff6a8'; c.beginPath(); c.arc(L * 0.8, 0, 3, 0, TAU); c.fill();
        break;
      }
      case 'drakewarden': {
        c.strokeStyle = 'rgba(255,90,60,0.4)'; c.lineWidth = 9;
        c.beginPath(); c.moveTo(7, 0); c.lineTo(L, 0); c.stroke();
        c.fillStyle = '#c8b08a';
        c.beginPath(); c.moveTo(7, -4); c.lineTo(L * 0.98, -2); c.lineTo(L * 1.06, 0); c.lineTo(L * 0.98, 2); c.lineTo(7, 4); c.closePath(); c.fill();
        c.strokeStyle = '#ff5a3c'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(L * 0.3, 0); c.lineTo(L * 0.95, 0); c.stroke();
        c.fillStyle = '#ffc46b'; c.beginPath(); c.arc(7, 0, 3.6, 0, TAU); c.fill();
        break;
      }
      default: {
        // sandseer khopesh
        c.strokeStyle = 'rgba(84,201,180,0.4)';
        c.lineWidth = 8;
        c.beginPath();
        c.moveTo(8, 0);
        c.quadraticCurveTo(L * 0.7, -4, L, -L * 0.16);
        c.stroke();
        c.strokeStyle = '#ffe9a8';
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(8, 0);
        c.quadraticCurveTo(L * 0.7, -4, L, -L * 0.16);
        c.stroke();
        c.fillStyle = '#54c9b4';
        c.beginPath();
        c.arc(6, 0, 3.4, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }

  private drawShot(c: CanvasRenderingContext2D, s: Shot) {
    const hostile = s.from === 'e';
    if (hostile) {
      // Hazard bolts get a pulsing danger ring + white core so they can never
      // be confused with pickups, boss bodies or telegraphs.
      const pulse = 1 + Math.sin(this.time * 18) * 0.12;
      this.drawGlow(c, s.x, s.y, s.r * 4 * pulse, HAZARD_COLOR, 0.85);
      c.strokeStyle = HAZARD_COLOR;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(s.x, s.y, s.r + 3, 0, TAU);
      c.stroke();
      c.fillStyle = HAZARD_COLOR;
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, TAU);
      c.fill();
      c.fillStyle = HAZARD_CORE;
      c.beginPath();
      c.arc(s.x, s.y, s.r * 0.5, 0, TAU);
      c.fill();
      return;
    }
    this.drawGlow(c, s.x, s.y, s.r * 3.2, s.color, 0.7);

    // Differentiated visual styles for hero archetypes
    if (s.kind === 'crescent') {
      // Spinning crescent blade
      c.save();
      c.translate(s.x, s.y);
      c.rotate(Math.atan2(s.vy, s.vx));
      c.fillStyle = s.color;
      c.beginPath();
      c.arc(0, 0, s.r * 1.3, -Math.PI * 0.45, Math.PI * 0.45);
      c.quadraticCurveTo(s.r * 0.3, 0, Math.cos(-Math.PI * 0.45) * s.r * 1.3, Math.sin(-Math.PI * 0.45) * s.r * 1.3);
      c.closePath();
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.5;
      c.stroke();
      c.restore();
      return;
    }

    if (s.kind === 'chakram') {
      // Spinning glass sand-chakram
      c.save();
      c.translate(s.x, s.y);
      c.rotate(this.time * 16);
      c.strokeStyle = s.color;
      c.lineWidth = 3.5;
      c.beginPath();
      c.arc(0, 0, s.r, 0, TAU);
      c.stroke();
      // Internal glass teeth
      c.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU;
        c.beginPath();
        c.arc(Math.cos(a) * (s.r * 0.6), Math.sin(a) * (s.r * 0.6), 2.2, 0, TAU);
        c.fill();
      }
      c.restore();
      return;
    }

    if (s.kind === 'trident') {
      // Piercing water spear / coral trident head
      c.save();
      c.translate(s.x, s.y);
      c.rotate(Math.atan2(s.vy, s.vx));
      c.fillStyle = s.color;
      c.beginPath();
      c.moveTo(s.r * 1.6, 0);
      c.lineTo(-s.r, -s.r * 0.75);
      c.lineTo(-s.r * 0.4, 0);
      c.lineTo(-s.r, s.r * 0.75);
      c.closePath();
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 2;
      c.stroke();
      c.restore();
      return;
    }

    if (s.kind === 'firewave') {
      // Expanding curved flame wave
      c.save();
      c.translate(s.x, s.y);
      c.rotate(Math.atan2(s.vy, s.vx));
      c.fillStyle = s.color;
      c.beginPath();
      c.arc(0, 0, s.r * 1.4, -Math.PI * 0.5, Math.PI * 0.5);
      c.quadraticCurveTo(-s.r * 0.2, 0, Math.cos(-Math.PI * 0.5) * s.r * 1.4, Math.sin(-Math.PI * 0.5) * s.r * 1.4);
      c.closePath();
      c.fill();
      c.fillStyle = '#ffd24a';
      c.beginPath();
      c.arc(0, 0, s.r * 0.7, -Math.PI * 0.4, Math.PI * 0.4);
      c.closePath();
      c.fill();
      c.restore();
      return;
    }

    // Default friendly projectile
    c.fillStyle = s.color;
    c.beginPath();
    c.arc(s.x, s.y, s.r, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath();
    c.arc(s.x, s.y, s.r * 0.45, 0, TAU);
    c.fill();
  }

  private drawSlash(c: CanvasRenderingContext2D, s: Slash) {
    const k = s.t / s.dur;
    const alpha = 1 - k;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.translate(s.x, s.y);
    c.strokeStyle = rgba(s.color.startsWith('#') ? s.color : '#ffffff', alpha * 0.8);
    c.lineWidth = (1 - k) * 12 + 3;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(0, 0, s.r * (0.8 + k * 0.25), s.a0, s.a0 + (s.a1 - s.a0) * Math.min(1, k * 1.8));
    c.stroke();
    c.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
    c.lineWidth = (1 - k) * 5 + 1;
    c.beginPath();
    c.arc(0, 0, s.r * (0.8 + k * 0.25), s.a0, s.a0 + (s.a1 - s.a0) * Math.min(1, k * 1.8));
    c.stroke();
    c.restore();
  }

  private drawParticles(c: CanvasRenderingContext2D) {
    for (const pt of this.parts) {
      const k = pt.t / pt.dur;
      const alpha = 1 - k;
      if (pt.kind === 'dot') {
        c.globalAlpha = alpha;
        c.fillStyle = pt.color;
        c.beginPath();
        c.arc(pt.x, pt.y, pt.size * (1 - k * 0.5), 0, TAU);
        c.fill();
      } else if (pt.kind === 'shard') {
        c.globalAlpha = alpha;
        c.fillStyle = pt.color;
        c.save();
        c.translate(pt.x, pt.y);
        c.rotate(pt.rot);
        c.beginPath();
        c.moveTo(0, -pt.size);
        c.lineTo(pt.size * 0.8, pt.size);
        c.lineTo(-pt.size * 0.8, pt.size);
        c.closePath();
        c.fill();
        c.restore();
      } else if (pt.kind === 'petal') {
        c.globalAlpha = alpha;
        c.fillStyle = pt.color;
        c.save();
        c.translate(pt.x, pt.y);
        c.rotate(pt.rot);
        c.beginPath();
        c.ellipse(0, 0, pt.size, pt.size * 0.5, 0, 0, TAU);
        c.fill();
        c.restore();
      }
    }
    c.globalAlpha = 1;
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (const pt of this.parts) {
      const k = pt.t / pt.dur;
      const alpha = 1 - k;
      if (pt.kind === 'spark') {
        c.globalAlpha = alpha;
        c.strokeStyle = pt.color;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(pt.x, pt.y);
        c.lineTo(pt.x - pt.vx * 0.035, pt.y - pt.vy * 0.035);
        c.stroke();
      } else if (pt.kind === 'ring') {
        c.globalAlpha = alpha * 0.9;
        c.strokeStyle = pt.color;
        c.lineWidth = (1 - k) * 5 + 1;
        c.beginPath();
        c.arc(pt.x, pt.y, pt.size + k * pt.size * 3.2, 0, TAU);
        c.stroke();
      }
    }
    c.restore();
    c.globalAlpha = 1;
  }

  private drawFloater(c: CanvasRenderingContext2D, f: Floater) {
    const k = f.t / f.dur;
    const alpha = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
    const rise = f.t * 55;
    const scale = f.crit && f.t < 0.12 ? 1 + (0.12 - f.t) * 5 : 1;
    c.save();
    c.globalAlpha = alpha;
    c.translate(f.x, f.y - rise);
    c.scale(scale, scale);
    c.font = f.crit ? `900 ${f.size}px Cinzel, Georgia, serif` : `800 ${f.size}px "Alegreya Sans", sans-serif`;
    c.textAlign = 'center';
    c.lineWidth = 3;
    c.strokeStyle = 'rgba(0,0,0,0.65)';
    c.strokeText(f.text, 0, 0);
    c.fillStyle = f.color;
    c.fillText(f.text, 0, 0);
    c.restore();
  }
}
