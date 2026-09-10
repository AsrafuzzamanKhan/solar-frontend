import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api, saveSession } from '../lib/api';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password }, { auth: false });
      saveSession(res.token, res.user);
      if (res.newDevice) sessionStorage.setItem('newDeviceLogin', '1');
      router.push('/');
    } catch (e) {
      if (e.data && e.data.needsOtp) {
        router.push(`/register?userId=${e.data.userId}&email=${encodeURIComponent(e.data.email || '')}`);
        return;
      }
      setError(e.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>Log in</h2>
      <form onSubmit={submit}>
        <div className="field">
          <label className="field-label">EMAIL OR PHONE</label>
          <input className="input" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
        </div>
        <div className="field">
          <label className="field-label">PASSWORD</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn" style={{ width: '100%' }}>Log in</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
        No account? <Link href="/register" style={{ color: 'var(--gold)' }}>Sign up</Link>
      </p>
    </div>
  );
}
