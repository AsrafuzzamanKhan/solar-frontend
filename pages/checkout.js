import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState('full');
  const [referralCode, setReferralCode] = useState('');
  const [eligibility, setEligibility] = useState({ occupationType: 'job', employerOrBusinessName: '', monthlyIncome: '', experienceRange: '1-3' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function submitOrder() {
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((i) => ({ product: i.product, qty: i.qty })),
        paymentType,
        referralCode: referralCode || undefined,
        eligibilityInfo: paymentType === 'downpayment' ? {
          ...eligibility,
          monthlyIncome: Number(eligibility.monthlyIncome),
        } : undefined,
      };
      const order = await api.post('/orders', payload);
      localStorage.removeItem('cart');
      router.push(`/orders/${order._id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid cols-2">
      <div>
        <h1 style={{ marginBottom: 20 }}>Checkout</h1>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Payment option</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 14 }}>
            Cash on Delivery — pay when your order arrives. No online payment needed right now.
          </p>
          <label style={{ display: 'flex', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
            <input type="radio" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} />
            Pay in full on delivery
          </label>
          <label style={{ display: 'flex', gap: 10, cursor: 'pointer' }}>
            <input type="radio" checked={paymentType === 'downpayment'} onChange={() => setPaymentType('downpayment')} />
            Down payment (cash) + monthly installments (3/6/12 months)
          </label>
        </div>

        {paymentType === 'downpayment' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 14 }}>A quick eligibility check</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
              This helps our team review your down payment request. No documents needed — just tell us about your work.
            </p>

            <div className="field">
              <label className="field-label">OCCUPATION TYPE</label>
              <select className="input" value={eligibility.occupationType} onChange={(e) => setEligibility({ ...eligibility, occupationType: e.target.value })}>
                <option value="job">Job</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">EMPLOYER OR BUSINESS NAME</label>
              <input className="input" value={eligibility.employerOrBusinessName} onChange={(e) => setEligibility({ ...eligibility, employerOrBusinessName: e.target.value })} />
            </div>

            <div className="field">
              <label className="field-label">MONTHLY INCOME (BDT)</label>
              <input className="input" type="number" value={eligibility.monthlyIncome} onChange={(e) => setEligibility({ ...eligibility, monthlyIncome: e.target.value })} />
            </div>

            <div className="field">
              <label className="field-label">HOW LONG AT THIS JOB/BUSINESS</label>
              <select className="input" value={eligibility.experienceRange} onChange={(e) => setEligibility({ ...eligibility, experienceRange: e.target.value })}>
                <option value="<1">Less than 1 year</option>
                <option value="1-3">1–3 years</option>
                <option value="3+">3+ years</option>
              </select>
            </div>
          </div>
        )}

        <div className="card">
          <label className="field-label">REFERRAL CODE (optional)</label>
          <input className="input" placeholder="e.g. ASRA-X92KP" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Order summary</h3>
          {cart.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>{item.name} × {item.qty}</span>
              <span className="mono">৳{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--panel-line)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>Total</span>
            <span className="mono" style={{ color: 'var(--gold)' }}>৳{total.toLocaleString()}</span>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 14 }}>
            {paymentType === 'downpayment'
              ? 'Your order will be reviewed by our team first; once approved, we collect the down payment and each installment in cash.'
              : 'We collect full payment in cash when your order is delivered.'}
          </p>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</p>}

          <button className="btn" style={{ width: '100%', marginTop: 16 }} disabled={submitting || cart.length === 0} onClick={submitOrder}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}
