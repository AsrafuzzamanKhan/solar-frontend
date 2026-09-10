import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  function removeItem(idx) {
    const next = cart.filter((_, i) => i !== idx);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Your cart</h1>
      {cart.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>Your cart is empty.</p>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td className="mono">৳{(item.price * item.qty).toLocaleString()}</td>
                    <td><button className="btn secondary" onClick={() => removeItem(idx)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <span className="mono" style={{ fontSize: 20, color: 'var(--gold)' }}>Total: ৳{total.toLocaleString()}</span>
            <button className="btn" onClick={() => router.push('/checkout')}>Proceed to checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}
