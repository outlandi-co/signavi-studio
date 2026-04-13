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

  const handleCartClick = () => {
    if (typeof setCartOpen === "function") {
      setCartOpen(true)
    }
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

        {/* CART */}
        <button onClick={handleCartClick} style={cartBtn}>
          🛒 Cart
          {cartCount > 0 && <span style={badge}>{cartCount}</span>}
        </button>

        {user && (
          <NavLink to="/notifications" active={isActive("/notifications")}>
            🔔 Alerts
          </NavLink>
        )}

        {/* 🔥 ADMIN NAV */}
        {admin && (
          <div style={adminGroup}>
            <NavLink to="/admin/production" active={isActive("/admin/production")}>Production</NavLink>
            <NavLink to="/admin/orders" active={isActive("/admin/orders")}>Orders</NavLink>
            <NavLink to="/admin/customers" active={isActive("/admin/customers")}>Customers</NavLink>
            <NavLink to="/admin/revenue" active={isActive("/admin/revenue")}>Revenue</NavLink>

            {/* 🔥 NEW LINKS */}
            <NavLink to="/admin/products" active={isActive("/admin/products")}>
              📦 Products
            </NavLink>

            <NavLink to="/admin/products/new" active={isActive("/admin/products/new")}>
              ➕ Add Product
            </NavLink>

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

/* NAV LINK */
function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        color: active ? "#22d3ee" : "#cbd5f5",
        fontWeight: active ? "600" : "400"
      }}
    >
      {children}
    </Link>
  )
}

/* STYLES */
const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: "16px 24px",
  background: "#020617",
  borderBottom: "1px solid #1e293b"
}

const left = { display: "flex", gap: 20, alignItems: "center" }
const right = { display: "flex", gap: 16, alignItems: "center" }
const authLinks = { display: "flex", gap: 12 }

const logoStyle = { height: 40 }
const adminGroup = { display: "flex", gap: 10, marginLeft: 20 }

const cartBtn = {
  background: "none",
  border: "none",
  color: "#cbd5f5",
  cursor: "pointer",
  position: "relative"
}

const badge = {
  position: "absolute",
  top: "-6px",
  right: "-10px",
  background: "#ef4444",
  color: "#fff",
  padding: "2px 6px",
  borderRadius: "999px",
  fontSize: "11px"
}

const logoutBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer"
}

export default Navbar