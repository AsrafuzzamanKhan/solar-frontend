import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/Skeleton';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then(setProduct).catch(console.error);
  }, [id]);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ product: product._id, name: product.name, price: product.price, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  }

  if (!product) {
    return (
      <div className="grid cols-2">
        <Skeleton height={300} radius={14} />
        <div>
          <Skeleton width={70} height={20} radius={999} style={{ marginBottom: 14 }} />
          <Skeleton width="70%" height={22} style={{ marginBottom: 10 }} />
          <Skeleton width="30%" height={13} style={{ marginBottom: 18 }} />
          <Skeleton width="40%" height={24} style={{ marginBottom: 22 }} />
          <Skeleton width="100%" height={13} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={13} style={{ marginBottom: 24 }} />
          <Skeleton width={140} height={40} radius={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid cols-2">
      <div className="card" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        Product image
      </div>
      <div>
        <div className="tag" style={{ marginBottom: 12 }}>{product.category}</div>
        <h1 style={{ marginBottom: 8 }}>{product.name}</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 16 }}>{product.brand}</p>
        <p className="mono" style={{ color: 'var(--gold)', fontSize: 26, marginBottom: 20 }}>৳{product.price.toLocaleString()}</p>
        <p style={{ lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>
        <button className="btn" onClick={addToCart}>Add to cart</button>
      </div>
    </div>
  );
}
