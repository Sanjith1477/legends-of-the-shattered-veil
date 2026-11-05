export interface BurnStatus {
  remaining: number;
  tickRemaining: number;
  damagePerSecond: number;
}

export interface BurnTick {
  status: BurnStatus | null;
  damage: number;
}

export const LEGEND_MECHANICS = {
  criticalMultiplier: 2,
  bloodRiteMultiplier: 1.45,
  stasisBaseDuration: 2,
  stasisDoublerBonus: 1,
  pyramidRiteProjectileMultiplier: 1.5,
  burnDuration: 2,
  burnTickInterval: 0.5,
  burnHitFraction: 0.2,
  burnMaxDpsFraction: 0.4,
  burnBossDpsFraction: 0.2,
  blackHoleDuration: 1.5,
  blackHoleRadius: 115,
  blackHoleTickInterval: 0.5,
  blackHoleDamageFraction: 0.18,
} as const;

export function resolveCriticalHit(roll: number, chance: number, guaranteed: boolean): boolean {
  return guaranteed || roll < Math.max(0, Math.min(1, chance));
}

export function criticalDamage(damage: number, isCritical: boolean): number {
  return isCritical ? damage * LEGEND_MECHANICS.criticalMultiplier : damage;
}

export function bloodRiteDamage(damage: number, classId: string, active: boolean): number {
  return classId === 'jaguar' && active ? damage * LEGEND_MECHANICS.bloodRiteMultiplier : damage;
}

export function stasisDuration(hasDoubler: boolean): number {
  return LEGEND_MECHANICS.stasisBaseDuration
    + (hasDoubler ? LEGEND_MECHANICS.stasisDoublerBonus : 0);
}

export function bloodRiteProjectileCount(baseCount: number, empowered: boolean): number {
  return empowered
    ? Math.ceil(baseCount * LEGEND_MECHANICS.pyramidRiteProjectileMultiplier)
    : baseCount;
}

export function radialAngles(count: number, offset = 0): number[] {
  if (!Number.isInteger(count) || count <= 0) return [];
  return Array.from({ length: count }, (_, index) => offset + index * (Math.PI * 2 / count));
}

export function claimProjectileHit<T>(hitTargets: Set<T>, target: T): boolean {
  if (hitTargets.has(target)) return false;
  hitTargets.add(target);
  return true;
}

export function shieldBlocksHit(nx: number, ny: number, faceA: number): boolean {
  const len = Math.hypot(nx, ny) || 1;
  const frontal = (-nx / len) * Math.cos(faceA) + (-ny / len) * Math.sin(faceA);
  return frontal > 0.25;
}

export function applyBurnStatus(
  current: BurnStatus | null,
  hitDamage: number,
  referenceDamage: number,
  boss = false,
): BurnStatus | null {
  if (!Number.isFinite(hitDamage) || !Number.isFinite(referenceDamage) || hitDamage <= 0 || referenceDamage <= 0) {
    return current;
  }
  const maxDps = referenceDamage * (
    boss ? LEGEND_MECHANICS.burnBossDpsFraction : LEGEND_MECHANICS.burnMaxDpsFraction
  );
  const hitDps = Math.min(hitDamage * LEGEND_MECHANICS.burnHitFraction, maxDps);
  return {
    remaining: LEGEND_MECHANICS.burnDuration,
    tickRemaining: current?.tickRemaining ?? LEGEND_MECHANICS.burnTickInterval,
    damagePerSecond: Math.max(current?.damagePerSecond ?? 0, hitDps),
  };
}

export function tickBurnStatus(status: BurnStatus | null, dt: number): BurnTick {
  if (!status || !Number.isFinite(dt) || dt <= 0) return { status, damage: 0 };
  const elapsed = Math.min(dt, status.remaining);
  let tickRemaining = status.tickRemaining - elapsed;
  let damage = 0;
  while (tickRemaining <= 0) {
    damage += status.damagePerSecond * LEGEND_MECHANICS.burnTickInterval;
    tickRemaining += LEGEND_MECHANICS.burnTickInterval;
  }
  const remaining = status.remaining - elapsed;
  return {
    status: remaining > 0 ? { ...status, remaining, tickRemaining } : null,
    damage,
  };
}

export function pointSegmentDistanceSquared(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return (px - x1) ** 2 + (py - y1) ** 2;
  const projection = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
  const nearestX = x1 + projection * dx;
  const nearestY = y1 + projection * dy;
  return (px - nearestX) ** 2 + (py - nearestY) ** 2;
}
