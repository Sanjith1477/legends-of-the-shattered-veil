export interface ClassDef {
  id: string;
  name: string;
  culture: string;
  epithet: string;
  lore: string;
  weaponName: string;
  color: string; // primary
  color2: string; // secondary
  hp: number;
  speed: number;
  dmg: number;
  atkCd: number;
  range: number;
  arc: number; // swing arc in radians
  crit: number;
  abilityName: string;
  abilityCd: number;
  abilityDesc: string;
  abilityKind: 'petals' | 'nova' | 'bolts' | 'storm' | 'tide' | 'rift' | 'tempest' | 'pyre';
  unlockWave: number;
}

export const CLASSES: ClassDef[] = [
  {
    id: 'kensei',
    name: 'Kensei',
    culture: 'Yamashiro Isles',
    epithet: 'The Petal Storm',
    lore: 'Blade-dancers of the eastern isles, said to cut the rain before it falls.',
    weaponName: 'Moonlit Katana',
    color: '#ff6b6b',
    color2: '#ffd9a0',
    hp: 92,
    speed: 252,
    dmg: 12,
    atkCd: 0.3,
    range: 80,
    arc: 1.85,
    crit: 0.18,
    abilityName: 'Thousand Petals',
    abilityCd: 7,
    abilityDesc: 'Unleash a 360° blade storm that shreds every foe around you.',
    abilityKind: 'petals',
    unlockWave: 0,
  },
  {
    id: 'shieldthane',
    name: 'Shieldthane',
    culture: 'Skaldheim Fjords',
    epithet: 'The Unbroken Wall',
    lore: 'Oath-sworn wardens of the frozen fjords, unbroken as the glacier itself.',
    weaponName: 'Runed Beard Axe',
    color: '#6fb7ff',
    color2: '#dbeeff',
    hp: 135,
    speed: 200,
    dmg: 19,
    atkCd: 0.5,
    range: 86,
    arc: 2.3,
    crit: 0.08,
    abilityName: 'Frostwake Nova',
    abilityCd: 9,
    abilityDesc: 'Shatter the earth in frozen runes — damages and freezes all nearby foes.',
    abilityKind: 'nova',
    unlockWave: 8,
  },
  {
    id: 'jaguar',
    name: 'Jaguar Knight',
    culture: 'Tlanex Sun Empire',
    epithet: 'Claw of the Fifth Sun',
    lore: 'Champions of the sun pyramid, their blood fed by the light of the fifth sun.',
    weaponName: 'Obsidian Macuahuitl',
    color: '#ff9d3c',
    color2: '#8ce07a',
    hp: 105,
    speed: 232,
    dmg: 15,
    atkCd: 0.38,
    range: 82,
    arc: 2.0,
    crit: 0.14,
    abilityName: 'Wrath of the Fifth Sun',
    abilityCd: 8,
    abilityDesc: 'Hurl ten solar bolts in all directions that pierce through enemies.',
    abilityKind: 'bolts',
    unlockWave: 15,
  },
  {
    id: 'sandseer',
    name: 'Sandseer',
    culture: 'Zahraan Dune Sea',
    epithet: 'Voice of the Dunes',
    lore: 'Veiled wanderers of the endless dunes who cast curved glass chakrams that return on the wind.',
    weaponName: 'Glass Sand-Chakram',
    color: '#e6c26a',
    color2: '#54c9b4',
    hp: 98,
    speed: 226,
    dmg: 13,
    atkCd: 0.33,
    range: 88,
    arc: 2.0,
    crit: 0.12,
    abilityName: 'Dune Requiem',
    abilityCd: 9,
    abilityDesc: 'Summon a whirling sandstorm that shreds and slows nearby foes for 4s.',
    abilityKind: 'storm',
    unlockWave: 25,
  },
  {
    id: 'tidecaller',
    name: 'Tidecaller',
    culture: 'Nacrean Atolls',
    epithet: 'The Living Undertow',
    lore: 'Pearl-bonded navigators who command moon tides and draw strength from the deep.',
    weaponName: 'Coral Trident',
    color: '#55d9e8',
    color2: '#d7a6ff',
    hp: 116,
    speed: 214,
    dmg: 17,
    atkCd: 0.43,
    range: 96,
    arc: 2.15,
    crit: 0.1,
    abilityName: 'Moonfall Undertow',
    abilityCd: 10,
    abilityDesc: 'Pull nearby enemies into a tidal ring, damaging and weakening them.',
    abilityKind: 'tide',
    unlockWave: 40,
  },
  {
    id: 'riftblade',
    name: 'Riftblade',
    culture: 'The Umbral Reach',
    epithet: 'The Unwritten Edge',
    lore: 'Exiles who step between heartbeats, carrying a weapon forged from a broken star.',
    weaponName: 'Nullglass Glaive',
    color: '#b68cff',
    color2: '#e8d8ff',
    hp: 84,
    speed: 278,
    dmg: 15,
    atkCd: 0.27,
    range: 78,
    arc: 1.72,
    crit: 0.24,
    abilityName: 'Eventide Rift',
    abilityCd: 11,
    abilityDesc: 'Blink through the nearest foes and leave a collapsing void behind you.',
    abilityKind: 'rift',
    unlockWave: 60,
  },
  {
    id: 'stormwarden',
    name: 'Stormwarden',
    culture: 'Voltaic Peaks',
    epithet: 'Voice of the Tempest',
    lore: 'Sky-wardens who chained the First Storm and now speak with thunder in their voice.',
    weaponName: 'Stormforged Maul',
    color: '#6ef3ff',
    color2: '#fff6a8',
    hp: 130,
    speed: 238,
    dmg: 21,
    atkCd: 0.36,
    range: 94,
    arc: 2.25,
    crit: 0.15,
    abilityName: 'Tempest Judgment',
    abilityCd: 10,
    abilityDesc: 'Chain lightning strikes the 7 nearest foes, stunning them briefly.',
    abilityKind: 'tempest',
    unlockWave: 80,
  },
  {
    id: 'drakewarden',
    name: 'Drakewarden',
    culture: 'Ashen Roost',
    epithet: 'Heir of the First Flame',
    lore: 'Dragon-blooded wardens hatched in ash. Where they walk, the old fire follows.',
    weaponName: 'Wyrmfang Greatblade',
    color: '#ff5a3c',
    color2: '#ffc46b',
    hp: 148,
    speed: 218,
    dmg: 24,
    atkCd: 0.42,
    range: 98,
    arc: 2.35,
    crit: 0.12,
    abilityName: 'Wyrmfire Cataclysm',
    abilityCd: 12,
    abilityDesc: 'Breathe a cataclysm of dragonfire: massive radial damage that ignites survivors.',
    abilityKind: 'pyre',
    unlockWave: 100,
  },
];

export function unlockedClassIdsAtWave(wave: number): string[] {
  return CLASSES.filter((entry) => entry.unlockWave <= wave).map((entry) => entry.id);
}

export interface ZoneDef {
  name: string;
  culture: string;
  color: string;
  boss: string;
  bossColor: string;
  bossTitle: string;
}

