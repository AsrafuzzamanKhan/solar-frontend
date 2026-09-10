import { useState } from 'react';
import { api } from '../../lib/api';

export default function PartnerApply() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [partner, setPartner] = useState(null);

  async function apply() {
    setStatus('loading');
    setError('');
    try {
      const res = await api.post('/partner/apply', {});
      setPartner(res);
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('idle');
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 12 }}>Become a partner</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
        Share your referral link. Every time someone orders using it, you earn a flat commission on the sale
        once their payment is confirmed.
      </p>

      {status === 'done' ? (
        <div>
          <p style={{ marginBottom: 8 }}>Application submitted. Your referral code:</p>
          <p className="mono" style={{ color: 'var(--gold)', fontSize: 18 }}>{partner.referralCode}</p>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 12 }}>
            An admin needs to approve your partner account before commissions start applying. You&rsquo;ll be notified once approved.
          </p>
        </div>
      ) : (
        <>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn" style={{ width: '100%' }} onClick={apply} disabled={status === 'loading'}>
            {status === 'loading' ? 'Submitting...' : 'Apply now'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>You need an account to apply — log in first if you haven&rsquo;t.</p>
        </>
      )}
    </div>
  );
}
