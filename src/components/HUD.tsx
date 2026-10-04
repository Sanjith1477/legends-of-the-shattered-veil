import { useEffect, useRef } from 'react';
import type { HudBus, HudData } from '../game/engine';
import { ClassEmblem } from './ClassEmblem';
import { useViewport } from '../hooks/useViewport';

interface Props {
  bus: HudBus;
  isTouch: boolean;
  onPause: () => void;
  onOpenSettings: () => void;
}

function setFrac(el: HTMLDivElement | null, frac: number) {
  if (!el) return;
  const f = Math.max(0, Math.min(1, frac));
  if (f <= 0) {
    if (el.dataset.on === '1') {
      el.style.background = 'transparent';
      el.dataset.on = '0';
      const btn = el.parentElement;
      if (btn) {
        btn.classList.remove('anim-ready');
        void btn.offsetWidth;
        btn.classList.add('anim-ready');
      }
    }
  } else {
    el.dataset.on = '1';
    el.style.background = `conic-gradient(rgba(4,7,11,0.85) ${f * 360}deg, rgba(4,7,11,0) 0deg)`;
  }
}

function cooldownText(seconds: number) {
  if (seconds <= 0) return 'READY';
  return seconds >= 10 ? `${Math.ceil(seconds)}s` : `${seconds.toFixed(1)}s`;
}

