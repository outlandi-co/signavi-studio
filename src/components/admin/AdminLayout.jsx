import { Link, useLocation } from "react-router-dom"

export default function AdminLayout({ children }) {
  const location = useLocation()

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Production", path: "/admin/production", icon: "🏭" },
    { name: "Orders", path: "/admin/orders", icon: "📦" },
    { name: "Customers", path: "/admin/customers", icon: "👥" },
    { name: "Pricing", path: "/admin/pricing", icon: "💰" },
    { name: "Inventory", path: "/admin/inventory", icon: "📋" },
    { name: "Mockups", path: "/admin/mockups", icon: "🎨" }
  ]

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-gray-800 p-4 sticky top-0 h-screen">

        <h2 className="text-xl font-bold mb-2">Signavi Admin</h2>
        <p className="text-xs text-gray-500 mb-6">Control Center</p>

        <nav className="space-y-2">
          {navItems.map(item => {

            // 🔥 FIXED ACTIVE LOGIC
            const active = location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* OPTIONAL FOOTER */}
        <div className="mt-10 text-xs text-gray-600">
          © {new Date().getFullYear()} Signavi
        </div>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}