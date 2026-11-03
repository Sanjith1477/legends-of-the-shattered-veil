import type { CSSProperties } from 'react';

interface Ember {
  left: string;
  size: number;
  duration: string;
  delay: string;
  drift: string;
  color: string;
}

// Fixed data instead of per-render randomness: the field looks organic but
// React never re-shuffles it and the browser can keep the same compositor
// layers alive between renders.
const EMBERS: Ember[] = [
  { left: '4%', size: 3, duration: '13s', delay: '0s', drift: '34px', color: '#ffd97a' },
  { left: '11%', size: 2, duration: '17s', delay: '2.4s', drift: '-22px', color: '#ffbf66' },
  { left: '18%', size: 4, duration: '15s', delay: '6.1s', drift: '46px', color: '#ffe9a8' },
  { left: '24%', size: 2, duration: '19s', delay: '1.2s', drift: '-38px', color: '#d7adff' },
  { left: '31%', size: 3, duration: '14s', delay: '8.4s', drift: '20px', color: '#ffd97a' },
  { left: '38%', size: 2, duration: '21s', delay: '4.6s', drift: '-16px', color: '#8fd8ff' },
  { left: '45%', size: 3, duration: '16s', delay: '10.2s', drift: '30px', color: '#ffd97a' },
  { left: '52%', size: 2, duration: '18s', delay: '3.1s', drift: '-44px', color: '#ff9d6b' },
  { left: '59%', size: 4, duration: '13.5s', delay: '7.7s', drift: '26px', color: '#ffe9a8' },
  { left: '66%', size: 2, duration: '20s', delay: '0.8s', drift: '-30px', color: '#d7adff' },
  { left: '72%', size: 3, duration: '15.5s', delay: '5.3s', drift: '38px', color: '#ffd97a' },
  { left: '78%', size: 2, duration: '22s', delay: '9.1s', drift: '-20px', color: '#8fd8ff' },
  { left: '84%', size: 3, duration: '14.5s', delay: '2.8s', drift: '24px', color: '#ffbf66' },
  { left: '90%', size: 2, duration: '19.5s', delay: '11.4s', drift: '-36px', color: '#ffd97a' },
  { left: '96%', size: 3, duration: '16.5s', delay: '6.7s', drift: '18px', color: '#d7adff' },
];

interface Props {
  /** Extra class for per-screen tinting. */
  className?: string;
  /** Fewer embers for compact overlays. */
  density?: 'full' | 'soft';
}

/**
 * Shared, purely CSS-driven fantasy atmosphere. Renders behind menu and
 * account screens so Android, browser and Windows all get the identical
 * treatment. No rAF loop and no React state.
 */
export function FantasyBackdrop({ className = '', density = 'full' }: Props) {
  const embers = density === 'soft' ? EMBERS.filter((_, i) => i % 2 === 0) : EMBERS;
  return (
    <div className={`fantasy-backdrop ${className}`} aria-hidden="true">
      <div className="fantasy-mist fantasy-mist-a" />
      <div className="fantasy-mist fantasy-mist-b" />

      <div className="rune-aura">
        <div className="rune-aura-inner" />
      </div>

      <div className="ember-field">
        {embers.map((ember, index) => (
          <span
            key={index}
            className="fantasy-ember"
            style={
              {
                left: ember.left,
                '--ember-size': `${ember.size}px`,
                '--ember-color': ember.color,
                '--ember-duration': ember.duration,
                '--ember-delay': ember.delay,
                '--ember-drift': ember.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* soft top/bottom atmospheric lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 34% at 50% 0%, rgba(226,180,92,0.08), transparent 70%), radial-gradient(ellipse 60% 30% at 50% 100%, rgba(70,200,168,0.045), transparent 70%)',
        }}
      />
    </div>
  );
}
