import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useToast } from '../context/ToastContext';
import { SkeletonStatRow, SkeletonTable } from '../components/Skeleton';

const STATUS_LABEL = {
  pending_review: 'Under Review',
  awaiting_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  processing: 'Processing',
  installing: 'Installing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const STATUS_TAG_CLASS = {
  confirmed: 'tag teal',
  processing: 'tag teal',
  installing: 'tag teal',
  completed: 'tag teal',
  cancelled: 'tag red',
  rejected: 'tag red',
};

function formatDue(due) {
  if (!due) return null;
  const amount = `৳${due.amount.toLocaleString()}`;
  if (!due.dueDate) return `${due.label} of ${amount} due now`;
  const date = new Date(due.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${due.label} of ${amount} due ${date}`;
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function load() {
    api.get('/orders/mine').then(setOrders).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Live status updates (e.g. an SSLCommerz IPN confirming payment, or an admin
  // review decision) refresh the list instead of requiring a manual reload.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onUpdate = ({ status }) => {
      showToast(`An order was updated: ${STATUS_LABEL[status] || status}`, 'success');
      load();
    };
    socket.on('order:updated', onUpdate);
    return () => socket.off('order:updated', onUpdate);
  }, [showToast]);

  const summary = useMemo(() => {
    const active = orders.filter((o) => !['cancelled', 'rejected'].includes(o.status));
    const totalOutstanding = active.reduce((sum, o) => sum + o.amountRemaining, 0);
    const totalPaid = orders.reduce((sum, o) => sum + o.amountPaid, 0);
    const dueOrders = orders
      .filter((o) => o.nextDue)
      .sort((a, b) => {
        if (!a.nextDue.dueDate) return -1;
        if (!b.nextDue.dueDate) return 1;
        return new Date(a.nextDue.dueDate) - new Date(b.nextDue.dueDate);
      });
    return { totalOutstanding, totalPaid, nextUp: dueOrders[0] || null };
  }, [orders]);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>My orders</h1>

      {loading ? (
        <>
          <SkeletonStatRow />
          <SkeletonTable rows={4} cols={6} />
        </>
      ) : (
      <>
      {orders.length > 0 && (
        <>
          <div className="grid cols-3" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="tag" style={{ marginBottom: 10 }}>ORDERS PLACED</div>
              <p className="mono" style={{ fontSize: 24 }}>{orders.length}</p>
            </div>
            <div className="card">
              <div className="tag teal" style={{ marginBottom: 10 }}>PAID SO FAR</div>
              <p className="mono" style={{ fontSize: 24, color: 'var(--teal)' }}>৳{summary.totalPaid.toLocaleString()}</p>
            </div>
            <div className="card">
              <div className="tag gold" style={{ marginBottom: 10 }}>OUTSTANDING BALANCE</div>
              <p className="mono" style={{ fontSize: 24, color: summary.totalOutstanding > 0 ? 'var(--gold-bright)' : 'var(--text-dim)' }}>
                ৳{summary.totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>

          {summary.nextUp && (
            <div className="card" style={{ marginBottom: 24, borderColor: 'var(--gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="tag gold" style={{ marginBottom: 8 }}>NEXT PAYMENT DUE</div>
                <p style={{ fontSize: 14.5 }}>
                  {formatDue(summary.nextUp.nextDue)} on order <span className="mono">{summary.nextUp._id.slice(-6).toUpperCase()}</span>
                </p>
              </div>
              <Link href={`/orders/${summary.nextUp._id}`} className="btn">Pay now</Link>
            </div>
          )}
        </>
      )}

      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>No orders yet.</p>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Payment</th><th>Next due</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="mono">{o._id.slice(-6).toUpperCase()}</td>
                    <td className="mono">৳{o.totalAmount.toLocaleString()}</td>
                    <td className="mono" style={{ color: 'var(--teal)' }}>৳{o.amountPaid.toLocaleString()}</td>
                    <td className="mono" style={{ color: o.amountRemaining > 0 ? 'var(--gold)' : 'var(--text-dim)' }}>৳{o.amountRemaining.toLocaleString()}</td>
                    <td>{o.paymentType === 'full' ? 'Full payment' : 'Down payment'}</td>
                    <td style={{ fontSize: 12.5, color: o.nextDue ? 'var(--gold-bright)' : 'var(--text-dim)' }}>
                      {o.nextDue ? formatDue(o.nextDue) : '—'}
                    </td>
                    <td><span className={STATUS_TAG_CLASS[o.status] || 'tag gold'}>{STATUS_LABEL[o.status] || o.status}</span></td>
                    <td><Link href={`/orders/${o._id}`} className="btn secondary" style={{ padding: '6px 12px', fontSize: 12 }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
