import test from 'node:test';
import assert from 'node:assert/strict';

import { heroBasePower, waveDifficulty } from './difficulty.ts';

const earlyHero = {
  baseDamage: 12,
  attackCooldown: 0.3,
  damageMultiplier: 1,
  attackRateMultiplier: 1,
  critChance: 0.18,
  maxHealth: 92,
  armor: 0,
  movementSpeed: 252,
};

test('hero baseline uses permanent combat stats and ignores temporary buffs', () => {
  const baseline = heroBasePower(earlyHero);
  const stronger = heroBasePower({ ...earlyHero, damageMultiplier: 1.8, attackRateMultiplier: 1.4, maxHealth: 140, armor: 0.25 });
  assert.ok(baseline > 0);
  assert.ok(stronger > baseline);
  assert.ok(stronger < baseline * 4);
});

test('early wave pressure rises smoothly while early bosses stay survivable', () => {
  const baseline = heroBasePower(earlyHero);
  const wave1 = waveDifficulty(baseline, baseline, 1);
  const wave3 = waveDifficulty(baseline, baseline, 3);
  const firstBoss = waveDifficulty(baseline * 1.35, baseline, 5);
  const mid = waveDifficulty(baseline * 1.8, baseline, 10);
  const lateBoss = waveDifficulty(baseline * 2.6, baseline, 25);

  assert.ok(wave1.hp < wave3.hp && wave3.hp < firstBoss.hp && firstBoss.hp < mid.hp && mid.hp < lateBoss.hp);
  assert.ok(firstBoss.bossHp > 2 && firstBoss.bossHp < 2.5);
  assert.ok(firstBoss.bossDmg > 0.3 && firstBoss.bossDmg < 0.5);
  assert.ok(firstBoss.bossAttackGap < 1);
  assert.ok(lateBoss.bossMinionGap < firstBoss.bossMinionGap);
});

test('wave ten returns to the original curve and late-game scaling is unchanged', () => {
  const baseline = heroBasePower(earlyHero);
  const wave10 = waveDifficulty(baseline, baseline, 10);
  const wave50 = waveDifficulty(baseline, baseline, 50);
  const wave50Progress = 49;

  assert.ok(Math.abs(wave10.hp - (1 + 9 * 0.12 + Math.pow(9, 1.2) * 0.018) * 0.92) < 0.0001);
  assert.ok(Math.abs(wave50.hp - (1 + wave50Progress * 0.12 + Math.pow(wave50Progress, 1.2) * 0.018) * 0.92) < 0.0001);
  assert.ok(Math.abs(wave50.bossDmg - 1.92) < 0.0001);
});

test('hero scaling is bounded instead of allowing one build to explode difficulty', () => {
  const baseline = heroBasePower(earlyHero);
  const ordinary = waveDifficulty(baseline * 1.1, baseline, 20);
  const extreme = waveDifficulty(baseline * 10, baseline, 20);
  assert.ok(extreme.hp / ordinary.hp < 1.5);
  assert.ok(extreme.bossHp / ordinary.bossHp < 1.5);
});