import { Outlet, Link, useLocation } from "react-router-dom"

export default function CustomerLayout() {

  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div style={container}>

      {/* ================= HEADER ================= */}

      <div style={header}>

        <h2 style={title}>
          Customer Dashboard
        </h2>

        {/* ================= NAV ================= */}

        <div style={nav}>

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
          >
            My Support
          </NavItem>

          <NavItem
            to="/security"
            active={isActive("/security")}
          >
            Security
          </NavItem>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div style={content}>
        <Outlet />
      </div>

    </div>
  )
}

/* ================= NAV ITEM ================= */

function NavItem({
  to,
  children,
  active
}) {

  return (
    <Link
      to={to}

      style={{
        ...navItem,

        background: active
          ? "#0f172a"
          : "transparent",

        border: active
          ? "1px solid #22d3ee"
          : "1px solid transparent",

        color: active
          ? "#22d3ee"
          : "#cbd5f5"
      }}
    >
      {children}
    </Link>
  )
}

/* ================= STYLES ================= */

const container = {

  padding: 30,

  background: "#020617",

  minHeight: "100vh",

  color: "white"
}

const header = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  marginBottom: 30,

  flexWrap: "wrap",

  gap: 20
}

const title = {

  margin: 0
}

const nav = {

  display: "flex",

  gap: 14,

  flexWrap: "wrap"
}

const navItem = {

  padding: "10px 16px",

  borderRadius: 10,

  textDecoration: "none",

  fontWeight: "500",

  transition: "0.2s ease"
}

const content = {

  background: "#0f172a",

  borderRadius: 14,

  padding: 20,

  border: "1px solid #1e293b"
}