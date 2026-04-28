import { users } from '../data/mockData'
import './pages.css'

export default function Users() {
  return (
    <div className="page">
      <h1 className="page-title">Users</h1>

      <div className="section">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="mono muted">{u.id}</td>
                <td>{u.name}</td>
                <td className="muted">{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'Admin' ? 'badge-purple' : u.role === 'Editor' ? 'badge-blue' : 'badge-gray'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="muted">{u.joined}</td>
                <td>
                  <span className={`badge ${u.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
