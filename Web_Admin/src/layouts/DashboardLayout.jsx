import { NavLink } from "react-router-dom"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
        <ul className="space-y-4">
          <li>
            <NavLink to="/" className="hover:text-yellow-300">Home</NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className="hover:text-yellow-300">Analytics</NavLink>
          </li>
          <li>
            <NavLink to="/settings" className="hover:text-yellow-300">Settings</NavLink>
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
