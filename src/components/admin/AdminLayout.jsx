import { Outlet, NavLink } from "react-router-dom"

export default function AdminLayout() {

  return (
    <div style={wrapper}>

      {/* ================= SIDEBAR ================= */}

      <div style={sidebar}>

        <h2 style={title}>
          Admin Panel
        </h2>

        <SideLink to="/admin/production">
          🏭 Production
        </SideLink>

        <SideLink to="/admin/orders">
          📦 Orders
        </SideLink>

        <SideLink to="/admin/customers">
          👥 Customers
        </SideLink>

        {/* 🔥 NEW EMAIL CENTER */}
        <SideLink to="/admin/emails">
          📧 Emails
        </SideLink>

        <SideLink to="/admin/revenue">
          💰 Revenue
        </SideLink>

      </div>

      {/* ================= CONTENT ================= */}

      <div style={content}>
        <Outlet />
      </div>

    </div>
  )
}

/* ================= LINK ================= */

function SideLink({ to, children }) {

  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...link,

        background: isActive
          ? "#0f172a"
          : "transparent",

        border: isActive
          ? "1px solid #22d3ee"
          : "1px solid transparent",

        color: isActive
          ? "#22d3ee"
          : "#cbd5f5"
      })}
    >
      {children}
    </NavLink>
  )
}

/* ================= STYLES ================= */

const wrapper = {
  display: "flex",
  minHeight: "100vh",
  background: "#020617"
}

const sidebar = {
  width: 240,
  background: "#020617",
  color: "#fff",

  display: "flex",
  flexDirection: "column",

  gap: 14,

  padding: 20,

  borderRight: "1px solid #1e293b"
}

const title = {
  marginBottom: 12
}

const content = {
  flex: 1,
  padding: 20
}

const link = {
  padding: "12px 14px",

  borderRadius: 10,

  textDecoration: "none",

  fontWeight: "500",

  transition: "0.2s ease"
}