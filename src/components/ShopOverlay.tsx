import type { CSSProperties } from 'react';
import type { ShopData } from '../game/engine';
import { RARITY_META, SHOP_EPIC_UNLOCK_WAVE, SHOP_LEGENDARY_UNLOCK_WAVE, SHOP_RARE_UNLOCK_WAVE, type ShopItemId } from '../game/data';
import { PowerIcon } from './PowerIcon';
import { RarityOdds } from './RarityOdds';

interface Props {
  data: ShopData;
  onBuy: (id: ShopItemId) => void;
  onToggleLock: (id: ShopItemId) => void;
  onOpenIndex: () => void;
  onReroll: () => void;
  onContinue: () => void;
}

function RestockPips({ left, max = 3 }: { left: number; max?: number }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={`${left} restocks left`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="reroll-pip" data-on={i < left ? '1' : '0'} />
      ))}
    </span>
  );
}

const EMBERS = [
  { left: '8%', size: 5, dur: '7s', delay: '0s', color: '#ffd97a' },
  { left: '18%', size: 4, dur: '9s', delay: '1.2s', color: '#ff9d3c' },
  { left: '32%', size: 3, dur: '6s', delay: '2s', color: '#ffe9a8' },
  { left: '68%', size: 4, dur: '8s', delay: '0.6s', color: '#7ddb6f' },
  { left: '82%', size: 5, dur: '7.5s', delay: '1.8s', color: '#ffd97a' },
  { left: '92%', size: 3, dur: '9.5s', delay: '0.3s', color: '#d7adff' },
];

