const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Products
export const productsApi = {
  list: (category?: string) =>
    request<Product[]>(`/products${category ? `?category=${category}` : ''}`),
  get: (id: string) => request<Product>(`/products/${id}`),
  create: (body: Omit<Product, 'id' | 'createdAt'>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Omit<Product, 'id' | 'createdAt'>>) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
};

// Orders
export const ordersApi = {
  list: (customerId?: string) =>
    request<Order[]>(`/orders${customerId ? `?customerId=${customerId}` : ''}`),
  get: (id: string) => request<Order>(`/orders/${id}`),
  create: (body: { customerId: string; items: { productId: string; quantity: number }[] }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Simulate (New Relic scenarios)
export const simulateApi = {
  slow: (ms?: number) =>
    request<{ message: string; duration_ms: number }>(`/simulate/slow${ms ? `?ms=${ms}` : ''}`),
  error: (type?: 'handled' | 'unhandled') =>
    request<{ message: string; errorMessage: string }>(
      `/simulate/error${type ? `?type=${type}` : ''}`,
    ),
  crash: () => request<never>('/simulate/crash'),
  metric: (value?: number) =>
    request<{ message: string; metric: string; value: number }>(
      `/simulate/metric${value !== undefined ? `?value=${value}` : ''}`,
    ),
  load: (count?: number) =>
    request<{ message: string; iterations: number; latencies_ms: number[]; avg_ms: number }>(
      `/simulate/load${count ? `?count=${count}` : ''}`,
    ),
  customTransaction: (name?: string) =>
    request<{ message: string }>(`/simulate/custom-transaction${name ? `?name=${name}` : ''}`),
};
