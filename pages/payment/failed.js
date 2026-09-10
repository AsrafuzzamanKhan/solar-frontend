import Link from 'next/link';

export default function PaymentFailed() {
  return (
    <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="tag red" style={{ marginBottom: 14 }}>PAYMENT FAILED</div>
      <h2 style={{ marginBottom: 10 }}>That payment didn&rsquo;t go through</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
        No charge was made. You can try again from your order page.
      </p>
      <Link href="/dashboard" className="btn">Go to my orders</Link>
    </div>
  );
}
