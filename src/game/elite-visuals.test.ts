import test from 'node:test';
import assert from 'node:assert/strict';

import { ELITE_ROLES, type EliteRole } from './data.ts';
import { ELITE_PALETTES } from './elite-visuals.ts';

const ROLES = Object.keys(ELITE_ROLES) as EliteRole[];
const HEX = /^#[0-9a-f]{6}$/i;

test('every elite role has a complete, distinct visual palette', () => {
  for (const role of ROLES) {
    const palette = ELITE_PALETTES[role];
    assert.ok(palette, `${role} is missing a palette`);
    for (const [key, value] of Object.entries(palette)) {
      assert.match(value, HEX, `${role}.${key} is not a hex colour`);
    }
    assert.equal(palette.primary.toLowerCase(), ELITE_ROLES[role].color.toLowerCase(), `${role} primary must match its cue colour`);
  }

  for (const key of ['primary', 'secondary', 'accent', 'dark', 'metal'] as const) {
    const values = ROLES.map((role) => ELITE_PALETTES[role][key].toLowerCase());
    assert.equal(new Set(values).size, values.length, `${key} colours must be unique per role`);
  }
});
