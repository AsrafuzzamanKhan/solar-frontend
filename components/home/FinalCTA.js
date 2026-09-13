import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from './gsapSetup';

export default function FinalCTA() {
  const root = useRef(null);
  const glow = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(glow.current, {
          boxShadow: '0 0 0 10px rgba(183,121,31,0)',
          duration: 1.8,
          repeat: -1,
          ease: 'sine.out',
        });
      });
      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="card"
      style={{
        marginTop: 64,
        padding: '40px 32px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--panel) 0%, #F1E7D2 100%)',
      }}
    >
      <div className="tag gold" style={{ marginBottom: 14 }}>READY WHEN YOU ARE</div>
      <h2 style={{ maxWidth: 560, margin: '0 auto 12px' }}>Find your system size, then choose how you pay.</h2>
      <p style={{ color: 'var(--text-dim)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>
        It takes two minutes to know your wattage. From there, buy outright, split it with EMI,
        or ask about our zero-upfront off-grid subscription.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          ref={glow}
          href="/calculator"
          className="btn"
          style={{ boxShadow: '0 0 0 0 rgba(183,121,31,0.55)' }}
        >
          Get my free solar plan
        </Link>
        <a href="mailto:support@solarbd.example?subject=Solar%20subscription%20enquiry" className="btn secondary">
          Ask about the subscription plan
        </a>
      </div>
    </section>
  );
}
