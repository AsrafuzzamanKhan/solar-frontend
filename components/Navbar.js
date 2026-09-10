import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSession, logout } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import { useRouter } from 'next/router';

function initialsFor(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        style={{
          width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--gold)', color: '#1A1207', fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {initialsFor(user.name)}
      </button>

      {open && (
        <div
          className="card"
          style={{ position: 'absolute', right: 0, top: 44, minWidth: 190, padding: 10, zIndex: 20 }}
        >
          <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid var(--panel-line)', marginBottom: 8 }}>
            <p style={{ fontSize: 13.5, fontWeight: 600 }}>{user.name}</p>
            {user.email && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{user.email}</p>}
          </div>
          <button
            className="btn secondary"
            style={{ width: '100%' }}
            onClick={() => { setOpen(false); onLogout(); }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showNewDeviceBanner, setShowNewDeviceBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getSession());
    if (sessionStorage.getItem('newDeviceLogin')) {
      setShowNewDeviceBanner(true);
      sessionStorage.removeItem('newDeviceLogin');
    }
  }, []);

  function handleLogout() {
    logout();
    disconnectSocket();
    setUser(null);
    router.push('/');
  }

  return (
    <>
      {showNewDeviceBanner && (
        <div style={{ background: 'var(--gold)', color: '#1A1207', textAlign: 'center', padding: '8px 16px', fontSize: 13 }}>
          We noticed a sign-in from a new device or location. Wasn&rsquo;t you?{' '}
          <a href="mailto:support@solarbd.example" style={{ textDecoration: 'underline', color: '#1A1207' }}>Contact support</a>.{' '}
          <button
            onClick={() => setShowNewDeviceBanner(false)}
            style={{ border: 'none', background: 'transparent', textDecoration: 'underline', cursor: 'pointer', fontSize: 13, color: '#1A1207' }}
          >
            Dismiss
          </button>
        </div>
      )}
      <header style={{ borderBottom: '1px solid var(--panel-line)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', rowGap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}>
          <Link href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18 }}>
            ☀ Solar<span style={{ color: 'var(--gold)' }}>BD</span>
          </Link>
          <nav style={{ display: 'flex', flexWrap: 'wrap', rowGap: 10, gap: 20, alignItems: 'center', fontSize: 14, justifyContent: 'flex-end' }}>
            <Link href="/products">Shop</Link>
            <Link href="/calculator">Calculator</Link>
            {!user && <Link href="/partner/apply">Become a Partner</Link>}

            {user && user.role === 'individual' && <Link href="/dashboard">My Orders</Link>}
            {user && user.role === 'partner' && <Link href="/partner/dashboard">Partner Dashboard</Link>}
            {user && user.role === 'admin' && <Link href="/admin">Admin</Link>}

            <Link href="/cart">Cart</Link>

            {user ? (
              <AccountMenu user={user} onLogout={handleLogout} />
            ) : (
              <Link href="/login" className="btn">Log in</Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
