export interface HeroCombatStats {
  baseDamage: number;
  attackCooldown: number;
  damageMultiplier: number;
  attackRateMultiplier: number;
  critChance: number;
  maxHealth: number;
  armor: number;
  movementSpeed: number;
}

export interface WaveDifficulty {
  hp: number;
  dmg: number;
  speed: number;
  elites: number;
  activeCap: number;
  spawnGap: number;
  bossHp: number;
  bossDmg: number;
  bossSpeed: number;
  bossAttackGap: number;
  bossMinionGap: number;
}

export function heroBasePower(stats: HeroCombatStats): number {
  const sustainedDamage = (stats.baseDamage / stats.attackCooldown) * stats.damageMultiplier * stats.attackRateMultiplier;
  const critFactor = 1 + Math.min(0.85, stats.critChance);
  const survivability = 1 + Math.min(0.65, stats.armor) + Math.min(0.7, Math.max(0, stats.maxHealth - 90) / 260);
  const mobility = 1 + Math.min(0.35, Math.max(0, stats.movementSpeed - 200) / 600);
  return sustainedDamage * critFactor * Math.sqrt(survivability * mobility);
}

export function waveDifficulty(heroPower: number, basePower: number, wave: number): WaveDifficulty {
  const progress = Math.max(0, wave - 1);
  const earlyScale = wave < 10 ? 0.82 + progress * 0.02 : 1;
  const progression = (1 + progress * 0.12 + Math.pow(progress, 1.2) * 0.018) * earlyScale;
  const buildRatio = basePower > 0 ? heroPower / basePower : 1;
  const heroPressure = Math.min(1.4, Math.max(0.88, 0.92 + (buildRatio - 1) * 0.34));
  const pressure = progression * heroPressure;
  const boss = wave % 5 === 0;
  const bossDamageScale = wave <= 10
    ? 0.23 + Math.max(0, wave - 5) * 0.008
    : Math.min(1, 0.27 + (wave - 10) * 0.0365);

  return {
    hp: pressure,
    dmg: Math.pow(pressure, 0.72),
    speed: 1 + Math.min(0.58, progress * 0.022 * earlyScale + (heroPressure - 1) * 0.08),
    elites: Math.min(0.34, 0.06 + progress * 0.014 * earlyScale + Math.max(0, heroPressure - 1) * 0.08),
    activeCap: Math.min(38, 13 + Math.floor(wave * 1.15) + Math.floor(Math.max(0, heroPressure - 1) * 4)),
    spawnGap: Math.max(0.2, 1.16 - wave * 0.045 - Math.max(0, heroPressure - 1) * 0.12),
    bossHp: boss ? (2.55 + Math.min(0.65, progress * 0.014)) * earlyScale * Math.min(1.45, 0.94 + (buildRatio - 1) * 0.28) : 0,
    bossDmg: boss ? (1.6 + Math.min(0.4, progress * 0.009)) * bossDamageScale * Math.min(1.3, 0.96 + (buildRatio - 1) * 0.2) : 0,
    bossSpeed: boss ? 1 + Math.min(0.28, progress * 0.012 * earlyScale) : 1,
    bossAttackGap: boss ? Math.max(0.62, 1 - Math.min(0.28, progress * 0.008 * earlyScale)) : 1,
    bossMinionGap: boss ? Math.max(4.8, 7.8 - progress * earlyScale * 0.07) : 7.8,
  };
}
