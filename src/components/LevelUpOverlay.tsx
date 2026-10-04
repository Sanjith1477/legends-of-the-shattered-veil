import type { CSSProperties } from 'react';
import type { LevelUpData } from '../game/engine';
import { EPIC_UNLOCK_LEVEL, LEGENDARY_UNLOCK_LEVEL, RARE_UNLOCK_LEVEL, RARITY_META, type PowerId } from '../game/data';
import { PowerIcon } from './PowerIcon';
import { RarityOdds } from './RarityOdds';

interface Props {
  data: LevelUpData;
  onChoose: (id: PowerId) => void;
  onOpenIndex: () => void;
  onReroll: () => void;
}

function RerollPips({ left, max = 3 }: { left: number; max?: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="reroll-pip" data-on={i < left ? '1' : '0'} />
      ))}
    </span>
  );
}

export function LevelUpOverlay({ data, onChoose, onOpenIndex, onReroll }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-abyss/75 px-3 py-5">
      {/* soft radial glow behind the cards */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(226,180,92,0.10), transparent 60%)' }} />
      <div className="relative w-full max-w-4xl text-center anim-fade-up my-auto">
        <div className="flex items-center justify-center gap-3">
          <span className="hidden sm:block h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
          <div className="font-display text-[10px] font-bold tracking-[0.5em] text-gold">AETHER AWAKENS</div>
          <span className="hidden sm:block h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
        <h2 className="font-display font-black text-[clamp(30px,6vw,54px)] leading-none text-goldbright text-emboss mt-1">
          LEVEL {data.level}
        </h2>
        <p className="text-sm text-parch/80 mt-2">Choose one lasting power before the next blade falls.</p>

        <div className="mt-3">
          <RarityOdds
            odds={data.rarityOdds}
            lockedLabels={{ rare: `LV ${RARE_UNLOCK_LEVEL}`, epic: `LV ${EPIC_UNLOCK_LEVEL}`, legendary: `LV ${LEGENDARY_UNLOCK_LEVEL}` }}
            hint={`Odds improve every level · Rare unlocks at Lv ${RARE_UNLOCK_LEVEL} · Epic at Lv ${EPIC_UNLOCK_LEVEL} · Legendary at Lv ${LEGENDARY_UNLOCK_LEVEL}`}
          />
        </div>

        <div data-tutorial="level-up" className="grid sm:grid-cols-3 gap-3 sm:gap-4 mt-5 text-left">
          {data.choices.map((power, index) => {
            const rarityColor = RARITY_META[power.rarity].color;
            return (
              <button
                key={power.id}
                onClick={() => onChoose(power.id)}
                className="choice-card power-choice clip-notch panel p-4 min-h-[210px] flex flex-col items-start group text-left"
                data-rarity={power.rarity}
                style={{ '--power': rarityColor, '--rarity-color': rarityColor } as CSSProperties}
              >
                <div className="flex w-full items-start justify-between">
                  <span className="choice-gem" style={{ ['--rarity-color' as string]: rarityColor }}>
                    <PowerIcon icon={power.icon} size={30} />
                  </span>
                  <span className="kbd group-hover:border-gold/70">{index + 1}</span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full mt-3">
                  <div className="font-display text-[10px] font-bold tracking-[0.28em]" style={{ color: power.color }}>{power.kicker}</div>
                  <span className="rarity-pill" style={{ ['--rarity-color' as string]: rarityColor }}>
                    {RARITY_META[power.rarity].label}
                  </span>
                </div>
                <div className="font-display font-bold text-xl text-parch mt-1.5 leading-tight">{power.name}</div>
                <p className="text-[13px] leading-snug text-parch/90 mt-1.5">{power.desc}</p>
                <div className="mt-2.5 p-2 rounded bg-black/40 border border-white/5 w-full">
                  <div className="font-display text-[8.5px] tracking-[0.2em] text-goldbright/80">GAMEPLAY EVOLUTION</div>
                  <div className="text-[11px] leading-tight text-parch/70 mt-0.5">{power.stacks}</div>
                </div>
                <div className="mt-auto pt-3 w-full flex items-center justify-between">
                  <span className="font-display text-[10px] tracking-[0.22em] text-parch/55 group-hover:text-goldbright transition-colors">ATTUNE POWER</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-parch/40 group-hover:text-goldbright group-hover:translate-x-1 transition-all">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button onClick={onOpenIndex} className="btn-dark clip-notch-sm px-3 py-2 text-[10px] font-bold order-3 sm:order-1">
            📚 POWER INDEX
          </button>
          <span className="text-[10px] font-bold tracking-[0.2em] text-faint order-1 sm:order-2">PRESS 1 · 2 · 3 TO CHOOSE</span>
          <button
            onClick={onReroll}
            disabled={data.rerollsLeft <= 0}
            title="Reroll all three power offers (R). Boss kills restore power rerolls to 3."
            className="btn-dark clip-notch-sm px-4 py-2 text-[10px] font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 order-2 sm:order-3"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6" />
            </svg>
            REROLL
            <RerollPips left={data.rerollsLeft} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-faint">Power rerolls are separate from market restocks · both reset to 3 after a boss kill</p>
      </div>
    </div>
  );
}
