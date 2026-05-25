import { useState, useEffect, useCallback } from 'react';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  total_price: number;
  delivery_address: string;
  status: string;
  created_at: string;
  products: { name: string } | null;
}

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error();
      setOrders(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function confirmOrder(id: string) {
    const res = await fetch(`/api/orders/${id}/confirm`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to confirm');
      return;
    }
    const { whatsapp_url } = await res.json();
    window.open(whatsapp_url, '_blank');
    fetchOrders();
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="headline-md">Orders</h2>
      </div>

      {loading ? (
        <p className="body-md">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="body-md" style={{ color: 'var(--fg-muted)', marginTop: 32 }}>No orders yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="label-sm">Date</th>
                <th className="label-sm">Customer</th>
                <th className="label-sm">Phone</th>
                <th className="label-sm">Product</th>
                <th className="label-sm">Qty</th>
                <th className="label-sm">Total</th>
                <th className="label-sm">Status</th>
                <th className="label-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="body-md" style={{ fontSize: '0.875rem' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="body-md">{o.customer_name}</td>
                  <td className="body-md" style={{ fontSize: '0.875rem' }}>{o.customer_phone}</td>
                  <td className="body-md" style={{ fontSize: '0.875rem' }}>{o.products?.name ?? '—'}</td>
                  <td className="body-md">{o.quantity}</td>
                  <td className="body-md">${Number(o.total_price).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${o.status}`}>{o.status}</span>
                  </td>
                  <td>
                    {o.status === 'pending' && (
                      <button className="btn-primary" onClick={() => confirmOrder(o.id)}>
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
