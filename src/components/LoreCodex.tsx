import { useCallback, useEffect, useState } from 'react';
import { CLASSES } from '../game/data';
import { LORE } from '../game/lore';
import { WEAPON_ARCHETYPES } from '../game/weapons';
import { ClassEmblem } from './ClassEmblem';
import { cn } from '../utils/cn';

interface Props {
  initialClassId?: string;
  unlocked: string[];
  isTouch: boolean;
  onClose: () => void;
}

export function LoreCodex({ initialClassId, unlocked, isTouch, onClose }: Props) {
  const startIdx = Math.max(0, CLASSES.findIndex((c) => c.id === (initialClassId ?? CLASSES[0].id)));
  const [idx, setIdx] = useState(startIdx);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = useCallback(
    (next: number) => {
      const n = ((next % CLASSES.length) + CLASSES.length) % CLASSES.length;
      setIdx((cur) => {
        if (n === cur) return cur;
        setDir(n > cur || (cur === CLASSES.length - 1 && n === 0) ? 1 : -1);
        return n;
      });
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
      else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault();
        go(idx + 1);
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault();
        go(idx - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, go, onClose]);

  const cls = CLASSES[idx];
  const lore = LORE[cls.id];
  const isUnlocked = cls.unlockWave === 0 || unlocked.includes(cls.id);

  return (
    <div className="absolute inset-0 z-[55] bg-abyss/92">
      {/* ambient realm glow that shifts with the legend */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at 70% 40%, ${cls.color}22 0%, transparent 60%)` }}
      />

      <div className="absolute inset-0 overflow-y-auto overscroll-contain p-3 sm:p-6">
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <div className="font-display text-[10px] tracking-[0.5em] text-gold">LEGEND SAGAS</div>
            <h2 className="font-display font-black text-[clamp(22px,5vw,38px)] leading-none text-goldbright text-emboss mt-1">
              SAGAS OF THE EIGHT
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sagas"
            className="w-10 h-10 clip-notch-sm panel flex items-center justify-center text-faint hover:text-blood hover:border-blood/60 active:scale-90 transition-all shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="grid lg:grid-cols-[210px_1fr] gap-3">
          {/* vertical legend wheel */}
          <div className="relative min-w-0">
            <div className="hidden lg:flex flex-col gap-1.5 relative">
              {CLASSES.map((c, n) => {
                const sel = n === idx;
                const dist = Math.abs(n - idx);
                const open = c.unlockWave === 0 || unlocked.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => go(n)}
                    className={cn(
                      'clip-notch-sm flex items-center gap-2.5 px-2.5 py-2 text-left border transition-all duration-300 origin-left',
                      sel ? 'panel-gold border-gold/60' : 'panel border-transparent hover:border-gold/40'
                    )}
                    style={{
                      transform: sel ? 'translateX(10px) scale(1.04)' : `translateX(0) scale(${1 - Math.min(dist, 3) * 0.035})`,
                      opacity: sel ? 1 : 1 - Math.min(dist, 3) * 0.16,
                      boxShadow: sel ? `0 0 22px ${c.color}44` : undefined,
                    }}
                  >
                    <span
                      className="w-9 h-9 clip-notch-sm bg-black/40 border border-iron flex items-center justify-center shrink-0 transition-colors duration-300"
                      style={{ color: open ? c.color : '#5d6a80', borderColor: sel ? `${c.color}88` : undefined }}
                    >
                      <ClassEmblem classId={c.id} size={24} />
                    </span>
                    <span className="min-w-0">
                      <span className={cn('font-display font-bold text-sm block truncate', sel ? 'text-goldbright' : 'text-parch')}>{c.name}</span>
                      <span className="text-[10px] text-faint block truncate">{open ? c.culture : `Locked · wave ${c.unlockWave}`}</span>
                    </span>
                  </button>
                );
              })}
              <div className="mt-2 flex items-center gap-2 text-[9px] tracking-[0.2em] text-faint justify-center">
                SELECT A LEGEND
              </div>
            </div>

            {/* compact horizontal rail on small screens */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1">
              {CLASSES.map((c, n) => (
                <button
                  key={c.id}
                  onClick={() => go(n)}
                  className={cn('clip-notch-sm shrink-0 w-12 h-12 flex items-center justify-center border transition-all', n === idx ? 'panel-gold border-gold/60 scale-105' : 'panel border-iron')}
                  style={{ color: c.unlockWave === 0 || unlocked.includes(c.id) ? c.color : '#5d6a80' }}
                >
                  <ClassEmblem classId={c.id} size={26} />
                </button>
              ))}
            </div>
          </div>

          {/* saga page */}
          <div className="panel-gold clip-notch p-4 sm:p-6 relative overflow-hidden min-h-[430px] min-w-0">
            <div
              className="absolute -right-10 -top-10 w-64 h-64 rounded-full pointer-events-none transition-all duration-700"
              style={{ background: `radial-gradient(circle, ${cls.color}33 0%, transparent 65%)` }}
            />
            <div
              key={cls.id}
              className="relative"
              style={{ animation: `codexIn 420ms cubic-bezier(0.2,0.9,0.3,1) both`, ['--dir' as string]: dir }}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <div className="absolute inset-0 rounded-full border border-dashed anim-spin-slow" style={{ borderColor: `${cls.color}88` }} />
                  <div className="absolute inset-2 rounded-full border border-dashed anim-spin-slower-rev border-gold/30" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: cls.color }}>
                    <ClassEmblem classId={cls.id} size={48} />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.3em]" style={{ color: cls.color }}>
                    {cls.culture.toUpperCase()} · {idx + 1}/{CLASSES.length}
                  </div>
                  <div className="font-display font-black text-2xl sm:text-3xl text-goldbright text-emboss leading-none">{cls.name}</div>
                  <div className="text-sm italic text-parch/80 mt-1">“{lore.title}”</div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-parch/90 max-w-3xl">
                {lore.saga.map((para, i) => (
                  <p
                    key={i}
                    className={i === 0 ? 'first-letter:font-display first-letter:text-4xl first-letter:text-goldbright first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]' : ''}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* weapon archetype evolution roadmap */}
              {(() => {
                const arch = WEAPON_ARCHETYPES[cls.id];
                if (!arch) return null;
                return (
                  <div className="mt-5 p-3 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-display text-[9px] font-black tracking-[0.25em] text-goldbright">
                        WEAPON EVOLUTION TIERS (ACCUMULATING RANGE / EVOLUTION UPGRADES)
                      </div>
                      <span className="text-[8.5px] font-display font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10" style={{ color: cls.color }}>
                        {arch.archetype.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                      {arch.rangeTiers.map((tier) => (
                        <div key={tier.threshold} className="p-2 rounded bg-black/35 border border-white/5 text-left">
                          <div className="text-[9px] font-display font-bold text-goldbright">TIER {tier.threshold}: {tier.title}</div>
                          <div className="text-[9px] font-display font-bold tracking-wide text-parch/55 mt-1">UNLOCKS AT EVOLUTION {tier.threshold}</div>
                          <div className="text-[11px] leading-tight text-parch/70 mt-1">{tier.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-5 grid md:grid-cols-3 gap-2.5">
                <AbilityCard
                  kicker="WEAPON"
                  name={cls.weaponName}
                  color={cls.color}
                  body={`Reach ${cls.range} · ${Math.round((1 / cls.atkCd) * 10) / 10} strikes/s · ${Math.round(cls.crit * 100)}% critical.`}
                  origin={cls.lore}
                />
                <AbilityCard kicker={isTouch ? 'SIGNATURE' : 'SIGNATURE · E'} name={cls.abilityName} color={cls.color} body={cls.abilityDesc} origin={lore.signatureOrigin} cd={cls.abilityCd} />
                <AbilityCard kicker={isTouch ? 'LEGACY' : 'LEGACY · Q'} name={lore.legacy.name} color={cls.color2} body={lore.legacy.desc} origin={lore.legacy.origin} cd={lore.legacy.cd} />
              </div>

              {!isUnlocked && (
                <div className="mt-4 text-[11px] font-bold tracking-wider text-[#ffb36b] border border-[#ffb36b]/40 bg-[#ffb36b]/10 clip-notch-sm px-3 py-2 inline-block">
                  Reach wave {cls.unlockWave} with any legend to earn the {cls.name}.
                </div>
              )}
            </div>

            {/* page arrows */}
            <div className="absolute right-3 bottom-3 flex gap-1.5">
              <button onClick={() => go(idx - 1)} aria-label="Previous legend" className="w-9 h-9 clip-notch-sm panel flex items-center justify-center text-faint hover:text-goldbright active:scale-90 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button onClick={() => go(idx + 1)} aria-label="Next legend" className="w-9 h-9 clip-notch-sm panel flex items-center justify-center text-faint hover:text-goldbright active:scale-90 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function AbilityCard({ kicker, name, color, body, origin, cd }: { kicker: string; name: string; color: string; body: string; origin: string; cd?: number }) {
  return (
    <div className="panel clip-notch-sm p-3 border-l-2 transition-transform duration-200 hover:-translate-y-0.5" style={{ borderLeftColor: color }}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display text-[9px] tracking-[0.28em]" style={{ color }}>
          {kicker}
        </div>
        {cd !== undefined && <div className="text-[9px] text-faint font-bold">{cd}s</div>}
      </div>
      <div className="font-display font-bold text-parch text-base mt-0.5">{name}</div>
      <p className="text-[12px] leading-snug text-parch/80 mt-1">{body}</p>
      <p className="text-[11px] leading-snug text-faint italic mt-2 border-t border-iron pt-1.5">Origin — {origin}</p>
    </div>
  );
}