export const ZONES: ZoneDef[] = [
  { name: 'The Jade Coast', culture: 'Yamashiro Isles', color: '#3ecf9a', boss: "Mizuchi, the Tide Serpent", bossColor: '#2ee6a8', bossTitle: 'SERPENT OF THE DEEP TIDE' },
  { name: 'The Ember Steppes', culture: 'Khaganate of Ash', color: '#ff8a4a', boss: 'Khorzun, Ashen Khagan', bossColor: '#ff6a2a', bossTitle: 'KHAGAN OF CINDER' },
  { name: 'Frostveil Fjord', culture: 'Skaldheim', color: '#6fb7ff', boss: 'Isbrekk the Hollow King', bossColor: '#9be8ff', bossTitle: 'THE HOLLOW KING' },
  { name: 'Sunspire Jungles', culture: 'Tlanex Empire', color: '#ffd24a', boss: "Balam K'in, Eclipse Priest", bossColor: '#ffe066', bossTitle: 'PRIEST OF THE ECLIPSE' },
  { name: 'The Dune Sea', culture: 'Zahraan Sultanate', color: '#e8b64c', boss: "Zar'qun, Sultan of Glass", bossColor: '#f4c95d', bossTitle: 'SULTAN OF GLASS' },
];

export type EnemyKind = 'husk' | 'skitter' | 'hexer' | 'brute' | 'mage' | 'demon' | 'wraith' | 'golem' | 'dragon' | 'boss';

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  hp: number;
  speed: number;
  dmg: number;
  r: number;
  xp: number;
  score: number;
  color: string;
}

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  husk: { kind: 'husk', name: 'Hollow Husk', hp: 26, speed: 92, dmg: 10, r: 15, xp: 12, score: 10, color: '#8fd9a8' },
  skitter: { kind: 'skitter', name: 'Dune Skitterer', hp: 14, speed: 168, dmg: 6, r: 12, xp: 9, score: 15, color: '#ffb36b' },
  hexer: { kind: 'hexer', name: 'Grave Hexer', hp: 32, speed: 74, dmg: 12, r: 15, xp: 24, score: 25, color: '#c58cf0' },
  brute: { kind: 'brute', name: 'Warbrute', hp: 100, speed: 52, dmg: 22, r: 26, xp: 32, score: 30, color: '#ff7d6b' },
  mage: { kind: 'mage', name: 'Ashen Mage', hp: 55, speed: 68, dmg: 16, r: 16, xp: 38, score: 45, color: '#7dd7ff' },
  demon: { kind: 'demon', name: 'Pit Demon', hp: 150, speed: 62, dmg: 26, r: 24, xp: 55, score: 60, color: '#ff4d3d' },
  wraith: { kind: 'wraith', name: 'Veil Wraith', hp: 46, speed: 196, dmg: 15, r: 14, xp: 44, score: 55, color: '#b9a7ff' },
  golem: { kind: 'golem', name: 'Siege Golem', hp: 320, speed: 38, dmg: 34, r: 32, xp: 90, score: 95, color: '#9aa7b8' },
  dragon: { kind: 'dragon', name: 'Cinder Whelp', hp: 240, speed: 84, dmg: 28, r: 28, xp: 120, score: 130, color: '#ff9a2e' },
  boss: { kind: 'boss', name: 'World Boss', hp: 620, speed: 66, dmg: 30, r: 46, xp: 220, score: 250, color: '#ff5d5d' },
};

export function waveComposition(w: number): { kind: EnemyKind; count: number }[] {
  if (w % 5 === 0) {
    const out: { kind: EnemyKind; count: number }[] = [
      { kind: 'boss', count: 1 },
      { kind: 'husk', count: 3 + Math.floor(w * 0.9) },
      { kind: 'skitter', count: Math.max(1, Math.floor(w / 3)) },
    ];
    if (w >= 10) out.push({ kind: 'mage', count: Math.floor(w / 6) });
    if (w >= 15) out.push({ kind: 'demon', count: Math.max(1, Math.floor(w / 10)) });
    if (w >= 20) out.push({ kind: 'wraith', count: Math.max(1, Math.floor(w / 9)) });
    return out;
  }
  const out: { kind: EnemyKind; count: number }[] = [
    { kind: 'husk', count: 5 + Math.min(20, w * 2) + Math.floor(w / 3) },
  ];
  if (w >= 2) out.push({ kind: 'skitter', count: 2 + Math.floor(w * 1.45) });
  if (w >= 3) out.push({ kind: 'hexer', count: Math.max(1, Math.floor((w + 1) / 2)) });
  if (w >= 4) out.push({ kind: 'brute', count: Math.max(1, Math.floor((w - 1) / 2)) });
  if (w >= 6) out.push({ kind: 'mage', count: Math.max(1, Math.floor((w - 3) / 2)) });
  if (w >= 8) out.push({ kind: 'demon', count: Math.max(1, Math.floor((w - 5) / 3)) });
  if (w >= 10) out.push({ kind: 'wraith', count: Math.max(2, Math.floor((w - 6) / 2)) });
  if (w >= 12) out.push({ kind: 'golem', count: Math.max(1, Math.floor((w - 9) / 4)) });
  if (w >= 15) out.push({ kind: 'dragon', count: Math.max(1, Math.floor((w - 12) / 4)) });
  return out;
}

export const FAKE_CHAT: string[] = [
  '[World] Yuki of Yamashiro: WTS Frostwake axe, 400g — port Jade Coast',
  '[Realm] Bjorn Ironjaw reached Lv 42!',
  '[World] Ixchel of Tlanex: LFG Sunspire dungeon, need a shieldthane',
  '[Trade] Zahra al-Raqis: buying moon-silk, pm me',
  '[Guild] <Dawn Oath> recruiting — all realms welcome',
  '[Event] The Eclipse Tide rises in 3 realms…',
  '[World] Kaelen the Grey: any healers for Isbrekk?',
  '[Realm] Mei-Lin looted [Jade Dragon Seal]!',
  '[World] Ragnar: Khorzun down first try. ez',
  '[Realm] Nadia bint-Farouk reached Lv 37!',
  '[Trade] Tlanex market: obsidian prices up 12%',
  '[Guild] <Sand Veil> won the Dune Derby!',
  '[World] Hilde: selling runestones, fair prices at the fjord',
  '[World] Akio: gg on Mizuchi — what a fight',
  '[Event] World boss Zar\u2019qun spawns in the Dune Sea — 10m',
  '[World] Oya: new player, any tips?',
  '[World] Dagny: tip — dash straight through brute charges',
  '[Realm] Imhotep VII looted [Scepter of Glass]!',
];

export const ELITE_NAMES: string[] = [
  'Vargr the Unbroken',
  'Sable Maw',
  'Keth the Rotbound',
  'Yurei of the Mist',
  'Ashen Claw',
  'The Veiled Hunger',
  'Grimjaw',
  'Omen of Tlanex',
  'Dust Wraith',
  'Fenris Spawn',
];

export const HERO_NAMES: Record<string, string[]> = {
  kensei: ['Akio', 'Yuki', 'Ren', 'Hana', 'Jiro', 'Kaede', 'Sora'],
  shieldthane: ['Bjorn', 'Hilda', 'Ragnar', 'Astrid', 'Ulf', 'Sigrid', 'Sten'],
  jaguar: ['Ixchel', 'Balam', 'Citlali', 'Yaotl', 'Xochitl', 'Coatl', 'Itzel'],
  sandseer: ['Zahra', 'Farouk', 'Nadia', 'Imran', 'Layla', 'Qasim', 'Amira'],
  tidecaller: ['Neris', 'Marea', 'Oru', 'Sela', 'Kaio', 'Tavai', 'Luma'],
  riftblade: ['Veyr', 'Noctis', 'Iria', 'Vale', 'Kest', 'Nyx', 'Orin'],
  stormwarden: ['Raijin', 'Sable', 'Volt', 'Kira', 'Thunder', 'Zephyr', 'Gale'],
  drakewarden: ['Pyra', 'Ignis', 'Seara', 'Cinder', 'Blaz', 'Ember', 'Flint'],
};

