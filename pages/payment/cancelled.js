import Link from 'next/link';

export default function PaymentCancelled() {
  return (
    <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="tag" style={{ marginBottom: 14 }}>PAYMENT CANCELLED</div>
      <h2 style={{ marginBottom: 10 }}>You cancelled the payment</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
        No charge was made. You can pick up where you left off from your order page.
      </p>
      <Link href="/dashboard" className="btn">Go to my orders</Link>
    </div>
  );
}
