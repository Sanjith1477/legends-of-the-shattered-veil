import { useMemo, useState } from 'react';
import { dedupeByPlayer, type ScoreEntry } from '../game/highscores';
import { CLASSES } from '../game/data';
import { ClassEmblem } from './ClassEmblem';
import { HighScoreList } from './HighScoreList';

interface Props {
  scores: ScoreEntry[];
  activeProfileId?: string;
  compact?: boolean;
}

export function Leaderboard({ scores, activeProfileId }: Props) {
  const [hero, setHero] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const heroDef = hero === 'all' ? null : CLASSES.find((c) => c.id === hero) ?? null;

  const runs = useMemo(
    () => dedupeByPlayer(hero === 'all' ? scores : scores.filter((s) => s.classId === hero)),
    [scores, hero]
  );
  const pageCount = Math.ceil(runs.length / pageSize);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const pageStart = currentPage * pageSize;
  const pageRuns = runs.slice(pageStart, pageStart + pageSize);

  function selectHero(classId: string) {
    setHero(classId);
    setPage(0);
  }

  return (
    <div>
      {/* hero filter rail */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <button
          onClick={() => selectHero('all')}
          title="All heroes"
          className={`h-7 px-2 clip-notch-sm font-display text-[9px] tracking-[0.2em] border transition-all duration-150 hover:-translate-y-0.5 ${
            hero === 'all'
              ? 'bg-gold/20 text-goldbright border-gold/60'
              : 'bg-black/30 text-faint border-iron hover:text-parch'
          }`}
        >
          ALL
        </button>
        {CLASSES.map((c) => {
          const active = hero === c.id;
          return (
            <button
              key={c.id}
              onClick={() => selectHero(c.id)}
              title={`${c.name} standings`}
              className={`h-7 w-7 clip-notch-sm flex items-center justify-center border transition-all duration-150 hover:-translate-y-0.5 ${
                active ? 'bg-black/50' : 'bg-black/30 border-iron'
              }`}
              style={
                active
                  ? { borderColor: c.color, color: c.color, boxShadow: `0 0 12px ${c.color}55` }
                  : { color: '#5d6a80' }
              }
            >
              <ClassEmblem classId={c.id} size={17} />
            </button>
          );
        })}
        {heroDef && (
          <span
            className="ml-auto text-[9px] font-display font-bold tracking-[0.22em] truncate max-w-[40%]"
            style={{ color: heroDef.color }}
          >
            {heroDef.name.toUpperCase()}
          </span>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="text-faint text-sm italic py-3 text-center">
          {heroDef ? `No runs recorded for the ${heroDef.name} yet.` : 'Complete a run to enter the realm ranking.'}
        </div>
      ) : (
        <>
          <HighScoreList scores={pageRuns} limit={pageSize} activeProfileId={activeProfileId} rankOffset={pageStart} />
          <div className="flex items-center justify-between gap-2 flex-wrap mt-2 text-[9px] font-display font-bold tracking-wider text-faint">
            <span>SHOWING {pageStart + 1}-{Math.min(pageStart + pageSize, runs.length)} OF {runs.length} · PAGE {currentPage + 1} OF {pageCount}</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="h-7 px-2 border border-iron bg-black/30 text-parch hover:text-goldbright disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount - 1}
                className="h-7 px-2 border border-iron bg-black/30 text-parch hover:text-goldbright disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
