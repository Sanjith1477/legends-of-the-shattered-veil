import { useEffect, useLayoutEffect, useState } from 'react';
import type { GameState } from '../game/engine';

interface Props {
  isTouch: boolean;
  screen: GameState;
  onClose: () => void;
  onContinueToMarket: () => void;
}

interface Step {
  id: string;
  title: string;
  target: string;
  body: (isTouch: boolean, screen: GameState) => string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const STEPS: Step[] = [
  {
    id: 'legend',
    title: 'Your Legend',
    target: 'legend',
    body: () => 'Your selected Legend shapes your playstyle. Your name and current level are shown here.',
  },
  {
    id: 'hp',
    title: 'Health',
    target: 'hp',
    body: () => 'This is your HP. If it reaches 0, your run ends.',
  },
  {
    id: 'xp',
    title: 'Experience',
    target: 'xp',
    body: () => 'Defeat enemies to gain XP. Fill this bar to level up and choose a new power.',
  },
  {
    id: 'wave',
    title: 'Waves',
    target: 'wave',
    body: () => 'This shows the current wave. Bosses arrive on specific waves; their health bar appears during the fight.',
  },
  {
    id: 'coins',
    title: 'Coins',
    target: 'coins',
    body: () => 'Earn coins as you play. Spend them on upgrades at the Traveling Market between cleared waves.',
  },
  {
    id: 'move',
    title: 'Move',
    target: 'move',
    body: (isTouch) => isTouch
      ? 'Drag on the left side of the screen to move. Keep moving to avoid enemy attacks.'
      : 'Move with WASD or the arrow keys. Keep moving to avoid enemy attacks.',
  },
  {
    id: 'attack',
    title: 'Attack',
    target: 'attack',
    body: (isTouch) => isTouch
      ? 'Hold the large attack button to strike. Your weapon automatically aims at nearby enemies.'
      : 'Hold Space or left-click to attack. Your weapon automatically aims at nearby enemies.',
  },
  {
    id: 'skills',
    title: 'Abilities',
    target: 'skills',
    body: (isTouch) => isTouch
      ? 'Use these buttons for your Legend ability, signature ability, and dash. Cooldowns appear on each button.'
      : 'These are your active abilities and dash. Their keys and cooldowns are shown here.',
  },
  {
    id: 'level-up',
    title: 'Level-up powers',
    target: 'level-up',
    body: (_isTouch, screen) => screen === 'levelup'
      ? 'Choose one of these powers to strengthen your build.'
      : 'When you level up, choose one of the offered powers to strengthen your build.',
  },
  {
    id: 'pause',
    title: 'Pause & settings',
    target: 'system-controls',
    body: () => 'Pause your run here, or open Settings to adjust music and sound effects.',
  },
  {
    id: 'marketplace',
    title: 'Traveling Market',
    target: 'marketplace',
    body: (_isTouch, screen) => screen === 'shop'
      ? 'Buy upgrades here to strengthen your build. Check each item’s cost and effect before purchasing.'
      : 'After a wave is cleared, the Traveling Market opens between realms. Use your coins there to buy upgrades.',
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function TutorialOverlay({ isTouch, screen, onClose, onContinueToMarket }: Props) {
  const [index, setIndex] = useState(0);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [waitingForMarket, setWaitingForMarket] = useState(false);
  const step = STEPS[index];
  const targetName = step.id === 'move' ? (isTouch ? 'move' : 'controls')
    : step.id === 'attack' ? (isTouch ? 'attack' : 'controls')
    : step.id === 'skills' ? (isTouch ? 'touch-skills' : 'skills')
    : step.id === 'level-up' && screen !== 'levelup' ? 'xp'
    : step.id === 'marketplace' && screen !== 'shop' ? 'coins'
    : step.target;

  useLayoutEffect(() => {
    const update = () => {
      const targets = Array.from(document.querySelectorAll<HTMLElement>(`[data-tutorial="${targetName}"]`))
        .filter((target) => getComputedStyle(target).display !== 'none')
        .map((target) => target.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      if (!targets.length) {
        setAnchor(null);
        return;
      }
      const left = Math.min(...targets.map((rect) => rect.left));
      const top = Math.min(...targets.map((rect) => rect.top));
      const right = Math.max(...targets.map((rect) => rect.right));
      const bottom = Math.max(...targets.map((rect) => rect.bottom));
      setAnchor({ top, left, width: right - left, height: bottom - top });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [targetName, screen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const next = () => {
    if (step.id === 'marketplace' && screen !== 'shop') {
      setWaitingForMarket(true);
      onContinueToMarket();
      return;
    }
    if (index === STEPS.length - 1) onClose();
    else setIndex((current) => current + 1);
  };
  const calloutWidth = Math.min(360, window.innerWidth - 24);
  const calloutHeight = 220;
  const calloutX = anchor
    ? clamp(anchor.left + anchor.width / 2, calloutWidth / 2 + 12, window.innerWidth - calloutWidth / 2 - 12)
    : window.innerWidth / 2;
  const calloutY = anchor
    ? clamp(
        anchor.top > window.innerHeight * 0.58 ? anchor.top - calloutHeight - 12 : anchor.top + anchor.height + 12,
        12,
        window.innerHeight - calloutHeight - 12
      )
    : Math.max(12, window.innerHeight / 2 - calloutHeight / 2);

  if (waitingForMarket && screen !== 'shop') {
    return (
      <div className="fixed inset-0 z-[58] pointer-events-none">
        <div className="fixed top-3 left-1/2 -translate-x-1/2 panel-gold clip-notch-sm px-3 py-2 flex items-center gap-3 pointer-events-auto shadow-lg">
          <span className="text-[10px] font-bold text-parch">Tutorial resumes when the Traveling Market opens.</span>
          <button onClick={onClose} className="text-[10px] font-black text-blood hover:text-[#ffaaaa]">SKIP</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[58] pointer-events-none" aria-live="polite">
      {anchor && (
        <div
          className="fixed rounded-md border-2 border-goldbright shadow-[0_0_0_3px_rgba(226,180,92,0.45),0_0_0_9999px_rgba(0,0,0,0.44),0_0_24px_rgba(255,217,122,0.8)]"
          style={{ top: anchor.top - 3, left: anchor.left - 3, width: anchor.width + 6, height: anchor.height + 6 }}
        />
      )}
      <section
        className="fixed w-[min(360px,calc(100vw-24px))] panel-gold clip-notch p-4 shadow-[0_16px_50px_rgba(0,0,0,0.7)] pointer-events-auto"
        style={{ top: calloutY, left: calloutX, transform: 'translateX(-50%)' }}
        aria-label={`Tutorial step ${index + 1}: ${step.title}`}
      >
        <div className="font-display text-[9px] tracking-[0.35em] text-gold">
          HOW TO PLAY · {index + 1}/{STEPS.length}
        </div>
        <h2 className="font-display font-black text-xl text-goldbright text-emboss mt-1">{step.title}</h2>
        <p className="text-[13px] leading-relaxed text-parch/90 mt-2">{step.body(isTouch, screen)}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0}
            className="btn-dark clip-notch-sm px-3 py-2 text-[10px] font-bold disabled:opacity-30"
          >
            BACK
          </button>
          <button onClick={onClose} className="btn-dark clip-notch-sm px-3 py-2 text-[10px] font-bold text-faint hover:text-blood">
            SKIP
          </button>
          <button onClick={next} className="btn-gold clip-notch-sm px-4 py-2 text-[10px] font-black">
            {index === STEPS.length - 1 ? (screen === 'shop' ? 'FINISH' : 'CONTINUE TO MARKET') : 'NEXT'}
          </button>
        </div>
      </section>
    </div>
  );
}
