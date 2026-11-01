import { useEffect, type ReactNode } from 'react';
import { VolumeControl } from './VolumeControl';

interface Props {
  musicOn: boolean;
  muted: boolean;
  musicVol: number;
  sfxVol: number;
  version: string;
  cloud: boolean;
  /** shown only when opened from the title screen */
  onSwitchAccount?: () => void;
  onOpenProfile?: () => void;
  onOpenTutorial?: () => void;
  onOpenPatchNotes?: () => void;
  onOpenIndex?: () => void;
  onMusicVol: (v: number) => void;
  onSfxVol: (v: number) => void;
  onToggleMusic: () => void;
  onToggleMute: () => void;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel clip-notch px-3.5 py-3">
      <div className="font-display text-[10px] tracking-[0.3em] text-gold mb-2.5">{title}</div>
      {children}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0">
        <span className="block text-[12.5px] font-bold text-parch">{label}</span>
        {hint && <span className="block text-[10.5px] text-faint mt-0.5">{hint}</span>}
      </span>
      <span className="shrink-0">{children}</span>
    </div>
  );
}

export function SettingsOverlay({
  musicOn, muted, musicVol, sfxVol, version, cloud,
  onSwitchAccount, onOpenProfile, onOpenTutorial, onOpenPatchNotes,
  onOpenIndex,
  onMusicVol, onSfxVol, onToggleMusic, onToggleMute, onClose,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const linkBtn =
    'btn-dark clip-notch-sm w-full py-2.5 text-[11px] font-bold flex items-center justify-center gap-2';

  return (
    <div className="absolute inset-0 z-[61] flex items-center justify-center bg-abyss/92 p-3 sm:p-6 overflow-y-auto anim-overlay-enter">
      <div className="w-full max-w-md my-auto anim-fade-up">
        <div className="panel-gold clip-notch p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close settings"
            title="Close (Esc)"
            className="absolute right-3 top-3 w-9 h-9 clip-notch-sm panel flex items-center justify-center text-faint hover:text-blood hover:border-blood/60 active:scale-90 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5 pr-10">
            <span className="w-10 h-10 clip-notch-sm bg-black/40 border border-gold/50 flex items-center justify-center text-goldbright shrink-0 anim-spin-slow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.04a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03Z" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="font-display text-[10px] tracking-[0.45em] text-gold">REALM OPTIONS</div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-goldbright text-emboss leading-none">SETTINGS</h2>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-5">
            <Section title="AUDIO">
              <Row label="Music" hint="Realm themes & boss battle tracks">
                <VolumeControl label="Music" icon="music" value={musicVol} muted={!musicOn} compact onChange={onMusicVol} onToggle={onToggleMusic} />
              </Row>
              <div className="h-[1px] bg-iron my-1" />
              <Row label="Sound effects" hint="Combat, loot and ability cues">
                <VolumeControl label="Effects" icon="sfx" value={sfxVol} muted={muted} compact onChange={onSfxVol} onToggle={onToggleMute} />
              </Row>
            </Section>

            {(onOpenTutorial || onOpenPatchNotes || onOpenIndex) && (
              <Section title="HELP & INFO">
                <div className="grid grid-cols-2 gap-2">
                  {onOpenIndex && (
                    <button onClick={onOpenIndex} className={linkBtn}>
                      📚 POWER & ITEM INDEX
                    </button>
                  )}
                  {onOpenTutorial && (
                    <button onClick={onOpenTutorial} className={linkBtn}>
                      ? REPLAY TUTORIAL
                    </button>
                  )}
                  {onOpenPatchNotes && (
                    <button onClick={onOpenPatchNotes} className={linkBtn}>
                      🛠 PATCH NOTES
                    </button>
                  )}
                </div>
              </Section>
            )}

            {(onOpenProfile || onSwitchAccount) && (
              <Section title="ACCOUNT">
                <div className="grid grid-cols-2 gap-2">
                  {onOpenProfile && (
                    <button onClick={onOpenProfile} className={linkBtn}>
                      👤 MY PROFILE
                    </button>
                  )}
                  {onSwitchAccount && (
                    <button onClick={onSwitchAccount} className={linkBtn}>
                      ⇄ SWITCH ACCOUNT
                    </button>
                  )}
                </div>
              </Section>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-iron flex items-center justify-between text-[10px] tracking-wider text-faint">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cloud ? '#46c8a8' : '#e05252' }} />
              {cloud ? 'CLOUD SYNC ACTIVE' : 'OFFLINE MODE'}
            </span>
            <span>AETHERIA v{version}</span>
          </div>

          <button onClick={onClose} className="btn-gold clip-notch w-full mt-4 py-3 text-sm font-black tracking-[0.15em]">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
