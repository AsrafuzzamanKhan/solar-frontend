import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="tag gold" style={{ marginBottom: 14 }}>404</div>
      <h2 style={{ marginBottom: 10 }}>Page not found</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link href="/" className="btn">Back to home</Link>
    </div>
  );
}
