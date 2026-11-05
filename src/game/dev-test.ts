import {
  ELITE_ROLE_KINDS,
  FINAL_WAVE,
  type EliteRole,
  type EnemyKind,
} from './data.ts';

/** Keep developer wave selection inside the real campaign range. */
export function normalizeDevWave(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(FINAL_WAVE, Math.max(1, Math.trunc(parsed)));
}

/** Pick a legal carrier for a forced elite role when spawning a test enemy. */
export function devEliteKindForRole(role: EliteRole): EnemyKind {
  const kinds = ELITE_ROLE_KINDS[role];
  return kinds[0] ?? 'husk';
}
