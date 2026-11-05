import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ELITE_ROLE_CAPS,
  ELITE_ROLE_KINDS,
  ELITE_ROLES,
  eliteRolesFor,
  type EliteRole,
} from './data.ts';

test('elite roles unlock gradually and never appear in the opening waves', () => {
  for (const kind of ['husk', 'skitter', 'hexer', 'brute', 'mage'] as const) {
    assert.deepEqual(eliteRolesFor(kind, 1), []);
    assert.deepEqual(eliteRolesFor(kind, 2), []);
  }
  assert.ok(eliteRolesFor('brute', 3).includes('shielded'));
  assert.ok(eliteRolesFor('skitter', 5).includes('assassin'));
  assert.ok(eliteRolesFor('mage', 8).includes('artillery'));
  assert.ok(eliteRolesFor('hexer', 11).includes('summoner'));
  assert.ok(eliteRolesFor('husk', 14).includes('healer'));
});

test('role compatibility stays inside the declared base enemy kinds', () => {
  for (const role of Object.keys(ELITE_ROLES) as EliteRole[]) {
    const kinds = ELITE_ROLE_KINDS[role];
    assert.ok(kinds.length > 0, `${role} must have at least one base kind`);
    for (const kind of kinds) {
      assert.ok(eliteRolesFor(kind, 120).includes(role), `${role} should be available on ${kind}`);
    }
    assert.ok(ELITE_ROLE_CAPS[role] >= 1, `${role} needs an active cap`);
  }
});
