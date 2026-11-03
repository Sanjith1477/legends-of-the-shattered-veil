import { useEffect, useState, type CSSProperties } from 'react';
import { CLASSES } from '../game/data';
import { LORE } from '../game/lore';
import { WEAPON_ARCHETYPES } from '../game/weapons';
import type { PlayerProfile, ScoreEntry } from '../game/highscores';
import type { WorldEvent } from '../lib/api';
import { ClassEmblem } from './ClassEmblem';
import { FantasyBackdrop } from './FantasyBackdrop';
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

type NavIconName = 'scroll' | 'tools' | 'help' | 'book' | 'user' | 'gear' | 'lock';

function NavIcon({ name }: { name: NavIconName }) {
  switch (name) {
    case 'scroll':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2V4Z" />
          <path d="M7 4H5a2 2 0 0 0 0 4h2M11 9h5M11 13h5M11 17h3" />
        </svg>
      );
    case 'tools':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.5 6.5a4.2 4.2 0 0 1 5.2 5.2l-8.4 8.4-2.4-2.4 8.4-8.4Z" />
          <path d="M4 20l3.6-3.6M4.5 9.5 9 5M5 5l4 4" />
        </svg>
      );
    case 'help':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.6 2.6 0 0 1 5.1.6c0 1.9-2.6 2.1-2.6 4" />
          <path d="M12 17.2h.01" />
        </svg>
      );
    case 'book':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 11h6" />
        </svg>
      );
    case 'user':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
        </svg>
      );
    case 'lock':
      return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case 'gear':
    default:
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.04a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03Z" />
        </svg>
      );
  }
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

