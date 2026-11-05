import test from 'node:test';
import assert from 'node:assert/strict';

import { ELITE_ROLE_KINDS, ELITE_ROLES, FINAL_WAVE, type EliteRole } from './data.ts';
import { devEliteKindForRole, normalizeDevWave } from './dev-test.ts';

test('developer wave selection clamps to a valid campaign wave', () => {
  assert.equal(normalizeDevWave(0), 1);
  assert.equal(normalizeDevWave(-12), 1);
  assert.equal(normalizeDevWave(7.9), 7);
  assert.equal(normalizeDevWave(FINAL_WAVE + 30), FINAL_WAVE);
  assert.equal(normalizeDevWave('14'), 14);
  assert.equal(normalizeDevWave('not-a-wave'), 1);
  assert.equal(normalizeDevWave(Number.NaN), 1);
});

test('forced elite spawns always use a declared carrier kind', () => {
  for (const role of Object.keys(ELITE_ROLES) as EliteRole[]) {
    const kind = devEliteKindForRole(role);
    assert.ok(ELITE_ROLE_KINDS[role].includes(kind), `${role} spawned an incompatible ${kind}`);
  }
});
