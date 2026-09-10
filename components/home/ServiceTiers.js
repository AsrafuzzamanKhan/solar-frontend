import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapSetup';

const TIERS = [
  {
    tag: 'ONE-TIME PAYMENT',
    tagClass: 'tag',
    title: 'Buy it outright',
    price: 'Pay 100% up front',
    bullets: [
      'Own your panels, inverter and battery from day one',
      'No interest, no monthly bill from us — lowest total cost',
      'Full warranty and free installation included',
    ],
    cta: { label: 'Browse products', href: '/products' },
  },
  {
    tag: 'DOWN PAYMENT + EMI',
    tagClass: 'tag gold',
    title: 'Down payment, then installments',
    price: 'Pay a deposit, spread the rest',
    bullets: [
      'Choose 3, 6 or 12 month installment terms at checkout',
      'Move in with solar today, pay the balance monthly',
      'Track every installment from your dashboard',
    ],
    cta: { label: 'See how sizing works', href: '/calculator' },
    highlight: true,
  },
  {
    tag: 'ZERO UPFRONT',
    tagClass: 'tag teal',
    title: 'Off-grid solar subscription',
    price: 'Pay only for what you use',
    bullets: [
      'We design, install and own the system at your home',
      'Billed monthly per unit (kWh) actually consumed — priced below grid rates',
      'No grid connection dependency, no upfront hardware cost',
    ],
    cta: { label: 'Talk to an advisor', href: 'mailto:support@solarbd.example?subject=Solar%20subscription%20enquiry' },
  },
];

export default function ServiceTiers() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray('.service-tier-card');
        gsap.from(cards, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
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
      <div className="tag gold" style={{ marginBottom: 10 }}>HOW YOU CAN GO SOLAR</div>
      <h2 style={{ maxWidth: 560, marginBottom: 10 }}>Three ways to pay. Pick whatever fits your budget.</h2>
      <p style={{ color: 'var(--text-dim)', maxWidth: 620, marginBottom: 28, lineHeight: 1.6 }}>
        Buy your system in one payment, split the cost with a down payment and EMI, or skip
        ownership entirely and subscribe to solar power the way you&rsquo;d subscribe to internet —
        we install it, we maintain it, you just pay for the electricity you draw each month.
      </p>

      <div className="grid cols-3">
        {TIERS.map((t) => (
          <div
            key={t.title}
            className="service-tier-card card"
            style={t.highlight ? { borderColor: 'var(--gold)' } : undefined}
          >
            <div className={t.tagClass} style={{ marginBottom: 14 }}>{t.tag}</div>
            <h3 style={{ fontSize: 19, marginBottom: 6 }}>{t.title}</h3>
            <p className="mono" style={{ fontSize: 13, color: 'var(--gold-bright)', marginBottom: 16 }}>{t.price}</p>
            <ul style={{ margin: 0, marginBottom: 22, paddingLeft: 18, color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.7 }}>
              {t.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <Link href={t.cta.href} className={t.highlight ? 'btn' : 'btn secondary'} style={{ width: '100%', textAlign: 'center' }}>
              {t.cta.label}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
