import { useEffect, useState } from 'react';
import { CLASSES } from '../game/data';
import { LORE } from '../game/lore';
import { WEAPON_ARCHETYPES } from '../game/weapons';
import type { PlayerProfile, ScoreEntry } from '../game/highscores';
import type { WorldEvent } from '../lib/api';
import { ClassEmblem } from './ClassEmblem';
import { Leaderboard } from './Leaderboard';
import { cn } from '../utils/cn';

interface Props {
  scores: ScoreEntry[];
  profiles: PlayerProfile[];
  activeProfile: PlayerProfile;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  version: string;
  hasNewPatch: boolean;
  onlineCount: number;
  cloud: boolean;
  events: WorldEvent[];
  onOpenCodex: (classId: string) => void;
  onOpenPatchNotes: () => void;
  onOpenTutorial: () => void;
  onOpenIndex: () => void;
  isTouch: boolean;
  onClassChange: (classId: string) => void;
  onStart: (classId: string) => void;
}

function StatBar({ label, frac, color }: { label: string; frac: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-[10px] tracking-[0.2em] text-faint w-8">{label}</span>
      <div className="bar-shell clip-notch-sm h-[7px] flex-1">
        <div className="bar-fill" style={{ width: `${Math.round(frac * 100)}%`, background: `linear-gradient(90deg, ${color}, #ffd97a)` }} />
      </div>
    </div>
  );
}

