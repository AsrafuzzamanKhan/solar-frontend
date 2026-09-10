import Link from 'next/link';

function ErrorPage({ statusCode }) {
  return (
    <div className="card" style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="tag red" style={{ marginBottom: 14 }}>{statusCode || 'Error'}</div>
      <h2 style={{ marginBottom: 10 }}>Something went wrong</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>
        We hit an unexpected error. Please try again in a moment.
      </p>
      <Link href="/" className="btn">Back to home</Link>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
