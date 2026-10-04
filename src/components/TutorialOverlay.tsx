import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { GameState } from '../game/engine';

interface TutorialEvent {
  id: number;
  type: 'level-up-opened' | 'skill-selected' | 'market-opened' | 'market-purchased' | 'market-continued';
}

interface Props {
  isTouch: boolean;
  screen: GameState;
  event: TutorialEvent | null;
  onClose: () => void;
  onContinue: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Step {
  title: string;
  target: string;
  body: (isTouch: boolean) => string;
}

const STEPS: Step[] = [
  { title: 'Your Legend', target: 'legend', body: () => 'Your selected Legend shapes your playstyle. Your name and level are shown here.' },
  { title: 'Health', target: 'hp', body: () => 'This is your HP. If it reaches 0, your run ends.' },
  { title: 'Experience', target: 'xp', body: () => 'Defeat enemies to gain XP. Fill this bar to level up and choose a new power.' },
  { title: 'Waves', target: 'wave', body: () => 'This shows the current wave. Bosses arrive on specific waves; their health bar appears during the fight.' },
  {
    title: 'Move',
    target: 'move',
    body: (isTouch) => isTouch ? 'Drag on the left side of the screen to move.' : 'Move with WASD or the arrow keys.',
  },
  {
    title: 'Attack',
    target: 'attack',
    body: (isTouch) => isTouch
      ? 'Hold the large attack button to strike. Your weapon aims automatically.'
      : 'Hold Space or left-click to attack. Your weapon aims automatically.',
  },
  {
    title: 'Abilities',
    target: 'skills',
    body: (isTouch) => isTouch
      ? 'These buttons activate your Legend abilities and dash. Cooldowns appear on each button.'
      : 'These are your active abilities and dash. Their keys and cooldowns are shown here.',
  },
  { title: 'Coins', target: 'coins', body: () => 'Earn coins during a run and spend them on upgrades in the Traveling Market.' },
  { title: 'Pause & settings', target: 'system-controls', body: () => 'Pause here, or open Settings to adjust music and sound effects.' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const overlaps = (a: Rect, b: Rect) =>
  a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;

export function TutorialOverlay({ isTouch, screen, event, onClose, onContinue }: Props) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<'steps' | 'waiting-level-up' | 'level-up' | 'waiting-market' | 'market' | 'market-continue'>('steps');
  const [marketStep, setMarketStep] = useState(0);
  const [marketPurchased, setMarketPurchased] = useState(false);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const calloutRef = useRef<HTMLElement>(null);
  const priorMode = useRef<typeof mode>('steps');
  const priorIndex = useRef(0);
  const previousEvent = useRef<number | null>(null);
  const step = STEPS[index];
  const targetSelector = mode === 'level-up'
    ? '[data-tutorial="level-up"]'
    : mode === 'market-continue'
      ? '[data-tutorial-detail="market-continue"]'
      : mode === 'market'
        ? ['[data-tutorial-detail="market-name"]', '[data-tutorial-detail="market-effect"]', '[data-tutorial-detail="market-price"]', '[data-tutorial-detail="market-buy"]', '[data-tutorial-detail="market-continue"]'][marketStep]
        : `[data-tutorial="${mode === 'steps' ? step.target : mode === 'waiting-level-up' ? 'xp' : 'wave'}"]`;

  useEffect(() => {
    if (!event || event.id === previousEvent.current) return;
    previousEvent.current = event.id;
    if (event.type === 'level-up-opened' && mode !== 'level-up') {
      priorMode.current = mode;
      priorIndex.current = index;
      setMode('level-up');
    } else if (event.type === 'skill-selected' && mode === 'level-up' && screen !== 'levelup') {
      if (priorMode.current === 'waiting-level-up') setMode('waiting-market');
      else {
        setMode(priorMode.current);
        setIndex(priorIndex.current);
      }
    } else if (event.type === 'market-opened' && mode !== 'market' && mode !== 'market-continue') {
      priorMode.current = mode;
      priorIndex.current = index;
      setMarketPurchased(false);
      setMarketStep(0);
      setMode('market');
    } else if (event.type === 'market-purchased' && mode === 'market') {
      setMarketPurchased(true);
      setMode('market-continue');
    } else if (event.type === 'market-continued' && (mode === 'market' || mode === 'market-continue')) {
      if (priorMode.current === 'waiting-market') onClose();
      else {
        setMode(priorMode.current);
        setIndex(priorIndex.current);
      }
    }
  }, [event, mode, index, screen, onClose]);

  useLayoutEffect(() => {
    const update = () => {
      const targetElements = Array.from(document.querySelectorAll<HTMLElement>(targetSelector))
        .filter((element) => getComputedStyle(element).display !== 'none')
        .filter((element) => element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0);
      if (mode === 'market-continue') {
        targetElements[0]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      const targets = targetElements
        .map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      if (!targets.length) {
        setAnchor(null);
        setPosition(null);
        return;
      }
      const left = Math.min(...targets.map((rect) => rect.left));
      const top = Math.min(...targets.map((rect) => rect.top));
      const right = Math.max(...targets.map((rect) => rect.right));
      const bottom = Math.max(...targets.map((rect) => rect.bottom));
      const targetRect = { top, left, width: right - left, height: bottom - top };
      setAnchor(targetRect);
      const contextCard = targetElements[0].closest<HTMLElement>('.choice-card');
      const cardBounds = contextCard?.getBoundingClientRect();

      const callout = calloutRef.current?.getBoundingClientRect();
      const width = Math.min(340, window.innerWidth - 24);
      const height = callout?.height || 180;
      const gap = 12;
      const candidatePositions = [
        { left: targetRect.left - width - gap, top: targetRect.top + targetRect.height / 2 - height / 2 },
        { left: targetRect.left + targetRect.width + gap, top: targetRect.top + targetRect.height / 2 - height / 2 },
        { left: targetRect.left + targetRect.width / 2 - width / 2, top: targetRect.top - height - gap },
        { left: targetRect.left + targetRect.width / 2 - width / 2, top: targetRect.top + targetRect.height + gap },
      ];
      if (cardBounds) {
        candidatePositions.push(
          { left: cardBounds.left + cardBounds.width / 2 - width / 2, top: cardBounds.top - height - gap },
          { left: cardBounds.left + cardBounds.width / 2 - width / 2, top: cardBounds.bottom + gap },
        );
      }
      const candidates = candidatePositions.map((candidate) => ({
        left: clamp(candidate.left, 12, window.innerWidth - width - 12),
        top: clamp(candidate.top, 12, window.innerHeight - height - 12),
        width,
        height,
      }));

      const blockers = Array.from(document.querySelectorAll<HTMLElement>('[data-tutorial], [data-tutorial-card], [data-tutorial-detail], button'))
        .filter((element) =>
          !calloutRef.current?.contains(element) &&
          !targetElements.includes(element) &&
          element.dataset.tutorial !== 'marketplace' &&
          getComputedStyle(element).display !== 'none'
        )
        .map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .map((rect) => ({ top: rect.top, left: rect.left, width: rect.width, height: rect.height }))
        .filter((rect) => !overlaps(rect, targetRect));
      const intersectionArea = (a: Rect, b: Rect) => {
        if (!overlaps(a, b)) return 0;
        return Math.min(a.left + a.width, b.left + b.width) *
          Math.min(a.top + a.height, b.top + b.height) -
          Math.max(a.left, b.left) * Math.max(a.top, b.top);
      };
      const scored = candidates.map((candidate) => ({
        candidate,
        overlap: intersectionArea(candidate, targetRect) * 1_000_000_000 +
          (cardBounds ? intersectionArea(candidate, {
            top: cardBounds.top,
            left: cardBounds.left,
            width: cardBounds.width,
            height: cardBounds.height,
          }) * 10_000_000 : 0) + blockers.reduce((sum, blocker) => {
          if (!overlaps(candidate, blocker)) return sum;
          return sum + intersectionArea(candidate, blocker);
        }, 0),
      })).sort((a, b) => a.overlap - b.overlap);
      setPosition({ top: scored[0].candidate.top, left: scored[0].candidate.left });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [targetSelector, screen, mode, marketStep]);

  useEffect(() => {
    const onKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.code === 'Escape') {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const next = () => {
    if (mode === 'level-up') return;
    if (mode === 'market-continue') return;
    if (mode === 'market') {
      if (marketStep < 3 && document.querySelector('[data-tutorial-detail="market-buy"]')) {
        setMarketStep((current) => current + 1);
      } else {
        setMode('market-continue');
      }
      return;
    }
    if (mode === 'waiting-level-up') return;
    if (index < STEPS.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    priorMode.current = 'waiting-level-up';
    setMode('waiting-level-up');
    onContinue();
  };

  const hasMarketItem = Boolean(document.querySelector('[data-tutorial="market-item"]'));
  const hasAffordableMarketItem = Boolean(document.querySelector('[data-tutorial-detail="market-buy"]'));
  const message = mode === 'level-up'
    ? 'Choose ONE power to strengthen your Legend. Select a card to continue.'
    : mode === 'waiting-level-up'
      ? 'Keep fighting. When Level Up appears, choose one power to strengthen your Legend.'
      : mode === 'waiting-market'
        ? 'Keep playing. When the Traveling Market opens, spend coins here on an upgrade.'
        : mode === 'market-continue'
          ? marketPurchased
            ? 'Your upgrade is ready. Click FACE WAVE to return to your run.'
            : 'No available item is affordable right now. You can return to the run with FACE WAVE.'
          : mode === 'market'
            ? marketStep === 0
            ? hasMarketItem
              ? 'Spend coins here to buy upgrades for your run. This is an item available in your Market.'
              : 'Each Market offers upgrades for your run. There are no unsold items in this Market.'
            : marketStep === 1
              ? 'This describes the effect of the selected item.'
              : marketStep === 2
                ? 'This is the item’s price. Check that your purse covers it.'
                : hasAffordableMarketItem
                  ? 'Click BUY NOW to purchase one upgrade. HOLD carries an item to future Markets.'
                  : 'No available item is affordable right now. Continue when you are ready.'
            : step.body(isTouch);
  const title = mode === 'level-up' ? 'Choose a power'
    : mode.startsWith('market') ? 'Traveling Market'
      : mode === 'waiting-level-up' ? 'Level up'
        : mode === 'waiting-market' ? 'Traveling Market'
          : step.title;
  const canAdvance = mode === 'steps' || (mode === 'market' && (
    !hasAffordableMarketItem || marketStep < 3
  ));
  const advanceLabel = mode === 'steps'
    ? index === STEPS.length - 1 ? 'CONTINUE' : 'NEXT'
    : mode === 'market' ? 'NEXT' : 'WAIT';

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none" aria-live="polite">
      {anchor && (
        <div
          className="fixed rounded-md border-2 border-goldbright pointer-events-none shadow-[0_0_0_3px_rgba(226,180,92,0.45),0_0_0_9999px_rgba(0,0,0,0.38),0_0_24px_rgba(255,217,122,0.8)]"
          style={{ top: anchor.top - 3, left: anchor.left - 3, width: anchor.width + 6, height: anchor.height + 6 }}
        />
      )}
      <section
        ref={calloutRef}
        className="fixed w-[min(340px,calc(100vw-24px))] panel-gold clip-notch p-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.85)] pointer-events-auto"
        style={position ? { top: position.top, left: position.left } : { top: 12, left: 12 }}
        aria-label={`Tutorial: ${title}`}
      >
        <h2 className="font-display font-black text-base text-goldbright text-emboss">{title}</h2>
        <p className="text-[13px] leading-relaxed text-parch/95 mt-1">{message}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          {mode === 'steps' && index > 0
            ? <button onClick={() => setIndex((current) => current - 1)} className="btn-dark clip-notch-sm px-3 py-1.5 text-[10px] font-bold">BACK</button>
            : <span />}
          <button onClick={onClose} className="btn-dark clip-notch-sm px-3 py-1.5 text-[10px] font-bold text-faint hover:text-blood">SKIP</button>
          {canAdvance && (
            <button onClick={next} className="btn-gold clip-notch-sm px-4 py-1.5 text-[10px] font-black">
              {advanceLabel}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
