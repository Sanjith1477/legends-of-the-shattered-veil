import type { EliteRole } from './data';

/**
 * Visual identity for each elite role.
 *
 * Primary matches the role cue colour used by the HUD/telegraphs so the
 * silhouette and the gameplay warning always read as the same creature.
 * These are rendering values only — no gameplay tuning lives here.
 */
export interface ElitePalette {
  /** Main body colour; matches ELITE_ROLES[role].color. */
  primary: string;
  /** Armour, cloth, and silhouette fill. */
  secondary: string;
  /** Runes, eyes, blades, and energy highlights. */
  accent: string;
  /** Deep shadow areas and cloth interior. */
  dark: string;
  /** Trim, blades, and mechanical parts. */
  metal: string;
}

export const ELITE_PALETTES: Record<EliteRole, ElitePalette> = {
  shielded: {
    primary: '#8fd7ff',
    secondary: '#2c4a63',
    accent: '#e9fbff',
    dark: '#0a1622',
    metal: '#c2d3df',
  },
  summoner: {
    primary: '#c58cf0',
    secondary: '#3a2257',
    accent: '#f3e3ff',
    dark: '#150b21',
    metal: '#8d78a3',
  },
  assassin: {
    primary: '#b9a7ff',
    secondary: '#241a3a',
    accent: '#e8e2ff',
    dark: '#07050d',
    metal: '#d3d9e8',
  },
  artillery: {
    primary: '#ffb36b',
    secondary: '#4a2a1b',
    accent: '#ffe6a8',
    dark: '#190d08',
    metal: '#82705c',
  },
  healer: {
    primary: '#7ddb6f',
    secondary: '#21402b',
    accent: '#e1ffd9',
    dark: '#0a1a10',
    metal: '#c2cfb2',
  },
};
