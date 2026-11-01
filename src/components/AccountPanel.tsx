import { useState, type FormEvent, type ReactNode } from 'react';
import type { PlayerProfile } from '../game/highscores';
import { ClassEmblem } from './ClassEmblem';

interface Props {
  profiles: PlayerProfile[];
  activeProfile: PlayerProfile | null;
  cloudStatus?: { ok: boolean; message: string };
  required?: boolean;
  onCreate: (name: string, password: string, confirmation: string) => Promise<string | null>;
  onLogin: (username: string, password: string) => Promise<string | null>;
  onSetPassword: (id: string, password: string, confirmation: string) => Promise<string | null>;
  onClose: () => void;
}

type Mode = 'login' | 'signup' | 'set-password';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between">
        <span className="font-display text-[10px] tracking-[0.28em] text-gold/90">{label}</span>
        {hint && <span className="text-[10px] text-faint">{hint}</span>}
      </span>
      <div className="mt-1.5 relative">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full bg-[#070b12] border border-[#4a3d24] focus:border-goldbright outline-none rounded-sm px-3.5 py-3 text-parch font-medium tracking-wide shadow-[inset_0_2px_8px_rgba(0,0,0,0.55)] placeholder:text-[#5d6778]';

export function AccountPanel({ profiles, activeProfile, cloudStatus, required = false, onCreate, onLogin, onSetPassword, onClose }: Props) {
  const [mode, setMode] = useState<Mode>(profiles.length ? 'login' : 'signup');
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('aetheria-remembered-user') || activeProfile?.name || '';
    } catch {
      return activeProfile?.name ?? '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [legacyId, setLegacyId] = useState('');

  const setModeSafe = (next: Mode) => {
    setMode(next);
    setError('');
    setPassword('');
    setConfirmation('');
    setShowPass(false);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    let message: string | null = null;
    if (mode === 'signup') message = await onCreate(username, password, confirmation);
    else if (mode === 'set-password') message = await onSetPassword(legacyId, password, confirmation);
    else message = await onLogin(username, password);
    setBusy(false);
    if (mode === 'login' && remember) {
      try {
        localStorage.setItem('aetheria-remembered-user', username);
      } catch {
        /* ignore */
      }
    }
    if (message) {
      if (/legacy|needs a new password/i.test(message)) {
        const match = profiles.find((p) => p.name.toLowerCase() === username.trim().toLowerCase());
        if (match) {
          setLegacyId(match.id);
          setMode('set-password');
          setError('This older profile needs a password before it can sign in.');
          setPassword('');
          setConfirmation('');
          return;
        }
      }
      setError(message);
    } else {
      setPassword('');
      setConfirmation('');
    }
  };

  const isSignup = mode === 'signup';
  const isSetPw = mode === 'set-password';

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center px-3 py-5 overflow-y-auto anim-overlay-enter">
      {/* full-bleed gate backdrop so the title screen never bleeds through */}
      <div className="absolute inset-0 bg-[#05070c]/92" />
      <div className="absolute inset-0 opacity-70" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(226,180,92,0.10) 0%, transparent 58%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.65) 100%)' }} />

      <div className="relative w-full max-w-[430px] anim-fade-up my-auto">
        {/* crest */}
        <div className="text-center mb-5 anim-title">
          <div className="inline-flex items-center gap-2 text-gold mb-2">
            <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-gold/60" />
            <ClassEmblem classId="sandseer" size={24} />
            <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <div className="font-display text-[10px] tracking-[0.5em] text-gold/80">AETHERIA REALM GATE</div>
          <h2 key={mode} className="font-display font-black text-[clamp(30px,8vw,46px)] leading-none text-goldbright text-emboss mt-1.5 anim-state-enter">
            {isSignup ? 'CREATE ACCOUNT' : isSetPw ? 'SECURE ACCOUNT' : 'SIGN IN'}
          </h2>
          <p className="text-[12.5px] text-parch/70 mt-2.5 px-4">
            {isSignup
              ? 'Choose the name that will carry your legend on the leaderboard.'
              : isSetPw
                ? 'Set a password for this existing adventurer.'
                : 'Welcome back, adventurer. The realms have missed you.'}
          </p>
        </div>

        <div className="relative panel-gold p-[1px]" style={{ clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)' }}>
          <div className="absolute left-2 top-2 w-3 h-3 border-l border-t border-gold/70 z-10" />
          <div className="absolute right-2 top-2 w-3 h-3 border-r border-t border-gold/70 z-10" />
          <div className="absolute left-2 bottom-2 w-3 h-3 border-l border-b border-gold/70 z-10" />
          <div className="absolute right-2 bottom-2 w-3 h-3 border-r border-b border-gold/70 z-10" />

          <div className="bg-[#0d131d] px-5 py-6 sm:px-7">
            <form onSubmit={submit} className="flex flex-col gap-4">
              {!isSetPw && (
                <Field label="USERNAME" hint={isSignup ? '3–16 characters' : undefined}>
                  <input
                    value={username}
                    maxLength={16}
                    autoFocus
                    autoComplete="username"
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    placeholder={isSignup ? 'Pick a username' : 'Your username'}
                    className={inputClass}
                  />
                </Field>
              )}

              {isSetPw && (
                <div className="text-[12px] text-parch/75 bg-black/30 border border-gold/20 px-3 py-2 rounded-sm">
                  Protect <span className="text-goldbright font-bold">{username || 'this adventurer'}</span> with a new password.
                </div>
              )}

              <Field label="PASSWORD" hint={mode === 'login' ? undefined : '8+ chars · upper, lower, number'}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  maxLength={32}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Your password' : 'Create a password'}
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-faint hover:text-goldbright px-2 py-1"
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </Field>

              {mode !== 'login' && (
                <Field label="CONFIRM PASSWORD">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmation}
                    maxLength={32}
                    autoComplete="new-password"
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="Repeat password"
                    className={inputClass}
                  />
                </Field>
              )}

              {mode === 'login' && (
                <label className="flex items-center gap-2 text-[12px] text-parch/70 select-none -mt-1">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#dca944] w-3.5 h-3.5" />
                  Remember username on this device
                </label>
              )}

              {error && <div className="text-[12px] text-[#ff8a8a] bg-[#3a1518]/70 border border-[#7a2b2b] px-3 py-2 rounded-sm">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="btn-gold w-full py-3.5 text-sm font-black tracking-[0.18em] disabled:opacity-50"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                {busy ? 'AUTHENTICATING…' : isSignup ? 'CREATE ACCOUNT' : isSetPw ? 'SAVE PASSWORD' : 'ENTER REALM'}
              </button>
            </form>

            {/* switch link */}
            {!isSetPw && (
              <div className="mt-5 pt-4 border-t border-[#2a3344] text-center">
                <span className="text-[12px] text-faint">{isSignup ? 'Already have an account?' : 'New to Aetheria?'} </span>
                <button
                  onClick={() => setModeSafe(isSignup ? 'login' : 'signup')}
                  className="text-[12px] font-display font-bold tracking-[0.12em] text-goldbright hover:text-gold underline underline-offset-4 decoration-gold/40 ml-1"
                >
                  {isSignup ? 'SIGN IN' : 'SIGN UP'}
                </button>
              </div>
            )}
            {isSetPw && (
              <div className="mt-5 pt-4 border-t border-[#2a3344] text-center">
                <button onClick={() => setModeSafe('login')} className="text-[12px] font-display font-bold tracking-[0.12em] text-goldbright hover:text-gold underline underline-offset-4 decoration-gold/40">
                  ← BACK TO SIGN IN
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#2a3344] text-[10px] tracking-wider text-faint">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cloudStatus?.ok ? '#46c8a8' : '#e05252' }} />
                  {cloudStatus?.ok ? 'CLOUD SYNC ACTIVE' : 'OFFLINE MODE'}
                </span>
                <span>{cloudStatus?.ok ? 'SUPABASE' : 'THIS BROWSER ONLY'}</span>
              </div>
              {cloudStatus && !cloudStatus.ok && (
                <p className="mt-2 text-[10px] leading-relaxed text-[#ffb36b] normal-case tracking-normal">{cloudStatus.message}</p>
              )}
            </div>
          </div>
        </div>

        {!required && (
          <button onClick={onClose} className="btn-dark w-full mt-3 py-2.5 text-xs font-bold" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
            RETURN TO TITLE
          </button>
        )}
      </div>
    </div>
  );
}
