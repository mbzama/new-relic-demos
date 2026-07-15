'use client';

import { useState, useEffect, useCallback } from 'react';
import { ordersApi, productsApi, type Order, type OrderStatus, type Product } from '@/lib/api';
import { addPageAction, noticeError, saveInteraction, setCustomAttribute } from '@/lib/newrelic-browser';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function CreateOrderForm({
  products,
  onSave,
  onCancel,
}: {
  products: Product[];
  onSave: (customerId: string, items: { productId: string; quantity: number }[]) => void;
  onCancel: () => void;
}) {
  const [customerId, setCustomerId] = useState('customer-' + Math.random().toString(36).slice(2, 8));
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id ?? '', quantity: 1 },
  ]);

  const addItem = () => setItems((i) => [...i, { productId: products[0]?.id ?? '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems((i) => i.filter((_, j) => j !== idx));

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3 mb-4">
      <h3 className="font-medium">New Order</h3>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Customer ID</label>
        <input
          className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs text-gray-400">Items</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <select
              className="flex-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
              value={item.productId}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, i) => (i === idx ? { ...it, productId: e.target.value } : it)),
                )
              }
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="w-20 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
              value={item.quantity}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, i) =>
                    i === idx ? { ...it, quantity: parseInt(e.target.value) || 1 } : it,
                  ),
                )
              }
            />
            {items.length > 1 && (
              <button
                onClick={() => removeItem(idx)}
                className="px-2 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button onClick={addItem} className="text-xs text-[#00AC69] hover:underline">
          + Add item
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(customerId, items)}
          className="px-4 py-2 rounded bg-[#00AC69] text-white text-sm font-medium hover:bg-[#00AC69]/80 transition-colors"
        >
          Create Order
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let ordersData: Order[] | null = null;
    try {
      const [orders, products] = await Promise.all([
        ordersApi.list(),
        productsApi.list(),
      ]);
      ordersData = orders;
      setOrders(orders);
      setProducts(products);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load';
      setError(msg);
      noticeError(err instanceof Error ? err : new Error(msg), { context: 'orders:load' });
    } finally {
      setLoading(false);
    }
    // NR calls outside try/catch — agent failures must not affect UI state
    if (ordersData) {
      setCustomAttribute('orders.count', ordersData.length);
      addPageAction('orders:loaded', { count: ordersData.length });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (
    customerId: string,
    items: { productId: string; quantity: number }[],
  ) => {
    try {
      saveInteraction('create-order');
      const order = await ordersApi.create({ customerId, items });
      addPageAction('orders:created', { orderId: order.id, total: order.total, itemCount: items.length });
      setShowCreate(false);
      load();
    } catch (err) {
      noticeError(err instanceof Error ? err : new Error('Create failed'), { context: 'orders:create' });
      alert(err instanceof Error ? err.message : 'Create failed');
    }
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      saveInteraction('update-order-status');
      await ordersApi.updateStatus(id, status);
      addPageAction('orders:status_changed', { orderId: id, newStatus: status });
      load();
    } catch (err) {
      noticeError(err instanceof Error ? err : new Error('Status update failed'), { context: 'orders:status' });
      alert(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Status changes emit named{' '}
            <code className="text-[#00AC69]">Interactions</code> visible in NR Browser session traces.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded bg-[#00AC69] text-white text-sm font-medium hover:bg-[#00AC69]/80 transition-colors"
        >
          + New Order
        </button>
      </div>

      {showCreate && products.length > 0 && (
        <CreateOrderForm
          products={products}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          No orders yet. Create an order to get started.
        </div>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-mono text-sm text-gray-300">#{o.id.slice(0, 8)}</span>
                <span className="ml-2 text-gray-500 text-sm">{o.customerId}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status]}`}
              >
                {o.status}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-3">
              {o.items.length} item{o.items.length !== 1 ? 's' : ''} &bull; Total: $
              {o.total.toFixed(2)} &bull; {new Date(o.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-1 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={o.status === s}
                  onClick={() => handleStatusChange(o.id, s)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    o.status === s
                      ? 'bg-gray-700 text-gray-500 cursor-default'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  → {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
