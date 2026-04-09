import { Link, useNavigate, useLocation } from "react-router-dom"
import logo from "../assets/SignaVi_Logo.jpg"
import NotificationBell from "./NotificationBell"
import useCart from "../hooks/useCart"

function Navbar({ setCartOpen }) {

  const navigate = useNavigate()
  const location = useLocation()

  const { cartCount } = useCart()

  const admin = JSON.parse(localStorage.getItem("adminUser") || "null")
  const customer = JSON.parse(localStorage.getItem("customerUser") || "null")
  const user = admin || customer

  const handleLogout = () => {
    localStorage.removeItem("adminUser")
    localStorage.removeItem("adminToken")
    localStorage.removeItem("customerUser")
    localStorage.removeItem("customerToken")
    navigate("/")
  }

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <div style={nav}>

      {/* LEFT */}
      <div style={left}>
        <Link to="/">
          <img src={logo} style={logoStyle} />
        </Link>

        <NavLink to="/" active={isActive("/")}>Home</NavLink>
        <NavLink to="/store" active={isActive("/store")}>Store</NavLink>

        {/* 🔥 CART BUTTON */}
        <button
          onClick={() => setCartOpen(true)}
          style={cartBtn}
          onMouseEnter={(e) => e.currentTarget.style.color = "#22d3ee"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#cbd5f5"}
        >
          🛒 Cart

          {cartCount > 0 && (
            <span style={badge}>
              {cartCount}
            </span>
          )}
        </button>

        {user && (
          <NavLink to="/notifications" active={isActive("/notifications")}>
            🔔 Alerts
          </NavLink>
        )}

        {admin && (
          <div style={adminGroup}>
            <NavLink to="/admin/production" active={isActive("/admin/production")}>Production</NavLink>
            <NavLink to="/admin/orders" active={isActive("/admin/orders")}>Orders</NavLink>
            <NavLink to="/admin/customers" active={isActive("/admin/customers")}>Customers</NavLink>
            <NavLink to="/admin/revenue" active={isActive("/admin/revenue")}>Revenue</NavLink>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={right}>
        <NotificationBell />

        {user ? (
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        ) : (
          <div style={authLinks}>
            <Link to="/customer-register">Register</Link>
            <Link to="/customer-login">Customer</Link>
            <Link to="/login">Admin</Link>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= NAV LINK ================= */

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        color: active ? "#22d3ee" : "#cbd5f5",
        fontWeight: active ? "600" : "400",
        transition: "color 0.2s ease"
      }}
    >
      {children}
    </Link>
  )
}

/* ================= STYLES ================= */

const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: "16px 24px",
  background: "#020617",
  borderBottom: "1px solid #1e293b",
  alignItems: "center"
}

const left = {
  display: "flex",
  gap: "20px",
  alignItems: "center"
}

const right = {
  display: "flex",
  gap: "16px",
  alignItems: "center"
}

const authLinks = {
  display: "flex",
  gap: "12px"
}

const logoStyle = {
  height: 40,
  cursor: "pointer"
}

const adminGroup = {
  display: "flex",
  gap: "10px",
  marginLeft: "20px"
}

/* 🔥 CART BUTTON */
const cartBtn = {
  background: "none",
  border: "none",
  color: "#cbd5f5",
  cursor: "pointer",
  position: "relative",
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "color 0.2s ease"
}

/* 🔥 BADGE */
const badge = {
  position: "absolute",
  top: "-6px",
  right: "-10px",
  background: "#ef4444",
  color: "#fff",
  padding: "2px 6px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "bold",
  boxShadow: "0 0 8px rgba(239,68,68,0.6)"
}

const logoutBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "0.2s"
}

export default Navbar