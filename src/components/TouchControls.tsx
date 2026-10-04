import { useEffect, useRef } from 'react';
import type { Game, HudBus, HudData } from '../game/engine';
import { useViewport } from '../hooks/useViewport';

interface Props {
  gameRef: { current: Game | null };
  bus: HudBus;
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
  if (seconds <= 0) return '';
  return seconds >= 10 ? `${Math.ceil(seconds)}s` : `${seconds.toFixed(1)}s`;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export function TouchControls({ gameRef, bus }: Props) {
  const vp = useViewport();
  const shortSide = Math.min(vp.w, vp.h);

  // Ergonomic sizing tailored to mobile thumb reach
  const attackSize = Math.round(clamp(shortSide * 0.22, 80, 110));
  const actionSize = Math.round(clamp(shortSide * 0.13, 50, 68));
  const joyRadius = Math.round(clamp(shortSide * 0.11, 40, 58));

  // Radial placement: distance from center of attack button to center of skill satellite buttons
  const orbitRadius = attackSize * 0.5 + actionSize * 0.5 + 10;

  // Angles (in radians) placing the 3 satellite buttons in a sweeping arc wrapping around the top-left of the attack button:
  // - Dash: bottom-left (approx 195° or ~3.4 rad)
  // - Signature (E): mid-left / upper-left (approx 145° or ~2.53 rad)
  // - Legacy (Q): top-left / straight-top (approx 95° or ~1.66 rad)
  const angleDash = (200 * Math.PI) / 180;
  const angleSig = (145 * Math.PI) / 180;
  const angleLeg = (90 * Math.PI) / 180;

  const edgeX = vp.landscape ? 24 : 14;
  const edgeY = vp.landscape ? 16 : 22;

  const zoneRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const abOv = useRef<HTMLDivElement>(null);
  const dashOv = useRef<HTMLDivElement>(null);
  const legOv = useRef<HTMLDivElement>(null);
  const abCd = useRef<HTMLSpanElement>(null);
  const dashCd = useRef<HTMLSpanElement>(null);
  const legCd = useRef<HTMLSpanElement>(null);
  const attackRef = useRef<HTMLButtonElement>(null);
  const active = useRef<{ id: number; ox: number; oy: number } | null>(null);
  const radiusRef = useRef(joyRadius);
  radiusRef.current = joyRadius;

  useEffect(() => {
    const update = (d: HudData) => {
      setFrac(abOv.current, d.abilityCd / d.abilityCdMax);
      setFrac(dashOv.current, d.dashCd / d.dashCdMax);
      setFrac(legOv.current, d.legacyCd / d.legacyCdMax);
      if (abCd.current) abCd.current.textContent = cooldownText(d.abilityCd);
      if (dashCd.current) dashCd.current.textContent = cooldownText(d.dashCd);
      if (legCd.current) legCd.current.textContent = cooldownText(d.legacyCd);
      if (attackRef.current) {
        attackRef.current.style.boxShadow =
          d.buffT > 0 ? '0 0 28px 8px rgba(255,217,122,0.65), 0 2px 0 #7c5f1e' : '';
      }
    };
    bus.listeners.add(update);
    return () => {
      bus.listeners.delete(update);
    };
  }, [bus]);

  const joyPos = (e: React.PointerEvent) => {
    const zone = zoneRef.current;
    if (!zone) return { cx: 0, cy: 0 };
    const r = zone.getBoundingClientRect();
    return { cx: e.clientX - r.left, cy: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { cx, cy } = joyPos(e);
    active.current = { id: e.pointerId, ox: cx, oy: cy };
    const base = baseRef.current;
    if (base) {
      base.style.left = `${cx - radiusRef.current}px`;
      base.style.top = `${cy - radiusRef.current}px`;
      base.style.opacity = '1';
    }
    gameRef.current?.setMove(0, 0);
  };

  const onMove = (e: React.PointerEvent) => {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    const { cx, cy } = joyPos(e);
    let dx = cx - a.ox;
    let dy = cy - a.oy;
    const len = Math.hypot(dx, dy);
    const maxR = radiusRef.current;
    if (len > maxR) {
      dx = (dx / len) * maxR;
      dy = (dy / len) * maxR;
    }
    if (thumbRef.current) thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    if (len < 7) gameRef.current?.setMove(0, 0);
    else gameRef.current?.setMove(dx / maxR, dy / maxR);
  };

  const endJoy = (e: React.PointerEvent) => {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    active.current = null;
    if (baseRef.current) baseRef.current.style.opacity = '0';
    if (thumbRef.current) thumbRef.current.style.transform = 'translate(0,0)';
    gameRef.current?.clearMove();
  };

  const btn =
    'relative rounded-full flex items-center justify-center touchbtn pointer-events-auto border transition-transform duration-75 active:scale-90';

  // Satellite positions relative to the attack button center
  const getOrbitalOffset = (angleRad: number) => {
    return {
      x: Math.cos(angleRad) * orbitRadius,
      y: -Math.sin(angleRad) * orbitRadius,
    };
  };

  const posLeg = getOrbitalOffset(angleLeg);
  const posSig = getOrbitalOffset(angleSig);
  const posDash = getOrbitalOffset(angleDash);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* joystick zone (left half, clear of the top HUD) */}
      <div
        ref={zoneRef}
        data-tutorial="move"
        className="absolute left-0 bottom-0 pointer-events-auto touchbtn"
        style={{ width: '50%', height: vp.landscape ? '78%' : '62%' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endJoy}
        onPointerCancel={endJoy}
      >
        <div
          ref={baseRef}
          className="absolute rounded-full border-2 border-gold/40 bg-white/5 opacity-0 pointer-events-none"
          style={{ width: joyRadius * 2, height: joyRadius * 2, transition: 'opacity 120ms ease' }}
        >
          <div className="absolute inset-0 rounded-full border border-gold/15 scale-75" />
          <div
            ref={thumbRef}
            className="absolute rounded-full bg-gold/45 border-2 border-goldbright pointer-events-none"
            style={{
              width: joyRadius * 0.86,
              height: joyRadius * 0.86,
              left: '50%',
              top: '50%',
              marginLeft: -joyRadius * 0.43,
              marginTop: -joyRadius * 0.43,
              boxShadow: '0 0 14px rgba(226,180,92,0.5)',
            }}
          />
        </div>
      </div>

      {/* Action Cluster: Orbital Radial Arc wrapping around the Attack Button */}
      <div
        className="absolute pointer-events-auto"
        style={{
          right: `calc(${edgeX}px + env(safe-area-inset-right))`,
          bottom: `calc(${edgeY}px + env(safe-area-inset-bottom))`,
          width: attackSize,
          height: attackSize,
        }}
      >
        {/* Main Attack button at center anchor */}
        <button
          ref={attackRef}
          data-tutorial="attack"
          className={`${btn} btn-gold absolute inset-0 z-10`}
          style={{
            width: attackSize,
            height: attackSize,
            boxShadow: '0 4px 18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            gameRef.current?.unlockAudio();
            gameRef.current?.touchAttack(true);
          }}
          onPointerUp={() => gameRef.current?.touchAttack(false)}
          onPointerCancel={() => gameRef.current?.touchAttack(false)}
          onPointerLeave={() => gameRef.current?.touchAttack(false)}
          aria-label="Attack"
        >
          <svg
            width={attackSize * 0.45}
            height={attackSize * 0.45}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#241a05"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M4 20 L15 9 M13 5 L19 11 M15 9 L19 5 M17.5 2.5 L21.5 6.5" strokeLinejoin="round" />
            <path d="M4 20 L7 17" strokeWidth="3.4" />
          </svg>
        </button>

        {/* 1. Legacy Ability (Q) - top satellite */}
        <div
          data-tutorial="touch-skills"
          className="absolute z-20 pointer-events-auto"
          style={{
            width: actionSize,
            height: actionSize,
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${posLeg.x}px), calc(-50% + ${posLeg.y}px))`,
          }}
        >
          <button
            className={`${btn} btn-dark w-full h-full`}
            style={{
              boxShadow: '0 3px 12px rgba(0,0,0,0.5), 0 0 16px rgba(215,173,255,0.35)',
              borderColor: 'rgba(215,173,255,0.6)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              gameRef.current?.unlockAudio();
              gameRef.current?.touchLegacy();
            }}
            aria-label="Legacy ability (Q)"
          >
            <svg
              width={actionSize * 0.42}
              height={actionSize * 0.42}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d7adff"
              strokeWidth="2.2"
              strokeLinejoin="round"
            >
              <path d="M12 2 20 12 12 22 4 12Z" />
              <path d="M12 7 15.5 12 12 17 8.5 12Z" fill="#d7adff" opacity="0.65" />
            </svg>
            <div ref={legOv} className="absolute inset-0 rounded-full" />
            <span
              ref={legCd}
              className="absolute inset-0 z-20 flex items-center justify-center font-display font-black text-white text-[11px] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pointer-events-none"
            />
          </button>
        </div>

        {/* 2. Signature Ability (E) - upper-left satellite */}
        <div
          data-tutorial="touch-skills"
          className="absolute z-20 pointer-events-auto"
          style={{
            width: actionSize,
            height: actionSize,
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${posSig.x}px), calc(-50% + ${posSig.y}px))`,
          }}
        >
          <button
            className={`${btn} btn-dark w-full h-full`}
            style={{
              boxShadow: '0 3px 12px rgba(0,0,0,0.5), 0 0 16px rgba(255,217,122,0.35)',
              borderColor: 'rgba(255,217,122,0.6)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              gameRef.current?.unlockAudio();
              gameRef.current?.touchAbility();
            }}
            aria-label="Signature ability (E)"
          >
            <svg
              width={actionSize * 0.45}
              height={actionSize * 0.45}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffd97a"
              strokeWidth="2.2"
            >
              <path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 15.8 L6.5 20 L8.5 13 L3 9 L10 9 Z" strokeLinejoin="round" />
            </svg>
            <div ref={abOv} className="absolute inset-0 rounded-full" />
            <span
              ref={abCd}
              className="absolute inset-0 z-20 flex items-center justify-center font-display font-black text-white text-[11px] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pointer-events-none"
            />
          </button>
        </div>

        {/* 3. Dash - bottom-left satellite */}
        <div
          data-tutorial="touch-skills"
          className="absolute z-20 pointer-events-auto"
          style={{
            width: actionSize,
            height: actionSize,
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${posDash.x}px), calc(-50% + ${posDash.y}px))`,
          }}
        >
          <button
            className={`${btn} btn-dark w-full h-full`}
            style={{
              boxShadow: '0 3px 12px rgba(0,0,0,0.5), 0 0 16px rgba(140,224,232,0.35)',
              borderColor: 'rgba(140,224,232,0.6)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              gameRef.current?.touchDash();
            }}
            aria-label="Dash (Shift)"
          >
            <svg
              width={actionSize * 0.45}
              height={actionSize * 0.45}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8ce0e8"
              strokeWidth="2.6"
              strokeLinecap="round"
            >
              <path d="M3 12 H14 M10 6 L17 12 L10 18" />
              <path d="M17 6 H21 M18 18 H21" opacity="0.6" />
            </svg>
            <div ref={dashOv} className="absolute inset-0 rounded-full" />
            <span
              ref={dashCd}
              className="absolute inset-0 z-20 flex items-center justify-center font-display font-black text-white text-[11px] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pointer-events-none"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
