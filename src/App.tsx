import { useEffect, useRef, useState } from 'react';
import { Game, type GameStats, type GameState, type HudBus, type LevelUpData, type ShopData } from './game/engine';
import type { PowerId, ShopItemId } from './game/data';
import { discoverPower, discoverShopItem, loadDiscovery, type DiscoveryState } from './game/collection';
import {
  createProfile,
  authenticateByName,
  getActiveProfile,
  loadProfiles,
  loadScores,
  setProfilePassword,
  changeLocalPassword,
  updateProfileProgress,
  updateProfileClass,
  recordProfileRun,
  usernameError,
  passwordError,
  type PlayerProfile,
  type ScoreEntry,
} from './game/highscores';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  changeCloudPassword,
  checkConnection,
  currentProfile,
  signOut,
  fetchCloudState,
  fetchRecentEvents,
  fetchRemotePatchNotes,
  hydrateProfile,
  joinPresence,
  markCloudDiscovery,
  recordRun,
  setPreferredClass,
  signInWithUsername,
  signUpWithUsername,
  subscribeToRuns,
  type WorldEvent,
} from './lib/api';
import { PATCH_NOTES, CURRENT_VERSION, lastSeenVersion, markVersionSeen, compareVersions, type PatchNote } from './game/patchnotes';
import { LoreCodex } from './components/LoreCodex';
import { ProfilePanel } from './components/ProfilePanel';
import { SettingsOverlay } from './components/SettingsOverlay';
import { ProgressionIndex } from './components/ProgressionIndex';
import { PatchNotesOverlay } from './components/PatchNotesOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { StartScreen } from './components/StartScreen';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { PauseOverlay } from './components/PauseOverlay';
import { GameOverScreen } from './components/GameOverScreen';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { ShopOverlay } from './components/ShopOverlay';
import { AccountPanel } from './components/AccountPanel';

