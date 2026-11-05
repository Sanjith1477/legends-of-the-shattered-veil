import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEGEND_MECHANICS,
  applyBurnStatus,
  bloodRiteDamage,
  bloodRiteProjectileCount,
  claimProjectileHit,
  criticalDamage,
  pointSegmentDistanceSquared,
  radialAngles,
  resolveCriticalHit,
  shieldBlocksHit,
  stasisDuration,
  tickBurnStatus,
} from './legend-mechanics.ts';

test('critical hits and Blood Rite scale damage once for all Jaguar damage sources', () => {
  assert.equal(resolveCriticalHit(0.99, 0.1, true), true);
  assert.equal(resolveCriticalHit(0.09, 0.1, false), true);
  assert.equal(resolveCriticalHit(0.1, 0.1, false), false);
  assert.equal(resolveCriticalHit(0.5, 2, false), true);
  assert.equal(resolveCriticalHit(0, -1, false), false);
  assert.equal(criticalDamage(100, false), 100);
  assert.equal(criticalDamage(100, true), 200);
  assert.equal(bloodRiteDamage(100, 'jaguar', true), 145);
  assert.equal(bloodRiteDamage(criticalDamage(100, true), 'jaguar', true), 290);
  assert.equal(bloodRiteDamage(100, 'kensei', true), 100);
  assert.equal(bloodRiteDamage(100, 'jaguar', false), 100);
});

test('Pyramid of Dawn increases projectile counts while Blood Rite is active', () => {
  assert.equal(bloodRiteProjectileCount(8, true), 12);
  assert.equal(bloodRiteProjectileCount(10, true), 15);
  assert.equal(bloodRiteProjectileCount(4, false), 4);
});

test('Stasis Doubler adds exactly one second', () => {
  assert.equal(stasisDuration(false), 2);
  assert.equal(stasisDuration(true), 3);
  assert.equal(stasisDuration(true) - stasisDuration(false), LEGEND_MECHANICS.stasisDoublerBonus);
});

test('radial evolution volleys return the requested number of evenly spaced directions', () => {
  const directions = radialAngles(8, Math.PI / 8);
  assert.equal(directions.length, 8);
  for (let i = 1; i < directions.length; i++) {
    assert.ok(Math.abs((directions[i] - directions[i - 1]) - Math.PI / 4) < 1e-12);
  }
  assert.deepEqual(radialAngles(0), []);
  assert.deepEqual(radialAngles(-1), []);
  assert.deepEqual(radialAngles(2.5), []);
});

test('a projectile can hit each target once per outbound or return pass', () => {
  const firstTarget = {};
  const secondTarget = {};
  const hitTargets = new Set<object>();
  assert.equal(claimProjectileHit(hitTargets, firstTarget), true);
  assert.equal(claimProjectileHit(hitTargets, firstTarget), false);
  assert.equal(claimProjectileHit(hitTargets, secondTarget), true);

  hitTargets.clear();
  assert.equal(claimProjectileHit(hitTargets, firstTarget), true);
});

test('shield facing blocks attacks and ordinary burn ticks from the front only', () => {
  assert.equal(shieldBlocksHit(1, 0, Math.PI), true);
  assert.equal(shieldBlocksHit(-1, 0, 0), true);
  assert.equal(shieldBlocksHit(1, 0, 0), false);
  assert.equal(shieldBlocksHit(0, 0, 0), false);
});

test('burn damage is capped, refreshes instead of stacking, and expires after bounded ticks', () => {
  const first = applyBurnStatus(null, 100, 10);
  assert.deepEqual(first, {
    remaining: LEGEND_MECHANICS.burnDuration,
    tickRemaining: LEGEND_MECHANICS.burnTickInterval,
    damagePerSecond: 4,
  });
  const refreshed = applyBurnStatus(first, 1, 10);
  assert.equal(refreshed?.remaining, LEGEND_MECHANICS.burnDuration);
  assert.equal(refreshed?.damagePerSecond, first?.damagePerSecond);

  const firstTick = tickBurnStatus(refreshed, 0.5);
  assert.equal(firstTick.damage, 2);
  assert.equal(firstTick.status?.remaining, 1.5);
  const fullDuration = tickBurnStatus(firstTick.status, 1.5);
  assert.equal(fullDuration.damage, 6);
  assert.equal(fullDuration.status, null);
  assert.equal(applyBurnStatus(null, -1, 10), null);
});

test('boss burn damage can use the conservative boss cap', () => {
  const bossBurn = applyBurnStatus(null, 100, 10, true);
  assert.equal(bossBurn?.damagePerSecond, 2);
});

test('line-slice geometry includes points on the path and rejects distant points', () => {
  assert.equal(pointSegmentDistanceSquared(5, 0, 0, 0, 10, 0), 0);
  assert.equal(pointSegmentDistanceSquared(5, 3, 0, 0, 10, 0), 9);
  assert.equal(pointSegmentDistanceSquared(13, 0, 0, 0, 10, 0), 9);
});
