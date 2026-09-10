import Link from 'next/link';

const LINK_COLUMNS = [
  {
    title: 'SHOP',
    links: [
      { label: 'All products', href: '/products' },
      { label: 'Solar panels', href: '/products?category=panel' },
      { label: 'Inverters', href: '/products?category=inverter' },
      { label: 'Batteries', href: '/products?category=battery' },
    ],
  },
  {
    title: 'GO SOLAR',
    links: [
      { label: 'Load calculator', href: '/calculator' },
      { label: 'Pay by installment', href: '/calculator' },
      { label: 'Off-grid subscription', href: 'mailto:support@solarbd.example?subject=Solar%20subscription%20enquiry' },
      { label: 'Become a partner', href: '/partner/apply' },
    ],
  },
  {
    title: 'ACCOUNT',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Create an account', href: '/register' },
      { label: 'My orders', href: '/dashboard' },
      { label: 'Cart', href: '/cart' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: '1px solid var(--panel-line)', marginTop: 64 }}>
      <div className="container footer-grid" style={{ display: 'grid', gap: 32, padding: '48px 24px 32px' }}>
        <div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
            ☀ Solar<span style={{ color: 'var(--gold)' }}>BD</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.7, maxWidth: 280, marginBottom: 16 }}>
            Solar panels, inverters and batteries for Bangladeshi homes and businesses —
            buy outright, pay by installment, or go zero-upfront with our off-grid subscription.
          </p>
          <a href="mailto:support@solarbd.example" style={{ fontSize: 13, color: 'var(--gold)' }}>
            support@solarbd.example
          </a>
        </div>

        {LINK_COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)', marginBottom: 14, letterSpacing: 0.5 }}>
              {col.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} style={{ fontSize: 13.5, color: 'var(--text)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="container" style={{ borderTop: '1px solid var(--panel-line)', padding: '18px 24px', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)' }}>
        <span>&copy; {year} SolarBD. All rights reserved.</span>
        <span>Dhaka, Bangladesh</span>
      </div>

      <style jsx>{`
        .footer-grid { grid-template-columns: 1.4fr repeat(3, 1fr); }
        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
