import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useToast } from '../../context/ToastContext';
import { SkeletonPanelList, SkeletonTable } from '../../components/Skeleton';

const TABS = [
  { key: 'review', label: 'Order Review Queue' },
  { key: 'cash', label: 'Cash Collection' },
  { key: 'products', label: 'Products' },
  { key: 'partners', label: 'Partner Approvals' },
  { key: 'users', label: 'Users' },
  { key: 'settings', label: 'Settings' },
  { key: 'audit', label: 'Audit Log' },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('review');
  const { showToast } = useToast();

  // Live notice when a new down-payment order lands in the review queue.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onNewReview = () => showToast('A new order needs review or cash collection', 'info');
    socket.on('review:new', onNewReview);
    return () => socket.off('review:new', onNewReview);
  }, [showToast]);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Admin</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'btn' : 'btn secondary'} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'review' && <ReviewQueue />}
      {tab === 'cash' && <CashCollection />}
      {tab === 'products' && <ProductManagement />}
      {tab === 'partners' && <PartnerApprovals />}
      {tab === 'users' && <UsersList />}
      {tab === 'settings' && <SettingsPanel />}
      {tab === 'audit' && <AuditLog />}
    </div>
  );
}

function ReviewQueue() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesById, setNotesById] = useState({});
  const [termById, setTermById] = useState({});
  const { showToast } = useToast();

  function load() {
    api.get('/admin/orders/pending-review').then(setOrders).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  async function decide(orderId, decision) {
    try {
      await api.put(`/admin/orders/${orderId}/review`, {
        decision,
        notes: notesById[orderId] || '',
        installmentTermMonths: Number(termById[orderId] || 6),
      });
      showToast(`Order ${decision.replace('_', ' ')}`, 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  if (loading) return <SkeletonPanelList />;
  if (orders.length === 0) return <p style={{ color: 'var(--text-dim)' }}>No orders waiting for review.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {orders.map((o) => (
        <div key={o._id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 600 }}>{o.user?.name} · {o.user?.phone}</p>
              <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Order total: ৳{o.totalAmount.toLocaleString()}</p>
            </div>
            <span className="tag gold">Pending Review</span>
          </div>

          <div className="grid cols-2" style={{ marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Occupation</p>
              <p>{o.eligibilityInfo?.occupationType} — {o.eligibilityInfo?.employerOrBusinessName}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Monthly income</p>
              <p className="mono">৳{o.eligibilityInfo?.monthlyIncome?.toLocaleString()}</p>
            </div>
          </div>

          <div className="field">
            <label className="field-label">INSTALLMENT TERM (IF APPROVING)</label>
            <select className="input" value={termById[o._id] || '6'} onChange={(e) => setTermById({ ...termById, [o._id]: e.target.value })}>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">NOTES (internal)</label>
            <input className="input" value={notesById[o._id] || ''} onChange={(e) => setNotesById({ ...notesById, [o._id]: e.target.value })} placeholder="Reason for rejection, or context for approval" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={() => decide(o._id, 'approved')}>Approve</button>
            <button className="btn secondary" onClick={() => decide(o._id, 'info_requested')}>Request more info</button>
            <button className="btn secondary" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => decide(o._id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CashCollection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function load() {
    api.get('/admin/orders/awaiting-cash').then(setRows).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  async function collect(orderId, target, installmentId) {
    try {
      await api.put(`/admin/orders/${orderId}/collect-payment`, { target, installmentId });
      showToast('Payment marked as collected', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  if (loading) return <SkeletonPanelList />;
  if (rows.length === 0) return <p style={{ color: 'var(--text-dim)' }}>No Cash on Delivery payments waiting to be collected.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map(({ order, plan }) => (
        <div key={order._id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 600 }}>{order.user?.name} · {order.user?.phone}</p>
              <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                Order {order._id.slice(-6).toUpperCase()} · ৳{order.totalAmount.toLocaleString()} · {order.paymentType === 'full' ? 'Full payment' : 'Down payment'}
              </p>
            </div>
            <span className="tag gold">{order.paymentType === 'full' ? 'Awaiting delivery payment' : 'Awaiting cash collection'}</span>
          </div>

          {order.paymentType === 'full' ? (
            <button className="btn" onClick={() => collect(order._id, 'full')}>Mark ৳{order.totalAmount.toLocaleString()} collected</button>
          ) : plan && (
            <div>
              {plan.downPaymentStatus !== 'paid' ? (
                <button className="btn" onClick={() => collect(order._id, 'downpayment')}>
                  Mark down payment ৳{plan.downPaymentAmount.toLocaleString()} collected
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Down payment collected. Pending installments:</p>
                  {plan.installments.filter((i) => i.status !== 'paid').map((inst) => (
                    <div key={inst._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13.5 }}>Due {new Date(inst.dueDate).toLocaleDateString()} · <span className="mono">৳{inst.amount.toLocaleString()}</span></span>
                      <button className="btn secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => collect(order._id, 'installment', inst._id)}>
                        Mark collected
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const EMPTY_PRODUCT = { name: '', slug: '', category: 'panel', brand: '', capacityWatt: '', price: '', stock: '', description: '' };

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const { showToast } = useToast();

  function load() {
    api.get('/products/admin/all').then(setProducts).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  function edit(p) {
    setEditingId(p._id);
    setForm({ ...p, capacityWatt: p.capacityWatt || '', description: p.description || '' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      capacityWatt: form.capacityWatt ? Number(form.capacityWatt) : undefined,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast('Product updated', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created', 'success');
      }
      resetForm();
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function deactivate(id) {
    try {
      await api.del(`/products/${id}`);
      showToast('Product deactivated', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function uploadImages(id, files) {
    if (!files.length) return;
    setUploadingId(id);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    try {
      await api.upload(`/products/${id}/images`, formData);
      showToast('Images uploaded', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setUploadingId(null); }
  }

  return (
    <div className="grid cols-2">
      <form onSubmit={submit} className="card" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: 14 }}>{editingId ? 'Edit product' : 'Add product'}</h3>
        <div className="field">
          <label className="field-label">NAME</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">SLUG</label>
          <input className="input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">CATEGORY</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="panel">Panel</option>
            <option value="inverter">Inverter</option>
            <option value="battery">Battery</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">BRAND</label>
          <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">CAPACITY (WATT)</label>
          <input className="input" type="number" value={form.capacityWatt} onChange={(e) => setForm({ ...form, capacityWatt: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">PRICE (BDT)</label>
          <input className="input" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">STOCK</label>
          <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">DESCRIPTION</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" type="submit">{editingId ? 'Save changes' : 'Create product'}</button>
          {editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Catalog ({products.length})</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td className="mono">৳{p.price.toLocaleString()}</td>
                    <td className="mono">{p.stock}</td>
                    <td><span className={`tag ${p.active ? 'teal' : 'red'}`}>{p.active ? 'active' : 'inactive'}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => edit(p)}>Edit</button>
                      <label className="btn secondary" style={{ padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                        {uploadingId === p._id ? '...' : 'Images'}
                        <input type="file" accept="image/*" multiple hidden onChange={(e) => uploadImages(p._id, e.target.files)} />
                      </label>
                      {p.active && (
                        <button className="btn secondary" style={{ padding: '4px 10px', fontSize: 12, borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => deactivate(p._id)}>
                          Deactivate
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
  );
}

function PartnerApprovals() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function load() {
    api.get('/admin/partners/pending').then(setPartners).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  async function setStatus(id, status) {
    try {
      await api.put(`/admin/partners/${id}/status`, { status });
      showToast(`Partner ${status}`, 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  if (loading) return <SkeletonTable rows={3} cols={4} />;
  if (partners.length === 0) return <p style={{ color: 'var(--text-dim)' }}>No pending partner applications.</p>;

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Contact</th><th>Referral Code</th><th></th></tr></thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id}>
                <td>{p.user?.name}</td>
                <td>{p.user?.phone}</td>
                <td className="mono">{p.referralCode}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => setStatus(p._id, 'approved')}>Approve</button>
                  <button className="btn secondary" onClick={() => setStatus(p._id, 'suspended')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function load() {
    api.get('/admin/users').then(setUsers).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  async function toggleSuspend(u) {
    try {
      await api.put(`/admin/users/${u._id}/status`, { action: u.suspended ? 'reactivate' : 'suspend' });
      showToast(u.suspended ? 'User reactivated' : 'User suspended', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  if (loading) return <SkeletonTable rows={6} cols={5} />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td><span className="tag">{u.role}</span></td>
                <td><span className={`tag ${u.suspended ? 'red' : 'teal'}`}>{u.suspended ? 'suspended' : 'active'}</span></td>
                <td>
                  {u.role !== 'admin' && (
                    <button className="btn secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => toggleSuspend(u)}>
                      {u.suspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/admin/settings').then(setSettings).catch((e) => showToast(e.message, 'error'));
  }, [showToast]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      showToast('Settings saved', 'success');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  if (!settings) return <SkeletonTable rows={2} cols={1} />;

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 420 }}>
      <h3 style={{ marginBottom: 14 }}>Platform settings</h3>
      <div className="field">
        <label className="field-label">DOWN PAYMENT PERCENTAGE</label>
        <input className="input" type="number" min="1" max="99" value={settings.downPaymentPercent}
          onChange={(e) => setSettings({ ...settings, downPaymentPercent: e.target.value })} />
      </div>
      <div className="field">
        <label className="field-label">DEFAULT PARTNER COMMISSION RATE (%)</label>
        <input className="input" type="number" min="0" max="100" value={settings.defaultCommissionRate}
          onChange={(e) => setSettings({ ...settings, defaultCommissionRate: e.target.value })} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
        The commission rate applies to newly-approved partners; existing partners keep their assigned rate.
      </p>
      <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
    </form>
  );
}

function AuditLog() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    api.get(`/admin/audit-logs?page=${page}`).then(setData).catch((e) => showToast(e.message, 'error'));
  }, [page, showToast]);

  if (!data) return <SkeletonTable rows={6} cols={4} />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr key={entry._id}>
                <td className="mono" style={{ fontSize: 12 }}>{new Date(entry.createdAt).toLocaleString()}</td>
                <td>{entry.actor ? `${entry.actor.name} (${entry.actor.role})` : 'system'}</td>
                <td><span className="tag">{entry.action}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{entry.entityType}{entry.entityId ? ` · ${entry.entityId.toString().slice(-6)}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Page {data.page} of {data.pages || 1}</span>
        <button className="btn secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
