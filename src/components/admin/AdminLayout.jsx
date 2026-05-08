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

  return (
    <div style={wrapper}>

      {/* ================= SIDEBAR ================= */}

      <aside style={sidebar}>

        <h2 style={title}>
          Admin Panel
        </h2>

        <SideLink to="/admin/production">
          🏭 Production
        </SideLink>

        <SideLink to="/admin/orders">
          📦 Orders
        </SideLink>

        <SideLink to="/admin/products">
          🛒 Products
        </SideLink>

        <SideLink to="/admin/customers">
          👥 Customers
        </SideLink>

        {/* ================= EMAILS ================= */}

        <div onClick={clearEmailUnread}>

          <SideLink to="/admin/emails">

            <div style={linkRow}>

              <span>
                📧 Emails
              </span>

              {emailUnread > 0 && (

                <span style={badge}>
                  {emailUnread}
                </span>
              )}

            </div>

          </SideLink>

        </div>

        {/* ================= SUPPORT ================= */}

        <div onClick={clearSupportUnread}>

          <SideLink to="/admin/support">

            <div style={linkRow}>

              <span>
                🛟 Support
              </span>

              {supportUnread > 0 && (

                <span style={badge}>
                  {supportUnread}
                </span>
              )}

            </div>

          </SideLink>

        </div>

        <SideLink to="/admin/revenue">
          💰 Revenue
        </SideLink>

      </aside>

      {/* ================= CONTENT ================= */}

      <main style={content}>
        <Outlet />
      </main>

    </div>
  )
}

/* ================= LINK ================= */

function SideLink({
  to,
  children
}) {

  return (
    <NavLink

      to={to}

      style={({ isActive }) => ({

        ...link,

        background:
          isActive
            ? "#0f172a"
            : "transparent",

        border:
          isActive
            ? "1px solid #22d3ee"
            : "1px solid transparent",

        color:
          isActive
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

  minWidth: 240,

  background: "#020617",

  color: "#fff",

  display: "flex",

  flexDirection: "column",

  gap: 14,

  padding: 20,

  borderRight:
    "1px solid #1e293b",

  position: "sticky",

  top: 0,

  height: "100vh",

  boxSizing: "border-box"
}

const title = {

  marginBottom: 12,

  fontSize: 22
}

const content = {

  flex: 1,

  padding: 20,

  minWidth: 0
}

const link = {

  padding: "12px 14px",

  borderRadius: 10,

  textDecoration: "none",

  fontWeight: "500",

  transition: "0.2s ease",

  display: "block"
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