function NavBtn({ onClick, children, badge, title }: { onClick: () => void; children: React.ReactNode; badge?: boolean; title?: string }) {
  return (
    <button onClick={onClick} title={title} className="btn-dark clip-notch-sm px-2.5 py-1.5 relative flex items-center gap-1.5 text-[10px] sm:text-[11px]">
      {children}
      {badge && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blood border border-abyss animate-pulse" />}
    </button>
  );
}

export function StartScreen({
  scores, profiles, activeProfile, version, hasNewPatch, onlineCount, cloud, events,
  onOpenProfile, onOpenSettings, onOpenCodex, onOpenPatchNotes, onOpenTutorial, onOpenIndex, isTouch, onClassChange, onStart,
}: Props) {
  const initialClass = activeProfile.unlockedClasses?.includes(activeProfile.preferredClass) ? activeProfile.preferredClass : CLASSES[0].id;
  const [classId, setClassId] = useState(initialClass);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const preferred =
      CLASSES.some((entry) => entry.id === activeProfile.preferredClass) && activeProfile.unlockedClasses?.includes(activeProfile.preferredClass)
        ? activeProfile.preferredClass
        : CLASSES[0].id;
    setClassId(preferred);
  }, [activeProfile.id, activeProfile.preferredClass, activeProfile.unlockedClasses]);

  const cls = CLASSES.find((c) => c.id === classId)!;
  const lore = LORE[cls.id];
  const liveEvent = events.length ? events[tick % events.length] : null;
  const runsTotal = profiles.reduce((s, p) => s + p.runs, 0);

  const selectClass = (id: string) => {
    if (!activeProfile.unlockedClasses?.includes(id)) return;
    setClassId(id);
    onClassChange(id);
  };

  return (
    <div className="absolute inset-0 z-40 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center px-3 sm:px-6 py-3 sm:py-5">
        {/* top nav */}
        <header className="w-full max-w-6xl flex items-center justify-between gap-2 anim-fade-up">
          <div className="flex items-center gap-2 text-gold min-w-0">
            <ClassEmblem classId="sandseer" size={26} />
            <span className="font-display font-bold tracking-[0.3em] text-xs sm:text-sm text-emboss hidden sm:block">SHATTERED VEIL</span>
            <button
              onClick={onOpenPatchNotes}
              className="panel clip-notch-sm px-2 py-1 text-[10px] font-bold tracking-wider text-faint hover:text-goldbright relative"
              title="Patch notes"
            >
              v{version}
              {hasNewPatch && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blood border border-abyss animate-pulse" />}
            </button>
          </div>
          <div className="flex items-center justify-end flex-wrap gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider text-faint">
            <span className="panel-gold clip-notch-sm px-2 py-1.5 flex items-center gap-1.5 text-parch" title={cloud ? 'Live realm presence' : 'Offline — only you'}>
              <span className={`w-1.5 h-1.5 rounded-full ${cloud ? 'bg-verdant anim-pulse-gold' : 'bg-faint'}`} />
              {onlineCount.toLocaleString()} ONLINE
              <span className="hidden md:inline text-faint">· {profiles.length} ADVENTURERS · {runsTotal} RUNS</span>
            </span>
            <NavBtn onClick={() => onOpenCodex(classId)} title="Legend Sagas">📜 <span className="hidden sm:inline">SAGAS</span></NavBtn>
            <NavBtn onClick={onOpenPatchNotes} badge={hasNewPatch} title="Patch notes">🛠 <span className="hidden sm:inline">PATCH NOTES</span></NavBtn>
            <NavBtn onClick={onOpenTutorial} title="Tutorial">? <span className="hidden sm:inline">TUTORIAL</span></NavBtn>
            <NavBtn onClick={onOpenIndex} title="Power & Item Index">📚 <span className="hidden sm:inline">POWER & ITEM INDEX</span></NavBtn>
            <NavBtn onClick={onOpenProfile} title="Your profile">
              <span className="w-1.5 h-1.5 rounded-full bg-verdant" />
              <span className="max-w-[72px] truncate">{activeProfile.name}</span>
            </NavBtn>
            <button
              onClick={onOpenSettings}
              title="Settings"
              aria-label="Settings"
              className="btn-dark clip-notch-sm w-[34px] h-[30px] flex items-center justify-center group"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                className="transition-transform duration-500 group-hover:rotate-90"
              >
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.04a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03Z" />
              </svg>
            </button>
          </div>
        </header>

        {/* logo */}
        <div className="text-center mt-3 sm:mt-5 anim-fade-up" style={{ animationDelay: '60ms' }}>
          <h1 className="font-display font-black text-gold text-emboss leading-tight text-[clamp(20px,6vw,56px)] tracking-[0.02em]">LEGENDS OF THE SHATTERED VEIL</h1>
          <div className="mt-2 text-[10px] sm:text-xs tracking-[0.08em] text-faint font-bold">Eight Legends. Five Realms. One Shattered World.</div>
        </div>

        <main className="w-full max-w-6xl grid lg:grid-cols-[1.04fr_0.96fr] gap-3 sm:gap-4 mt-4 sm:mt-6">
          {/* class select */}
          <section className="anim-fade-up" style={{ animationDelay: '120ms' }}>
            <h2 className="font-display font-bold text-parch text-sm tracking-[0.3em] mb-2 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-gold inline-block" />
              CHOOSE YOUR LEGEND
              <span className="ml-auto text-[10px] text-faint tracking-wider">{activeProfile.unlockedClasses?.length ?? 1}/{CLASSES.length} EARNED</span>
            </h2>
            <div className="flex flex-col gap-2">
              {CLASSES.map((c) => {
                const sel = c.id === classId;
                const unlocked = c.unlockWave === 0 || activeProfile.unlockedClasses?.includes(c.id);
                return (
                  <button
                    key={c.id}
                    disabled={!unlocked}
                    onClick={() => selectClass(c.id)}
                    className={cn(
                      'clip-notch text-left px-3 py-2.5 flex items-center gap-3 transition-all duration-150 w-full disabled:cursor-not-allowed relative overflow-hidden',
                      sel ? 'panel-gold translate-x-1' : unlocked ? 'panel hover:border-gold/50 hover:translate-x-0.5' : 'panel opacity-55'
                    )}
                  >
                    {sel && <span className="absolute inset-y-0 left-0 w-1" style={{ background: c.color }} />}
                    <span
                      className={cn('shrink-0 clip-notch-sm w-12 h-12 flex items-center justify-center border', sel ? 'bg-black/50 border-gold/60' : 'bg-black/30 border-iron')}
                      style={{ color: unlocked ? (sel ? c.color : '#8a94a8') : '#4d5769', boxShadow: sel ? `0 0 18px ${c.color}55` : undefined }}
                    >
                      {unlocked ? (
                        <ClassEmblem classId={c.id} size={34} />
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className={cn('font-display font-bold text-lg leading-tight', sel ? 'text-goldbright' : 'text-parch')}>{c.name}</span>
                        {!unlocked && <span className="text-[9px] font-display font-bold tracking-[0.18em] text-[#ffb36b]">WAVE {c.unlockWave}</span>}
                        <span className="text-[11px] text-faint font-bold tracking-wider truncate">{c.culture}</span>
                      </span>
                      <span className={cn('block text-xs mt-0.5 truncate', sel ? 'text-parch/90' : 'text-faint')}>
                        {unlocked ? c.epithet + ' — ' + c.abilityName + ' · ' + LORE[c.id].legacy.name : `Reach wave ${c.unlockWave} to earn this legend.`}
                      </span>
                    </span>
                    <span className="hidden sm:flex flex-col gap-1 w-20 shrink-0">
                      {([['VIT', c.hp / 148], ['PWR', c.dmg / 24], ['SPD', c.speed / 278]] as [string, number][]).map(([l, f]) => (
                        <span key={l} className="flex items-center gap-1">
                          <span className="text-[8px] font-display text-faint w-6">{l}</span>
                          <span className="bar-shell h-[5px] flex-1 clip-notch-sm">
                            <span className="bar-fill block" style={{ width: `${Math.round(f * 100)}%`, background: sel ? c.color : '#4a5670' }} />
                          </span>
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* hero showcase */}
          <section className="panel-gold clip-notch p-4 sm:p-5 anim-fade-up relative overflow-hidden" style={{ animationDelay: '180ms' }}>
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cls.color}2e 0%, transparent 65%)` }} />
            <div className="flex items-center gap-4 relative">
              <div className="relative w-[116px] h-[116px] shrink-0 anim-floaty">
                <div className="absolute inset-0 rounded-full border border-dashed anim-spin-slow" style={{ borderColor: `${cls.color}88` }} />
                <div className="absolute inset-2.5 rounded-full border border-dashed anim-spin-slower-rev border-gold/40" />
                <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${cls.color}33 0%, transparent 65%)` }} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: cls.color }}>
                  <ClassEmblem classId={cls.id} size={72} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-2xl sm:text-3xl text-goldbright text-emboss leading-none">{cls.name}</div>
                <div className="text-xs italic text-parch/80 mt-1">“{cls.epithet}”</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center text-[10px] font-bold tracking-[0.2em] px-2 py-1 clip-notch-sm border" style={{ borderColor: `${cls.color}77`, color: cls.color, background: `${cls.color}14` }}>
                    {cls.culture.toUpperCase()}
                  </span>
                  <button onClick={() => onOpenCodex(cls.id)} className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] px-2 py-1 clip-notch-sm border border-gold/40 text-goldbright hover:bg-gold/10">
                    📜 READ THE SAGA
                  </button>
                </div>
              </div>
            </div>

            {/* weapon archetype preview banner */}
            {(() => {
              const arch = WEAPON_ARCHETYPES[cls.id];
              return (
                <div className="mt-4 p-3 rounded bg-black/45 border border-gold/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[9px] font-black tracking-[0.22em] text-goldbright flex items-center gap-1.5">
                      ⚔ WEAPON ARCHETYPE: {cls.weaponName.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-display font-bold tracking-wider px-2 py-0.5 rounded-sm bg-white/5 border border-white/10" style={{ color: cls.color }}>
                      {arch?.archetype.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11.5px] leading-relaxed text-parch/85 mt-1.5">
                    {cls.lore}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-faint flex-wrap">
                    <span className="text-goldbright/80 font-bold">Evolution Milestones:</span>
                    <span>Reach Tier 2 → Widen Arc / Impact</span>
                    <span>·</span>
                    <span>Tier 3 → Ranged Projectile / Echoes</span>
                    <span>·</span>
                    <span>Tier 4 → Ultimate Cleave</span>
                  </div>
                </div>
              );
            })()}

            {/* abilities */}
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              <div className="panel clip-notch-sm p-2.5 border-l-2" style={{ borderLeftColor: cls.color }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[9px] tracking-[0.28em]" style={{ color: cls.color }}>{isTouch ? 'SIGNATURE' : 'SIGNATURE · E'}</span>
                  <span className="text-[9px] text-faint font-bold">{cls.abilityCd}s</span>
                </div>
                <div className="font-display font-bold text-sm text-parch mt-0.5">{cls.abilityName}</div>
                <p className="text-[11px] leading-snug text-parch/75 mt-0.5">{cls.abilityDesc}</p>
              </div>
              <div className="panel clip-notch-sm p-2.5 border-l-2" style={{ borderLeftColor: cls.color2 }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[9px] tracking-[0.28em]" style={{ color: cls.color2 }}>{isTouch ? 'LEGACY' : 'LEGACY · Q'}</span>
                  <span className="text-[9px] text-faint font-bold">{lore.legacy.cd}s</span>
                </div>
                <div className="font-display font-bold text-sm text-parch mt-0.5">{lore.legacy.name}</div>
                <p className="text-[11px] leading-snug text-parch/75 mt-0.5">{lore.legacy.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 mt-3">
              <StatBar label="VIT" frac={cls.hp / 148} color={cls.color} />
              <StatBar label="SPD" frac={cls.speed / 278} color={cls.color} />
              <StatBar label="PWR" frac={cls.dmg / 24} color={cls.color} />
              <StatBar label="CRIT" frac={cls.crit / 0.24} color={cls.color} />
            </div>

            <div className="mt-4 panel clip-notch-sm px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-display text-[10px] tracking-[0.3em] text-faint">RANKING IDENTITY</div>
                <div className="font-display font-bold text-lg text-goldbright leading-tight">{activeProfile.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="clip-notch-sm border border-gold/50 bg-gold/10 px-2.5 py-1.5 text-right shadow-[0_0_10px_rgba(226,180,92,0.25)]">
                  <div className="font-display text-[8px] tracking-[0.22em] text-goldbright/80">BEST WAVE</div>
                  <div className="font-display font-black text-goldbright text-emboss leading-none text-base">{activeProfile.bestWave}</div>
                </div>
                <div className="clip-notch-sm border border-gold/50 bg-gold/10 px-2.5 py-1.5 text-right shadow-[0_0_10px_rgba(226,180,92,0.25)]">
                  <div className="font-display text-[8px] tracking-[0.22em] text-goldbright/80">BEST SCORE</div>
                  <div className="font-display font-black text-goldbright text-emboss leading-none text-base">{activeProfile.bestScore.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <button onClick={() => onStart(cls.id)} className="btn-gold clip-notch w-full mt-3 py-4 sm:py-3.5 text-base sm:text-lg font-black tracking-[0.18em]">
              ⚔ ENTER THE REALMS
            </button>
            <div className="text-center text-[10px] text-faint mt-1.5 tracking-wider">The first wave strikes within seconds. Survive it.</div>

            <div className="mt-4">
              <h3 className="font-display text-[11px] tracking-[0.3em] text-gold mb-1.5 flex items-center gap-2">
                REALM LEADERBOARD
                <span className="h-[1px] flex-1 bg-gold/25 inline-block" />
              </h3>
              <Leaderboard scores={scores} activeProfileId={activeProfile.id} compact />
            </div>
          </section>
        </main>

        {/* live world feed */}
        <footer className="w-full max-w-6xl mt-3 sm:mt-4 mb-2">
          <div className="panel clip-notch px-3 py-2 flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 font-display text-[10px] tracking-[0.25em] text-verdant border border-verdant/40 bg-verdant/10 px-1.5 py-0.5 clip-notch-sm flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${cloud ? 'bg-verdant animate-pulse' : 'bg-faint'}`} />
              LIVE
            </span>
            {liveEvent ? (
              <div key={liveEvent.id + tick} className="anim-ticker text-xs truncate" style={{ color: liveEvent.color }}>
                {liveEvent.text}
              </div>
            ) : (
              <div className="text-xs text-faint truncate">
                {cloud ? 'The realm is quiet. Be the first to inscribe a run today.' : 'Offline — connect to Supabase to see live adventurer achievements.'}
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