const TUTORIAL_VERSION = 2;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const busRef = useRef<HudBus>({ listeners: new Set() });
  const [screen, setScreen] = useState<GameState>('menu');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [levelUp, setLevelUp] = useState<LevelUpData | null>(null);
  const [shop, setShop] = useState<ShopData | null>(null);
  const cloud = isSupabaseConfigured;
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [profiles, setProfiles] = useState<PlayerProfile[]>(() => loadProfiles());
  const [activeProfile, setActiveProfileState] = useState<PlayerProfile | null>(() => (cloud ? null : getActiveProfile()));
  const [accountPanelOpen, setAccountPanelOpen] = useState(() => {
    if (cloud) return true;
    const profile = getActiveProfile();
    return !profile || !profile.passwordHash;
  });
  const [cloudStatus, setCloudStatus] = useState<{ ok: boolean; message: string }>({
    ok: false,
    message: cloud ? 'Checking connection…' : 'No .env — running offline on localStorage only.',
  });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const inscribedKeyRef = useRef<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [musicOn, setMusicOn] = useState(() => {
    try {
      return localStorage.getItem('aetheria-music') !== 'off';
    } catch {
      return true;
    }
  });
  const [musicVol, setMusicVol] = useState(() => {
    const v = Number(localStorage.getItem('aetheria-music-vol'));
    return Number.isFinite(v) && v > 0 ? Math.min(1, v) : 0.7;
  });
  const [sfxVol, setSfxVol] = useState(() => {
    const v = Number(localStorage.getItem('aetheria-sfx-vol'));
    return Number.isFinite(v) && v > 0 ? Math.min(1, v) : 0.7;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [indexTab, setIndexTab] = useState<'powers' | 'shop' | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryState>({ powers: [], shopItems: [] });
  const [codexClass, setCodexClass] = useState<string | null>(null);
  const [patchOpen, setPatchOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const tutorialAutoStartedFor = useRef<string | null>(null);
  const tutorialResumeAfterClose = useRef(false);
  const [notes, setNotes] = useState<PatchNote[]>(PATCH_NOTES);
  const [seenVersion, setSeenVersion] = useState<string | null>(null);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const currentVersion = notes[0]?.version ?? CURRENT_VERSION;
  const hasNewPatch = seenVersion === null || compareVersions(currentVersion, seenVersion) > 0;
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let game: Game;
    game = new Game(canvas, {
      bus: busRef.current,
      onState: (s, st) => {
        setScreen(s);
        if (st) {
          setStats(st);
          if (s === 'over') {
            const progressed = updateProfileProgress(st.profileId, st.wave, st.classId);
            if (progressed) {
              setActiveProfileState(progressed);
              setProfiles(loadProfiles());
            }
          }
        }
        if (!isSupabaseConfigured && (s === 'menu' || s === 'over')) setScores(loadScores());
        if (s === 'levelup') setLevelUp(game.getLevelUpData());
        else if (s !== 'paused') setLevelUp(null);
        if (s === 'shop') setShop(game.getShopData());
        else if (s !== 'paused') setShop(null);
      },
    });
    gameRef.current = game;
    (window as unknown as Record<string, unknown>).__game = game; // TEMP: bot playtest hook, remove before ship
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void checkConnection().then((result) => {
      if (!alive) return;
      setCloudStatus(result);
      if (!result.ok) console.warn('[AETHERIA]', result.message);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!cloud || !supabase) return;
    let alive = true;
    const applyCloudUser = async () => {
      const { data } = await currentProfile();
      if (!alive) return;
      if (data) {
        const mapped = await hydrateProfile(data);
        if (!alive) return;
        setActiveProfileState(mapped);
        setAccountPanelOpen(false);
      } else {
        setActiveProfileState(null);
        setAccountPanelOpen(true);
      }
      const board = await fetchCloudState();
      if (!alive) return;
      if (board.error) {
        console.error('[AETHERIA] leaderboard load failed:', board.error);
        return;
      }
      setProfiles(board.profiles);
      setScores(board.scores);
    };
    void applyCloudUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void applyCloudUser();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [cloud]);

  // Browsers block audio until the first gesture — unlock on any interaction.
  useEffect(() => {
    const onVisibilityChange = () => gameRef.current?.setAudioPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const unlock = () => {
      const g = gameRef.current;
      if (!g) return;
      g.unlockAudio();
      g.setVolumes(musicVol, sfxVol);
      g.setMusicEnabled(musicOn);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // apply persisted audio preferences once the engine exists
  useEffect(() => {
    gameRef.current?.music.setEnabled(musicOn);
  }, [musicOn]);

  useEffect(() => {
    gameRef.current?.setVolumes(musicVol, sfxVol);
    try {
      localStorage.setItem('aetheria-music-vol', String(musicVol));
      localStorage.setItem('aetheria-sfx-vol', String(sfxVol));
    } catch {
      /* ignore */
    }
  }, [musicVol, sfxVol]);

  const changeMusicVol = (v: number) => {
    setMusicVol(v);
    if (v > 0 && !musicOn) {
      setMusicOn(true);
      gameRef.current?.setMusicEnabled(true);
    }
  };
  const changeSfxVol = (v: number) => {
    setSfxVol(v);
    const g = gameRef.current;
    if (!g) return;
    if (v > 0 && g.muted) setMuted(g.toggleMuted());
  };

  // remote patch notes merge (optional table) — newest first, bundled as base
  useEffect(() => {
    if (!cloud) return;
    void fetchRemotePatchNotes().then((remote) => {
      if (!remote.length) return;
      const byVersion = new Map<string, PatchNote>();
      for (const n of PATCH_NOTES) byVersion.set(n.version, n);
      for (const n of remote) byVersion.set(n.version, { ...n, date: n.date || new Date().toISOString().slice(0, 10) });
      setNotes(Array.from(byVersion.values()).sort((a, b) => compareVersions(b.version, a.version)));
    });
  }, [cloud]);

  // Per-profile discovery, tutorial version, and patch-note state.
  useEffect(() => {
    if (!activeProfile) return;
    let cancelled = false;
    let tutorialTimer: number | undefined;
    const local = loadDiscovery(activeProfile.id);
    setDiscovery({
      powers: Array.from(new Set([...local.powers, ...((activeProfile.discoveredPowers ?? []) as PowerId[])])),
      shopItems: Array.from(new Set([...local.shopItems, ...((activeProfile.discoveredShopItems ?? []) as ShopItemId[])])),
    });
    const seen = lastSeenVersion(activeProfile.id);
    setSeenVersion(seen);
    let tutorialVersion = 0;
    try {
      const storedVersion = Number(localStorage.getItem(`aetheria-tutorial-version-${activeProfile.id}`));
      if (Number.isFinite(storedVersion)) tutorialVersion = storedVersion;
    } catch {
      console.error('[AETHERIA] could not read tutorial version.');
    }
    if (tutorialVersion < TUTORIAL_VERSION) {
      tutorialTimer = window.setTimeout(() => {
        if (cancelled || tutorialAutoStartedFor.current === activeProfile.id) return;
        tutorialAutoStartedFor.current = activeProfile.id;
        startGame(activeProfile.preferredClass);
        tutorialResumeAfterClose.current = true;
        gameRef.current?.setPaused(true);
        setTutorialOpen(true);
      });
      // first-ever launch: don't stack the patch notes on top of the tutorial
      if (seen === null) markVersionSeen(activeProfile.id, currentVersion);
    } else if (seen !== null && compareVersions(currentVersion, seen) > 0) {
      setPatchOpen(true);
    }
    return () => {
      cancelled = true;
      if (tutorialTimer !== undefined) window.clearTimeout(tutorialTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile?.id, currentVersion]);

  // live world feed + realm presence
  useEffect(() => {
    if (!cloud || !activeProfile) {
      // offline: derive a feed from local scores so the ticker is never fake
      setEvents(
        scores.slice(0, 10).map((s, i) => ({
          id: `local-${i}-${s.date}`,
          at: s.date,
          color: i === 0 ? '#ffd97a' : '#9fb0c8',
          text: `[Ledger] ${s.userName ?? s.name} reached wave ${s.wave} · ${s.score.toLocaleString()} pts`,
        }))
      );
      setOnlineCount(1);
      return;
    }
    let alive = true;
    void fetchRecentEvents().then((list) => alive && setEvents(list));
    const unsubRuns = subscribeToRuns((fresh) => {
      if (!alive) return;
      setEvents((prev) => [...fresh, ...prev].slice(0, 20));
      for (const ev of fresh) gameRef.current?.pushWorldEvent(ev.text, ev.color);
    });
    const unsubPresence = joinPresence(activeProfile.id, activeProfile.name, (n) => alive && setOnlineCount(n));
    return () => {
      alive = false;
      unsubRuns();
      unsubPresence();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloud, activeProfile?.id]);

  const openPatchNotes = () => {
    setPatchOpen(true);
  };
  const closePatchNotes = () => {
    setPatchOpen(false);
    markVersionSeen(activeProfile?.id, currentVersion);
    setSeenVersion(currentVersion);
  };
  const closeTutorial = () => {
    setTutorialOpen(false);
    if (tutorialResumeAfterClose.current) {
      tutorialResumeAfterClose.current = false;
      gameRef.current?.setPaused(false);
    }
    try {
      if (activeProfile) localStorage.setItem(`aetheria-tutorial-version-${activeProfile.id}`, String(TUTORIAL_VERSION));
    } catch (error) {
      console.error('[AETHERIA] could not save tutorial version:', error);
    }
  };
  const changePassword = async (current: string, next: string, confirm: string) => {
    if (!activeProfile) return 'No adventurer is signed in.';
    const problem = passwordError(next, confirm);
    if (problem) return problem;
    if (cloud) {
      const res = await changeCloudPassword(activeProfile.name, current, next);
      return res.error ?? null;
    }
    const res = await changeLocalPassword(activeProfile.id, current, next, confirm);
    if (!res.profile) return res.error ?? 'Could not change password.';
    setActiveProfileState(res.profile);
    setProfiles(loadProfiles());
    return null;
  };

  const logOut = async () => {
    setProfileOpen(false);
    gameRef.current?.toMenu();
    if (cloud) await signOut();
    setActiveProfileState(null);
    setAccountPanelOpen(true);
  };

  const quitGame = () => {
    setProfileOpen(false);
    gameRef.current?.toMenu();
    window.close();
    // Browsers block close() for tabs the script did not open — show a farewell.
    setTimeout(() => {
      document.body.innerHTML =
        '<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#05070c;color:#e2b45c;font-family:Cinzel,Georgia,serif;text-align:center;padding:24px"><div><div style="font-size:12px;letter-spacing:.5em;opacity:.7">FAREWELL, ADVENTURER</div><div style="font-size:clamp(24px,6vw,44px);font-weight:900;margin-top:10px">THE REALMS AWAIT YOUR RETURN</div><div style="font-size:13px;color:#8a94a8;margin-top:14px;font-family:sans-serif">You may close this tab safely — your progress is saved.</div></div></div>';
    }, 120);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    gameRef.current?.setMusicEnabled(next);
    try {
      localStorage.setItem('aetheria-music', next ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  };

  // quick-restart hotkeys on overlay screens (never while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (document.activeElement?.tagName ?? '') === 'INPUT';
      if (typing) return;
      const g = gameRef.current;
      if (!g) return;
      if (e.code === 'KeyR' && (screen === 'over' || screen === 'paused')) {
        e.preventDefault();
        g.sfx.ensure();
        g.sfx.play('click');
        g.restart();
      }
      if (e.code === 'Enter' && screen === 'over') {
        e.preventDefault();
        g.sfx.ensure();
        g.sfx.play('click');
        g.restart();
      }
      if (screen === 'levelup' && levelUp) {
        const choice = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
        if (choice >= 0) {
          e.preventDefault();
          g.choosePower(levelUp.choices[choice].id);
        }
        if (e.code === 'KeyR') {
          e.preventDefault();
          g.rerollPowers();
        }
      }
      if (screen === 'shop' && shop) {
        const item = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
        if (item >= 0) {
          e.preventDefault();
          g.buyShopItem(shop.items[item].item.id);
        }
        // Market closes ONLY via its button — no Enter/Space shortcut.
        if (e.code === 'KeyR') {
          e.preventDefault();
          g.rerollShop();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, levelUp, shop]);

  const startGame = (classId: string) => {
    const g = gameRef.current;
    if (!g || !activeProfile) return;
    g.sfx.ensure();
    g.sfx.play('click');
    inscribedKeyRef.current = null;
    setSaveState('idle');
    setSaveError('');
    g.start(classId, activeProfile.name, activeProfile.id, activeProfile.name);
  };

  const openTutorial = () => {
    setSettingsOpen(false);
    if (screen === 'menu' && activeProfile) {
      startGame(activeProfile.preferredClass);
      tutorialResumeAfterClose.current = true;
      gameRef.current?.setPaused(true);
    }
    setTutorialOpen(true);
  };

  const continueTutorialToMarket = () => {
    tutorialResumeAfterClose.current = false;
    gameRef.current?.setPaused(false);
  };

  const toggleMute = () => {
    const g = gameRef.current;
    if (!g) return;
    setMuted(g.toggleMuted());
  };

  const restart = () => {
    const g = gameRef.current;
    if (!g) return;
    g.sfx.play('click');
    inscribedKeyRef.current = null;
    setSaveState('idle');
    setSaveError('');
    g.restart();
  };

  const toMenu = () => {
    const g = gameRef.current;
    if (!g) return;
    g.sfx.play('click');
    // Abandoning still banks progress: best wave, unlocks, discovery and a
    // ledger entry for the partial run — nothing earned is lost.
    try {
      const live = g.getStats();
      // Skip if this exact run was already inscribed (e.g. TITLE pressed
      // from the game-over screen) so runs/ledger aren't double-counted.
      const key = activeProfile
        ? `${activeProfile.id}|${live.classId}|${live.score}|${live.wave}|${live.timeSec}`
        : null;
      if (live.wave > 0 && activeProfile && key !== inscribedKeyRef.current) {
        inscribedKeyRef.current = key;
        const progressed = updateProfileProgress(live.profileId, live.wave, live.classId);
        if (progressed) {
          setActiveProfileState(progressed);
          setProfiles(loadProfiles());
        }
        if (cloud) {
          void recordRun({
            classId: live.classId,
            score: live.score,
            wave: live.wave,
            level: live.level,
            kills: live.kills,
            gold: live.gold,
            durationSeconds: live.timeSec,
          }).then(() => {
            void fetchCloudState().then((board) => {
              if (!board.error) {
                setProfiles(board.profiles);
                setScores(board.scores);
              }
            });
          });
        } else {
          const result = recordProfileRun(live.profileId, {
            classId: live.classId,
            score: live.score,
            wave: live.wave,
            level: live.level,
            durationSeconds: live.timeSec,
            date: Date.now(),
            kills: live.kills,
          });
          setScores(result.scores);
          setProfiles(result.profiles);
        }
      }
    } catch (err) {
      console.error('[AETHERIA] abandon-save failed:', err);
    }
    g.toMenu();
  };

  const choosePower = (id: PowerId) => {
    const chosen = gameRef.current?.choosePower(id);
    if (chosen && activeProfile) {
      setDiscovery(discoverPower(activeProfile.id, id));
      if (cloud) void markCloudDiscovery('power', id);
    }
  };

  const buyShopItem = (id: ShopItemId) => {
    const bought = gameRef.current?.buyShopItem(id);
    if (bought && activeProfile) {
      setDiscovery(discoverShopItem(activeProfile.id, id));
      if (cloud) void markCloudDiscovery('shop', id);
    }
  };

  const applyLocalAuth = (profile: PlayerProfile) => {
    setProfiles(loadProfiles());
    setActiveProfileState(profile);
    setAccountPanelOpen(false);
    setScores(loadScores());
  };

  const applyCloudAuth = async (dbProfile: NonNullable<Awaited<ReturnType<typeof currentProfile>>['data']>) => {
    const mapped = await hydrateProfile(dbProfile);
    setActiveProfileState(mapped);
    setAccountPanelOpen(false);
    const board = await fetchCloudState();
    if (!board.error) {
      setProfiles(board.profiles);
      setScores(board.scores);
    }
  };

  const createAccount = async (name: string, password: string, confirmation: string) => {
    const nameProblem = usernameError(name);
    if (nameProblem) return nameProblem;
    const passProblem = passwordError(password, confirmation);
    if (passProblem) return passProblem;
    if (cloud) {
      const result = await signUpWithUsername(name, password);
      if (!result.data) return result.error ?? 'Could not create profile.';
      await applyCloudAuth(result.data);
      return null;
    }
    const result = await createProfile(name, password, confirmation);
    if (!result.profile) return result.error ?? 'Could not create profile.';
    applyLocalAuth(result.profile);
    return null;
  };

  const selectAccount = async (username: string, password: string) => {
    if (cloud) {
      const result = await signInWithUsername(username, password);
      if (!result.data) return result.error ?? 'Login failed.';
      await applyCloudAuth(result.data);
      return null;
    }
    const result = await authenticateByName(username, password);
    if (!result.profile) return result.error ?? 'Login failed.';
    applyLocalAuth(result.profile);
    return null;
  };

  const setPassword = async (id: string, password: string, confirmation: string) => {
    const result = await setProfilePassword(id, password, confirmation);
    if (!result.profile) return result.error ?? 'Could not save password.';
    setProfiles(loadProfiles());
    setActiveProfileState(result.profile);
    setAccountPanelOpen(false);
    return null;
  };

  const rememberClass = (classId: string) => {
    if (!activeProfile) return;
    const updated = updateProfileClass(activeProfile.id, classId);
    if (updated) {
      setActiveProfileState(updated);
      setProfiles(loadProfiles());
    }
    if (cloud) void setPreferredClass(classId);
  };

  const inscribeRun = async (): Promise<string | null> => {
    if (!stats || !activeProfile) return 'No adventurer is signed in.';
    if (cloud) {
      const result = await recordRun({
        classId: stats.classId,
        score: stats.score,
        wave: stats.wave,
        level: stats.level,
        kills: stats.kills,
        gold: stats.gold,
        durationSeconds: stats.timeSec,
      });
      if (result.error) {
        console.error('[AETHERIA] record_run failed:', result.error);
        return result.error;
      }
      recordProfileRun(stats.profileId, {
        classId: stats.classId,
        score: stats.score,
        wave: stats.wave,
        level: stats.level,
        durationSeconds: stats.timeSec,
        date: Date.now(),
        kills: stats.kills,
      });
      if (result.data) setActiveProfileState(await hydrateProfile(result.data));
      const board = await fetchCloudState();
      if (!board.error) {
        setProfiles(board.profiles);
        setScores(board.scores);
      }
      return null;
    }
    const result = recordProfileRun(stats.profileId, {
      classId: stats.classId,
      score: stats.score,
      wave: stats.wave,
      level: stats.level,
      durationSeconds: stats.timeSec,
      date: Date.now(),
      kills: stats.kills,
    });
    setScores(result.scores);
    setProfiles(result.profiles);
    return null;
  };

  // Save every run the instant the game-over screen appears — no manual
  // click required. A ref-guarded key prevents double-saving the same run
  // (e.g. on React StrictMode re-renders or re-opening the same stats).
  useEffect(() => {
    if (screen !== 'over' || !stats || !activeProfile) return;
    const key = `${activeProfile.id}|${stats.classId}|${stats.score}|${stats.wave}|${stats.timeSec}`;
    if (inscribedKeyRef.current === key) return;
    inscribedKeyRef.current = key;
    setSaveState('saving');
    setSaveError('');
    void inscribeRun().then((err) => {
      if (err) {
        console.error('[AETHERIA] run save failed:', err);
        setSaveState('error');
        setSaveError(err);
      } else {
        setSaveState('saved');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, stats, activeProfile]);

  const retrySave = () => {
    if (!stats || !activeProfile) return;
    inscribedKeyRef.current = `${activeProfile.id}|${stats.classId}|${stats.score}|${stats.wave}|${stats.timeSec}`;
    setSaveState('saving');
    setSaveError('');
    void inscribeRun().then((err) => {
      if (err) {
        setSaveState('error');
        setSaveError(err);
      } else {
        setSaveState('saved');
      }
    });
  };

  const pauseStats = screen === 'paused' ? (gameRef.current?.getStats() ?? null) : null;
  const pauseData = screen === 'paused' ? (gameRef.current?.getPauseData() ?? null) : null;

  return (
    <div className="fixed inset-0 bg-ink overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* ambient vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 52%, rgba(4,6,10,0.6) 100%)' }}
      />

      {screen !== 'menu' && (
        <HUD
          bus={busRef.current}
          isTouch={isTouch}
          onPause={() => gameRef.current?.setPaused(true)}
          onOpenSettings={() => {
            gameRef.current?.setPaused(true);
            setSettingsOpen(true);
          }}
        />
      )}

      {(screen === 'playing' || (screen === 'paused' && tutorialOpen)) && isTouch && <TouchControls gameRef={gameRef} bus={busRef.current} />}

      {screen === 'levelup' && levelUp && (
        <LevelUpOverlay data={levelUp} onChoose={choosePower} onOpenIndex={() => setIndexTab('powers')} onReroll={() => gameRef.current?.rerollPowers()} />
      )}

      {screen === 'shop' && shop && (
        <ShopOverlay
          data={shop}
          onBuy={buyShopItem}
          onToggleLock={(id) => gameRef.current?.toggleLockShopItem(id)}
          onOpenIndex={() => setIndexTab('shop')}
          onReroll={() => gameRef.current?.rerollShop()}
          onContinue={() => gameRef.current?.continueFromShop()}
        />
      )}

      {screen === 'menu' && activeProfile && (
        <StartScreen
          scores={scores}
          profiles={profiles}
          activeProfile={activeProfile}
          version={currentVersion}
          hasNewPatch={hasNewPatch}
          onlineCount={onlineCount}
          cloud={cloud}
          events={events}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenTutorial={openTutorial}
          onOpenCodex={(id) => setCodexClass(id)}
          onOpenIndex={() => setIndexTab('powers')}
          onOpenPatchNotes={openPatchNotes}
          isTouch={isTouch}
          onClassChange={rememberClass}
          onStart={startGame}
        />
      )}

      {settingsOpen && (
        <SettingsOverlay
          musicOn={musicOn}
          muted={muted}
          musicVol={musicVol}
          sfxVol={sfxVol}
          version={currentVersion}
          cloud={cloud}
          onMusicVol={changeMusicVol}
          onSfxVol={changeSfxVol}
          onToggleMusic={toggleMusic}
          onToggleMute={toggleMute}
          onOpenIndex={() => {
            setSettingsOpen(false);
            setIndexTab('powers');
          }}
          {...(screen === 'menu' && activeProfile
            ? {
                onOpenProfile: () => {
                  setSettingsOpen(false);
                  setProfileOpen(true);
                },
                onSwitchAccount: () => {
                  setSettingsOpen(false);
                  setAccountPanelOpen(true);
                },
                onOpenTutorial: openTutorial,
                onOpenPatchNotes: () => {
                  setSettingsOpen(false);
                  openPatchNotes();
                },
              }
            : {})}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {indexTab && (
        <ProgressionIndex discovery={discovery} initialTab={indexTab} onClose={() => setIndexTab(null)} />
      )}

      {profileOpen && activeProfile && (
        <ProfilePanel
          profile={activeProfile}
          cloud={cloud}
          onlineCount={onlineCount}
          onChangePassword={changePassword}
          onLogout={logOut}
          onQuit={quitGame}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {screen === 'menu' && codexClass && activeProfile && (
        <LoreCodex initialClassId={codexClass} unlocked={activeProfile.unlockedClasses ?? ['kensei']} isTouch={isTouch} onClose={() => setCodexClass(null)} />
      )}

      {patchOpen && (screen === 'menu' || screen === 'paused') && (
        <PatchNotesOverlay notes={notes} currentVersion={currentVersion} lastSeen={seenVersion} onClose={closePatchNotes} />
      )}

      {tutorialOpen && ['playing', 'paused', 'levelup', 'shop'].includes(screen) && activeProfile && !accountPanelOpen && (
        <TutorialOverlay isTouch={isTouch} screen={screen} onClose={closeTutorial} onContinueToMarket={continueTutorialToMarket} />
      )}

      {screen === 'menu' && accountPanelOpen && (
        <AccountPanel
          profiles={profiles}
          activeProfile={activeProfile}
          cloudStatus={cloudStatus}
          required={!activeProfile}
          onCreate={createAccount}
          onLogin={selectAccount}
          onSetPassword={setPassword}
          onClose={() => setAccountPanelOpen(false)}
        />
      )}

      {screen === 'paused' && !tutorialOpen && pauseStats && pauseData && (
        <PauseOverlay
          wave={pauseStats.wave}
          score={pauseStats.score}
          skills={pauseData.activeSkills}
          totalStats={pauseData.totalBuildStats}
          marketplacePowerups={pauseData.marketplacePowerups}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenTutorial={() => setTutorialOpen(true)}
          onResume={() => gameRef.current?.setPaused(false)}
          onRestart={restart}
          onMenu={toMenu}
        />
      )}

      {screen === 'over' && stats && (
        <GameOverScreen
          stats={stats}
          scores={scores}
          profile={activeProfile}
          saveState={saveState}
          saveError={saveError}
          onRestart={restart}
          onMenu={toMenu}
          onRetry={retrySave}
        />
      )}
    </div>
  );
}
