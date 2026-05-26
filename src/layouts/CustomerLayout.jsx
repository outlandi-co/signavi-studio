import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom"

import useNotifications from "../hooks/useNotifications"

export default function CustomerLayout() {
  const location = useLocation()

  const {
    supportUnread = 0,
    clearSupportUnread = () => {},
  } = useNotifications() || {}

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <p style={eyebrow}>Customer Portal</p>

          <h2 style={title}>
            Customer Dashboard
          </h2>
        </div>

        <nav style={nav}>
          <NavItem
            to="/dashboard"
            active={isActive("/dashboard")}
          >
            Dashboard
          </NavItem>

          <NavItem
            to="/my-orders"
            active={isActive("/my-orders")}
          >
            My Orders
          </NavItem>

          <NavItem
            to="/my-support"
            active={isActive("/my-support")}
            onClick={clearSupportUnread}
          >
            <span style={supportRow}>
              <span>My Support</span>

              {supportUnread > 0 && (
                <span style={badge}>
                  {supportUnread}
                </span>
              )}
            </span>
          </NavItem>

          <NavItem
            to="/security"
            active={isActive("/security")}
          >
            Security
          </NavItem>
        </nav>
      </div>

      <main style={content}>
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({
  to,
  children,
  active,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        ...navItem,
        background: active
          ? "rgba(6, 182, 212, 0.12)"
          : "transparent",
        border: active
          ? "1px solid #22d3ee"
          : "1px solid #1e293b",
        color: active
          ? "#22d3ee"
          : "#cbd5e1",
        boxShadow: active
          ? "0 0 20px rgba(34, 211, 238, 0.12)"
          : "none",
      }}
    >
      {children}
    </Link>
  )
}

const container = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "#ffffff",
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 30,
  flexWrap: "wrap",
  gap: 20,
}

const eyebrow = {
  margin: "0 0 6px",
  color: "#22d3ee",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
}

const title = {
  margin: 0,
  fontSize: 28,
}

const nav = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
}

const navItem = {
  padding: "10px 16px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 600,
  transition: "0.2s ease",
  display: "block",
}

const content = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #1e293b",
}

const supportRow = {
  display: "flex",
  gap: 8,
  alignItems: "center",
}

const badge = {
  minWidth: 20,
  height: 20,
  borderRadius: "999px",
  background: "#ef4444",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 6px",
}