export function ShopOverlay({ data, onBuy, onToggleLock, onOpenIndex, onReroll, onContinue }: Props) {
  const lockedCount = data.items.filter((s) => s.locked && !s.sold).length;

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto bg-abyss/80 px-3 py-4">
      <div data-tutorial="marketplace" className="market-stage relative w-full max-w-6xl my-auto anim-fade-up rounded-xl border border-gold/25 shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-hidden">
        <div className="market-awning" />
        {/* floating embers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="market-ember"
              style={{
                left: e.left,
                width: e.size,
                height: e.size,
                background: e.color,
                boxShadow: `0 0 10px ${e.color}`,
                animationDuration: e.dur,
                animationDelay: e.delay,
              }}
            />
          ))}
          {/* lantern glows */}
          <div className="anim-lantern absolute -top-10 left-[8%] w-44 h-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,190,90,0.22), transparent 65%)' }} />
          <div className="anim-lantern absolute -top-10 right-[8%] w-44 h-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,190,90,0.18), transparent 65%)', animationDelay: '1.4s' }} />
        </div>

        <div className="relative p-4 sm:p-6">
          {/* header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gold/25 pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold/15 border border-gold/40 text-xl shadow-[0_0_16px_rgba(226,180,92,0.35)]">
                  🏮
                </span>
                <div>
                  <div className="font-display text-[10px] font-bold tracking-[0.45em] text-gold">WAVE {data.wave} CLEARED · BETWEEN THE REALMS</div>
                  <h2 className="font-display font-black text-[clamp(26px,5vw,44px)] leading-none text-goldbright text-emboss mt-1">
                    TRAVELING MARKET
                  </h2>
                </div>
              </div>
              <p className="text-sm text-parch/80 mt-2 max-w-xl">
                The merchant unfurls her wares by lantern-light. Spend your spoils before entering{' '}
                <span className="font-bold" style={{ color: data.nextZoneColor }}>{data.nextZoneName}</span>.
                {lockedCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-goldbright bg-gold/10 border border-gold/40 rounded px-2 py-0.5 align-middle">
                    🔒 {lockedCount} HELD
                  </span>
                )}
              </p>
            </div>
            <div className="panel-gold clip-notch shrink-0 px-5 py-3 text-right relative overflow-hidden min-w-[150px]">
              <div className="purse-shine" />
              <div className="font-display text-[9px] tracking-[0.3em] text-faint">YOUR PURSE</div>
              <div className="font-display font-black text-3xl text-goldbright flex items-center gap-2 justify-end tabular-nums">
                <svg width="20" height="20" viewBox="0 0 24 24" className="drop-shadow-[0_0_6px_rgba(255,210,74,0.8)]">
                  <circle cx="12" cy="12" r="9" fill="#ffd24a" stroke="#a87b1e" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="#a87b1e" strokeWidth="1.6" />
                </svg>
                {data.gold}
                <span className="text-xs text-faint font-body font-bold">G</span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2.5">
            <RarityOdds
              odds={data.rarityOdds}
              lockedLabels={{ rare: `WAVE ${SHOP_RARE_UNLOCK_WAVE}`, epic: `WAVE ${SHOP_EPIC_UNLOCK_WAVE}`, legendary: `WAVE ${SHOP_LEGENDARY_UNLOCK_WAVE}` }}
              hint={`Rations always stocked · Rare unlocks Wave ${SHOP_RARE_UNLOCK_WAVE} · Epic at Wave ${SHOP_EPIC_UNLOCK_WAVE} · Legendary at Wave ${SHOP_LEGENDARY_UNLOCK_WAVE}`}
            />
          </div>

          {/* goods */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
            {data.items.map(({ item, sold, locked }, index) => {
              const affordable = data.gold >= item.cost;
              const rarityColor = RARITY_META[item.rarity].color;
              return (
                <div
                  key={item.id}
                  className="choice-card shop-offer clip-notch panel p-4 text-left flex flex-col min-h-[236px] relative anim-card-in"
                  data-rarity={item.rarity}
                  data-sold={sold ? '1' : '0'}
                  data-locked={locked ? '1' : '0'}
                  style={{
                    '--offer': item.color,
                    '--rarity-color': rarityColor,
                    animationDelay: `${index * 70}ms`,
                    boxShadow: locked
                      ? '0 0 18px rgba(255, 217, 122, 0.4), 0 12px 28px rgba(0,0,0,0.5)'
                      : undefined,
                    borderColor: locked ? '#ffd97a' : undefined,
                  } as CSSProperties}
                >
                  {sold && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 pointer-events-none rounded-[inherit]">
                      <span className="font-display font-black text-lg tracking-[0.3em] text-parch/60 -rotate-12 border-2 border-parch/30 px-4 py-1 rounded bg-black/40">
                        SOLD
                      </span>
                    </div>
                  )}
                  {locked && !sold && (
                    <div className="absolute top-0 right-0 z-10 font-display text-[9px] font-black tracking-[0.2em] bg-gradient-to-r from-[#8a6a22] to-[#dca944] text-[#241a05] px-2.5 py-1 rounded-bl-lg shadow">
                      🔒 HELD OVER
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className="choice-gem shrink-0"
                      style={{
                        ['--rarity-color' as string]: item.color,
                        width: 52,
                        height: 52,
                        boxShadow: `0 0 18px ${item.color}44, inset 0 1px 0 rgba(255,255,255,0.12)`,
                      }}
                    >
                      <PowerIcon icon={item.icon} size={28} />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!sold && (
                        <button
                          type="button"
                          onClick={() => onToggleLock(item.id)}
                          title={locked ? 'Locked: held across restocks and future markets. Click to unlock.' : 'Lock to hold this item for future markets'}
                          aria-pressed={locked}
                          className={`clip-notch-sm px-2.5 py-1.5 text-[10px] font-display font-bold tracking-wider border transition-all active:scale-95 flex items-center gap-1 min-h-[32px] ${
                            locked
                              ? 'bg-gold/25 border-goldbright text-goldbright shadow-[0_0_10px_rgba(255,217,122,0.65)]'
                              : 'bg-black/40 border-iron text-faint hover:text-parch hover:border-gold/50'
                          }`}
                        >
                          {locked ? '🔒 HELD' : '🔓 HOLD'}
                        </button>
                      )}
                      <span className="kbd">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-3">
                    <div className="font-display text-[9px] font-bold tracking-[0.25em]" style={{ color: item.color }}>{item.kicker}</div>
                    <span className="rarity-pill" style={{ ['--rarity-color' as string]: rarityColor }}>
                      {RARITY_META[item.rarity].label}
                    </span>
                  </div>
                  <div className="font-display font-bold text-[19px] leading-tight text-parch mt-1">{item.name}</div>
                  <p className="text-[13px] leading-snug text-faint mt-1.5">{item.desc}</p>
                  <div className="mt-auto pt-3">
                    {sold ? (
                      <div className="font-display font-black text-sm tracking-[0.16em] text-parch/45">SOLD OUT</div>
                    ) : (
                      <button
                        type="button"
                        disabled={!affordable}
                        onClick={() => onBuy(item.id)}
                        className="w-full btn-gold clip-notch-sm py-2.5 px-3 text-[13px] font-black tracking-wider flex items-center justify-between disabled:opacity-45 disabled:cursor-not-allowed disabled:saturate-50 min-h-[42px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" fill="#241a05" stroke="#7c5f1e" strokeWidth="2" />
                            <circle cx="12" cy="12" r="4" fill="none" stroke="#7c5f1e" strokeWidth="1.6" />
                          </svg>
                          {affordable ? 'BUY NOW' : 'NEED GOLD'}
                        </span>
                        <span className="tabular-nums">{item.cost} G</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* footer */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mt-5 rounded-xl border border-gold/20 bg-black/35 px-4 py-3">
            <p className="text-[11.5px] text-faint text-center lg:text-left leading-relaxed">
              Each offering can be bought once · tap <b className="text-goldbright">🔓 HOLD</b> to carry an item into future markets.<br className="hidden sm:block" />
              Market restocks are separate from power rerolls · bosses restore all 3.
            </p>
            <div className="flex gap-2 flex-wrap justify-center shrink-0">
              <button onClick={onOpenIndex} className="btn-dark clip-notch px-4 py-3 shrink-0 text-xs font-bold min-h-[48px]">📚 CATALOG</button>
              <button
                onClick={onReroll}
                disabled={data.shopRerollsLeft <= 0}
                title="Restock unsold offers (R). Boss kills restore market rerolls to 3."
                className="btn-dark clip-notch px-4 py-3 shrink-0 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 min-h-[48px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6" />
                </svg>
                RESTOCK
                <RestockPips left={data.shopRerollsLeft} />
              </button>
              <button
                onClick={onContinue}
                className="btn-gold clip-notch px-7 py-3 shrink-0 text-sm font-black flex items-center gap-2 min-h-[48px] shadow-[0_0_24px_rgba(226,180,92,0.35)]"
              >
                FACE WAVE {data.wave + 1}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
