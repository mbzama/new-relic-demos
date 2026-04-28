import { stats, recentOrders } from '../data/mockData'
import './pages.css'

const statusClass = {
  Shipped: 'badge badge-blue',
  Processing: 'badge badge-yellow',
  Delivered: 'badge badge-green',
  Pending: 'badge badge-gray',
}

export default function Dashboard() {
  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
            <span className={`stat-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? '▲' : '▼'} {s.change}
            </span>
          </div>
        ))}
      </div>

      <div className="section">
        <h2 className="section-title">Recent Orders</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.product}</td>
                <td>{o.amount}</td>
                <td><span className={statusClass[o.status] || 'badge badge-gray'}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