export const STREAKS: [number, string][] = [
  [5, 'RAMPAGE!'],
  [10, 'UNSTOPPABLE!'],
  [15, 'GODLIKE!'],
  [25, 'AETHERBORN!'],
];

export type PowerId =
  | 'keen_edge'
  | 'ironhide'
  | 'windstep'
  | 'precision'
  | 'longreach'
  | 'siphon'
  | 'quicksilver'
  | 'sunward'
  | 'gilded_hand'
  | 'wardplate'
  | 'battle_tempo'
  | 'titan_blood'
  | 'veteran_reach'
  | 'blood_harvest'
  | 'astral_echo'
  | 'predator_instinct'
  | 'colossus_soul'
  | 'death_dealer'
  | 'chronomancer'
  | 'royal_treasury'
  | 'aetherborn_form'
  | 'undying_legend'
  | 'aether_insight'
  | 'late_aether_surge'
  | 'late_void_horizon'
  | 'late_starfall'
  // Mechanical archetype powers
  | 'piercing_edge'
  | 'impact_shockwave'
  | 'bouncing_blades'
  | 'echo_slash'
  | 'kinetic_knockback'
  | 'chain_arc'
  | 'terminal_blast'
  | 'frenzy_momentum'
  // Legend-specific archetype evolutions
  | 'evo_kensei_crescent'
  | 'evo_kensei_petalstorm'
  | 'evo_kensei_raincutter'
  | 'evo_shield_frostwave'
  | 'evo_shield_runicthorns'
  | 'evo_shield_glaciermaster'
  | 'evo_jaguar_spears'
  | 'evo_jaguar_pyramidrite'
  | 'evo_jaguar_fifthsunborn'
  | 'evo_sand_split'
  | 'evo_sand_vortex'
  | 'evo_sand_dunelord'
  | 'evo_tide_boomerang'
  | 'evo_tide_pearlsurge'
  | 'evo_tide_oceanmonarch'
  | 'evo_rift_echoes'
  | 'evo_rift_stasisdoubler'
  | 'evo_rift_unwrittenvoid'
  | 'evo_storm_chainbolt'
  | 'evo_storm_skysmite'
  | 'evo_storm_firststormlord'
  | 'evo_drake_firewave'
  | 'evo_drake_pyreburst'
  | 'evo_drake_firstflameavatar'
  | `expanded_${string}`;

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export const FINAL_WAVE = 120;
export const MAX_PLAYER_LEVEL = 60;

export const RARITY_META: Record<Rarity, { label: string; color: string; weight: number }> = {
  common: { label: 'COMMON', color: '#aab4c5', weight: 1 },
  rare: { label: 'RARE', color: '#61b9ff', weight: 2 },
  epic: { label: 'EPIC', color: '#c184ff', weight: 3 },
  legendary: { label: 'LEGENDARY', color: '#ffd36b', weight: 4 },
};

/** Single source of truth for rarity unlock gating. */
export const RARE_UNLOCK_LEVEL = 12;
export const EPIC_UNLOCK_LEVEL = 28;
export const LEGENDARY_UNLOCK_LEVEL = 48;
export const SHOP_RARE_UNLOCK_WAVE = 20;
export const SHOP_EPIC_UNLOCK_WAVE = 55;
export const SHOP_LEGENDARY_UNLOCK_WAVE = 90;

