import { useState, type FormEvent } from 'react';
import { CLASSES } from '../game/data';
import type { PlayerProfile } from '../game/highscores';
import { ClassEmblem } from './ClassEmblem';

interface Props {
  profile: PlayerProfile;
  cloud: boolean;
  onlineCount: number;
  onChangePassword: (current: string, next: string, confirm: string) => Promise<string | null>;
  onLogout: () => void;
  onQuit: () => void;
  quitBusy: boolean;
  quitError: string;
  onClose: () => void;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel clip-notch-sm px-2 py-2.5 text-center">
      <div className="font-display text-[9px] tracking-[0.25em] text-faint">{label}</div>
      <div className={`font-display font-black text-lg leading-tight mt-0.5 ${accent ? 'text-goldbright text-emboss' : 'text-parch'}`}>{value}</div>
    </div>
  );
}

const inputClass =
  'w-full bg-[#070b12] border border-[#4a3d24] focus:border-goldbright outline-none rounded-sm px-3 py-2.5 text-parch font-medium tracking-wide shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] placeholder:text-[#5d6778]';

export function ProfilePanel({ profile, cloud, onlineCount, onChangePassword, onLogout, onQuit, quitBusy, quitError, onClose }: Props) {
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const cls = CLASSES.find((c) => c.id === profile.preferredClass) ?? CLASSES[0];
  const unlockedCount = profile.unlockedClasses?.length ?? 1;
  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const heroBests = Object.entries(profile.heroBests ?? {}).sort((a, b) => b[1].score - a[1].score);

  const submitPw = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const err = await onChangePassword(cur, next, confirm);
    setBusy(false);
    if (err) setMsg({ ok: false, text: err });
    else {
      setMsg({ ok: true, text: 'Password updated.' });
      setCur('');
      setNext('');
      setConfirm('');
      setPwOpen(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[62] flex items-center justify-center bg-abyss/92 p-3 sm:p-6 overflow-y-auto anim-overlay-enter">
      <div className="w-full max-w-lg my-auto anim-fade-up">
        <div className="panel-gold clip-notch p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cls.color}2e 0%, transparent 65%)` }} />

          <button
            onClick={onClose}
            aria-label="Close profile"
            className="absolute right-3 top-3 z-10 w-9 h-9 clip-notch-sm panel flex items-center justify-center text-faint hover:text-blood hover:border-blood/60 active:scale-90 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {/* identity */}
          <div className="flex items-center gap-4 relative pr-10">
            <div className="relative w-[84px] h-[84px] shrink-0">
              <div className="absolute inset-0 rounded-full border border-dashed anim-spin-slow" style={{ borderColor: `${cls.color}88` }} />
              <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${cls.color}30 0%, transparent 65%)` }} />
              <div className="absolute inset-0 flex items-center justify-center" style={{ color: cls.color }}>
                <ClassEmblem classId={cls.id} size={48} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-display text-[10px] tracking-[0.4em] text-gold">ADVENTURER</div>
              <div className="font-display font-black text-2xl sm:text-3xl text-goldbright text-emboss leading-none truncate">{profile.name}</div>
              <div className="text-[11px] text-faint mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${cloud ? 'bg-verdant' : 'bg-faint'}`} />
                  {cloud ? `Online · ${onlineCount} in realm` : 'Offline · this browser'}
                </span>
                <span className="w-[1px] h-3 bg-iron" />
                <span>Joined {joined}</span>
              </div>
            </div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <Stat label="BEST SCORE" value={profile.bestScore.toLocaleString()} accent />
            <Stat label="BEST WAVE" value={`${profile.bestWave}`} />
            <Stat label="RUNS" value={`${profile.runs}`} />
            <Stat label="TOTAL KILLS" value={profile.totalKills.toLocaleString()} />
            <Stat label="LEGENDS" value={`${unlockedCount}/${CLASSES.length}`} />
            <Stat label="MAIN" value={cls.name.split(' ')[0]} />
          </div>

          {/* per-hero bests */}
          {heroBests.length > 0 && (
            <div className="mt-4">
              <div className="font-display text-[10px] tracking-[0.3em] text-gold mb-1.5">RECORDS BY LEGEND</div>
              <div className="flex flex-col gap-[3px]">
                {heroBests.map(([id, best]) => {
                  const c = CLASSES.find((x) => x.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 px-2 py-1 bg-black/25 clip-notch-sm text-sm">
                      <span style={{ color: c?.color ?? '#8a94a8' }}>
                        <ClassEmblem classId={id} size={15} />
                      </span>
                      <span className="text-parch font-bold truncate">{c?.name ?? id}</span>
                      <span className="text-faint text-[10px] ml-auto">W{best.wave} · {best.runs} runs</span>
                      <span className="font-display font-bold text-gold tabular-nums w-[64px] text-right">{best.score.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* security */}
          <div className="mt-5 border-t border-iron pt-4">
            {!pwOpen ? (
              <button onClick={() => { setPwOpen(true); setMsg(null); }} className="btn-dark clip-notch w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                🔑 CHANGE PASSWORD
              </button>
            ) : (
              <form onSubmit={submitPw} className="flex flex-col gap-2.5">
                <div className="font-display text-[10px] tracking-[0.3em] text-gold">CHANGE PASSWORD</div>
                <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password" autoComplete="current-password" className={inputClass} />
                <input type="password" value={next} maxLength={32} onChange={(e) => setNext(e.target.value)} placeholder="New password (8+, upper, lower, number)" autoComplete="new-password" className={inputClass} />
                <input type="password" value={confirm} maxLength={32} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className={inputClass} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setPwOpen(false); setMsg(null); }} className="btn-dark clip-notch-sm flex-1 py-2.5 text-xs font-bold">
                    CANCEL
                  </button>
                  <button type="submit" disabled={busy} className="btn-gold clip-notch-sm flex-1 py-2.5 text-xs font-black disabled:opacity-50">
                    {busy ? 'SAVING…' : 'SAVE PASSWORD'}
                  </button>
                </div>
              </form>
            )}
            {msg && (
              <p className={`text-[11px] mt-2 ${msg.ok ? 'text-verdant' : 'text-blood'}`}>{msg.text}</p>
            )}
          </div>

          {/* session */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={onLogout} className="btn-dark clip-notch py-3 text-xs font-bold flex items-center justify-center gap-2 hover:border-gold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 17l5-5-5-5M20 12H9M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
              </svg>
              LOG OUT
            </button>
            {!confirmQuit ? (
              <button onClick={() => setConfirmQuit(true)} className="btn-dark clip-notch py-3 text-xs font-bold flex items-center justify-center gap-2 text-blood/90 hover:border-blood">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 3v9M6.5 6.5a8 8 0 1 0 11 0" />
                </svg>
                QUIT GAME
              </button>
            ) : (
              <button onClick={onQuit} disabled={quitBusy} className="btn-gold clip-notch py-3 text-xs font-black bg-blood/80 flex items-center justify-center disabled:opacity-60">
                {quitBusy ? 'SAVING…' : 'CONFIRM QUIT'}
              </button>
            )}
          </div>
          {confirmQuit && <p className="text-[10px] text-faint mt-1.5 text-center">Your progress is saved before the game closes.</p>}
          {quitError && <p role="alert" className="text-[11px] text-blood mt-2 text-center">{quitError}</p>}
        </div>
      </div>
    </div>
  );
}
