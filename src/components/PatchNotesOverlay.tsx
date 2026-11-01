import { useEffect } from 'react';
import type { PatchNote } from '../game/patchnotes';

interface Props {
  notes: PatchNote[];
  currentVersion: string;
  lastSeen: string | null;
  onClose: () => void;
}

const KIND: Record<PatchNote['changes'][number]['kind'], { label: string; color: string }> = {
  new: { label: 'NEW', color: '#46c8a8' },
  improved: { label: 'IMPROVED', color: '#6fb7ff' },
  balance: { label: 'BALANCE', color: '#ffd24a' },
  fixed: { label: 'FIXED', color: '#ff9a9a' },
};

export function PatchNotesOverlay({ notes, currentVersion, lastSeen, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[55] flex items-center justify-center bg-abyss/88 p-3 sm:p-6 overflow-y-auto anim-overlay-enter">
      <div className="w-full max-w-3xl my-auto anim-fade-up">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <div className="font-display text-[10px] tracking-[0.5em] text-gold">CHRONICLE OF CHANGES</div>
            <h2 className="font-display font-black text-[clamp(24px,5vw,40px)] leading-none text-goldbright text-emboss mt-1">PATCH NOTES</h2>
            <div className="text-[11px] text-faint mt-1">
              You are playing <span className="text-parch font-bold">v{currentVersion}</span>
              {lastSeen && lastSeen !== currentVersion && (
                <>
                  {' '}
                  · updated from <span className="text-parch/80">v{lastSeen}</span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} aria-label="Back" className="btn-dark clip-notch-sm px-3 py-2 text-xs font-bold shrink-0">
            ← BACK
          </button>
        </div>

        <div className="space-y-3">
          {notes.map((n, i) => {
            const isNew = lastSeen === null ? i === 0 : n.version !== lastSeen && i === 0;
            return (
              <article key={n.version} className={`clip-notch p-4 sm:p-5 ${i === 0 ? 'panel-gold' : 'panel'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-black text-goldbright text-lg">v{n.version}</span>
                  <span className="font-display text-sm text-parch">— {n.title}</span>
                  <span className="text-[10px] text-faint ml-auto">{new Date(n.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  {isNew && (
                    <span className="text-[9px] font-display font-bold tracking-[0.25em] text-abyss bg-goldbright px-2 py-0.5 clip-notch-sm">LATEST</span>
                  )}
                </div>
                {n.highlights.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {n.highlights.map((h) => (
                      <li key={h} className="text-[11px] text-parch/90 border border-gold/30 bg-gold/10 clip-notch-sm px-2 py-0.5">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="mt-3 space-y-1.5">
                  {n.changes.map((c, j) => (
                    <li key={j} className="flex items-start gap-2 text-[13px] text-parch/85">
                      <span
                        className="font-display text-[8px] font-bold tracking-[0.2em] px-1.5 py-[3px] clip-notch-sm shrink-0 mt-[2px] w-[68px] text-center"
                        style={{ color: KIND[c.kind].color, border: `1px solid ${KIND[c.kind].color}55`, background: `${KIND[c.kind].color}14` }}
                      >
                        {KIND[c.kind].label}
                      </span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
