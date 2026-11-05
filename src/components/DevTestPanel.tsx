import { useState } from 'react';
import { ELITE_ROLES, FINAL_WAVE, type EliteRole } from '../game/data';
import { normalizeDevWave } from '../game/dev-test';

interface Props {
  hasProfile: boolean;
  inRun: boolean;
  isTestRun: boolean;
  currentWave: number | null;
  onStart: (wave: number, eliteRole: EliteRole | null) => void;
  onSpawnElite: (role: EliteRole) => void;
}

const ROLE_IDS = Object.keys(ELITE_ROLES) as EliteRole[];

export function DevTestPanel({ hasProfile, inRun, isTestRun, currentWave, onStart, onSpawnElite }: Props) {
  const [open, setOpen] = useState(false);
  const [waveInput, setWaveInput] = useState('1');
  const [eliteRole, setEliteRole] = useState<EliteRole | ''>('');
  const wave = normalizeDevWave(waveInput);

  return (
    <div
      className="fixed z-[80] flex flex-col items-start gap-2"
      style={{ left: 'calc(8px + var(--safe-left))', top: 'calc(150px + var(--safe-top))' }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="clip-notch-sm border border-[#ff8a8a]/70 bg-[#3a1118]/95 px-3 py-1.5 font-display text-[10px] font-black tracking-[0.22em] text-[#ffb0a2] shadow-[0_0_14px_rgba(255,90,80,0.25)]"
        aria-expanded={open}
      >
        {open ? 'CLOSE DEV' : 'DEV TEST'}
      </button>

      {open && (
        <div
          className="panel-gold clip-notch w-[min(310px,calc(100vw-16px))] p-3 text-parch"
          style={{ background: 'linear-gradient(135deg, rgba(8,16,26,0.98), rgba(16,22,34,0.97))' }}
        >
          <div className="font-display text-[11px] font-black tracking-[0.24em] text-[#ff9a9a]">
            DEVELOPER TEST MODE
          </div>
          <p className="mt-1 text-[10px] leading-snug text-faint">
            Dev build only. Test runs start directly on the chosen wave and are never saved to the
            leaderboard or permanent progression.
          </p>

          <label className="mt-3 block text-[9px] font-bold tracking-[0.2em] text-gold" htmlFor="dev-test-wave">
            STARTING WAVE
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="dev-test-wave"
              type="number"
              min={1}
              max={FINAL_WAVE}
              step={1}
              value={waveInput}
              onChange={(event) => setWaveInput(event.target.value)}
              onBlur={() => setWaveInput(String(wave))}
              className="w-24 rounded border border-gold/40 bg-black/55 px-2 py-1 font-display text-sm font-black text-goldbright outline-none focus:border-gold"
            />
            <span className="text-[10px] text-faint">of {FINAL_WAVE}</span>
          </div>

          <label className="mt-3 block text-[9px] font-bold tracking-[0.2em] text-gold" htmlFor="dev-test-elite">
            ELITE ENEMY (OPTIONAL)
          </label>
          <select
            id="dev-test-elite"
            value={eliteRole}
            onChange={(event) => setEliteRole(event.target.value as EliteRole | '')}
            className="mt-1 w-full rounded border border-gold/40 bg-black/55 px-2 py-1.5 text-[11px] text-parch outline-none focus:border-gold"
          >
            <option value="">Random / no forced elite</option>
            {ROLE_IDS.map((role) => (
              <option key={role} value={role}>
                {ELITE_ROLES[role].title} (unlocks wave {ELITE_ROLES[role].unlockWave})
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!hasProfile}
            onClick={() => onStart(wave, eliteRole || null)}
            className="btn-gold clip-notch-sm mt-3 w-full px-3 py-2 text-[10px] font-black tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isTestRun ? 'RESTART TEST' : 'START TEST'} · WAVE {wave}
          </button>
          {!hasProfile && <div className="mt-1 text-[10px] text-[#ff9a9a]">Choose a profile before starting.</div>}

          <div className="mt-3 border-t border-gold/20 pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold tracking-[0.18em] text-gold">ACTIVE TEST RUN</span>
              <span className={`text-[10px] font-black ${isTestRun ? 'text-[#ffb0a2]' : 'text-faint'}`}>
                {isTestRun ? `WAVE ${currentWave ?? wave}` : 'NONE'}
              </span>
            </div>
            <button
              type="button"
              disabled={!isTestRun || !inRun || !eliteRole}
              onClick={() => eliteRole && onSpawnElite(eliteRole)}
              className="btn-dark clip-notch-sm mt-2 w-full px-3 py-2 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              SPAWN SELECTED ELITE
            </button>
            <p className="mt-1 text-[9px] leading-snug text-faint">
              Spawn during active play, not while paused. The forced elite uses normal wave scaling and AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
