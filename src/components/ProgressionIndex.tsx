import { useMemo, useState, type CSSProperties } from 'react';
import { CLASSES, POWERS, RARITY_META, SHOP_ITEMS, type Rarity } from '../game/data';
import type { DiscoveryState } from '../game/collection';
import { ClassEmblem } from './ClassEmblem';
import { PowerIcon } from './PowerIcon';

interface Props {
  discovery: DiscoveryState;
  initialTab?: 'powers' | 'shop';
  onClose: () => void;
}

const rarities: ('all' | Rarity)[] = ['all', 'common', 'rare', 'epic', 'legendary'];

function Recommendations({ ids }: { ids: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap mt-2">
      <span className="text-[9px] font-display tracking-[0.16em] text-faint mr-1">RECOMMENDED</span>
      {ids.map((id) => {
        const cls = CLASSES.find((c) => c.id === id);
        if (!cls) return null;
        return (
          <span key={id} title={cls.name} className="w-6 h-6 clip-notch-sm bg-black/35 border border-iron flex items-center justify-center" style={{ color: cls.color }}>
            <ClassEmblem classId={id} size={15} />
          </span>
        );
      })}
    </div>
  );
}

export function ProgressionIndex({ discovery, initialTab = 'powers', onClose }: Props) {
  const [tab, setTab] = useState<'powers' | 'shop'>(initialTab);
  const [rarity, setRarity] = useState<'all' | Rarity>('all');
  const [showUnused, setShowUnused] = useState(false);

  const entries = useMemo(() => {
    const list = tab === 'powers' ? POWERS : SHOP_ITEMS;
    return list.filter((entry) => {
      if (rarity !== 'all' && entry.rarity !== rarity) return false;
      if (!showUnused) return true;
      return tab === 'powers'
        ? !discovery.powers.includes(entry.id as (typeof discovery.powers)[number])
        : !discovery.shopItems.includes(entry.id as (typeof discovery.shopItems)[number]);
    });
  }, [tab, rarity, showUnused, discovery]);

  const usedCount = tab === 'powers' ? discovery.powers.length : discovery.shopItems.length;
  const total = tab === 'powers' ? POWERS.length : SHOP_ITEMS.length;

  return (
    <div className="absolute inset-0 z-[64] bg-abyss/94 p-3 sm:p-6 overflow-y-auto anim-overlay-enter">
      <div className="w-full max-w-6xl mx-auto anim-fade-up">
        <div className="flex items-end justify-between gap-3 border-b border-gold/30 pb-3">
          <div>
            <div className="font-display text-[10px] tracking-[0.5em] text-gold">AETHERIA ARCHIVE</div>
            <h2 className="font-display font-black text-[clamp(25px,5vw,42px)] leading-none text-goldbright text-emboss mt-1">PROGRESSION INDEX</h2>
            <p className="text-[12px] text-faint mt-1">
              Used {usedCount}/{total} {tab === 'powers' ? 'powers' : 'market items'} · dark entries have not been used in a run yet.
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 clip-notch-sm panel flex items-center justify-center text-faint hover:text-blood hover:border-blood/60 active:scale-90 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5">
            <button onClick={() => { setTab('powers'); setRarity('all'); }} className={`font-display text-[11px] tracking-[0.22em] px-4 py-2 clip-notch-sm border ${tab === 'powers' ? 'bg-gold/15 text-goldbright border-gold/55' : 'panel text-faint border-iron'}`}>
              LEVEL-UP POWERS
            </button>
            <button onClick={() => { setTab('shop'); setRarity('all'); }} className={`font-display text-[11px] tracking-[0.22em] px-4 py-2 clip-notch-sm border ${tab === 'shop' ? 'bg-gold/15 text-goldbright border-gold/55' : 'panel text-faint border-iron'}`}>
              MARKET CATALOG
            </button>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-faint select-none">
            <input type="checkbox" checked={showUnused} onChange={(e) => setShowUnused(e.target.checked)} className="accent-[#dca944]" />
            Show unused only
          </label>
        </div>

        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {rarities.map((r) => {
            const meta = r === 'all' ? null : RARITY_META[r];
            return (
              <button
                key={r}
                onClick={() => setRarity(r)}
                className="clip-notch-sm border px-2.5 py-1 font-display text-[9px] font-bold tracking-[0.2em] transition-all"
                style={{
                  color: rarity === r ? meta?.color ?? '#ffd97a' : '#8a94a8',
                  borderColor: rarity === r ? `${meta?.color ?? '#e2b45c'}88` : '#2a3448',
                  background: rarity === r ? `${meta?.color ?? '#e2b45c'}15` : 'rgba(0,0,0,.2)',
                }}
              >
                {r.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4 pb-6">
          {entries.map((entry) => {
            const used = tab === 'powers'
              ? discovery.powers.includes(entry.id as (typeof discovery.powers)[number])
              : discovery.shopItems.includes(entry.id as (typeof discovery.shopItems)[number]);
            const meta = RARITY_META[entry.rarity];
            const power = tab === 'powers' ? entry as (typeof POWERS)[number] : null;
            const shop = tab === 'shop' ? entry as (typeof SHOP_ITEMS)[number] : null;
            return (
              <article
                key={entry.id}
                className={`clip-notch panel p-3.5 relative overflow-hidden transition-all ${used ? '' : 'opacity-50 saturate-[0.35]'}`}
                style={{ '--rarity': meta.color, borderColor: `${meta.color}${used ? '66' : '30'}` } as CSSProperties}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: meta.color, opacity: used ? 1 : 0.35 }} />
                <div className="flex items-start gap-3">
                  <span className="w-12 h-12 clip-notch-sm bg-black/40 border flex items-center justify-center shrink-0" style={{ color: entry.color, borderColor: `${entry.color}66` }}>
                    <PowerIcon icon={entry.icon} size={29} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[9px] font-black tracking-[0.2em]" style={{ color: meta.color }}>{meta.label}</span>
                      <span className={`text-[9px] font-display tracking-[0.16em] ${used ? 'text-verdant' : 'text-faint'}`}>
                        {used ? 'USED' : 'NOT USED'}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-parch leading-tight mt-0.5">{entry.name}</h3>
                    <div className="text-[9px] font-bold tracking-[0.2em] mt-1" style={{ color: entry.color }}>{entry.kicker}</div>
                  </div>
                </div>
                <p className="text-[13px] leading-snug text-parch/85 mt-3">{entry.desc}</p>
                <div className="mt-2 border-t border-iron pt-2 grid grid-cols-2 gap-2 text-[10px]">
                  {power && <><span className="text-faint">STACKING</span><span className="text-parch text-right">{power.stacks}</span></>}
                  {shop && <>
                    <span className="text-faint">COST</span><span className="text-goldbright font-bold text-right">{shop.cost} G</span>
                    <span className="text-faint">DURATION</span><span className="text-parch text-right">{shop.duration}</span>
                  </>}
                </div>
                <Recommendations ids={entry.recommended} />
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}