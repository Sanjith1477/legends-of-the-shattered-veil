import { Game, type GameStats } from './engine';
import { devEliteKindForRole, normalizeDevWave } from './dev-test';
import type { EliteRole, EnemyKind } from './data';

/**
 * Developer Test Mode runtime.
 *
 * This module is only ever loaded through the `import.meta.env.DEV` guarded
 * dynamic import in App.tsx. It augments the Game prototype at runtime so the
 * production Game class contains no developer-only state, methods, wave
 * selection, or forced-elite spawn paths.
 */

interface DevGame {
  state: string;
  p: unknown;
  wave: number;
  waveBreak: number;
  feed: unknown[];
  classDef: { id: string };
  playerName: string;
  profileId: string;
  profileName: string;
  beginRun(classId: string, name: string, profileId: string, profileName: string): void;
  startWave(wave: number): void;
  spawnEnemy(kind: EnemyKind, forcedRole?: EliteRole | null): void;
  pushFeed(text: string, color: string): void;
  toMenu(): void;
  restart(): void;
}

type DevRun = { wave: number; eliteRole: EliteRole | null };

export type DevGameStats = GameStats & { testRun: boolean };

interface DevPrototype extends DevGame {
  getStats(): GameStats;
  startDevRun?: (
    this: DevGame,
    classId: string,
    name: string,
    profileId: string,
    profileName: string,
    wave: number,
    eliteRole?: EliteRole | null,
  ) => boolean;
  spawnDevElite?: (this: DevGame, role: EliteRole) => boolean;
  isDevTestRun?: (this: DevGame) => boolean;
}

const devRunState = new WeakMap<Game, DevRun>();
let installed = false;

function isDevTestRun(this: DevGame): boolean {
  return devRunState.has(this as unknown as Game);
}

function startDevRun(
  this: DevGame,
  classId: string,
  name: string,
  profileId: string,
  profileName: string,
  wave: number,
  eliteRole: EliteRole | null = null,
): boolean {
  const targetWave = normalizeDevWave(wave);
  this.beginRun(classId, name, profileId, profileName);
  // beginRun emits the normal intro feed; a test run replaces it with its own.
  this.feed.length = 0;
  this.waveBreak = 0;
  this.wave = targetWave - 1;
  devRunState.set(this as unknown as Game, { wave: targetWave, eliteRole });
  this.startWave(targetWave);
  this.pushFeed(
    `DEVELOPER TEST RUN · WAVE ${targetWave}. Leaderboard and permanent progression are disabled.`,
    '#ff8a8a',
  );
  if (eliteRole) this.spawnEnemy(devEliteKindForRole(eliteRole), eliteRole);
  return true;
}

function spawnDevElite(this: DevGame, role: EliteRole): boolean {
  if (!isDevTestRun.call(this) || this.state !== 'playing' || !this.p) return false;
  this.spawnEnemy(devEliteKindForRole(role), role);
  return true;
}

export function installDevRun(GameClass: typeof Game) {
  if (!import.meta.env.DEV || installed) return;
  installed = true;

  const proto = GameClass.prototype as unknown as DevPrototype;
  const baseBeginRun = proto.beginRun;
  const baseGetStats = proto.getStats;
  const baseToMenu = proto.toMenu;
  const baseRestart = proto.restart;

  proto.startDevRun = startDevRun;
  proto.spawnDevElite = spawnDevElite;
  proto.isDevTestRun = isDevTestRun;
  proto.getStats = function (this: DevGame): GameStats {
    const stats = baseGetStats.call(this) as DevGameStats;
    return isDevTestRun.call(this) ? Object.assign(stats, { testRun: true }) : stats;
  };
  proto.beginRun = function (this: DevGame, ...args: [string, string, string, string]) {
    devRunState.delete(this as unknown as Game);
    baseBeginRun.apply(this, args);
  };
  proto.toMenu = function (this: DevGame) {
    devRunState.delete(this as unknown as Game);
    baseToMenu.call(this);
  };
  proto.restart = function (this: DevGame) {
    const dev = devRunState.get(this as unknown as Game);
    if (dev) {
      startDevRun.call(
        this,
        this.classDef.id,
        this.playerName,
        this.profileId,
        this.profileName,
        dev.wave,
        dev.eliteRole,
      );
      return;
    }
    baseRestart.call(this);
  };
}

if (import.meta.env.DEV) installDevRun(Game);
