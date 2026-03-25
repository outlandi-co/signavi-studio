import { Link, useLocation } from "react-router-dom"

export default function AdminLayout({ children }) {
  const location = useLocation()

  const navItems = [
    { name: "Production", path: "/admin/production" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Customers", path: "/admin/customers" },
    { name: "Pricing", path: "/admin/pricing" },
    { name: "Inventory", path: "/admin/inventory" },
    { name: "Mockups", path: "/admin/mockups" }
  ]

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-gray-800 p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-cyan-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}