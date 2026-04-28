import { Link, useNavigate, useLocation } from "react-router-dom"
import logo from "../assets/SignaVi_Logo.jpg"
import NotificationBell from "./NotificationBell"
import useCart from "../hooks/useCart"
import { useState } from "react"
import AccountDrawer from "./AccountDrawer"

function Navbar({ setCartOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  const { cartCount } = useCart()
  const [accountOpen, setAccountOpen] = useState(false)

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null")
  const customerUser = JSON.parse(localStorage.getItem("customerUser") || "null")

  const isAdmin = adminUser?.role === "admin"
  const isCustomer = !!customerUser

  const handleLogout = () => {
    localStorage.clear()
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
          <img src={logo} style={logoStyle} alt="logo" />
        </Link>

        <NavItem to="/" active={isActive("/")}>Home</NavItem>
        <NavItem to="/store" active={isActive("/store")}>Store</NavItem>

        <button onClick={() => setCartOpen(true)} style={cartBtn}>
          🛒 Cart
          {cartCount > 0 && <span style={badge}>{cartCount}</span>}
        </button>

        {(isCustomer || isAdmin) && (
          <NavItem to="/notifications" active={isActive("/notifications")}>
            🔔 Alerts
          </NavItem>
        )}

        {/* 🔥 ADMIN NAV */}
        {isAdmin && (
          <div style={adminGroup}>
            <NavItem to="/admin/production" active={isActive("/admin/production")}>
              Production
            </NavItem>
            <NavItem to="/admin/orders" active={isActive("/admin/orders")}>
              Orders
            </NavItem>
            <NavItem to="/admin/customers" active={isActive("/admin/customers")}>
              Customers
            </NavItem>
            <NavItem to="/admin/revenue" active={isActive("/admin/revenue")}>
              Revenue
            </NavItem>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={right}>
        <NotificationBell />

        {isCustomer && (
          <button
            onClick={() => setAccountOpen(true)}
            style={accountBtn}
          >
            Account
          </button>
        )}

        {(isCustomer || isAdmin) ? (
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

      {/* ACCOUNT DRAWER */}
      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={customerUser}
      />

    </div>
  )
}

/* 🔥 CLEAN NAV ITEM */
function NavItem({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        color: active ? "#22d3ee" : "#cbd5f5",
        fontWeight: active ? "600" : "400",
        textDecoration: "none"
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

const accountBtn = {
  background: "#22c55e",
  color: "#000",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer"
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