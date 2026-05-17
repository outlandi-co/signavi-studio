import {
  Outlet,
  NavLink
} from "react-router-dom"

import useNotifications from "../../hooks/useNotifications"

export default function AdminLayout() {
  const {
    supportUnread,
    emailUnread,
    clearSupportUnread,
    clearEmailUnread
  } = useNotifications()

  const downloadOrdersCSV = () => {
    window.open(
      "https://signavi-backend.onrender.com/api/orders/export",
      "_blank"
    )
  }

  const downloadTaxCSV = () => {
    window.open(
      "https://signavi-backend.onrender.com/api/export-taxes",
      "_blank"
    )
  }

  return (
    <div style={wrapper}>
      <aside style={sidebar}>
        <div style={brandBox}>
          <div style={brandIcon}>S</div>
          <div>
            <h2 style={title}>Signavi</h2>
            <p style={subtitle}>Admin Panel</p>
          </div>
        </div>

        <SideLink to="/admin/production">🏭 Production</SideLink>
        <SideLink to="/admin/orders">📦 Orders</SideLink>
        <SideLink to="/admin/invoices">🧾 Invoices</SideLink>
        <SideLink to="/admin/custom-order/new">🧾 New Custom Order</SideLink>
        <SideLink to="/admin/products">🛒 Products</SideLink>
        <SideLink to="/admin/signavi-store/products">🛍 Store Products</SideLink>
        <SideLink to="/admin/signavi-store/create">➕ Create Store Product</SideLink>
        <SideLink to="/admin/customers">👥 Customers</SideLink>

        <div onClick={clearEmailUnread}>
          <SideLink to="/admin/emails">
            <div style={linkRow}>
              <span>📧 Emails</span>
              {emailUnread > 0 && <span style={badge}>{emailUnread}</span>}
            </div>
          </SideLink>
        </div>

        <div onClick={clearSupportUnread}>
          <SideLink to="/admin/support">
            <div style={linkRow}>
              <span>🛟 Support</span>
              {supportUnread > 0 && <span style={badge}>{supportUnread}</span>}
            </div>
          </SideLink>
        </div>

        <SideLink to="/admin/revenue">💰 Revenue</SideLink>

        <div style={csvGroup}>
          <button type="button" onClick={downloadOrdersCSV} style={csvButton}>
            📄 Orders CSV
          </button>

          <button type="button" onClick={downloadTaxCSV} style={taxButton}>
            🧾 Tax CSV
          </button>
        </div>
      </aside>

      <main style={content}>
        <Outlet />
      </main>
    </div>
  )
}

function SideLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...link,
        background: isActive ? "rgba(34, 211, 238, 0.12)" : "transparent",
        border: isActive
          ? "1px solid #22d3ee"
          : "1px solid transparent",
        color: isActive ? "#22d3ee" : "#cbd5e1"
      })}
    >
      {children}
    </NavLink>
  )
}

const wrapper = {
  display: "flex",
  minHeight: "100vh",
  background: "#020617"
}

const sidebar = {
  width: 280,
  minWidth: 280,
  background: "#020617",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: 24,
  borderRight: "1px solid #1e293b",
  position: "sticky",
  top: 0,
  height: "100vh",
  boxSizing: "border-box",
  overflowY: "auto"
}

const brandBox = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 22
}

const brandIcon = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "#22d3ee",
  color: "#020617",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: 900
}

const title = {
  margin: 0,
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: "-0.04em"
}

const subtitle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
  fontWeight: 700
}

const content = {
  flex: 1,
  padding: "42px 48px",
  minWidth: 0,
  background:
    "radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 30%), #020617"
}

const link = {
  padding: "14px 16px",
  borderRadius: 16,
  textDecoration: "none",
  fontWeight: 800,
  transition: "0.2s ease",
  display: "block"
}

const csvGroup = {
  marginTop: "auto",
  display: "grid",
  gap: 12
}

const csvButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "14px 16px",
  borderRadius: 16,
  fontWeight: 900,
  cursor: "pointer",
  textAlign: "left"
}

const taxButton = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  padding: "14px 16px",
  borderRadius: 16,
  fontWeight: 900,
  cursor: "pointer",
  textAlign: "left"
}

const linkRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10
}

const badge = {
  minWidth: 22,
  height: 22,
  borderRadius: "999px",
  background: "#ef4444",
  color: "white",
  fontSize: 12,
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 6px"
}