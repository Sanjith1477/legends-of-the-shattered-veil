import test from 'node:test';
import assert from 'node:assert/strict';

import { ASSASSIN_TELEPORT, sampleAssassinLanding } from './elite-teleport.ts';

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

test('assassin blink landing stays inside the telegraphed area', () => {
  const random = seededRandom(42);
  for (let i = 0; i < 200; i++) {
    const landing = sampleAssassinLanding(500, 400, random);
    const distance = Math.hypot(landing.x - 500, landing.y - 400);
    assert.ok(distance <= ASSASSIN_TELEPORT.maxScatter + 0.0001);
    assert.ok(distance >= ASSASSIN_TELEPORT.minScatter - 0.0001);
    assert.ok(distance < ASSASSIN_TELEPORT.areaRadius);
  }
});

test('assassin blink landing is not the exact indicator centre', () => {
  const landing = sampleAssassinLanding(500, 400, () => 0);
  assert.notDeepEqual(landing, { x: 500, y: 400 });
  assert.ok(Math.hypot(landing.x - 500, landing.y - 400) >= ASSASSIN_TELEPORT.minScatter);
});
