import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="tag teal" style={{ marginBottom: 14 }}>PAYMENT RECEIVED</div>
      <h2 style={{ marginBottom: 10 }}>Thank you!</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
        Your payment is being confirmed by our payment partner. Your order status will update
        automatically — usually within a minute — once it clears.
      </p>
      <Link href="/dashboard" className="btn">Go to my orders</Link>
    </div>
  );
}
