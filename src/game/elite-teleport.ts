const TAU = Math.PI * 2;

/**
 * Assassin blink telegraph tuning.
 *
 * The area is wide enough to read as a warning, while the actual landing point
 * is rolled inside it only when the blink resolves. That keeps the marker from
 * becoming a pixel-perfect safe-spot guide.
 */
export const ASSASSIN_TELEPORT = {
  windup: 0.55,
  areaRadius: 78,
  minScatter: 18,
  maxScatter: 58,
} as const;

export interface BlinkLanding {
  x: number;
  y: number;
}

/** Roll the real landing point somewhere inside the telegraphed area. */
export function sampleAssassinLanding(centerX: number, centerY: number, random = Math.random): BlinkLanding {
  const angle = random() * TAU;
  const radius = ASSASSIN_TELEPORT.minScatter
    + Math.sqrt(random()) * (ASSASSIN_TELEPORT.maxScatter - ASSASSIN_TELEPORT.minScatter);
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}
