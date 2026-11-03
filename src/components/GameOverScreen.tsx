import type { GameStats } from '../game/engine';
import type { PlayerProfile, ScoreEntry } from '../game/highscores';
import { CLASSES } from '../game/data';
import { Leaderboard } from './Leaderboard';
import { FantasyBackdrop } from './FantasyBackdrop';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  stats: GameStats;
  scores: ScoreEntry[];
  profile: PlayerProfile | null;
  saveState: SaveState;
  saveError?: string;
  onRestart: () => void;
  onMenu: () => void;
  onRetry: () => void;
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel clip-notch-sm px-2 py-2 text-center">
      <div className="font-display text-[9px] tracking-[0.28em] text-faint">{label}</div>
      <div className={`font-display font-black text-lg leading-tight ${accent ? 'text-goldbright text-emboss' : 'text-parch'}`}>
        {value}
      </div>
    </div>
  );
}

export function GameOverScreen({ stats, scores, profile, saveState, saveError, onRestart, onMenu, onRetry }: Props) {
  const isRecord = stats.score > 0 && (scores.length === 0 || stats.score >= scores[0].score);
  const cls = CLASSES.find((c) => c.id === stats.classId);
  const m = Math.floor(stats.timeSec / 60);
  const s = stats.timeSec % 60;

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto anim-overlay-enter">
      <FantasyBackdrop density="soft" />
      <div className="overlay-scrim pointer-events-none absolute inset-0" />
      <div className="safe-screen relative min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-lg anim-fade-up">
          <div className="text-center">
            <div className="font-display text-[10px] tracking-[0.5em] text-faint">YOUR SAGA ENDS… FOR NOW</div>
            <h2 className="font-display font-black text-blood text-emboss-red text-[clamp(34px,8vw,58px)] leading-none mt-1">
              YOU HAVE FALLEN
            </h2>
            <div className="text-sm text-parch/80 mt-2 font-bold">
              <span style={{ color: cls?.color }}>{stats.playerName}</span>
              <span className="text-faint"> · the {stats.className} · slain by </span>
              <span className="text-[#ff9a9a]">{stats.killer}</span>
            </div>
            {isRecord && (
              <div className="inline-block mt-2 font-display font-bold text-[11px] tracking-[0.3em] text-abyss bg-goldbright px-3 py-1 clip-notch-sm anim-pulse-gold">
                ★ NEW LEGEND — TOP SCORE ★
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <StatCell label="SCORE" value={stats.score.toLocaleString()} accent />
            <StatCell label="WAVE" value={`${stats.wave}`} />
            <StatCell label="LEVEL" value={`${stats.level}`} />
            <StatCell label="KILLS" value={`${stats.kills}`} />
            <StatCell label="GOLD" value={`${stats.gold}`} />
            <StatCell label="TIME" value={`${m}:${s.toString().padStart(2, '0')}`} />
          </div>

          {/* profile-aware leaderboard entry */}
          <div className="panel-gold clip-notch p-3 mt-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <div className="font-display text-[10px] tracking-[0.3em] text-gold">REALM LEDGER</div>
                <div className="text-[11px] text-faint mt-0.5">
                  Hero <span className="text-parch font-bold">{stats.playerName}</span> is recorded under{' '}
                  <span className="text-goldbright font-bold">{profile?.name ?? stats.profileName}</span>.
                </div>
              </div>
              {saveState === 'error' ? (
                <button onClick={onRetry} className="btn-gold clip-notch-sm px-4 py-2 text-xs font-black shrink-0 bg-blood/80">
                  RETRY SAVE
                </button>
              ) : (
                <span
                  className={`clip-notch-sm px-3 py-1.5 text-[10px] font-black tracking-widest shrink-0 flex items-center gap-1.5 ${
                    saveState === 'saved' ? 'text-verdant' : 'text-faint'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      saveState === 'saved' ? 'bg-verdant' : 'bg-gold animate-pulse'
                    }`}
                  />
                  {saveState === 'saved' ? 'INSCRIBED ✓' : 'SAVING…'}
                </span>
              )}
            </div>
            {saveState === 'error' && (
              <p className="text-[11px] text-blood mb-2">
                {saveError || 'Could not save this run.'} Your local progress is safe — press RETRY SAVE to try again.
              </p>
            )}
            <Leaderboard scores={scores} activeProfileId={stats.profileId} compact />
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={onRestart} className="btn-gold clip-notch flex-1 py-3.5 text-sm font-black tracking-[0.15em]">
              ⚔ RISE AGAIN <span className="opacity-60 text-[10px] align-middle">(R)</span>
            </button>
            <button onClick={onMenu} className="btn-dark clip-notch px-5 py-3.5 text-xs font-bold">
              ⌂ TITLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
