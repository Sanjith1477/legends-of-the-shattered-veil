import { CLASSES } from '../game/data';
import { dedupeByPlayer, type ScoreEntry } from '../game/highscores';
import { ClassEmblem } from './ClassEmblem';
import { cn } from '../utils/cn';

interface Props {
  scores: ScoreEntry[];
  limit?: number;
  highlightScore?: number;
  activeProfileId?: string;
  rankOffset?: number;
}

const RANK_COLORS = ['#ffd97a', '#cfd8ea', '#d09a5a'];

function formatTime(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function HighScoreList({ scores, limit = 8, highlightScore, activeProfileId, rankOffset = 0 }: Props) {
  // Rank is always determined by score. Time is display information only.
  // Each player appears once with their best score.
  const list = dedupeByPlayer(scores).slice(0, limit);
  if (list.length === 0) {
    return (
      <div className="text-faint text-sm italic py-3 text-center">
        No legends inscribed yet — be the first.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="grid grid-cols-[20px_16px_minmax(0,1fr)_56px_62px] sm:grid-cols-[24px_18px_minmax(0,1fr)_66px_66px_78px] items-center gap-1.5 sm:gap-2 px-2 py-1 text-[8px] font-display font-bold tracking-[0.18em] text-[#aab4c5] border-b border-iron/80">
        <span>#</span>
        <span />
        <span>PLAYER</span>
        <span className="text-right">WAVE</span>
        <span className="text-right hidden sm:block">TIME</span>
        <span className="text-right text-gold">SCORE</span>
      </div>
      {list.map((s, i) => {
        const rank = rankOffset + i + 1;
        const cls = CLASSES.find((c) => c.id === s.classId);
        const highlighted =
          (highlightScore !== undefined && s.score === highlightScore) ||
          (activeProfileId !== undefined && s.userId === activeProfileId);
        return (
          <div
            key={`${s.name}-${s.score}-${i}`}
            className={cn(
              'grid grid-cols-[20px_16px_minmax(0,1fr)_56px_62px] sm:grid-cols-[24px_18px_minmax(0,1fr)_66px_66px_78px] items-center gap-1.5 sm:gap-2 px-2 py-[5px] clip-notch-sm text-sm',
              highlighted ? 'bg-gold/15 border border-gold/50' : 'bg-black/25 border border-transparent'
            )}
          >
            <span
              className="font-display font-bold text-center text-xs"
              style={{ color: rank <= 3 ? RANK_COLORS[rank - 1] : '#5d6a80' }}
            >
              {rank}
            </span>
            <span className="shrink-0" style={{ color: cls?.color ?? '#e2b45c' }}>
              <ClassEmblem classId={s.classId} size={16} />
            </span>
            <span className={cn('truncate font-bold', highlighted ? 'text-goldbright' : 'text-parch')}>
              {s.userName ?? s.name}
            </span>
            <span className="text-faint text-[10px] text-right whitespace-nowrap">
              <span className="sm:hidden">W{s.wave}/L{s.level}</span>
              <span className="hidden sm:inline">W{s.wave} / L{s.level}</span>
            </span>
            <span className="text-parch/80 text-[10px] font-bold tabular-nums text-right hidden sm:block">
              {formatTime(s.durationSeconds)}
            </span>
            <span className="font-display font-black text-goldbright tabular-nums text-right shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {s.score.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
