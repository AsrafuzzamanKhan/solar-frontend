import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { SkeletonStatRow, SkeletonTable } from '../../components/Skeleton';

export default function PartnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/partner/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: 'var(--red)' }}>{error}</p>;
  if (!data) {
    return (
      <div>
        <SkeletonStatRow />
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  const { partner, commissions } = data;
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${partner.referralCode}` : '';

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Partner dashboard</h1>

      <div className="grid cols-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="tag" style={{ marginBottom: 10 }}>REFERRAL CODE</div>
          <p className="mono" style={{ color: 'var(--gold)', fontSize: 18 }}>{partner.referralCode}</p>
        </div>
        <div className="card">
          <div className="tag" style={{ marginBottom: 10 }}>TOTAL EARNED</div>
          <p className="mono" style={{ fontSize: 20 }}>৳{partner.totalEarned.toLocaleString()}</p>
        </div>
        <div className="card">
          <div className="tag" style={{ marginBottom: 10 }}>PENDING PAYOUT</div>
          <p className="mono" style={{ fontSize: 20, color: 'var(--gold)' }}>৳{partner.pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Your referral link</p>
        <p className="mono" style={{ fontSize: 14 }}>{referralLink}</p>
      </div>

      <h3 style={{ marginBottom: 12 }}>Commission history</h3>
      <div className="card">
        {commissions.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No commissions yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Sale Amount</th><th>Rate</th><th>Commission</th><th>Status</th></tr></thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c._id}>
                    <td className="mono">{c.order.toString().slice(-6).toUpperCase()}</td>
                    <td className="mono">৳{c.saleAmount.toLocaleString()}</td>
                    <td>{c.commissionRate}%</td>
                    <td className="mono" style={{ color: 'var(--gold)' }}>৳{c.commissionAmount.toLocaleString()}</td>
                    <td><span className="tag">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
