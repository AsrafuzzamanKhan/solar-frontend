import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonStatRow, SkeletonTable } from '../../components/Skeleton';

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

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [paying, setPaying] = useState(null); // key of the button currently in-flight (online gateway only)

  function load() {
    if (!id) return;
    api.get(`/orders/${id}`).then(setData).catch((e) => showToast(e.message, 'error'));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [id]);

  // Only used for paymentMethod === 'online' orders — COD orders never call the gateway.
  async function pay(target, installmentId) {
    const key = installmentId || target;
    setPaying(key);
    try {
      const res = await api.post(`/payment/init/${id}`, { target, installmentId });
      window.location.href = res.gatewayUrl;
    } catch (e) {
      showToast(e.message, 'error');
      setPaying(null);
    }
  }

  if (!data) {
    return (
      <div>
        <SkeletonStatRow />
        <SkeletonTable rows={4} cols={4} />
      </div>
    );
  }

  const { order, paymentPlan, amountPaid, amountRemaining } = data;
  const isCod = order.paymentMethod === 'cod';

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Order {order._id.slice(-6).toUpperCase()}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {isCod && <span className="tag teal">Cash on Delivery</span>}
          <span className="tag gold">{STATUS_LABEL[order.status] || order.status}</span>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="tag" style={{ marginBottom: 10 }}>ORDER TOTAL</div>
          <p className="mono" style={{ fontSize: 22 }}>৳{order.totalAmount.toLocaleString()}</p>
        </div>
        <div className="card">
          <div className="tag teal" style={{ marginBottom: 10 }}>PAID SO FAR</div>
          <p className="mono" style={{ fontSize: 22, color: 'var(--teal)' }}>৳{amountPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <div className="tag gold" style={{ marginBottom: 10 }}>REMAINING</div>
          <p className="mono" style={{ fontSize: 22, color: 'var(--gold)' }}>৳{amountRemaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Items</h3>
          {order.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>{item.name} × {item.qty}</span>
              <span className="mono">৳{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--panel-line)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>Total</span>
            <span className="mono" style={{ color: 'var(--gold)' }}>৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div>
          {order.paymentType === 'full' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Payment</h3>
              {order.status === 'awaiting_payment' ? (
                isCod ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
                    Cash on Delivery — please have ৳{order.totalAmount.toLocaleString()} ready when your order arrives.
                    We&rsquo;ll mark it paid once our team collects it.
                  </p>
                ) : (
                  <button className="btn" style={{ width: '100%' }} disabled={paying === 'full'} onClick={() => pay('full')}>
                    {paying === 'full' ? 'Redirecting...' : `Pay ৳${order.totalAmount.toLocaleString()} now`}
                  </button>
                )
              ) : (
                <p style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>Payment received. Thank you!</p>
              )}
            </div>
          )}

          {order.paymentType === 'downpayment' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Eligibility review</h3>
              <p style={{ fontSize: 13.5 }}>
                Status: <span className="tag">{order.eligibilityStatus.replace('_', ' ')}</span>
              </p>
              {order.eligibilityStatus === 'rejected' && order.reviewNotes && (
                <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{order.reviewNotes}</p>
              )}
              {order.eligibilityStatus === 'info_requested' && order.reviewNotes && (
                <p style={{ color: 'var(--gold)', fontSize: 13, marginTop: 10 }}>{order.reviewNotes}</p>
              )}

              {order.eligibilityStatus === 'approved' && paymentPlan && (
                <div style={{ marginTop: 16 }}>
                  {paymentPlan.downPaymentStatus === 'paid' ? (
                    <p style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>Down payment of ৳{paymentPlan.downPaymentAmount.toLocaleString()} received.</p>
                  ) : isCod ? (
                    <p style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
                      Down payment of ৳{paymentPlan.downPaymentAmount.toLocaleString()} due in cash — awaiting collection by our team.
                    </p>
                  ) : (
                    <button className="btn" style={{ width: '100%' }} disabled={paying === 'downpayment'} onClick={() => pay('downpayment')}>
                      {paying === 'downpayment' ? 'Redirecting...' : `Pay down payment · ৳${paymentPlan.downPaymentAmount.toLocaleString()}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {paymentPlan && (
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Installment schedule</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {paymentPlan.installments.map((inst) => (
                      <tr key={inst._id}>
                        <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                        <td className="mono">৳{inst.amount.toLocaleString()}</td>
                        <td><span className="tag">{inst.status}</span></td>
                        <td>
                          {inst.status === 'pending' && paymentPlan.downPaymentStatus === 'paid' && !isCod && (
                            <button
                              className="btn secondary"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                              disabled={paying === inst._id}
                              onClick={() => pay('installment', inst._id)}
                            >
                              {paying === inst._id ? '...' : 'Pay'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
