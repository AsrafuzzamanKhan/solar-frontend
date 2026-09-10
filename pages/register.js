import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api, saveSession } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', referredByCode: '' });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Arriving from /login when the account exists but was never verified —
  // jump straight to the OTP step instead of forcing a re-register (which
  // would just 409 on the already-registered email/phone).
  useEffect(() => {
    if (!router.isReady) return;
    const { userId: uid, email } = router.query;
    if (uid) {
      setUserId(uid);
      if (email) setForm((f) => ({ ...f, email }));
      setStep('otp');
    }
  }, [router.isReady, router.query]);

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', form, { auth: false });
      setUserId(res.userId);
      setStep('otp');
    } catch (e) { setError(e.message); }
  }

  async function submitOtp(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp }, { auth: false });
      saveSession(res.token, res.user);
      router.push('/');
    } catch (e) { setError(e.message); }
  }

  async function resendOtp() {
    setError('');
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { userId }, { auth: false });
      showToast('A new code is on its way to your email.', 'success');
    } catch (e) {
      setError(e.message);
    } finally {
      setResending(false);
    }
  }

  if (step === 'otp') {
    return (
      <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 16 }}>Verify your email</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 20 }}>
          {form.email ? `We sent a code to ${form.email}.` : 'We sent a code to your email.'} It expires in 10 minutes —
          check spam/promotions if it doesn&rsquo;t show up in a minute or two.
        </p>
        <form onSubmit={submitOtp}>
          <div className="field">
            <label className="field-label">OTP CODE</label>
            <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn" style={{ width: '100%', marginBottom: 12 }}>Verify & continue</button>
          <button type="button" className="btn secondary" style={{ width: '100%' }} onClick={resendOtp} disabled={resending}>
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>Create your account</h2>
      <form onSubmit={submitForm}>
        <div className="field">
          <label className="field-label">FULL NAME</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label className="field-label">EMAIL</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <label className="field-label">PHONE</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div className="field">
          <label className="field-label">PASSWORD</label>
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="field">
          <label className="field-label">REFERRAL CODE (optional)</label>
          <input className="input" value={form.referredByCode} onChange={(e) => setForm({ ...form, referredByCode: e.target.value })} />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn" style={{ width: '100%' }}>Sign up</button>
      </form>
    </div>
  );
}