export function rarityOddsForLevel(level: number): Record<Rarity, number> {
  const cappedLevel = Math.min(MAX_PLAYER_LEVEL, Math.max(1, level));
  const raw: Record<Rarity, number> = {
    common: Math.max(0.56, 0.9 - Math.max(0, cappedLevel - 1) * 0.006),
    rare: isRarityUnlocked('rare', cappedLevel) ? Math.min(0.28, 0.16 + Math.max(0, cappedLevel - RARE_UNLOCK_LEVEL) * 0.004) : 0,
    epic: isRarityUnlocked('epic', cappedLevel) ? Math.min(0.18, 0.05 + Math.max(0, cappedLevel - EPIC_UNLOCK_LEVEL) * 0.004) : 0,
    legendary: isRarityUnlocked('legendary', cappedLevel) ? Math.min(0.08, 0.01 + Math.max(0, cappedLevel - LEGENDARY_UNLOCK_LEVEL) * 0.005) : 0,
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  return {
    common: raw.common / total,
    rare: raw.rare / total,
    epic: raw.epic / total,
    legendary: raw.legendary / total,
  };
}

export function shopRarityOddsForWave(wave: number): Record<Rarity, number> {
  const cappedWave = Math.min(FINAL_WAVE, Math.max(1, wave));
  const raw: Record<Rarity, number> = {
    common: Math.max(0.52, 0.92 - cappedWave * 0.0025),
    rare: isShopRarityUnlocked('rare', cappedWave) ? Math.min(0.3, 0.16 + Math.max(0, cappedWave - SHOP_RARE_UNLOCK_WAVE) * 0.0025) : 0,
    epic: isShopRarityUnlocked('epic', cappedWave) ? Math.min(0.2, 0.04 + Math.max(0, cappedWave - SHOP_EPIC_UNLOCK_WAVE) * 0.003) : 0,
    legendary: isShopRarityUnlocked('legendary', cappedWave) ? Math.min(0.1, 0.01 + Math.max(0, cappedWave - SHOP_LEGENDARY_UNLOCK_WAVE) * 0.004) : 0,
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  return {
    common: raw.common / total,
    rare: raw.rare / total,
    epic: raw.epic / total,
    legendary: raw.legendary / total,
  };
}

export function xpWithBonus(baseXp: number, bonusMultiplier: number): number {
  return baseXp * Math.max(1, bonusMultiplier);
}

export function canOpenLevelUp(level: number, pendingLevels: number, validChoiceCount: number): boolean {
  return level < MAX_PLAYER_LEVEL && pendingLevels > 0 && validChoiceCount > 0;
}

/** Whether a level-up power rarity is unlocked at the given player level. */
export function isRarityUnlocked(rarity: Rarity, level: number): boolean {
  if (rarity === 'rare') return level >= RARE_UNLOCK_LEVEL;
  if (rarity === 'epic') return level >= EPIC_UNLOCK_LEVEL;
  if (rarity === 'legendary') return level >= LEGENDARY_UNLOCK_LEVEL;
  return true;
}

/** Whether a shop item rarity is unlocked at the given wave. */
export function isShopRarityUnlocked(rarity: Rarity, wave: number): boolean {
  if (rarity === 'rare') return wave >= SHOP_RARE_UNLOCK_WAVE;
  if (rarity === 'epic') return wave >= SHOP_EPIC_UNLOCK_WAVE;
  if (rarity === 'legendary') return wave >= SHOP_LEGENDARY_UNLOCK_WAVE;
  return true;
}

export interface PowerDef {
  id: PowerId;
  name: string;
  kicker: string;
  desc: string;
  color: string;
  icon: 'blade' | 'heart' | 'boot' | 'eye' | 'reach' | 'drop' | 'bolt' | 'sun' | 'coin' | 'shield';
  rarity: Rarity;
  recommended: string[];
  stacks: string;
  maxStacks?: number;
}

export function capStackCount(count: number, maxStacks: number | null): number {
  if (maxStacks === null || maxStacks <= 0) return Math.max(0, count);
  return Math.min(Math.max(0, count), maxStacks);
}

export const POWER_STACK_LIMITS: Partial<Record<PowerId, number>> = {
  keen_edge: 3,
  ironhide: 4,
  windstep: 3,
  precision: 4,
  longreach: 4,
  siphon: 3,
  quicksilver: 3,
  sunward: 3,
  gilded_hand: 3,
  wardplate: 4,
  battle_tempo: 3,
  titan_blood: 2,
  veteran_reach: 3,
  blood_harvest: 3,
  astral_echo: 2,
  predator_instinct: 2,
  colossus_soul: 2,
  death_dealer: 1,
  chronomancer: 1,
  royal_treasury: 1,
  aetherborn_form: 1,
  undying_legend: 1,
  aether_insight: 5,
  piercing_edge: 1,
  kinetic_knockback: 3,
  frenzy_momentum: 3,
  impact_shockwave: 1,
  bouncing_blades: 1,
  echo_slash: 1,
  chain_arc: 1,
  terminal_blast: 1,
  evo_kensei_crescent: 1,
  evo_kensei_petalstorm: 1,
  evo_kensei_raincutter: 1,
  evo_shield_frostwave: 1,
  evo_shield_runicthorns: 1,
  evo_shield_glaciermaster: 1,
  evo_jaguar_spears: 1,
  evo_jaguar_pyramidrite: 1,
  evo_jaguar_fifthsunborn: 1,
  evo_sand_split: 1,
  evo_sand_vortex: 1,
  evo_sand_dunelord: 1,
  evo_tide_boomerang: 1,
  evo_tide_pearlsurge: 1,
  evo_tide_oceanmonarch: 1,
  evo_rift_echoes: 1,
  evo_rift_stasisdoubler: 1,
  evo_rift_unwrittenvoid: 1,
  evo_storm_chainbolt: 1,
  evo_storm_skysmite: 1,
  evo_storm_firststormlord: 1,
  evo_drake_firewave: 1,
  evo_drake_pyreburst: 1,
  evo_drake_firstflameavatar: 1,
};

export function getPowerStackCap(powerId: PowerId | string): number | null {
  const cap = POWER_STACK_LIMITS[powerId as PowerId];
  if (powerId.startsWith('expanded_')) {
    const index = Number(powerId.split('_').pop());
    return index >= 26 ? 1 : index >= 18 ? 2 : 3;
  }
  return typeof cap === 'number' ? cap : null;
}

export function isPowerAvailable(powerId: PowerId, ownedPowerIds: PowerId[]): boolean {
  const cap = getPowerStackCap(powerId);
  if (cap === null) return true;
  return ownedPowerIds.filter((ownedId) => ownedId === powerId).length < cap;
}

const EXPANDED_POWER_NAMES = {
  offense: ['Ember Edge', 'Rift Lance', 'Falling Star', 'Warpath', 'Crimson Measure', 'Searing Point', 'Moonlit Cut', 'Ashen Volley', 'Iron Comet', 'Storm Fang', 'Sunbreak', 'Gravebrand', 'Hollow Crown', 'Flare Dance', 'Abyssal Bite', 'Dawnpiercer', 'Wildfire Rhythm', 'Vigilant Strike', 'Glass Cannon', 'Thundering Arc', 'Night Hunt', 'Cinder Mark', 'Aether Spear', 'Final Flourish', 'Ruinous Beat', 'Brightscar', 'Tempest Edge', 'Starved Blade', 'Worldsplitter'],
  defense: ['Bastion Oath', 'Stoneheart', 'Mending Ward', 'Bulwark Pulse', 'Last Stand', 'Frosthide', 'Rooted Soul', 'Hearthguard', 'Aegis Thread', 'Quiet Shelter', 'Keeper of Ash', 'Vital Current', 'Granite Will', 'Wellspring', 'Oathbound', 'Shielding Bloom', 'Second Wind', 'Sovereign Guard', 'Lifeweaver', 'Iron Resolve', 'Safe Harbor', 'Guardian Ring', 'Deep Reserve', 'Refusing End', 'Mortal Anchor', 'Aether Shell', 'Unbroken Line', 'Dawn Bastion', 'Eternal Ward'],
  mobility: ['Fleetfoot', 'Wind Rake', 'Blink Rhythm', 'Swift Current', 'Horizon Step', 'Dancing Reach', 'Quickdraw', 'Wayfinder', 'Rush of Stars', 'Slipstream', 'Tactical Dash', 'Farwalker', 'Tempo Shift', 'Mirage Pace', 'Keen Momentum', 'Silver Stride', 'Afterwind', 'Chase the Sun', 'Phase Runner', 'Relentless Motion', 'Skybound', 'Hasteweaver', 'Rapid Cadence', 'Voidstep', 'Crosswind', 'Liminal Pace', 'Flashpoint', 'Unseen Route', 'Aether Velocity'],
  utility: ['Aether Ledger', 'Hunter\'s Bounty', 'Resonant Memory', 'Lucky Break', 'Scholar\'s Eye', 'Coinwake', 'Deep Pockets', 'Echo of Plenty', 'Ruin Cartographer', 'Harvest Rune', 'Fate Thread', 'Prospector\'s Instinct', 'Experience Well', 'Golden Hour', 'Aether Compass', 'Scavenger\'s Grace', 'Living Map', 'Treasure Sense', 'Lasting Insight', 'Merchant\'s Favor', 'Bounty Circuit', 'Wellspring Coin', 'Archive of Fates', 'Fortune\'s Wake', 'Relic Sense', 'Aether Dividend', 'Pathfinder\'s Luck', 'Crown of Plenty', 'Endless Ledger'],
} as const;

function expandedPowerRarity(index: number): Rarity {
  if (index < 8) return 'common';
  if (index < 18) return 'rare';
  if (index < 26) return 'epic';
  return 'legendary';
}

function expandedPower(category: keyof typeof EXPANDED_POWER_NAMES, index: number, name: string): PowerDef {
  const rarity = expandedPowerRarity(index);
  const descriptions = {
    offense: ['+9% weapon damage.', '+5% critical chance.', '+18 weapon reach.', '+7% attack speed.', '+12% weapon damage and +8 reach.'],
    defense: ['+20 max health and restore it.', 'Take 6% less damage.', 'Heal 2 health per kill.', '+12 max health and +4% armor.', '+8% movement speed while below half health.'],
    mobility: ['+8% movement speed.', '+6% attack speed.', 'Ability cooldowns are 6% shorter.', '+12 weapon reach.', '+4% critical chance and +5% speed.'],
    utility: ['+8% experience from defeated foes.', '+25% coin value.', '+30 pickup range.', '+10 max health and +4% coin value.', '+5% weapon damage and +5% experience.'],
  }[category];
  return {
    id: `expanded_${category}_${index}` as PowerId,
    name,
    kicker: category.toUpperCase(),
    desc: descriptions[index % descriptions.length],
    color: category === 'offense' ? '#ff9a7d' : category === 'defense' ? '#8fc7ff' : category === 'mobility' ? '#78e0d0' : '#ffd36b',
    icon: category === 'offense' ? 'blade' : category === 'defense' ? 'shield' : category === 'mobility' ? 'boot' : 'coin',
    rarity,
    recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade', 'stormwarden', 'drakewarden'],
    stacks: `${category} path · repeatable`,
    maxStacks: rarity === 'legendary' ? 1 : rarity === 'epic' ? 2 : 3,
  };
}

const EXPANDED_POWERS: PowerDef[] = (Object.entries(EXPANDED_POWER_NAMES) as [keyof typeof EXPANDED_POWER_NAMES, readonly string[]][])
  .flatMap(([category, names]) => names.map((name, index) => expandedPower(category, index, name)));

export const POWERS: PowerDef[] = [
  {
    id: 'keen_edge',
    name: 'Keen Edge',
    kicker: 'OFFENSE',
    desc: '+22% weapon damage. Your attacks cut deeper.',
    color: '#ff907d',
    icon: 'blade',
    rarity: 'common', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'Multiplicative · repeatable',
  },
  {
    id: 'ironhide',
    name: 'Ironhide',
    kicker: 'VITALITY',
    desc: '+25 max health and restore 25 health now.',
    color: '#7fc4ff',
    icon: 'heart',
    rarity: 'common', recommended: ['shieldthane', 'tidecaller'], stacks: 'Additive · repeatable',
  },
  {
    id: 'windstep',
    name: 'Windstep',
    kicker: 'MOBILITY',
    desc: '+14% movement speed. Leave danger behind.',
    color: '#78e0d0',
    icon: 'boot',
    rarity: 'common', recommended: ['sandseer', 'riftblade', 'jaguar'], stacks: 'Multiplicative · repeatable',
  },
  {
    id: 'precision',
    name: 'Hunter\'s Eye',
    kicker: 'CRITICAL',
    desc: '+12% critical chance. Crits strike twice as hard.',
    color: '#ffd36b',
    icon: 'eye',
    rarity: 'rare', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'Additive · max 85%',
  },
  {
    id: 'longreach',
    name: 'Long Reach',
    kicker: 'TECHNIQUE',
    desc: '+22 weapon reach. Control a wider arc.',
    color: '#d7adff',
    icon: 'reach',
    rarity: 'common', recommended: ['shieldthane', 'tidecaller', 'sandseer'], stacks: 'Additive · repeatable',
  },
  {
    id: 'siphon',
    name: 'Soul Siphon',
    kicker: 'SUSTAIN',
    desc: 'Heal 2 health whenever you defeat an enemy.',
    color: '#9defa4',
    icon: 'drop',
    rarity: 'rare', recommended: ['jaguar', 'riftblade', 'shieldthane'], stacks: 'Additive healing · repeatable',
  },
  {
    id: 'quicksilver',
    name: 'Quicksilver',
    kicker: 'TEMPO',
    desc: '+18% attack speed. Keep the pressure relentless.',
    color: '#9ce9ff',
    icon: 'bolt',
    rarity: 'rare', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'Multiplicative · repeatable',
  },
  {
    id: 'sunward',
    name: 'Sunward Focus',
    kicker: 'SIGNATURE',
    desc: 'Signature ability cooldown is 18% shorter.',
    color: '#ffe092',
    icon: 'sun',
    rarity: 'rare', recommended: ['sandseer', 'tidecaller', 'shieldthane'], stacks: 'Affects Signature & Legacy · repeatable',
  },
  {
    id: 'gilded_hand',
    name: 'Gilded Hand',
    kicker: 'FORTUNE',
    desc: '+50% coin value and a wider pickup aura.',
    color: '#ffd24a',
    icon: 'coin',
    rarity: 'common', recommended: ['sandseer', 'tidecaller'], stacks: 'Additive fortune · repeatable',
  },
  {
    id: 'wardplate',
    name: 'Wardplate',
    kicker: 'DEFENSE',
    desc: 'Take 12% less damage from every foe.',
    color: '#b1c5df',
    icon: 'shield',
    rarity: 'rare', recommended: ['shieldthane', 'tidecaller'], stacks: 'Additive · max 65%',
  },
  {
    id: 'battle_tempo', name: 'Battle Tempo', kicker: 'HYBRID',
    desc: '+10% weapon damage and +10% attack speed.', color: '#ffb08f', icon: 'bolt',
    rarity: 'rare', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'Multiplicative · repeatable',
  },
  {
    id: 'titan_blood', name: 'Titan Blood', kicker: 'VITALITY',
    desc: '+18% maximum health and restore the amount gained.', color: '#83b8ff', icon: 'heart',
    rarity: 'rare', recommended: ['shieldthane', 'tidecaller'], stacks: 'Multiplicative max health · repeatable',
  },
  {
    id: 'veteran_reach', name: "Veteran's Reach", kicker: 'TECHNIQUE',
    desc: '+26 weapon reach and +12% weapon damage.', color: '#bfa0ff', icon: 'reach',
    rarity: 'rare', recommended: ['shieldthane', 'sandseer', 'tidecaller'], stacks: 'Reach additive, damage multiplicative, capped at 3',
  },
  {
    id: 'blood_harvest', name: 'Blood Harvest', kicker: 'SUSTAIN',
    desc: 'Heal 4 health per kill and gain +10% weapon damage.', color: '#e46f8f', icon: 'drop',
    rarity: 'epic', recommended: ['jaguar', 'riftblade'], stacks: 'Healing additive · damage multiplicative',
  },
  {
    id: 'astral_echo', name: 'Astral Echo', kicker: 'ABILITY',
    desc: 'Signature and Legacy cooldowns are 28% shorter; refresh both now.', color: '#d7adff', icon: 'sun',
    rarity: 'epic', recommended: ['sandseer', 'tidecaller', 'shieldthane'], stacks: 'Multiplicative cooldown · repeatable',
  },
  {
    id: 'predator_instinct', name: 'Predator Instinct', kicker: 'HUNTER',
    desc: '+10% critical chance, +12% speed and +10% damage.', color: '#f0c85f', icon: 'eye',
    rarity: 'epic', recommended: ['jaguar', 'kensei', 'riftblade'], stacks: 'Mixed bonuses · max 2',
  },
  {
    id: 'colossus_soul', name: 'Colossus Soul', kicker: 'FORTRESS',
    desc: '+45 max health, restore 45 health and take 10% less damage.', color: '#9ab7d6', icon: 'shield',
    rarity: 'epic', recommended: ['shieldthane', 'tidecaller'], stacks: 'Health additive · armor max 65%',
  },
  {
    id: 'death_dealer', name: 'Death Dealer', kicker: 'ANNIHILATION',
    desc: '+32% weapon damage and +8% critical chance.', color: '#ff6d67', icon: 'blade',
    rarity: 'epic', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'Damage multiplicative · one-time',
  },
  {
    id: 'chronomancer', name: 'Chronomancer', kicker: 'TIME',
    desc: 'All ability cooldowns are 38% shorter and dash cooldown is reduced.', color: '#8fe7ff', icon: 'sun',
    rarity: 'legendary', recommended: ['sandseer', 'riftblade', 'tidecaller'], stacks: 'Multiplicative cooldown · one-time',
  },
  {
    id: 'royal_treasury', name: 'Royal Treasury', kicker: 'FORTUNE',
    desc: 'Double coin value, greatly widen pickup range and gain +16% damage.', color: '#ffd24a', icon: 'coin',
    rarity: 'legendary', recommended: ['sandseer', 'tidecaller'], stacks: 'Fortune additive · damage multiplicative · one-time',
  },
  {
    id: 'aetherborn_form', name: 'Aetherborn Form', kicker: 'TRANSCENDENCE',
    desc: '+42% damage, +16% speed, +12% critical chance and +25 max health.', color: '#ffdf8a', icon: 'sun',
    rarity: 'legendary', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'All bonuses · one-time',
  },
  {
    id: 'undying_legend', name: 'Undying Legend', kicker: 'IMMORTALITY',
    desc: '+35 max health, heal 6 per kill and take 15% less damage.', color: '#a8ffd1', icon: 'shield',
    rarity: 'legendary', recommended: ['shieldthane', 'tidecaller', 'jaguar'], stacks: 'Health/lifesteal additive · armor max 65% · one-time',
  },
  {
    id: 'aether_insight', name: 'Aether Insight', kicker: 'PROGRESSION',
    desc: '+15% experience from defeated foes. The Aether reveals more of its path.', color: '#7de7ff', icon: 'eye',
    rarity: 'rare', recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade'], stacks: 'Experience additive · max 5', maxStacks: 5,
  },
  {
    id: 'late_aether_surge', name: 'Aether Surge', kicker: 'LATE AWAKENING',
    desc: '+8% weapon damage and +8% movement speed. Power continues to answer.', color: '#8fffe0', icon: 'bolt',
    rarity: 'common', recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade'], stacks: 'Repeatable late-game reserve',
  },
  {
    id: 'late_void_horizon', name: 'Void Horizon', kicker: 'LATE AWAKENING',
    desc: '+10% weapon damage and +5% critical chance. Nothing lies beyond your reach.', color: '#d7adff', icon: 'sun',
    rarity: 'rare', recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade'], stacks: 'Repeatable late-game reserve',
  },
  {
    id: 'late_starfall', name: 'Starfall Engine', kicker: 'LATE AWAKENING',
    desc: '+12% attack speed and +4% critical chance. The final stars align.', color: '#ffd36b', icon: 'bolt',
    rarity: 'epic', recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade'], stacks: 'Repeatable late-game reserve',
  },
  // Mechanical archetype powers
  {
    id: 'piercing_edge', name: 'Piercing Edge', kicker: 'PENETRATION',
    desc: 'Weapon attacks and projectiles pierce 2 additional enemies with +15% travel distance.',
    color: '#7fffd4', icon: 'reach',
    rarity: 'rare', recommended: ['kensei', 'sandseer', 'tidecaller', 'drakewarden'], stacks: 'Pierce +2 · range +15%',
  },
  {
    id: 'impact_shockwave', name: 'Impact Shockwave', kicker: 'CONCUSSION',
    desc: 'Successful attacks trigger an expanding ground shockwave dealing 60% weapon damage.',
    color: '#ffd28a', icon: 'drop',
    rarity: 'rare', recommended: ['shieldthane', 'stormwarden', 'drakewarden'], stacks: 'Shockwave 90px · repeatable',
  },
  {
    id: 'bouncing_blades', name: 'Ricochet Edge', kicker: 'RICOCHET',
    desc: 'Projectiles and crescent slashes bounce to a second nearby foe for 75% damage.',
    color: '#8fe7ff', icon: 'bolt',
    rarity: 'epic', recommended: ['kensei', 'sandseer', 'tidecaller', 'stormwarden'], stacks: 'Bounce +1 target · repeatable',
  },
  {
    id: 'echo_slash', name: 'Echoing Afterimage', kicker: 'DUALITY',
    desc: 'Every attack produces a delayed spirit echo 0.22s later dealing 50% damage.',
    color: '#d7adff', icon: 'blade',
    rarity: 'epic', recommended: ['kensei', 'riftblade', 'jaguar'], stacks: 'Echo 50% damage · repeatable',
  },
  {
    id: 'kinetic_knockback', name: 'Kinetic Repulsion', kicker: 'FORCE',
    desc: 'Weapon strikes push enemies back violently with 18% bonus damage on close impact.',
    color: '#bfa0ff', icon: 'shield',
    rarity: 'common', recommended: ['shieldthane', 'stormwarden', 'tidecaller'], stacks: 'Knockback +120% · damage +18%',
  },
  {
    id: 'chain_arc', name: 'Tesla Conductor', kicker: 'ARCS',
    desc: 'Attacks arc chain energy to 3 nearby enemies dealing 45% damage.',
    color: '#6ef3ff', icon: 'bolt',
    rarity: 'epic', recommended: ['stormwarden', 'kensei', 'sandseer'], stacks: 'Chain 3 targets · repeatable',
  },
  {
    id: 'terminal_blast', name: 'Terminal Detonation', kicker: 'COLLAPSE',
    desc: 'Defeated foes explode in a 110px blast dealing 70% weapon damage to survivors.',
    color: '#ff6b4a', icon: 'sun',
    rarity: 'epic', recommended: ['drakewarden', 'jaguar', 'riftblade'], stacks: 'Blast 110px · damage +70%',
  },
  {
    id: 'frenzy_momentum', name: 'Frenzy Momentum', kicker: 'TEMPO',
    desc: 'Each enemy hit grants +4% attack speed for 4s (stacks up to 40%).',
    color: '#ffc86b', icon: 'boot',
    rarity: 'rare', recommended: ['kensei', 'jaguar', 'riftblade'], stacks: 'Stacking attack speed up to +40%',
  },
  // Legend-specific archetype evolutions
  {
    id: 'evo_kensei_crescent', name: 'Crescent Moon Arts', kicker: 'KATANA EVO',
    desc: 'All katana slashes unleash crescent projectiles that pierce 2 foes.',
    color: '#ff8a8a', icon: 'blade',
    rarity: 'rare', recommended: ['kensei'], stacks: 'Katana gains piercing crescent projectiles',
  },
  {
    id: 'evo_kensei_petalstorm', name: 'Storm of Petals', kicker: 'BLADE FLURRY',
    desc: 'Critical strikes erupt in 6 razor petals that shred nearby enemies.',
    color: '#ffb7c9', icon: 'reach',
    rarity: 'epic', recommended: ['kensei'], stacks: 'Crits spawn 6 razor petal shards',
  },
  {
    id: 'evo_kensei_raincutter', name: 'Rain-Cutter Mastery', kicker: 'LEGENDARY EVO',
    desc: 'Katana attacks fire 3 crescent blades and Still Water spawns an echo-ring.',
    color: '#ffd97a', icon: 'blade',
    rarity: 'legendary', recommended: ['kensei'], stacks: 'Triple crescent waves + Still Water echo',
  },
  {
    id: 'evo_shield_frostwave', name: 'Frostwake Cleave', kicker: 'AXE EVO',
    desc: 'Every axe swing launches an icy ground shockwave that damages and chills.',
    color: '#9be8ff', icon: 'reach',
    rarity: 'rare', recommended: ['shieldthane'], stacks: 'Linear freezing ground shockwave',
  },
  {
    id: 'evo_shield_runicthorns', name: 'Runic Reflection', kicker: 'DEFENSIVE EVO',
    desc: 'Blocking or getting hit sends 4 frost runes outward that shatter attackers.',
    color: '#cfe6ff', icon: 'shield',
    rarity: 'epic', recommended: ['shieldthane'], stacks: 'Frost rune counter-bursts',
  },
  {
    id: 'evo_shield_glaciermaster', name: 'Glacier King Sovereign', kicker: 'LEGENDARY EVO',
    desc: 'Axe shocks erupt into huge glacier spikes; Oathwall reflects 200% force.',
    color: '#ffffff', icon: 'shield',
    rarity: 'legendary', recommended: ['shieldthane'], stacks: 'Giant glacial ruptures + crushing counter',
  },
  {
    id: 'evo_jaguar_spears', name: 'Sun-Spire Spears', kicker: 'HYBRID EVO',
    desc: 'Strikes fire radiant solar bolts. Wrath of the Fifth Sun fires 4 extra spears.',
    color: '#ff9d3c', icon: 'sun',
    rarity: 'rare', recommended: ['jaguar'], stacks: 'Melee strikes generate piercing sun spears',
  },
  {
    id: 'evo_jaguar_pyramidrite', name: 'Pyramid of Dawn', kicker: 'SOLAR RAGE',
    desc: 'Blood Rite releases 8 solar flares and grants +50% projectile count.',
    color: '#ffd24a', icon: 'sun',
    rarity: 'epic', recommended: ['jaguar'], stacks: 'Blood Rite releases solar flares',
  },
  {
    id: 'evo_jaguar_fifthsunborn', name: 'Avatar of the Fifth Sun', kicker: 'LEGENDARY EVO',
    desc: 'Your weapon fires continuous solar barrages; critical kills trigger miniature suns.',
    color: '#ffe599', icon: 'sun',
    rarity: 'legendary', recommended: ['jaguar'], stacks: 'Continuous solar barrage',
  },
  {
    id: 'evo_sand_split', name: 'Mirage Chakram Split', kicker: 'CHAKRAM EVO',
    desc: 'Chakrams pierce all foes and release sand shards upon hitting enemies.',
    color: '#e6c26a', icon: 'reach',
    rarity: 'rare', recommended: ['sandseer'], stacks: 'Chakrams pierce and explode into shards',
  },
  {
    id: 'evo_sand_vortex', name: 'Vortex of Glass', kicker: 'MIRAGE SYNERGY',
    desc: 'Mirage Step summons a duplicate that also throws chakrams toward your target.',
    color: '#54c9b4', icon: 'blade',
    rarity: 'epic', recommended: ['sandseer'], stacks: 'Mirage clone actively throws chakrams',
  },
  {
    id: 'evo_sand_dunelord', name: 'Sultan of the Glass Storm', kicker: 'LEGENDARY EVO',
    desc: 'Throws 3 homing sand chakrams that leave burning glass trails and pierce all.',
    color: '#ffe9a8', icon: 'reach',
    rarity: 'legendary', recommended: ['sandseer'], stacks: 'Triple piercing returning glass storm',
  },
  {
    id: 'evo_tide_boomerang', name: 'Undertow Recall', kicker: 'TRIDENT EVO',
    desc: 'Trident spears pierce all enemies, then return back to you, dragging foes.',
    color: '#55d9e8', icon: 'reach',
    rarity: 'rare', recommended: ['tidecaller'], stacks: 'Piercing tidal spears return and pull enemies',
  },
  {
    id: 'evo_tide_pearlsurge', name: 'Pearl Tide Resonance', kicker: 'DEEP MAGIC',
    desc: 'Pearl Tide shoots 8 water tridents in all directions that mend you on hit.',
    color: '#d7a6ff', icon: 'drop',
    rarity: 'epic', recommended: ['tidecaller'], stacks: 'Pearl Tide triggers radial trident wave',
  },
  {
    id: 'evo_tide_oceanmonarch', name: 'Ocean Sovereign', kicker: 'LEGENDARY EVO',
    desc: 'Your spears turn into crashing tidal waves that crush, slow and drown bosses.',
    color: '#bfefff', icon: 'reach',
    rarity: 'legendary', recommended: ['tidecaller'], stacks: 'Tridents become crashing tsunami walls',
  },
  {
    id: 'evo_rift_echoes', name: 'Echoes of the Void', kicker: 'RIFT EVO',
    desc: 'Every slash leaves a void tear that strikes again 0.35s later for 70% damage.',
    color: '#b68cff', icon: 'blade',
    rarity: 'rare', recommended: ['riftblade'], stacks: 'Attacks leave delayed space-tearing echoes',
  },
  {
    id: 'evo_rift_stasisdoubler', name: 'Stasis Paradox', kicker: 'TIME REND',
    desc: 'Heartbeat Stasis duration +1s; all echo damage dealt during stasis deals 2.5x.',
    color: '#e8d8ff', icon: 'sun',
    rarity: 'epic', recommended: ['riftblade'], stacks: 'Stasis duration +1s and amplified echo',
  },
  {
    id: 'evo_rift_unwrittenvoid', name: 'The Unwritten Reality', kicker: 'LEGENDARY EVO',
    desc: 'Slashes slice across the entire screen; kills generate black holes that swallow foes.',
    color: '#ffffff', icon: 'reach',
    rarity: 'legendary', recommended: ['riftblade'], stacks: 'Screen-wide slashes + void singularities',
  },
  {
    id: 'evo_storm_chainbolt', name: 'Chain Lightning Conduit', kicker: 'LIGHTNING EVO',
    desc: 'Every hammer blow arcs electric bolts to 4 secondary targets for 65% damage.',
    color: '#6ef3ff', icon: 'bolt',
    rarity: 'rare', recommended: ['stormwarden'], stacks: 'Melee hammer triggers chain lightning arcs',
  },
  {
    id: 'evo_storm_skysmite', name: 'Sky-Smite Catalyst', kicker: 'THUNDER CALL',
    desc: 'Critical strikes and Tempest Judgment call lightning pillars from heaven.',
    color: '#fff6a8', icon: 'bolt',
    rarity: 'epic', recommended: ['stormwarden'], stacks: 'Crits summon vertical smiting lightning',
  },
  {
    id: 'evo_storm_firststormlord', name: 'Lord of the First Tempest', kicker: 'LEGENDARY EVO',
    desc: 'Hammer attacks trigger continuous fork lightning across the screen.',
    color: '#ffffff', icon: 'bolt',
    rarity: 'legendary', recommended: ['stormwarden'], stacks: 'Screen-wide fork lightning',
  },
  {
    id: 'evo_drake_firewave', name: 'Wyrmfire Wave Cleave', kicker: 'DRAGON EVO',
    desc: 'Every greatblade swing launches a piercing dragonfire wave forward.',
    color: '#ff5a3c', icon: 'reach',
    rarity: 'rare', recommended: ['drakewarden'], stacks: 'Melee swings launch piercing fire waves',
  },
  {
    id: 'evo_drake_pyreburst', name: 'Furnace Cataclysm Flare', kicker: 'INFERNO',
    desc: 'Critical strikes explode for 150% damage in a 100px fire nova.',
    color: '#ffc46b', icon: 'sun',
    rarity: 'epic', recommended: ['drakewarden'], stacks: 'Crits trigger radial fire explosions',
  },
  {
    id: 'evo_drake_firstflameavatar', name: 'Avatar of the First Flame', kicker: 'LEGENDARY EVO',
    desc: 'Slashes launch 3 piercing dragonfire waves; Pyreheart spawns dragon apparitions.',
    color: '#ffffff', icon: 'sun',
    rarity: 'legendary', recommended: ['drakewarden'], stacks: 'Triple fire wave cataclysm + wyrms',
  },
  ...EXPANDED_POWERS,
];

export type ShopItemId = 'rations' | 'tonic' | 'steel' | 'boots' | 'ward' | 'sigil' | 'whetstone' | 'hourglass' | 'magnet' | 'elixir' | 'prism' | 'war_banner' | 'xp_tome' | `expanded_shop_${string}`;

export interface ShopItemDef {
  id: ShopItemId;
  name: string;
  kicker: string;
  desc: string;
  cost: number;
  color: string;
  icon: 'heart' | 'sun' | 'blade' | 'boot' | 'shield' | 'spark';
  rarity: Rarity;
  recommended: string[];
  duration: string;
  maxStacks?: number;
}

export const SHOP_ITEM_STACK_LIMITS: Partial<Record<ShopItemId, number>> = {
  tonic: 2,
  steel: 3,
  boots: 3,
  ward: 3,
  whetstone: 3,
  hourglass: 2,
  magnet: 3,
  war_banner: 2,
  xp_tome: 5,
};

export function getShopItemStackCap(itemId: ShopItemId | string): number | null {
  const cap = SHOP_ITEM_STACK_LIMITS[itemId as ShopItemId];
  if (itemId.startsWith('expanded_shop_')) {
    const index = Number(itemId.split('_').pop());
    return index >= 30 ? 1 : index >= 20 ? 2 : 3;
  }
  return typeof cap === 'number' ? cap : null;
}

const EXPANDED_SHOP_NAMES = ['Hunter\'s Draught', 'Aegis Oil', 'Swiftwind Salve', 'Piercing Dust', 'Vitality Seal', 'Echo Battery', 'Goldleaf Charm', 'Farsight Lens', 'Bulwark Core', 'Razor Thread', 'Mercury Coil', 'Sunderstone', 'Lifebloom Vial', 'Dashweave', 'Coinbinder', 'Arcane Magazine', 'Sunken Reliquary', 'Warden\'s Plate', 'Storm Cartridge', 'Hearthstone', 'Void Purse', 'Dragonbone Grip', 'Mirage Compass', 'Starforged Edge', 'Crown of Haste', 'Aether Reservoir', 'Phoenix Thread', 'Worldroot Talisman', 'Eclipse Lens', 'Sovereign Cache', 'First Flame Relic', 'Endless Hour', 'Legend\'s Dividend', 'Aether Crown', 'Realmheart'];

function expandedShopRarity(index: number): Rarity {
  if (index < 9) return 'common';
  if (index < 20) return 'rare';
  if (index < 30) return 'epic';
  return 'legendary';
}

const EXPANDED_SHOP_ITEMS: ShopItemDef[] = EXPANDED_SHOP_NAMES.map((name, index) => {
  const rarity = expandedShopRarity(index);
  const cost = rarity === 'common' ? 300 + index * 30
    : rarity === 'rare' ? 600 + (index - 9) * 180
      : rarity === 'epic' ? 2500 + (index - 20) * 250
        : 6000 + (index - 30) * 500;
  const effect = index % 6;
  const desc = effect === 0 ? '+8% weapon damage for the rest of this run.' : effect === 1 ? '+8% attack speed for the rest of this run.' : effect === 2 ? '+10% movement speed for the rest of this run.' : effect === 3 ? '+18 max health and restore it now.' : effect === 4 ? '+6% critical chance for the rest of this run.' : '+35% coin value for the rest of this run.';
  return {
    id: `expanded_shop_${index}` as ShopItemId,
    name,
    kicker: 'PERMANENT',
    desc,
    cost,
    color: rarity === 'legendary' ? '#ffd36b' : rarity === 'epic' ? '#c184ff' : rarity === 'rare' ? '#61b9ff' : '#aab4c5',
    icon: effect === 0 || effect === 4 ? 'blade' : effect === 1 || effect === 2 ? 'boot' : effect === 3 ? 'heart' : 'spark',
    rarity,
    recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade', 'stormwarden', 'drakewarden'],
    duration: 'Rest of run · stacks',
  };
});

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'rations',
    name: 'Field Rations',
    kicker: 'ONE USE',
    desc: 'Restore 48 health before the next assault.',
    cost: 100,
    color: '#9defa4',
    icon: 'heart',
    rarity: 'common', recommended: ['shieldthane', 'tidecaller', 'jaguar'], duration: 'Immediate',
  },
  {
    id: 'tonic',
    name: 'Sun Tonic',
    kicker: 'ONE USE',
    desc: 'Gain Empowered for 18 seconds (+50% damage).',
    cost: 200,
    color: '#ffd36b',
    icon: 'sun',
    rarity: 'common', recommended: ['kensei', 'jaguar', 'riftblade'], duration: '18 seconds',
  },
  {
    id: 'steel',
    name: 'Tempered Steel',
    kicker: 'PERMANENT',
    desc: '+14% weapon damage for the rest of this run.',
    cost: 1200,
    color: '#ff9e88',
    icon: 'blade',
    rarity: 'rare', recommended: ['kensei', 'jaguar', 'riftblade'], duration: 'Rest of run · stacks',
  },
  {
    id: 'boots',
    name: 'Wayfarer Boots',
    kicker: 'PERMANENT',
    desc: '+10% movement speed for the rest of this run.',
    cost: 150,
    color: '#78e0d0',
    icon: 'boot',
    rarity: 'common', recommended: ['sandseer', 'riftblade', 'jaguar'], duration: 'Rest of run · stacks',
  },
  {
    id: 'ward',
    name: 'Moonward Charm',
    kicker: 'PERMANENT',
    desc: '+18 max health and restore 18 health now.',
    cost: 900,
    color: '#b1c5df',
    icon: 'shield',
    rarity: 'rare', recommended: ['shieldthane', 'tidecaller'], duration: 'Rest of run · stacks',
  },
  {
    id: 'sigil',
    name: 'Astral Sigil',
    kicker: 'ONE USE',
    desc: 'Fully refresh your signature ability now.',
    cost: 600,
    color: '#d7adff',
    icon: 'spark',
    rarity: 'rare', recommended: ['sandseer', 'tidecaller', 'shieldthane'], duration: 'Immediate',
  },
  {
    id: 'whetstone', name: 'Obsidian Whetstone', kicker: 'PERMANENT',
    desc: '+7% critical chance and +8% weapon damage.', cost: 1400, color: '#ff907d', icon: 'blade',
    rarity: 'rare', recommended: ['kensei', 'jaguar', 'riftblade'], duration: 'Rest of run · stacks',
  },
  {
    id: 'hourglass', name: 'Chronicle Hourglass', kicker: 'PERMANENT',
    desc: 'Signature and Legacy cooldowns are 14% shorter.', cost: 3000, color: '#8fe7ff', icon: 'spark',
    rarity: 'epic', recommended: ['sandseer', 'tidecaller', 'riftblade'], duration: 'Rest of run · stacks',
  },
  {
    id: 'magnet', name: 'Gilded Lodestone', kicker: 'PERMANENT',
    desc: '+50% coin value and +60 pickup range.', cost: 1000, color: '#ffd24a', icon: 'spark',
    rarity: 'rare', recommended: ['sandseer', 'tidecaller'], duration: 'Rest of run · stacks',
  },
  {
    id: 'elixir', name: 'Phoenix Elixir', kicker: 'ONE USE',
    desc: 'Fully restore health and gain +20 max health.', cost: 2500, color: '#ff856b', icon: 'heart',
    rarity: 'epic', recommended: ['shieldthane', 'jaguar', 'tidecaller'], duration: 'Immediate + permanent health',
  },
  {
    id: 'prism', name: 'Legacy Prism', kicker: 'ONE USE',
    desc: 'Fully refresh both Signature and Legacy abilities.', cost: 3500, color: '#d7adff', icon: 'spark',
    rarity: 'epic', recommended: ['sandseer', 'tidecaller', 'riftblade'], duration: 'Immediate',
  },
  {
    id: 'war_banner', name: 'Banner of Six Realms', kicker: 'PERMANENT',
    desc: '+18% damage, +10% movement speed and +15 max health.', cost: 6000, color: '#ffd36b', icon: 'sun',
    rarity: 'legendary', recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade'], duration: 'Rest of run · stacks',
  },
  {
    id: 'xp_tome', name: 'Tome of Aether Insight', kicker: 'PERMANENT',
    desc: '+12% experience from defeated foes for the rest of this run.', cost: 4000, color: '#7de7ff', icon: 'spark',
    rarity: 'epic', recommended: ['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade'], duration: 'Rest of run · stacks',
  },
  ...EXPANDED_SHOP_ITEMS,
];
