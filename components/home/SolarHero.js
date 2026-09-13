import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from './gsapSetup';

// Hero illustration tells the story in one glance: the grid flickers
// (load-shedding), the sun keeps shining, and the solar-powered bulb stays lit.
export default function SolarHero() {
  const root = useRef(null);
  const sunRayGroup = useRef(null);
  const dots = useRef([]);
  const gridBulb = useRef(null);
  const solarBulb = useRef(null);
  const headline = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Entrance — plays once regardless of reduced-motion (it's a simple fade/slide,
      // not a distraction), but the ongoing loops below respect the user's preference.
      gsap.from(headline.current.children, {
        y: 18,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Sun rays rotate slowly, forever.
        gsap.to(sunRayGroup.current, {
          rotation: 360,
          transformOrigin: '50% 50%',
          duration: 50,
          repeat: -1,
          ease: 'none',
        });

        // Energy dots travel from the rooftop panel down into the house.
        dots.current.forEach((dot, i) => {
          if (!dot) return;
          const tl = gsap.timeline({ repeat: -1, delay: i * 0.6 });
          tl.set(dot, { attr: { cx: 150, cy: 92 }, opacity: 0 })
            .to(dot, { opacity: 1, duration: 0.15 })
            .to(dot, { attr: { cx: 150, cy: 140 }, duration: 0.7, ease: 'power1.in' })
            .to(dot, { attr: { cx: 110, cy: 168 }, duration: 0.6, ease: 'power1.out' })
            .to(dot, { opacity: 0, duration: 0.2 }, '-=0.15');
        });

        // Grid bulb flickers unevenly — load-shedding.
        const flicker = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
        flicker
          .to(gridBulb.current, { opacity: 0.15, duration: 0.08 })
          .to(gridBulb.current, { opacity: 0.9, duration: 0.08 })
          .to(gridBulb.current, { opacity: 0.15, duration: 0.06 })
          .to(gridBulb.current, { opacity: 0.9, duration: 0.4 })
          .to(gridBulb.current, { opacity: 0.1, duration: 1.2 });

        // Solar bulb stays on, just a soft steady glow pulse.
        gsap.to(solarBulb.current, {
          opacity: 0.75,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="hero-grid" style={{ paddingBottom: 8 }}>
      <div>
        <div className="tag gold" style={{ marginBottom: 14 }}>SOLAR FOR BANGLADESH</div>
        <div ref={headline}>
          <h1 className="hero-heading" style={{ maxWidth: 620, lineHeight: 1.12, marginBottom: 16 }}>
            Power your home or business with solar — <span style={{ color: 'var(--gold-bright)' }}>your way to pay.</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: 520, marginBottom: 14, lineHeight: 1.6 }}>
            Buy your system outright, split it into a down payment with 3–12 month installments,
            or go completely off the grid with our zero-upfront solar subscription — you only pay
            for the electricity you actually use, at a rate below what BPDB charges at peak slabs.
          </p>
          <p style={{ color: 'var(--text-dim)', maxWidth: 520, marginBottom: 28, lineHeight: 1.6, fontSize: 13.5 }}>
            Not sure what size system you need? Use our load calculator to find your exact wattage
            and recommended capacity in under two minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
            <Link href="/calculator" className="btn">Size my solar system</Link>
            <Link href="/products" className="btn secondary">Browse products</Link>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {[
              'Pay in full or by installment',
              'Free load & capacity calculator',
              'Zero-upfront off-grid subscription',
            ].map((t) => (
              <span key={t} style={{ fontSize: 12.5, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--teal)', display: 'inline-block' }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="Illustration of sunlight charging a solar panel that keeps a home's lights on, while the grid connection flickers">
          <defs>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--gold-bright)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </radialGradient>
          </defs>

          {/* sky */}
          <rect x="0" y="0" width="300" height="300" fill="var(--panel)" />

          {/* sun + rays */}
          <g transform="translate(70,60)">
            <g ref={sunRayGroup}>
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={i}
                  x1="0" y1="0" x2="0" y2="-34"
                  stroke="var(--gold)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.55"
                  transform={`rotate(${i * 45})`}
                />
              ))}
            </g>
            <circle r="22" fill="url(#sunGrad)" />
          </g>

          {/* grid pylon, flickering */}
          <g transform="translate(230,50)" opacity="0.8">
            <line x1="0" y1="0" x2="0" y2="40" stroke="var(--text-dim)" strokeWidth="3" />
            <line x1="-14" y1="8" x2="14" y2="8" stroke="var(--text-dim)" strokeWidth="3" />
            <circle ref={gridBulb} cx="0" cy="-8" r="6" fill="var(--red)" />
          </g>

          {/* rooftop + panel */}
          <polygon points="70,150 150,110 230,150 230,165 70,165" fill="#232838" stroke="var(--panel-line)" />
          <polygon points="100,150 150,124 200,150" fill="#2B3245" stroke="var(--teal)" strokeWidth="1.5" />

          {/* house body */}
          <rect x="90" y="165" width="120" height="70" fill="#1B2030" stroke="var(--panel-line)" />
          <rect x="140" y="195" width="20" height="40" fill="#12151E" />
          <circle ref={solarBulb} cx="150" cy="210" r="4" fill="var(--gold-bright)" opacity="0.9" />

          {/* energy dots flowing from panel into the house */}
          {[0, 1, 2].map((i) => (
            <circle key={i} ref={(el) => (dots.current[i] = el)} r="3.2" fill="var(--teal)" />
          ))}

          {/* ground */}
          <rect x="0" y="235" width="300" height="65" fill="#0D0F16" />
        </svg>
      </div>

      <style jsx>{`
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 32px; align-items: center; }
        .hero-heading { font-size: 40px; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .hero-heading { font-size: 30px; }
        }
      `}</style>
    </div>
  );
}
