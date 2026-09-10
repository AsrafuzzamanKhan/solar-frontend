import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapSetup';

// BERC (Bangladesh Energy Regulatory Commission) residential LT-A slab tariff, 2026.
const SLABS = [
  { label: '0–50 units (lifeline)', rate: 4.19 },
  { label: '51–75 units', rate: 5.72 },
  { label: '76–200 units', rate: 6.48 },
  { label: '201–300 units', rate: 7.59 },
  { label: '301–400 units', rate: 10.40 },
  { label: '401–600 units', rate: 12.30 },
  { label: '601+ units', rate: 13.44 },
];
const MAX_RATE = 13.44;

export default function GridVsSolar() {
  const root = useRef(null);
  const bars = useRef([]);
  const values = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        SLABS.forEach((s, i) => {
          const bar = bars.current[i];
          const val = values.current[i];
          if (!bar || !val) return;
          const counter = { n: 0 };
          gsap.to(bar, {
            width: `${(s.rate / MAX_RATE) * 100}%`,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: root.current, start: 'top 75%' },
            delay: i * 0.08,
          });
          gsap.to(counter, {
            n: s.rate,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: root.current, start: 'top 75%' },
            delay: i * 0.08,
            onUpdate: () => { val.textContent = `৳${counter.n.toFixed(2)}`; },
          });
        });
      });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} style={{ marginTop: 64 }}>
      <div className="tag teal" style={{ marginBottom: 10 }}>WHY IT MATTERS</div>
      <h2 style={{ maxWidth: 560, marginBottom: 10 }}>Grid tariffs climb with usage. Your solar rate doesn&rsquo;t.</h2>
      <p style={{ color: 'var(--text-dim)', maxWidth: 620, marginBottom: 28, lineHeight: 1.6 }}>
        BPDB bills you more per unit the more electricity you draw — running an AC or a water pump
        can push your household into the ৳10–13.44/unit slabs. Our off-grid subscription is one
        flat, lower rate, quoted after a free load survey of your home.
      </p>

      <div className="card" style={{ display: 'grid', gap: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>
          BERC 2026 RESIDENTIAL TARIFF (৳ PER UNIT / kWh)
        </div>
        {SLABS.map((s, i) => (
          <div key={s.label} className="tariff-row" style={{ display: 'grid', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{s.label}</span>
            <div style={{ background: 'var(--bg)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div
                ref={(el) => (bars.current[i] = el)}
                style={{
                  width: 0,
                  height: '100%',
                  borderRadius: 6,
                  background: s.rate >= 10.4 ? 'var(--red)' : s.rate >= 7.59 ? 'var(--gold)' : 'var(--teal)',
                }}
              />
            </div>
            <span ref={(el) => (values.current[i] = el)} className="mono" style={{ fontSize: 13, textAlign: 'right' }}>৳0.00</span>
          </div>
        ))}
        <p style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>
          Source: BERC residential slab tariff, effective 2026. Actual bills also include VAT, demand charge and meter rent.
        </p>
      </div>

      <style jsx>{`
        .tariff-row { grid-template-columns: 160px 1fr 70px; }
        @media (max-width: 560px) {
          .tariff-row { grid-template-columns: 100px 1fr 56px; gap: 8px; }
          .tariff-row span { font-size: 11.5px !important; }
        }
      `}</style>
    </section>
  );
}
