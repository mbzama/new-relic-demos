'use client';

import { useState, useEffect, useCallback } from 'react';
import { productsApi, type Product } from '@/lib/api';
import { addPageAction, noticeError, saveInteraction, setCustomAttribute } from '@/lib/newrelic-browser';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Product>;
  onSave: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    price: initial?.price ?? 0,
    category: initial?.category ?? CATEGORIES[0],
    stock: initial?.stock ?? 0,
  });

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Product name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Price</label>
          <input
            type="number"
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Stock</label>
          <input
            type="number"
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: parseInt(e.target.value) }))}
            min={0}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-400 mb-1">Category</label>
          <select
            className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-[#00AC69]"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 rounded bg-[#00AC69] text-white text-sm font-medium hover:bg-[#00AC69]/80 transition-colors"
        >
          Save
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let data: Product[] | null = null;
    try {
      data = await productsApi.list(category || undefined);
      setProducts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load products';
      setError(msg);
      noticeError(err instanceof Error ? err : new Error(msg), { context: 'products:load' });
    } finally {
      setLoading(false);
    }
    // NR calls outside try/catch — agent failures must not affect UI state
    if (data) {
      setCustomAttribute('products.count', data.length);
      addPageAction('products:loaded', { count: data.length, category: category || 'all' });
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      saveInteraction('create-product');
      await productsApi.create(data);
      addPageAction('products:created', { name: data.name, category: data.category });
      setShowCreate(false);
      load();
    } catch (err) {
      noticeError(err instanceof Error ? err : new Error('Create failed'), { context: 'products:create' });
      alert(err instanceof Error ? err.message : 'Create failed');
    }
  };

  const handleUpdate = async (id: string, data: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      saveInteraction('update-product');
      await productsApi.update(id, data);
      addPageAction('products:updated', { id });
      setEditId(null);
      load();
    } catch (err) {
      noticeError(err instanceof Error ? err : new Error('Update failed'), { context: 'products:update' });
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      saveInteraction('delete-product');
      await productsApi.delete(id);
      addPageAction('products:deleted', { id });
      load();
    } catch (err) {
      noticeError(err instanceof Error ? err : new Error('Delete failed'), { context: 'products:delete' });
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Each action sends a{' '}
            <code className="text-[#00AC69]">PageAction</code> and named{' '}
            <code className="text-[#00AC69]">Interaction</code> to New Relic Browser.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded bg-[#00AC69] text-white text-sm font-medium hover:bg-[#00AC69]/80 transition-colors"
        >
          + New Product
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${category === '' ? 'border-[#00AC69] text-[#00AC69] bg-[#00AC69]/10' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${category === c ? 'border-[#00AC69] text-[#00AC69] bg-[#00AC69]/10' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="mb-4">
          <ProductForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
          No products found. Create one to get started.
        </div>
      )}

      <div className="space-y-3">
        {products.map((p) =>
          editId === p.id ? (
            <ProductForm
              key={p.id}
              initial={p}
              onSave={(data) => handleUpdate(p.id, data)}
              onCancel={() => setEditId(null)}
            />
          ) : (
            <div
              key={p.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium truncate">{p.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                    {p.category}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  ${p.price.toFixed(2)} &bull; {p.stock} in stock
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditId(p.id)}
                  className="px-3 py-1.5 rounded bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="px-3 py-1.5 rounded bg-red-900/30 text-sm text-red-400 hover:bg-red-900/50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
