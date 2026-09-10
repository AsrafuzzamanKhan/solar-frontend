import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { SkeletonCardGrid } from '../../components/Skeleton';

const CATEGORIES = ['panel', 'inverter', 'battery', 'accessory'];
const PAGE_SIZE = 12;

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', search: '', minPrice: '', maxPrice: '', sort: '' });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // Picks up ?category=panel deep links (e.g. from the footer) once the router
  // has resolved the query string, then lets the category effect below load it.
  useEffect(() => {
    if (!router.isReady) return;
    const cat = router.query.category;
    if (cat && CATEGORIES.includes(cat)) setFilters((f) => ({ ...f, category: cat }));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  async function load(targetPage) {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', targetPage);
    params.set('limit', PAGE_SIZE);
    try {
      const data = await api.get(`/products?${params.toString()}`);
      setProducts(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.get('/products/categories', { auth: false })
      .then((rows) => setCategoryCounts(Object.fromEntries(rows.map((r) => [r.category, r.count]))))
      .catch(() => {}); // counts are a nice-to-have, not worth failing the page over
  }, []);

  // Category, sort, or a new search term all restart pagination at page 1.
  // Waits for `ready` so a ?category= deep link is applied before the first fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) load(1); }, [ready, filters.category, filters.sort]);

  function onSearchSubmit(e) {
    e.preventDefault();
    load(1);
  }

  function selectCategory(cat) {
    setFilters((f) => ({ ...f, category: cat }));
    router.replace({ pathname: '/products', query: cat ? { category: cat } : {} }, undefined, { shallow: true });
  }

  const allCount = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Shop solar panels & accessories</h1>

      <div className="shop-tabs" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          className={filters.category === '' ? 'tag gold' : 'tag'}
          style={{ cursor: 'pointer', border: filters.category === '' ? undefined : '1px solid var(--panel-line)', background: 'none', padding: '7px 14px' }}
          onClick={() => selectCategory('')}
        >
          All{allCount ? ` (${allCount})` : ''}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={filters.category === c ? 'tag gold' : 'tag'}
            style={{ cursor: 'pointer', background: 'none', padding: '7px 14px' }}
            onClick={() => selectCategory(c)}
          >
            {c[0].toUpperCase() + c.slice(1)}{categoryCounts[c] ? ` (${categoryCounts[c]})` : ''}
          </button>
        ))}
      </div>

      <div className="shop-layout" style={{ display: 'grid', gap: 24 }}>
        <aside className="card" style={{ height: 'fit-content' }}>
          <form onSubmit={onSearchSubmit} className="field">
            <label className="field-label">SEARCH</label>
            <input
              className="input"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </form>

          <div className="field">
            <label className="field-label">PRICE RANGE (BDT)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
              <input className="input" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
          </div>

          <button className="btn" style={{ width: '100%' }} onClick={() => load(1)}>Apply filters</button>

          <div className="field" style={{ marginTop: 16 }}>
            <label className="field-label">SORT</label>
            <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        <section>
          {loading ? (
            <SkeletonCardGrid count={PAGE_SIZE} />
          ) : products.length === 0 ? (
            <p style={{ color: 'var(--text-dim)' }}>No products match those filters.</p>
          ) : (
            <>
              <div className="grid cols-3">
                {products.map((p) => (
                  <Link key={p._id} href={`/products/${p.slug}`} className="card">
                    <div className="tag" style={{ marginBottom: 10 }}>{p.category}</div>
                    <h3 style={{ fontSize: 16, marginBottom: 6 }}>{p.name}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{p.brand}</p>
                    <p className="mono" style={{ color: 'var(--gold)', fontSize: 16, marginTop: 10 }}>৳{p.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>

              {pages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
                  <p className="mono" style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                    Page {page} of {pages} &middot; {total} products
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn secondary" disabled={page <= 1} onClick={() => load(page - 1)}>&larr; Prev</button>
                    {Array.from({ length: pages }).map((_, i) => {
                      const n = i + 1;
                      // Keep the pager compact on long catalogs: first, last, current, and its neighbors.
                      if (pages > 7 && Math.abs(n - page) > 1 && n !== 1 && n !== pages) {
                        if (n === 2 || n === pages - 1) return <span key={n} style={{ color: 'var(--text-dim)' }}>…</span>;
                        return null;
                      }
                      return (
                        <button
                          key={n}
                          className={n === page ? 'btn' : 'btn secondary'}
                          style={{ padding: '10px 15px' }}
                          onClick={() => load(n)}
                        >
                          {n}
                        </button>
                      );
                    })}
                    <button className="btn secondary" disabled={page >= pages} onClick={() => load(page + 1)}>Next &rarr;</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .shop-layout { grid-template-columns: 240px 1fr; }
        @media (max-width: 800px) {
          .shop-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
