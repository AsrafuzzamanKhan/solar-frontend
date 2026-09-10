// Shimmering placeholders shown while real data is in flight, so a slow network
// or a cold API paints a shape of the coming layout instead of "Loading..." text
// (or worse, a flash of an empty/zero state that looks like real data).

export function Skeleton({ width = '100%', height = 14, radius = 6, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton width={70} height={20} radius={999} style={{ marginBottom: 14 }} />
      <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="45%" height={12} style={{ marginBottom: 16 }} />
      <Skeleton width="35%" height={18} />
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div className="grid cols-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonStatRow({ count = 3 }) {
  return (
    <div className="grid cols-3" style={{ marginBottom: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="card" key={i}>
          <Skeleton width={90} height={16} radius={999} style={{ marginBottom: 14 }} />
          <Skeleton width="55%" height={26} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height={13} width={c === 0 ? '20%' : `${18 - c * 2}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Mimics the admin "one card per record" list layout used for review queues,
// cash collection, etc.: a header line, a two-column info block, then a button row.
export function SkeletonPanelCard() {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Skeleton width={180} height={16} />
        <Skeleton width={90} height={20} radius={999} />
      </div>
      <div className="grid cols-2" style={{ marginBottom: 16 }}>
        <Skeleton height={13} width="70%" />
        <Skeleton height={13} width="70%" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Skeleton width={90} height={36} radius={10} />
        <Skeleton width={90} height={36} radius={10} />
      </div>
    </div>
  );
}

export function SkeletonPanelList({ count = 2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonPanelCard key={i} />)}
    </div>
  );
}

// Generic full-page shape used while RouteGuard verifies access — kept deliberately
// simple since it's shown only for the brief moment it takes to check a session.
export function PageSkeleton() {
  return (
    <div>
      <Skeleton width={220} height={26} style={{ marginBottom: 20 }} />
      <SkeletonStatRow />
      <SkeletonTable />
    </div>
  );
}
