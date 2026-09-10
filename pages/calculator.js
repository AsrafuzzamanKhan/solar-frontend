import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

// Fallback list used if the backend appliance-defaults endpoint is unreachable —
// the calculator must keep working for guests even if the API is briefly down.
const FALLBACK_APPLIANCES = [
  { key: 'fan', name: 'Ceiling Fan', watt: 70, defaultHours: 8 },
  { key: 'light', name: 'LED Light', watt: 12, defaultHours: 6 },
  { key: 'fridge', name: 'Refrigerator', watt: 150, defaultHours: 24 },
  { key: 'ac1', name: 'Air Conditioner (1 Ton)', watt: 1200, defaultHours: 6 },
  { key: 'ac15', name: 'Air Conditioner (1.5 Ton)', watt: 1800, defaultHours: 6 },
  { key: 'tv', name: 'Television', watt: 100, defaultHours: 4 },
  { key: 'pump', name: 'Water Pump', watt: 750, defaultHours: 1 },
  { key: 'iron', name: 'Iron', watt: 1000, defaultHours: 0.5 },
  { key: 'computer', name: 'Computer / Laptop', watt: 150, defaultHours: 4 },
];

const PANEL_SIZES = [1, 2, 3, 5, 7.5, 10, 15];
const BATTERY_SIZES = [2.4, 4.8, 7.2, 9.6, 14.4, 19.2];

function roundUpTo(value, list) {
  for (const v of list) if (value <= v) return v;
  return list[list.length - 1];
}

