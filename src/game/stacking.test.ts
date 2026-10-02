import test from 'node:test';
import assert from 'node:assert/strict';

import {
  capStackCount,
  getPowerStackCap,
  getShopItemStackCap,
  isPowerAvailable,
  isRarityUnlocked,
  isShopRarityUnlocked,
  rarityOddsForLevel,
  shopRarityOddsForWave,
  xpWithBonus,
  canOpenLevelUp,
  FINAL_WAVE,
  MAX_PLAYER_LEVEL,
  POWERS,
  SHOP_ITEMS,
} from './data.ts';

test('power stacking caps are finite and enforced', () => {
  assert.equal(getPowerStackCap('keen_edge'), 3);
  assert.equal(getPowerStackCap('veteran_reach'), 3);
  assert.equal(capStackCount(99, getPowerStackCap('keen_edge')), 3);
  assert.equal(capStackCount(4, getPowerStackCap('veteran_reach')), 3);
});

test('one-time powers and maxed stacks leave the draft pool', () => {
  assert.equal(getPowerStackCap('evo_kensei_crescent'), 1);
  assert.equal(isPowerAvailable('evo_kensei_crescent', []), true);
  assert.equal(isPowerAvailable('evo_kensei_crescent', ['evo_kensei_crescent']), false);
  assert.equal(isPowerAvailable('veteran_reach', ['veteran_reach', 'veteran_reach']), true);
  assert.equal(isPowerAvailable('veteran_reach', ['veteran_reach', 'veteran_reach', 'veteran_reach']), false);
});

test('late multiplicative outliers have bounded realistic caps', () => {
  assert.equal(getPowerStackCap('death_dealer'), 1);
  assert.equal(getPowerStackCap('chronomancer'), 1);
  assert.equal(getPowerStackCap('royal_treasury'), 1);
  assert.equal(getPowerStackCap('aetherborn_form'), 1);
  assert.equal(getPowerStackCap('predator_instinct'), 2);
});

test('marketplace stacking caps prevent runaway purchases', () => {
  assert.equal(getShopItemStackCap('tonic'), 2);
  assert.equal(getShopItemStackCap('steel'), 3);
  assert.equal(capStackCount(999, getShopItemStackCap('tonic')), 2);
  assert.equal(capStackCount(5, getShopItemStackCap('steel')), 3);
});

test('late-game draft reserves and XP power remain valid', () => {
  assert.equal(getPowerStackCap('aether_insight'), 5);
  assert.equal(isPowerAvailable('aether_insight', Array(4).fill('aether_insight')), true);
  assert.equal(isPowerAvailable('aether_insight', Array(5).fill('aether_insight')), false);
  assert.deepEqual(POWERS.filter((power) => power.id.startsWith('late_')).map((power) => power.id), [
    'late_aether_surge', 'late_void_horizon', 'late_starfall',
  ]);
});

test('marketplace prices scale with item power and rarity', () => {
  const prices = Object.fromEntries(SHOP_ITEMS.map((item) => [item.id, item.cost]));
  assert.equal(prices.rations, 100);
  assert.equal(prices.steel, 1200);
  assert.equal(prices.hourglass, 3000);
  assert.equal(prices.war_banner, 6000);
  const priceRange = (rarity: string) => {
    const costs = SHOP_ITEMS.filter((item) => item.rarity === rarity).map((item) => item.cost);
    return [Math.min(...costs), Math.max(...costs)];
  };
  assert.deepEqual(priceRange('common'), [100, 540]);
  assert.deepEqual(priceRange('rare'), [600, 2400]);
  assert.deepEqual(priceRange('epic'), [2500, 4750]);
  assert.deepEqual(priceRange('legendary'), [6000, 8000]);
});

test('late-game progression caps and unlock gaps are fixed', () => {
  assert.equal(FINAL_WAVE, 120);
  assert.equal(MAX_PLAYER_LEVEL, 60);
  assert.equal(isRarityUnlocked('rare', 11), false);
  assert.equal(isRarityUnlocked('rare', 12), true);
  assert.equal(isRarityUnlocked('epic', 27), false);
  assert.equal(isRarityUnlocked('epic', 28), true);
  assert.equal(isRarityUnlocked('legendary', 47), false);
  assert.equal(isRarityUnlocked('legendary', 48), true);
  assert.equal(isShopRarityUnlocked('rare', 19), false);
  assert.equal(isShopRarityUnlocked('epic', 54), false);
  assert.equal(isShopRarityUnlocked('legendary', 89), false);
  assert.deepEqual(rarityOddsForLevel(60), rarityOddsForLevel(600));
  assert.deepEqual(shopRarityOddsForWave(120), shopRarityOddsForWave(1200));
});

test('XP boost is per-run and additive to the existing multiplier', () => {
  assert.equal(xpWithBonus(100, 1), 100);
  assert.equal(xpWithBonus(100, 1.24), 124);
  assert.equal(xpWithBonus(100, 0.5), 100);
});

test('level-up protection rejects max levels and empty drafts', () => {
  assert.equal(canOpenLevelUp(MAX_PLAYER_LEVEL, 1, 3), false);
  assert.equal(canOpenLevelUp(20, 1, 0), false);
  assert.equal(canOpenLevelUp(20, 1, 3), true);
});

test('power and marketplace pools are expanded without removing the original content', () => {
  assert.equal(POWERS.length, 174);
  assert.equal(SHOP_ITEMS.length, 48);
  assert.ok(POWERS.some((power) => power.id === 'aether_insight'));
  assert.ok(SHOP_ITEMS.some((item) => item.id === 'xp_tome'));
  assert.equal(getShopItemStackCap('xp_tome'), 5);
});
