import { products } from '../data/mockData'
import './pages.css'

const stockClass = {
  'In Stock': 'badge badge-green',
  'Low Stock': 'badge badge-yellow',
  'Out of Stock': 'badge badge-red',
}

export default function Products() {
  return (
    <div className="page">
      <h1 className="page-title">Products</h1>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="mono muted">{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td><span className={stockClass[p.status] || 'badge badge-gray'}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
