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

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    sessionStorage.removeItem("adminToken")
    sessionStorage.removeItem("adminUser")
    window.location.href = "/login"
  }

  return (
    <div style={wrapper}>
      <aside style={sidebar}>
        <div style={brandBox}>
          <div style={brandIcon}>
            <img
              src="/logo.png"
              alt="SignaVi"
              style={brandImage}
              onError={(event) => {
                event.currentTarget.style.display = "none"
                event.currentTarget.parentElement.textContent = "S"
              }}
            />
          </div>

          <div>
            <h2 style={title}>
              SignaVi
            </h2>

            <p style={subtitle}>
              Admin Panel
            </p>
          </div>
        </div>

        <div style={sectionLabel}>
          Workflow
        </div>

        <SideLink to="/admin">
          📊 Dashboard
        </SideLink>

        <SideLink to="/admin/production">
          🏭 Production
        </SideLink>

        <SideLink to="/admin/orders">
          📦 Orders
        </SideLink>

        <SideLink to="/admin/invoices">
  🧾 Invoices
</SideLink>

        <SideLink to="/admin/custom-order/new">
          🧾 New Custom Order
        </SideLink>

        <div style={sectionLabel}>
          Store
        </div>

<SideLink to="/admin/products/new">
  ➕ Create Product
</SideLink>

<NavLink
  to="/admin/signavi-store/discounts"
>
  Store Discounts
</NavLink>

        <div style={sectionLabel}>
          Customers
        </div>

        <SideLink to="/admin/customers">
          👥 Customers
        </SideLink>

        <div onClick={clearEmailUnread}>
          <SideLink to="/admin/emails">
            <div style={linkRow}>
              <span>📧 Emails</span>

              {emailUnread > 0 && (
                <span style={badge}>
                  {emailUnread}
                </span>
              )}
            </div>
          </SideLink>
        </div>

        <div onClick={clearSupportUnread}>
          <SideLink to="/admin/support">
            <div style={linkRow}>
              <span>🛟 Support</span>

              {supportUnread > 0 && (
                <span style={badge}>
                  {supportUnread}
                </span>
              )}
            </div>
          </SideLink>
        </div>

        <div style={sectionLabel}>
          Business
        </div>

        <SideLink to="/admin/revenue">
          💰 Revenue
        </SideLink>

        <SideLink to="/admin/marketing">
          📣 Marketing Hub
        </SideLink>

        <div style={quickStats}>
          <div style={quickStatCard}>
            <span>💰 Revenue Tools</span>
          </div>

          <div style={quickStatCard}>
            <span>📦 Order Exports</span>
          </div>
        </div>

        <div style={csvGroup}>
          <button
            type="button"
            onClick={downloadOrdersCSV}
            style={csvButton}
          >
            📄 Orders CSV
          </button>

          <button
            type="button"
            onClick={downloadTaxCSV}
            style={taxButton}
          >
            🧾 Tax CSV
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={logoutButton}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={content}>
        <Outlet />
      </main>
    </div>
  )
}

function SideLink({
  to,
  children
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...link,
        background: isActive
          ? "rgba(34, 211, 238, 0.12)"
          : "transparent",
        border: isActive
          ? "1px solid #22d3ee"
          : "1px solid transparent",
        color: isActive
          ? "#22d3ee"
          : "#cbd5e1",
        boxShadow: isActive
          ? "0 10px 30px rgba(34,211,238,.12)"
          : "none"
      })}
      end={to === "/admin"}
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
  width: 320,
  minWidth: 320,
  background: "#020617",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 10,
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
  marginBottom: 22,
  paddingBottom: 18,
  borderBottom: "1px solid #1e293b"
}

const brandIcon = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "linear-gradient(135deg, #22d3ee, #2563eb)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: 900,
  overflow: "hidden",
  boxShadow: "0 14px 30px rgba(34,211,238,.22)"
}

const brandImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  borderRadius: 16
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

const sectionLabel = {
  marginTop: 10,
  marginBottom: 2,
  color: "#64748b",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.18em",
  textTransform: "uppercase"
}

const link = {
  padding: "14px 16px",
  borderRadius: 16,
  textDecoration: "none",
  fontWeight: 800,
  transition: "0.2s ease",
  display: "block"
}

const quickStats = {
  display: "grid",
  gap: 10,
  marginTop: 14,
  marginBottom: 14
}

const quickStatCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 12,
  color: "#cbd5e1",
  fontWeight: 800
}

const csvGroup = {
  marginTop: "auto",
  display: "grid",
  gap: 12,
  paddingTop: 16,
  borderTop: "1px solid #1e293b"
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

const logoutButton = {
  background: "#dc2626",
  color: "white",
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