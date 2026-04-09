import { Link, useNavigate, useLocation } from "react-router-dom"
import { useMemo } from "react"
import logo from "../assets/SignaVi_Logo.jpg"
import NotificationBell from "./NotificationBell"
import useCart from "../hooks/useCart"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart } = useCart()

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

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }, [cart])

  return (
    <div style={nav}>

      <div style={left}>
        <Link to="/">
          <img src={logo} style={logoStyle} />
        </Link>

        <NavLink to="/" active={isActive("/")}>Home</NavLink>
        <NavLink to="/store" active={isActive("/store")}>Store</NavLink>

        <NavLink to="/cart" active={isActive("/cart")}>
          🛒 Cart
          {totalItems > 0 && (
            <span style={badge}>{totalItems}</span>
          )}
        </NavLink>

        {user && <NavLink to="/notifications" active={isActive("/notifications")}>🔔 Alerts</NavLink>}

        {admin && (
          <div style={adminGroup}>
            <NavLink to="/admin/production" active={isActive("/admin/production")}>Production</NavLink>
            <NavLink to="/admin/orders" active={isActive("/admin/orders")}>Orders</NavLink>
            <NavLink to="/admin/customers" active={isActive("/admin/customers")}>Customers</NavLink>
            <NavLink to="/admin/revenue" active={isActive("/admin/revenue")}>Revenue</NavLink>
          </div>
        )}
      </div>

      <div style={right}>
        <NotificationBell />

        {user ? (
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/customer-register">Register</Link>
            <Link to="/customer-login">Customer</Link>
            <Link to="/login">Admin</Link>
          </>
        )}
      </div>
    </div>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        color: active ? "#06b6d4" : "#cbd5f5",
        position: "relative"
      }}
    >
      {children}
    </Link>
  )
}

/* ===== STYLES ===== */

const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: 20,
  background: "#020617",
  borderBottom: "1px solid #1e293b"
}

const left = { display: "flex", gap: 20, alignItems: "center" }
const right = { display: "flex", gap: 15 }
const logoStyle = { height: 40 }
const adminGroup = { display: "flex", gap: 10, marginLeft: 20 }

const badge = {
  position: "absolute",
  top: "-10px",
  right: "-14px",
  background: "#22c55e",
  color: "#000",
  padding: "2px 6px",
  borderRadius: "50%",
  fontSize: "12px",
  fontWeight: "bold"
}

const logoutBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
}

export default Navbar