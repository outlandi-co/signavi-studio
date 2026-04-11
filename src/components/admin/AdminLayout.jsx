import { Outlet, NavLink } from "react-router-dom"

export default function AdminLayout() {

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2>Admin Panel</h2>

        <SideLink to="/admin/production">Production</SideLink>
        <SideLink to="/admin/orders">Orders</SideLink>
        <SideLink to="/admin/customers">Customers</SideLink>
        <SideLink to="/admin/revenue">Revenue</SideLink>
      </div>

      {/* CONTENT */}
      <div style={content}>
        <Outlet />
      </div>

    </div>
  )
}

/* 🔥 ACTIVE LINK COMPONENT */
function SideLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        color: isActive ? "#22d3ee" : "#cbd5f5",
        fontWeight: isActive ? "600" : "400",
        textDecoration: "none",
        padding: "6px 0"
      })}
    >
      {children}
    </NavLink>
  )
}

/* STYLES */
const sidebar = {
  width: 200,
  background: "#020617",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 20
}

const content = {
  flex: 1,
  padding: 20
}