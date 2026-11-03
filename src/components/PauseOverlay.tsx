import type { ActiveSkillSummary, MarketplacePowerupSummary } from '../game/engine';
import { ZONES } from '../game/data';
import { useViewport } from '../hooks/useViewport';

interface Props {
  wave: number;
  score: number;
  skills: ActiveSkillSummary[];
  totalStats: { label: string; value: string }[];
  marketplacePowerups: MarketplacePowerupSummary[];
  onOpenSettings: () => void;
  onOpenTutorial?: () => void;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

function ReferenceDesktopPauseLayout({ wave, score, skills, totalStats, marketplacePowerups, onOpenSettings, onOpenTutorial, onResume, onRestart, onMenu }: Props) {

  return (
    <div className="safe-screen absolute inset-0 z-40 bg-abyss/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto anim-overlay-enter">
      <div className="reference-pause panel-gold clip-notch w-full max-w-5xl p-4 sm:p-5 anim-fade-up my-auto">
        <div className="text-center mb-4">
          <div className="font-display text-[10px] tracking-[0.5em] text-faint">THE REALMS WAIT</div>
          <h2 className="font-display font-black text-3xl text-goldbright text-emboss mt-1">GAME PAUSED</h2>
          <div className="text-xs text-cyan-100/85 mt-1 font-bold tracking-wider">{ZONES[Math.max(0, wave - 1) % ZONES.length].name} · Wave {wave} · {score.toLocaleString()} score</div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[150px_minmax(0,1fr)]">
          <nav className="reference-pause-nav panel clip-notch p-2 flex flex-row lg:flex-col gap-1.5" aria-label="Pause menu">
            <button onClick={onResume} className="reference-pause-nav-item reference-pause-resume btn-gold clip-notch flex items-center gap-3 px-3 py-3 text-[11px] font-black"><span className="text-xl">▶</span> RESUME</button>
            <button onClick={onRestart} className="reference-pause-nav-item btn-dark clip-notch flex items-center gap-3 px-3 py-3 text-[11px] font-bold"><span className="text-xl text-goldbright">↻</span> RESTART</button>
            <button onClick={onOpenSettings} className="reference-pause-nav-item btn-dark clip-notch flex items-center gap-3 px-3 py-3 text-[11px] font-bold"><span className="text-xl text-goldbright">⚙</span> SETTINGS</button>
            <button onClick={onOpenTutorial} className="reference-pause-nav-item btn-dark clip-notch flex items-center gap-3 px-3 py-3 text-[11px] font-bold"><span className="text-xl text-cyan-100">▣</span> TUTORIAL</button>
            <button onClick={onMenu} className="reference-pause-nav-item reference-pause-abandon btn-dark clip-notch flex items-center gap-3 px-3 py-3 text-[11px] font-bold"><span className="text-xl">↪</span> ABANDON RUN</button>
          </nav>

          <div className="grid gap-3 md:grid-cols-2 min-w-0">
          <section className="panel clip-notch bg-[rgba(5,14,24,0.92)] p-3 border-cyan-200/25">
            <h3 className="font-display text-[11px] tracking-[0.28em] font-black text-goldbright mb-2">SKILLS</h3>
            <div className="space-y-2 text-[11px] text-cyan-50/90">
              {skills.length === 0 ? <div className="text-faint">No active skills.</div> : skills.map((skill) => (
                <div key={skill.id} className="border border-cyan-200/20 p-2 rounded-sm bg-[#081522]/90">
                  <div className="flex items-center justify-between gap-2"><span className="font-bold text-white">{skill.name}</span><span className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">{skill.rarity}</span></div>
                  <div className="mt-1 text-[10px] text-goldbright/90">Stacks: {skill.count}{skill.maxStacks ? ` / ${skill.maxStacks}` : ''}</div>
                  <div className="mt-1 text-cyan-50/90">{skill.valueText}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel clip-notch bg-[rgba(5,14,24,0.92)] p-3 border-cyan-200/25">
            <h3 className="font-display text-[11px] tracking-[0.28em] font-black text-goldbright mb-2">TOTAL BUILD STATS</h3>
            <div className="space-y-1.5 text-[11px] text-cyan-50/90">
              {totalStats.map((stat) => <div key={stat.label} className="flex items-center justify-between gap-2 border-b border-cyan-200/15 pb-1"><span>{stat.label}</span><span className="font-bold text-white">{stat.value}</span></div>)}
            </div>
          </section>

          <section className="panel clip-notch bg-[rgba(5,14,24,0.92)] p-3 border-cyan-200/25 md:col-span-2">
            <h3 className="font-display text-[11px] tracking-[0.28em] font-black text-goldbright mb-2">MARKETPLACE POWER-UPS</h3>
            <div className="grid gap-2 md:grid-cols-2 text-[11px] text-cyan-50/90">
              {marketplacePowerups.length === 0 ? <div className="text-faint">No active marketplace power-ups.</div> : marketplacePowerups.map((entry, i) => (
                <div key={`${entry.name}-${i}`} className="border border-cyan-200/20 p-2 rounded-sm bg-[#081522]/90">
                  <div className="flex items-center justify-between gap-2"><span className="font-bold text-white">{entry.name}</span>{entry.count > 1 && <span className="text-[10px] text-goldbright">x{entry.count}</span>}</div>
                  <div className="mt-1 text-cyan-50/90">{entry.effect}</div>
                  {entry.remainingSeconds !== null && <div className="mt-1 text-[10px] text-goldbright/90">Remaining: {entry.remainingSeconds.toFixed(1)}s</div>}
                </div>
              ))}
            </div>
          </section>
        </div>
        </div>

        <div className="mt-3 border-t border-cyan-200/20 pt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-parch/80">
          <div><span className="kbd">WASD</span> move</div><div><span className="kbd">SPACE</span>/<span className="kbd">CLICK</span> attack</div>
          <div><span className="kbd">SHIFT</span> dash · i-frames</div><div><span className="kbd">E</span>/<span className="kbd">R-CLICK</span> signature</div>
          <div><span className="kbd">Q</span> legacy ability</div><div><span className="kbd">ESC</span>/<span className="kbd">P</span> pause</div><div><span className="kbd">M</span> mute</div>
        </div>

      </div>
    </div>
  );
}

export function PauseOverlay(props: Props) {
  const { wave, score, skills, totalStats, marketplacePowerups, onOpenSettings, onResume, onRestart, onMenu } = props;
  const vp = useViewport();
  const realm = ZONES[Math.max(0, wave - 1) % ZONES.length].name;

  if (!vp.coarse) {
    return <ReferenceDesktopPauseLayout {...props} />;
  }

  return (
    <div className="safe-screen absolute inset-0 z-40 bg-abyss/75 flex items-center justify-center p-2.5 overflow-y-auto anim-overlay-enter">
      <div className="panel-gold clip-notch w-full max-w-3xl p-3 sm:p-4 anim-fade-up my-auto">
        <div className="text-center">
          <div className="font-display text-[10px] tracking-[0.5em] text-faint">THE REALMS WAIT</div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-goldbright text-emboss mt-0.5">GAME PAUSED</h2>
          <div className="text-[11px] sm:text-xs text-cyan-100/85 mt-0.5 font-bold tracking-wider">
            {realm} · Wave {wave} · {score.toLocaleString()} score
          </div>
        </div>

        <nav className="pause-actions mt-3 grid grid-cols-2 gap-2 p-2" aria-label="Pause menu">
            <button onClick={onResume} className="pause-action pause-action-primary btn-gold clip-notch min-h-[78px] flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-black">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.2v13.6c0 1 1.1 1.6 2 1l9.2-6.8c.8-.6.8-1.8 0-2.4L10 3.8c-.9-.6-2-.1-2 1.4Z" /></svg>
              RESUME
            </button>
            <button onClick={onOpenSettings} className="pause-action btn-dark clip-notch min-h-[78px] flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-bold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.04a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03Z" />
              </svg>
              SETTINGS
            </button>
            <button onClick={onRestart} className="pause-action btn-dark clip-notch min-h-[78px] flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-bold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0 1 4" /><path d="M20 4v7h-7" /></svg>
              RESTART
            </button>
            <button onClick={onMenu} className="pause-action pause-action-danger btn-dark clip-notch min-h-[78px] flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-bold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 4h12v16H6z" /><path d="m10 9 4 3-4 3" /></svg>
              ABANDON
            </button>
        </nav>

        <div className="mt-3 grid gap-2.5 md:grid-cols-2 min-w-0">
          <section className="panel clip-notch bg-[rgba(5,14,24,0.92)] p-3 border-cyan-200/25">
            <h3 className="font-display text-[11px] tracking-[0.25em] font-black text-goldbright mb-2">SKILLS</h3>
            <div className="space-y-1.5 text-[11px] text-cyan-50/90">
              {skills.length === 0 ? <div className="text-faint">No active skills.</div> : skills.map((skill) => (
                <div key={skill.id} className="border border-cyan-200/20 p-2 rounded-sm bg-[#081522]/90">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{skill.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">{skill.rarity}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-goldbright/90">Stacks: {skill.count}{skill.maxStacks ? ` / ${skill.maxStacks}` : ''}</div>
                  <div className="mt-1 text-cyan-50/90 leading-relaxed">{skill.valueText}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel clip-notch bg-[rgba(5,14,24,0.92)] p-3 border-cyan-200/25">
            <h3 className="font-display text-[11px] tracking-[0.25em] font-black text-goldbright mb-2">TOTAL BUILD STATS</h3>
            <div className="space-y-1.5 text-[11px] text-cyan-50/90">
              {totalStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between gap-2 border-b border-cyan-200/15 pb-1">
                  <span>{stat.label}</span>
                  <span className="font-bold text-white tabular-nums">{stat.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel clip-notch bg-[rgba(5,14,24,0.92)] p-3 border-cyan-200/25 md:col-span-2">
            <h3 className="font-display text-[11px] tracking-[0.25em] font-black text-goldbright mb-2">MARKETPLACE POWER-UPS</h3>
            <div className="grid gap-1.5 md:grid-cols-2 text-[11px] text-cyan-50/90">
              {marketplacePowerups.length === 0 ? <div className="text-faint">No active marketplace power-ups.</div> : marketplacePowerups.map((entry, i) => (
                <div key={`${entry.name}-${i}`} className="border border-cyan-200/20 p-2 rounded-sm bg-[#081522]/90">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{entry.name}</span>
                    {entry.count > 1 && <span className="text-[10px] text-goldbright">x{entry.count}</span>}
                  </div>
                  <div className="mt-1 text-cyan-50/90 leading-relaxed">{entry.effect}</div>
                  {entry.remainingSeconds !== null ? (
                    <div className="mt-1 text-[10px] text-goldbright/90">Remaining: {entry.remainingSeconds.toFixed(1)}s</div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-3 border-t border-cyan-200/20 pt-2">
          {vp.coarse ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-parch/80">
              <div className="flex items-center gap-1.5">Left side — drag to move</div>
              <div className="flex items-center gap-1.5">Gold circle — attack</div>
              <div className="flex items-center gap-1.5">★ button — signature</div>
              <div className="flex items-center gap-1.5">◈ button — legacy ability</div>
              <div className="flex items-center gap-1.5">➤ button — dash (i-frames)</div>
              <div className="flex items-center gap-1.5 col-span-2">⏸ top-right — pause any time</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-parch/80">
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">WASD</span> move</div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">SPACE</span>/<span className="kbd">CLICK</span> attack</div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">SHIFT</span> dash · i-frames</div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">E</span>/<span className="kbd">R-CLICK</span> signature</div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">Q</span> legacy ability</div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">ESC</span>/<span className="kbd">P</span> pause</div>
              <div className="flex items-center gap-1.5 flex-wrap"><span className="kbd">M</span> mute</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