export function HUD({ bus, isTouch, onPause, onOpenSettings }: Props) {
  const vp = useViewport();
  const compact = vp.compact;
  const tiny = vp.w < 420 || vp.h < 430;

  const emblemWrap = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const classRef = useRef<HTMLSpanElement>(null);
  const lvRef = useRef<HTMLSpanElement>(null);
  const hpFill = useRef<HTMLDivElement>(null);
  const hpText = useRef<HTMLSpanElement>(null);
  const xpFill = useRef<HTMLDivElement>(null);
  const buffRef = useRef<HTMLDivElement>(null);
  const zoneName = useRef<HTMLSpanElement>(null);
  const waveText = useRef<HTMLSpanElement>(null);
  const threatRef = useRef<HTMLSpanElement>(null);
  const foesText = useRef<HTMLSpanElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const bossWrap = useRef<HTMLDivElement>(null);
  const bossFill = useRef<HTMLDivElement>(null);
  const bossName = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const goldRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const comboWrap = useRef<HTMLDivElement>(null);
  const comboText = useRef<HTMLSpanElement>(null);
  const hurtRef = useRef<HTMLDivElement>(null);
  const lowHpRef = useRef<HTMLDivElement>(null);
  const abOv = useRef<HTMLDivElement>(null);
  const dashOv = useRef<HTMLDivElement>(null);
  const legOv = useRef<HTMLDivElement>(null);
  const abCd = useRef<HTMLSpanElement>(null);
  const dashCd = useRef<HTMLSpanElement>(null);
  const legCd = useRef<HTMLSpanElement>(null);
  const legName = useRef<HTMLSpanElement>(null);
  const legActive = useRef<HTMLDivElement>(null);
  const abName = useRef<HTMLSpanElement>(null);
  const feedRows = useRef<(HTMLDivElement | null)[]>([]);
  const lastAnnounce = useRef(0);
  const lastFeed = useRef('');

  // how many feed lines fit on this screen (read inside the rAF-driven update)
  const feedCount = useRef(5);
  feedCount.current = tiny ? 2 : compact ? 3 : 5;

  useEffect(() => {
    const update = (d: HudData) => {
      if (emblemWrap.current) {
        emblemWrap.current.style.color = d.classColor;
        if (emblemWrap.current.dataset.cid !== d.classId) {
          emblemWrap.current.dataset.cid = d.classId;
          for (const child of Array.from(emblemWrap.current.children)) {
            (child as HTMLElement).style.display =
              (child as HTMLElement).dataset.emb === d.classId ? 'flex' : 'none';
          }
        }
      }
      if (nameRef.current) nameRef.current.textContent = d.playerName;
      if (classRef.current) classRef.current.textContent = d.className;
      if (lvRef.current) lvRef.current.textContent = `Lv ${d.level}`;
      if (hpFill.current) hpFill.current.style.width = `${(d.hp / d.maxHp) * 100}%`;
      if (hpText.current) hpText.current.textContent = `${d.hp} / ${d.maxHp}`;
      if (xpFill.current) xpFill.current.style.width = `${(d.xp / d.xpNext) * 100}%`;
      if (buffRef.current) {
        buffRef.current.style.display = d.buffT > 0 ? 'flex' : 'none';
        if (d.buffT > 0) buffRef.current.textContent = `☀ EMPOWERED ${Math.ceil(d.buffT)}s`;
      }
      if (zoneName.current) {
        zoneName.current.textContent = d.zoneName;
        zoneName.current.style.color = d.zoneColor;
      }
      if (waveText.current) waveText.current.textContent = `WAVE ${d.wave}`;
      if (threatRef.current) threatRef.current.textContent = d.threat;
      if (foesText.current)
        foesText.current.textContent = d.foesLeft > 0 ? `${d.foesLeft} FOES LEFT` : 'WAVE CLEAR';
      if (announceRef.current && d.announceId !== lastAnnounce.current) {
        lastAnnounce.current = d.announceId;
        announceRef.current.textContent = d.announce;
        announceRef.current.classList.remove('anim-banner');
        void announceRef.current.offsetWidth;
        announceRef.current.classList.add('anim-banner');
      }
      if (bossWrap.current) bossWrap.current.style.display = d.bossMax > 0 ? 'block' : 'none';
      if (bossFill.current && d.bossMax > 0) bossFill.current.style.width = `${(d.bossHp / d.bossMax) * 100}%`;
      if (bossName.current) bossName.current.textContent = d.bossName;
      if (scoreRef.current) scoreRef.current.textContent = d.score.toLocaleString();
      if (goldRef.current) goldRef.current.textContent = d.gold.toLocaleString();
      if (timeRef.current) timeRef.current.textContent = d.timeStr;
      if (comboWrap.current) comboWrap.current.style.display = d.combo >= 2 ? 'flex' : 'none';
      if (comboText.current) comboText.current.textContent = `×${d.combo}`;
      if (hurtRef.current) hurtRef.current.style.opacity = `${d.hurt * 0.5}`;
      if (lowHpRef.current) lowHpRef.current.style.display = d.lowHp ? 'block' : 'none';
      setFrac(abOv.current, d.abilityCd / d.abilityCdMax);
      setFrac(dashOv.current, d.dashCd / d.dashCdMax);
      setFrac(legOv.current, d.legacyCd / d.legacyCdMax);
      if (abCd.current) {
        abCd.current.textContent = cooldownText(d.abilityCd);
        abCd.current.dataset.ready = d.abilityCd <= 0 ? '1' : '0';
      }
      if (dashCd.current) {
        dashCd.current.textContent = cooldownText(d.dashCd);
        dashCd.current.dataset.ready = d.dashCd <= 0 ? '1' : '0';
      }
      if (legCd.current) {
        legCd.current.textContent = cooldownText(d.legacyCd);
        legCd.current.dataset.ready = d.legacyCd <= 0 ? '1' : '0';
      }
      if (legName.current) legName.current.textContent = d.legacyName;
      if (abName.current) abName.current.textContent = d.abilityName;
      if (legActive.current) {
        legActive.current.style.display = d.legacyActive ? 'block' : 'none';
        legActive.current.textContent = d.legacyActive;
      }

      const rows = feedCount.current;
      const feedKey = `${rows}:${d.feed.map((f) => f.id).join(',')}`;
      if (feedKey !== lastFeed.current) {
        lastFeed.current = feedKey;
        for (let i = 0; i < 5; i++) {
          const row = feedRows.current[i];
          if (!row) continue;
          if (i >= rows) {
            row.style.display = 'none';
            continue;
          }
          const msg = d.feed[d.feed.length - rows + i];
          if (msg && d.feed.length - rows + i >= 0) {
            row.style.display = 'block';
            row.style.color = msg.color;
            row.textContent = msg.text;
            row.style.opacity = `${0.45 + (i / Math.max(1, rows - 1)) * 0.55}`;
          } else {
            row.style.display = 'none';
          }
        }
      }
    };
    bus.listeners.add(update);
    return () => {
      bus.listeners.delete(update);
    };
  }, [bus]);

  const emblemBox = compact ? 'w-7 h-7' : 'w-9 h-9';
  const emblemSize = compact ? 20 : 26;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none">
      {/* hurt + low hp vignettes */}
      <div
        ref={hurtRef}
        className="absolute inset-0"
        style={{ opacity: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(200,30,30,0.55) 100%)' }}
      />
      <div
        ref={lowHpRef}
        className="absolute inset-0 anim-low-hp"
        style={{ display: 'none', boxShadow: 'inset 0 0 120px 30px rgba(190,30,30,0.5)' }}
      />

      {/* top row */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-start justify-between gap-1 sm:gap-2 px-1 sm:px-3 ${isTouch ? 'h-[140px]' : ''}`}
        style={{ paddingTop: 'calc(4px + env(safe-area-inset-top))' }}
      >
        {/* player frame */}
        <div
          className="panel-gold clip-notch shrink-0 z-10"
          style={{
            width: isTouch ? 'calc(100% - 8px)' : compact ? (tiny ? 116 : 140) : 240,
            padding: isTouch ? '7px 9px' : compact ? '5px 6px' : '10px 12px',
            background: 'linear-gradient(135deg, rgba(7,16,28,0.96), rgba(11,25,38,0.94))',
            boxShadow: '0 5px 18px rgba(0,0,0,0.28), 0 0 16px rgba(70,200,220,0.08)',
            ...(isTouch ? { position: 'absolute', left: 4, top: 77 } : {}),
          }}
          data-tutorial="legend"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              ref={emblemWrap}
              data-cid="kensei"
              className={`clip-notch-sm ${emblemBox} border border-gold/50 bg-black/50 flex items-center justify-center shrink-0`}
            >
              {['kensei', 'shieldthane', 'jaguar', 'sandseer', 'tidecaller', 'riftblade', 'stormwarden', 'drakewarden'].map((cid) => (
                <span
                  key={cid}
                  data-emb={cid}
                  style={{ display: cid === 'kensei' ? 'flex' : 'none' }}
                  className="items-center justify-center"
                >
                  <ClassEmblem classId={cid} size={emblemSize} />
                </span>
              ))}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span
                  ref={nameRef}
                  className="font-display font-black text-white truncate leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                  style={{ fontSize: isTouch ? 13 : compact ? 11 : 14 }}
                />
                {(isTouch || !compact) && <span ref={classRef} className="text-[10px] text-cyan-200/90 font-bold tracking-wide truncate" />}
              </div>
              <div data-tutorial="hp" className="bar-shell clip-notch-sm relative mt-1" style={{ height: compact ? 11 : 14 }}>
                <div ref={hpFill} className="bar-fill" style={{ width: '100%', background: 'linear-gradient(180deg,#ff8f96,#e54855)' }} />
                <span
                  ref={hpText}
                  className="absolute inset-0 flex items-center justify-center font-bold text-white"
                  style={{ fontSize: compact ? 8 : 10, textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                />
              </div>
              <div data-tutorial="xp" className="bar-shell clip-notch-sm mt-1 bg-black/70 border border-cyan-300/25" style={{ height: compact ? 5 : 6 }}>
                <div ref={xpFill} className="bar-fill" style={{ width: '0%', background: 'linear-gradient(90deg,#63e6d1,#16bfc4)' }} />
              </div>
            </div>
            <span
              ref={lvRef}
              className="font-display font-black text-goldbright text-emboss shrink-0 text-right"
              style={{ fontSize: isTouch ? 15 : compact ? 11 : 15, width: isTouch ? 42 : compact ? 30 : 48 }}
            />
          </div>
          <div
            ref={buffRef}
            className="mt-1 items-center justify-center font-bold tracking-[0.15em] text-goldbright border border-gold/50 bg-gold/10 clip-notch-sm py-0.5"
            style={{ display: 'none', fontSize: compact ? 8 : 9 }}
          />
        </div>

        {/* zone / wave / announce / boss */}
        <div className="flex-1 flex flex-col items-center min-w-0 px-1">
          <div
            data-tutorial="wave"
            className="panel-gold clip-notch flex items-center justify-center gap-1 sm:gap-2 font-bold tracking-wider flex-wrap"
            style={{
              padding: compact ? '3px 6px' : '6px 15px',
              fontSize: compact ? 8.5 : 11.5,
              background: 'rgba(5,14,24,0.92)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.24)',
              ...(isTouch ? { position: 'absolute', left: 4, right: 154, top: 4, minHeight: 40 } : {}),
            }}
          >
            <span ref={zoneName} className="truncate" style={{ maxWidth: isTouch ? '34vw' : compact ? '22vw' : '38vw' }} />
            <span className="w-[1px] h-2.5 bg-iron" />
            <span ref={waveText} className="text-goldbright font-display whitespace-nowrap" />
            <span
              ref={threatRef}
              className="font-display font-black tracking-[0.08em] whitespace-nowrap px-1 py-0.2 clip-notch-sm border border-[#ff7868]/55 bg-[#601f22]/70 text-[#ffb0a2] shadow-[0_0_9px_rgba(255,90,80,0.25)]"
              style={{ fontSize: compact ? 7.5 : 10 }}
            />
            <span
              ref={foesText}
              className="font-display font-black whitespace-nowrap px-1 py-0.2 clip-notch-sm border border-verdant/45 bg-verdant/10 text-verdant"
              style={{ fontSize: compact ? 7.5 : 10 }}
            />
          </div>
          <div
            ref={announceRef}
            className="font-display font-black text-gold text-emboss tracking-[0.12em] text-center opacity-0 whitespace-nowrap"
            style={{
              fontSize: 'clamp(12px, 3.8vw, 34px)',
              marginTop: isTouch ? (vp.h < 430 ? 136 : 148) : compact ? 10 : 24,
            }}
          />
          <div ref={bossWrap} data-tutorial="boss" className="mt-1" style={{ display: 'none', width: compact ? '68vw' : 'min(440px, 66vw)' }}>
            <div className="flex justify-between font-bold tracking-wider mb-0.5 px-0.5" style={{ fontSize: compact ? 8.5 : 10 }}>
              <span ref={bossName} className="text-[#ff9a9a] truncate" />
              <span className="text-faint shrink-0">WORLD BOSS</span>
            </div>
            <div className="bar-shell clip-notch-sm" style={{ height: compact ? 7 : 10 }}>
              <div ref={bossFill} className="bar-fill" style={{ width: '100%', background: 'linear-gradient(180deg,#ff7d7d,#a92626)' }} />
            </div>
          </div>
        </div>

        {/* score frame + system controls */}
        <div data-tutorial="system-controls" className="flex items-start gap-1 shrink-0 z-10">
          <div
            className="panel-gold clip-notch text-right"
            style={{
              width: compact ? (tiny ? 92 : 110) : 176,
              padding: compact ? '5px 6px' : '10px 13px',
              background: 'linear-gradient(135deg, rgba(7,16,28,0.96), rgba(11,25,38,0.94))',
              ...(isTouch ? { position: 'absolute', right: 50, top: 4 } : {}),
            }}
          >
            <div className="font-display font-bold tracking-[0.3em] text-cyan-100/85" style={{ fontSize: compact ? 8 : 9 }}>
              SCORE
            </div>
            <div
              ref={scoreRef}
              className="font-display font-black text-goldbright text-emboss leading-none"
              style={{ fontSize: compact ? 16 : 22 }}
            >
              0
            </div>
            {/* Coins & Timer Badge: higher contrast, bold text, glowing coin icon */}
            <div
              data-tutorial="coins"
              className="flex items-center justify-end gap-2 mt-1.5 px-2 py-0.5 rounded bg-black/45 border border-gold/30 shadow-inner"
              style={{ fontSize: compact ? 11 : 13 }}
            >
              <span className="flex items-center gap-1.5 text-goldbright font-bold">
                <svg
                  width={compact ? 13 : 15}
                  height={compact ? 13 : 15}
                  viewBox="0 0 24 24"
                  fill="#ffd97a"
                  stroke="#8a6a22"
                  strokeWidth="1.5"
                  className="drop-shadow-[0_0_4px_rgba(255,217,122,0.8)]"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" fill="none" stroke="#b9892e" strokeWidth="1.5" />
                </svg>
                <span ref={goldRef} className="tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  0
                </span>
              </span>
              <span className="w-[1px] h-3 bg-gold/30" />
              <span className="flex items-center gap-1 text-parch font-bold tabular-nums">
                <svg
                  width={compact ? 11 : 12}
                  height={compact ? 11 : 12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="opacity-70"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span ref={timeRef} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  0:00
                </span>
              </span>
            </div>
            {/* Chain / Combo Badge: prominent pill with neon green/teal glow */}
            <div
              ref={comboWrap}
              className="mt-1.5 items-center justify-end gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-400/50 shadow-[0_0_12px_rgba(70,200,168,0.35)]"
              style={{ display: 'none' }}
            >
              <span
                className="font-display font-extrabold tracking-[0.22em] text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                style={{ fontSize: compact ? 9 : 10 }}
              >
                CHAIN
              </span>
              <span
                ref={comboText}
                className="font-display font-black text-emerald-300 drop-shadow-[0_0_8px_rgba(70,200,168,0.9)] leading-none tabular-nums"
                style={{ fontSize: compact ? 15 : 18 }}
              />
            </div>
          </div>

          {/* dedicated system cluster: PAUSE is always visible and thumb-sized */}
          <div className="flex flex-col items-center gap-1 pointer-events-auto" style={isTouch ? { position: 'absolute', right: 4, top: 4 } : undefined}>
            <button
              onClick={onPause}
              aria-label="Pause game"
              title="Pause (Esc)"
              className="panel-gold clip-notch-sm flex items-center justify-center text-goldbright transition-transform duration-100 active:scale-90 hover:border-gold"
              style={{ width: compact ? 36 : 48, height: compact ? 36 : 48 }}
            >
              <svg width={compact ? 15 : 20} height={compact ? 15 : 20} viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4.2" height="16" rx="1.2" />
                <rect x="13.8" y="4" width="4.2" height="16" rx="1.2" />
              </svg>
            </button>
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              title="Settings"
              className="panel clip-notch-sm flex items-center justify-center text-parch/80 transition-transform duration-100 active:scale-90 hover:text-goldbright group"
              style={{ width: compact ? 36 : 48, height: compact ? 26 : 32 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="transition-transform duration-500 group-hover:rotate-90">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.04a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03Z" />
              </svg>
            </button>
            {!isTouch && !compact && (
              <span className="kbd" style={{ opacity: 0.8 }}>
                ESC
              </span>
            )}
          </div>
        </div>
      </div>

      {/* bottom row */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-1.5 sm:px-3 gap-2"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
      >
        {/* event feed — shrinks out of the way of touch controls */}
        <div
          className="flex flex-col gap-[5px] min-w-0 panel-gold clip-notch px-2.5 py-2.5"
          style={{
            width: isTouch ? 'min(64vw, 340px)' : 'min(400px, 46vw)',
            marginBottom: isTouch ? 'calc(16px + env(safe-area-inset-bottom))' : 0,
            background: 'rgba(4,10,18,0.9)',
            borderColor: isTouch ? 'rgba(82,164,190,0.38)' : 'rgba(226,180,92,0.38)',
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              ref={(el) => {
                feedRows.current[i] = el;
              }}
              className="font-bold truncate text-parch"
              style={{ display: 'none', fontSize: compact ? 10 : 12, lineHeight: 1.45, textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
            />
          ))}
        </div>

        {/* desktop skill bar */}
        {!isTouch && (
          <div data-tutorial="controls" className="flex flex-col items-end gap-1.5 shrink-0">
            <div ref={legActive} className="font-display text-[10px] tracking-[0.2em] text-goldbright text-emboss px-2 py-1 panel-gold clip-notch-sm" style={{ display: 'none' }} />
            <div data-tutorial="skills" className="flex items-end gap-3 panel-gold clip-notch px-3.5 py-3 bg-[rgba(5,14,24,0.94)]">
              <div className="flex flex-col items-center gap-1">
                <div className="relative panel-gold clip-notch-sm flex items-center justify-center overflow-hidden" style={{ width: 66, height: 66, boxShadow: '0 0 14px rgba(215,173,255,0.25)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d7adff" strokeWidth="2" strokeLinejoin="round">
                    <path d="M12 2 20 12 12 22 4 12Z" />
                    <path d="M12 7 15.5 12 12 17 8.5 12Z" fill="#d7adff" opacity="0.6" />
                  </svg>
                  <div ref={legOv} className="absolute inset-0 z-10" style={{ background: 'transparent' }} />
                  <span className="absolute left-1 top-1 z-30 min-w-6 h-5 px-1 flex items-center justify-center rounded-sm border border-goldbright/70 bg-parch text-abyss font-black text-[11px] leading-none shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Q</span>
                  <span ref={legCd} className="skill-cooldown absolute inset-x-0 bottom-1.5 z-30 text-center font-display font-black text-white text-[12px] tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,1)]" />
                </div>
                <span ref={legName} className="text-[10px] font-bold tracking-wider text-white max-w-[82px] truncate" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="relative panel-gold clip-notch-sm flex items-center justify-center overflow-hidden" style={{ width: 66, height: 66, boxShadow: '0 0 14px rgba(255,217,122,0.25)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffd97a" strokeWidth="2">
                    <path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 15.8 L6.5 20 L8.5 13 L3 9 L10 9 Z" strokeLinejoin="round" />
                  </svg>
                  <div ref={abOv} className="absolute inset-0 z-10" style={{ background: 'transparent' }} />
                  <span className="absolute left-1 top-1 z-30 min-w-6 h-5 px-1 flex items-center justify-center rounded-sm border border-goldbright/70 bg-parch text-abyss font-black text-[11px] leading-none shadow-[0_1px_4px_rgba(0,0,0,0.8)]">E</span>
                  <span ref={abCd} className="skill-cooldown absolute inset-x-0 bottom-1.5 z-30 text-center font-display font-black text-white text-[12px] tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,1)]" />
                </div>
                <span ref={abName} className="text-[10px] font-bold tracking-wider text-white max-w-[82px] truncate" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="relative panel-gold clip-notch-sm flex items-center justify-center overflow-hidden" style={{ width: 72, height: 66 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8ce0e8" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M3 12 H14 M10 6 L17 12 L10 18" />
                    <path d="M17 6 H21 M18 18 H21" opacity="0.6" />
                  </svg>
                  <div ref={dashOv} className="absolute inset-0 z-10" style={{ background: 'transparent' }} />
                  <span className="absolute left-1 top-1 z-30 h-5 px-1.5 flex items-center justify-center rounded-sm border border-[#8ce0e8]/80 bg-[#d8f7fa] text-[#102027] font-black text-[9px] leading-none shadow-[0_1px_4px_rgba(0,0,0,0.8)]">SHIFT</span>
                  <span ref={dashCd} className="skill-cooldown absolute inset-x-0 bottom-1.5 z-30 text-center font-display font-black text-white text-[12px] tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,1)]" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-white">Dash</span>
              </div>
            </div>
            {!compact && (
              <div className="flex items-center gap-1.5 text-[10px] text-faint font-bold">
                <span className="kbd">WASD</span> move · <span className="kbd">SPACE</span> attack · <span className="kbd">ESC</span> pause
              </div>
            )}
          </div>
        )}
        {isTouch && (
          <div ref={legActive} className="absolute left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.2em] text-goldbright text-emboss px-2 py-1 panel-gold clip-notch-sm whitespace-nowrap" style={{ display: 'none', bottom: 'calc(150px + env(safe-area-inset-bottom))' }} />
        )}
      </div>
    </div>
  );
}