function NavBtn({
  onClick,
  icon,
  label,
  shortLabel,
  badge,
  attention,
  title,
}: {
  onClick: () => void;
  icon: NavIconName;
  label: string;
  shortLabel?: string;
  badge?: boolean;
  attention?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      className="nav-btn"
      data-attention={attention ? 'true' : 'false'}
    >
      <span className="nav-btn-icon">
        <NavIcon name={icon} />
      </span>
      <span className="hidden min-[840px]:inline">{label}</span>
      <span className="min-[840px]:hidden">{shortLabel ?? label}</span>
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
    <div className="absolute inset-0 z-40 overflow-y-auto anim-overlay-enter">
      <FantasyBackdrop />

      {/* Sticky navigation respects Android status-bar / cutout insets */}
      <header className="nav-surface sticky top-0 z-30 w-full">
        <div
          className="mx-auto w-full max-w-6xl px-3 sm:px-6"
          style={{
            paddingTop: 'calc(8px + var(--safe-top))',
            paddingLeft: 'calc(12px + var(--safe-left))',
            paddingRight: 'calc(12px + var(--safe-right))',
          }}
        >
          <div className="flex min-h-[34px] items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-gold">
              <ClassEmblem classId="sandseer" size={26} />
              <span className="hidden font-display text-xs font-bold tracking-[0.3em] text-emboss min-[420px]:inline sm:text-sm">SHATTERED VEIL</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <span className="online-pill" title={cloud ? 'Live realm presence' : 'Offline — only you'}>
                <span className="online-pulse" data-offline={!cloud} />
                <span className="font-display font-black text-goldbright">{onlineCount.toLocaleString()}</span>
                <span className="hidden min-[380px]:inline">ONLINE</span>
                <span className="hidden text-faint lg:inline">· {profiles.length} ADVENTURERS · {runsTotal} RUNS</span>
              </span>
              <button
                type="button"
                onClick={onOpenPatchNotes}
                className="nav-btn relative"
                title="Patch notes"
                aria-label="Patch notes"
              >
                <span className="font-display font-black tracking-[0.08em] text-goldbright">v{version}</span>
                {hasNewPatch && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blood border border-abyss animate-pulse" />}
              </button>
            </div>
          </div>

          <div className="nav-scroller mt-2 pb-2">
            <nav className="nav-rail" aria-label="Main menu navigation">
              <NavBtn onClick={() => onOpenCodex(classId)} icon="scroll" label="SAGAS" shortLabel="SAGAS" title="Legend Sagas" />
              <NavBtn onClick={onOpenPatchNotes} icon="tools" label="PATCH NOTES" shortLabel="NOTES" badge={hasNewPatch} attention={hasNewPatch} title="Patch notes" />
              <NavBtn onClick={onOpenTutorial} icon="help" label="TUTORIAL" shortLabel="TUTORIAL" title="Tutorial" />
              <NavBtn onClick={onOpenIndex} icon="book" label="POWER & ITEM INDEX" shortLabel="INDEX" title="Power & Item Index" />
              <button
                type="button"
                onClick={onOpenProfile}
                title="Your profile"
                aria-label={`Open profile for ${activeProfile.name}`}
                className="nav-btn"
              >
                <span className="nav-btn-icon">
                  <NavIcon name="user" />
                </span>
                <span className="hidden max-w-[92px] truncate md:inline">{activeProfile.name}</span>
                <span className="md:hidden">PROFILE</span>
                <span className="h-1.5 w-1.5 rounded-full bg-verdant shadow-[0_0_6px_rgba(70,200,168,0.9)]" />
              </button>
              <NavBtn onClick={onOpenSettings} icon="gear" label="SETTINGS" shortLabel="SETTINGS" title="Settings" />
            </nav>
          </div>
        </div>
      </header>

      <div
        className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-3 sm:px-6"
        style={{
          paddingLeft: 'calc(12px + var(--safe-left))',
          paddingRight: 'calc(12px + var(--safe-right))',
          paddingBottom: 'calc(18px + var(--safe-bottom))',
        }}
      >
        {/* title */}
        <div className="text-center mt-4 sm:mt-7 anim-fade-up">
          <div className="title-flourish mb-2.5 sm:mb-3">
            <span className="title-rune" />
          </div>
          <h1
            className="fantasy-title font-display font-black leading-[1.06] text-center text-[clamp(24px,min(7.2vw,8.4vh),60px)] tracking-[0.015em]"
            data-text="LEGENDS OF THE SHATTERED VEIL"
            aria-label="Legends of the Shattered Veil"
          >
            <span className="fantasy-title-text">LEGENDS OF THE SHATTERED VEIL</span>
          </h1>
          <div className="mt-2 text-[10px] sm:text-xs tracking-[0.1em] text-faint font-bold">Eight Legends. Five Realms. One Shattered World.</div>
          <div className="title-flourish mt-2.5">
            <span className="title-rune" style={{ animationDelay: '1.2s' }} />
          </div>
        </div>

        <main className="w-full max-w-6xl grid lg:grid-cols-[1.04fr_0.96fr] gap-3 sm:gap-5 mt-5 sm:mt-7">
          {/* class select */}
          <section className="anim-fade-up" style={{ animationDelay: '120ms' }}>
            <h2 className="font-display font-bold text-parch text-sm tracking-[0.26em] mb-2 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-gold inline-block" />
              CHOOSE YOUR LEGEND
              <span className="ml-auto text-[10px] text-faint tracking-wider">{activeProfile.unlockedClasses?.length ?? 1}/{CLASSES.length} EARNED</span>
            </h2>
            <div className="legend-grid">
              {CLASSES.map((c) => {
                const sel = c.id === classId;
                const unlocked = c.unlockWave === 0 || activeProfile.unlockedClasses?.includes(c.id);
                const cardStyle = {
                  '--legend-color': c.color,
                  '--legend-color2': c.color2,
                } as CSSProperties;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => selectClass(c.id)}
                    aria-pressed={sel}
                    data-selected={sel ? 'true' : 'false'}
                    data-locked={!unlocked ? 'true' : 'false'}
                    className="legend-card w-full disabled:cursor-not-allowed"
                    style={cardStyle}
                  >
                    <span className="flex items-start gap-2 min-w-0">
                      <span className="legend-crest">
                        {unlocked ? (
                          <ClassEmblem classId={c.id} size={30} />
                        ) : (
                          <span className="opacity-80">
                            <NavIcon name="lock" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span className={cn('font-display font-bold text-[14px] sm:text-base leading-tight truncate', sel ? 'text-goldbright' : unlocked ? 'text-parch' : 'text-parch/70')}>
                            {c.name}
                          </span>
                          {sel && (
                            <span className="legend-check" aria-hidden>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m5 12 4.5 4.5L19 7" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className={cn('mt-0.5 block truncate text-[9.5px] sm:text-[10.5px]', sel ? 'text-parch/85' : 'text-faint')}>
                          {unlocked ? c.epithet : `Reach wave ${c.unlockWave} to earn this legend.`}
                        </span>
                        {unlocked ? (
                          <span className="mt-1.5 hidden items-center gap-1 sm:flex">
                            <span className="legend-badge">{c.culture.toUpperCase()}</span>
                            <span className="ml-auto flex w-[52px] flex-col gap-[3px]">
                              {([['VIT', c.hp / 148], ['PWR', c.dmg / 24]] as [string, number][]).map(([l, f]) => (
                                <span key={l} className="flex items-center gap-1">
                                  <span className="w-[18px] text-[7px] font-display text-faint">{l}</span>
                                  <span className="legend-stat flex-1"><span style={{ width: `${Math.round(f * 100)}%` }} /></span>
                                </span>
                              ))}
                            </span>
                          </span>
                        ) : (
                          <span className="legend-lock mt-1.5">
                            <NavIcon name="lock" />
                            WAVE {c.unlockWave}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] tracking-wider text-faint">
              {isTouch ? 'Tap a Legend to preview their saga.' : 'Select a Legend to preview their saga.'} Unlocked Legends are saved as your preferred class.
            </p>
          </section>

          {/* hero showcase */}
          <section
            className="legend-showcase panel-gold clip-notch p-4 sm:p-5 anim-fade-up relative overflow-hidden"
            style={{ animationDelay: '180ms', '--legend-color': cls.color } as CSSProperties}
          >
            <div key={cls.id} className="anim-state-enter">
              <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cls.color}2e 0%, transparent 65%)` }} />
              <div className="flex items-center gap-4 relative">
                <div className="legend-portrait" style={{ '--legend-color': cls.color } as CSSProperties}>
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
                    <button onClick={() => onOpenCodex(cls.id)} className="inline-flex min-h-9 items-center gap-1 text-[10px] font-bold tracking-[0.2em] px-2 py-1 clip-notch-sm border border-gold/40 text-goldbright hover:bg-gold/10 active:scale-95 transition-all">
                      <NavIcon name="scroll" /> READ THE SAGA
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
                    <div className="text-[11.5px] leading-relaxed text-parch/85 mt-1.5">{cls.lore}</div>
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

              <button
                onClick={() => onStart(cls.id)}
                className="btn-gold clip-notch w-full mt-3 py-4 sm:py-3.5 text-base sm:text-lg font-black tracking-[0.18em] active:scale-[0.99] transition-transform"
              >
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
