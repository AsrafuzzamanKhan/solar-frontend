import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapSetup';

const REASONS = [
  { tag: 'RELIABILITY', title: 'Load-shedding doesn’t stop you', desc: 'Grid outages are common across Bangladesh, especially in peak summer months. A battery-backed solar system keeps your fridge, fans and lights running through the cuts.' },
  { tag: 'COST', title: 'Grid tariffs keep rising', desc: 'BERC has revised residential slab rates upward again in 2026. Locking in a fixed solar rate protects you from future hikes on the units you use most.' },
  { tag: 'INDEPENDENCE', title: 'No diesel generator needed', desc: 'Skip the noise, fuel cost and maintenance of a backup generator — a properly sized solar + battery setup covers the same essential loads quietly.' },
  { tag: 'FLEXIBILITY', title: 'A plan for every budget', desc: 'Whether you can pay upfront, prefer EMI, or want zero capital outlay with our subscription service, there’s a way to switch that fits your household.' },
];

export default function WhySolarBD() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.why-card', {
          opacity: 0,
          y: 24,
          duration: 0.55,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: root.current, start: 'top 78%' },
        });
      });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} style={{ marginTop: 64 }}>
      <div className="tag" style={{ marginBottom: 10 }}>WHY BANGLADESH IS GOING SOLAR</div>
      <h2 style={{ maxWidth: 560, marginBottom: 28 }}>The grid isn&rsquo;t getting cheaper or steadier. Solar is.</h2>

      <div className="grid cols-2">
        {REASONS.map((r) => (
          <div key={r.title} className="why-card card">
            <div className="tag teal" style={{ marginBottom: 12 }}>{r.tag}</div>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>{r.title}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.65 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
