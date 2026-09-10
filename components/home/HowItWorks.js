import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapSetup';

const STEPS = [
  { n: '01', title: 'Calculate your load', desc: 'Add the fans, lights, fridge and AC you run — our calculator works out your wattage and daily kWh.' },
  { n: '02', title: 'Choose how to pay', desc: 'Pay in full, put down a deposit with 3–12 month EMI, or go zero-upfront with a monthly subscription.' },
  { n: '03', title: 'We install & commission', desc: 'Our technicians size the array, install the panels, inverter and battery, and connect everything safely.' },
  { n: '04', title: 'Power your home', desc: 'Keep the lights on through load-shedding and track your usage, savings or monthly bill from your dashboard.' },
];

export default function HowItWorks() {
  const root = useRef(null);
  const path = useRef(null);
  const nodes = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (path.current) {
        const len = path.current.getTotalLength();
        path.current.style.strokeDasharray = len;
        path.current.style.strokeDashoffset = len;
      }

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 72%' } });
        if (path.current) {
          tl.to(path.current, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
        }
        tl.from(nodes.current, { y: 20, opacity: 0, duration: 0.5, stagger: 0.18, ease: 'power2.out' }, '-=0.9');
      });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} style={{ marginTop: 64 }}>
      <div className="tag gold" style={{ marginBottom: 10 }}>HOW IT WORKS</div>
      <h2 style={{ maxWidth: 560, marginBottom: 28 }}>From your first calculation to power in your home.</h2>

      <div style={{ position: 'relative' }}>
        <svg
          width="100%"
          height="2"
          viewBox="0 0 1000 2"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 22, left: 0, display: 'none' }}
          className="how-it-works-line"
        >
          <path ref={path} d="M0,1 L1000,1" stroke="var(--gold)" strokeWidth="2" fill="none" />
        </svg>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} ref={(el) => (nodes.current[i] = el)}>
              <div
                className="mono"
                style={{
                  width: 44, height: 44, borderRadius: 999, border: '1px solid var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gold)', fontSize: 14, marginBottom: 14, background: 'var(--panel)',
                }}
              >
                {s.n}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .steps-grid { display: grid; gap: 16px; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 900px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .steps-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 900px) {
          .how-it-works-line { display: block !important; }
        }
      `}</style>
    </section>
  );
}