function ProductColumn({ title, products }) {
  return (
    <div className="card">
      <div className="tag" style={{ marginBottom: 10 }}>{title}</div>
      {products.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No matching in-stock product right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map((p) => (
            <Link key={p._id} href={`/products/${p.slug}`} style={{ display: 'block' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</p>
              <p className="mono" style={{ fontSize: 13, color: 'var(--gold)' }}>৳{p.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Calculator() {
  const [appliances, setAppliances] = useState(FALLBACK_APPLIANCES);
  const [state, setState] = useState(null);
  const [backupHours, setBackupHours] = useState(8);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    api.get('/calculator/appliances', { auth: false }).then((list) => {
      if (list && list.length) setAppliances(list.map((a) => ({ key: a.key, name: a.name, watt: a.watt, defaultHours: a.defaultHours })));
    }).catch(() => {}); // fallback list already in state
  }, []);

  useEffect(() => {
    setState(Object.fromEntries(appliances.map((a) => [a.key, { active: false, qty: 0, hours: a.defaultHours, watt: a.watt }])));
  }, [appliances]);

  function update(id, patch) {
    setState((s) => ({ ...s, [id]: { ...s[id], ...patch } }));
  }

  const { totalWatt, dailyKWh } = useMemo(() => {
    if (!state) return { totalWatt: 0, dailyKWh: 0 };
    let totalWatt = 0, dailyWh = 0;
    Object.values(state).forEach((s) => {
      if (s.active && s.qty > 0) {
        totalWatt += s.qty * s.watt;
        dailyWh += s.qty * s.watt * s.hours;
      }
    });
    return { totalWatt, dailyKWh: dailyWh / 1000 };
  }, [state]);

  const recPanel = roundUpTo(dailyKWh / 4.5 / 0.8, PANEL_SIZES);
  const recInverter = Math.ceil((totalWatt * 1.25) / 100) * 100;
  const recBattery = roundUpTo((totalWatt * backupHours) / 1000 / 0.75, BATTERY_SIZES);

  async function seeResults() {
    setShowResults(true);
    try {
      const result = await api.post('/calculator/recommend', {
        panelKw: recPanel, inverterWatt: recInverter, batteryKwh: recBattery,
      }, { auth: false });
      setMatches(result);
    } catch (e) {
      setMatches({ panels: [], inverters: [], batteries: [] });
    }
  }

  if (!state) return <SkeletonTable rows={6} cols={3} />;

  return (
    <div>
      <div className="tag gold" style={{ marginBottom: 12 }}>SOLAR LOAD CALCULATOR</div>
      <h1 style={{ marginBottom: 12, maxWidth: 640 }}>Tell us what you run. We&rsquo;ll tell you what solar you need.</h1>
      <p style={{ color: 'var(--text-dim)', maxWidth: 560, marginBottom: 28 }}>
        Add your fans, lights, fridge, AC — anything you power daily — and we&rsquo;ll size a solar system that matches it.
      </p>

      <div className="calc-layout" style={{ display: 'grid', gap: 24 }}>
        <div className="card" style={{ padding: 8 }}>
          {appliances.map((a) => {
            const s = state[a.key];
            if (!s) return null;
            return (
              <div key={a.key} className="appliance-row" style={{ display: 'grid', gap: 16, alignItems: 'center', padding: 16, borderBottom: '1px solid var(--panel-line)' }}>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{a.watt}W each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mono">
                  <button className="btn secondary" style={{ padding: '4px 10px' }} onClick={() => update(a.key, { qty: Math.max(0, s.qty - 1), active: s.qty - 1 > 0 })}>−</button>
                  <span>{s.qty}</span>
                  <button className="btn secondary" style={{ padding: '4px 10px' }} onClick={() => update(a.key, { qty: s.qty + 1, active: true })}>+</button>
                </div>
                <div style={{ minWidth: 140 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-dim)' }} className="mono">{s.hours} hrs/day</label>
                  <input type="range" min="0" max="24" step="0.5" value={s.hours} onChange={(e) => update(a.key, { hours: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: 'var(--gold)' }} />
                </div>
              </div>
            );
          })}
        </div>

        <aside className="card">
          <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 16 }}>Current draw</h3>
          <p className="mono" style={{ fontSize: 30, color: 'var(--gold-bright)', marginBottom: 4 }}>{totalWatt.toLocaleString()} W</p>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>{dailyKWh.toFixed(1)} kWh / day</p>

          <div className="field">
            <label className="field-label">BACKUP YOU WANT</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[4, 8, 12, 24].map((h) => (
                <button key={h} className={backupHours === h ? 'tag gold' : 'tag'} style={{ cursor: 'pointer', border: 'none' }} onClick={() => setBackupHours(h)}>
                  {h === 24 ? 'All day' : `${h} hrs`}
                </button>
              ))}
            </div>
          </div>

          <button className="btn" style={{ width: '100%', marginTop: 16 }} onClick={seeResults} disabled={totalWatt === 0}>
            See my recommended system
          </button>
        </aside>
      </div>

      {showResults && totalWatt > 0 && (
        <>
          <div className="grid cols-3" style={{ marginTop: 32 }}>
            <div className="card">
              <div className="tag" style={{ marginBottom: 10 }}>SOLAR ARRAY</div>
              <p className="mono" style={{ fontSize: 26, color: 'var(--gold-bright)' }}>{recPanel} kW</p>
            </div>
            <div className="card">
              <div className="tag" style={{ marginBottom: 10 }}>INVERTER</div>
              <p className="mono" style={{ fontSize: 26, color: 'var(--gold-bright)' }}>{recInverter.toLocaleString()} W</p>
            </div>
            <div className="card">
              <div className="tag" style={{ marginBottom: 10 }}>BATTERY BANK</div>
              <p className="mono" style={{ fontSize: 26, color: 'var(--gold-bright)' }}>{recBattery} kWh</p>
            </div>
          </div>

          {matches && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 14 }}>Matching products in stock</h3>
              <div className="grid cols-3">
                <ProductColumn title="PANELS" products={matches.panels} />
                <ProductColumn title="INVERTERS" products={matches.inverters} />
                <ProductColumn title="BATTERIES" products={matches.batteries} />
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .calc-layout { grid-template-columns: 1fr 340px; }
        .appliance-row { grid-template-columns: 1fr auto auto; }
        @media (max-width: 760px) {
          .calc-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .appliance-row { grid-template-columns: 1fr; row-gap: 10px; }
        }
      `}</style>
    </div>
  );
}
