import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom"

import logo from "../assets/SignaVi_Logo.jpg"

import {
  useCartContext
} from "../context/useCartContext"

import useNotifications from "../hooks/useNotifications"

function Navbar({
  setCartOpen,
  setAccountOpen
}) {

  const navigate = useNavigate()

  const location = useLocation()

  const { cartCount } =
    useCartContext()

  const {
    supportUnread
  } = useNotifications()

  const adminUser = JSON.parse(
    localStorage.getItem(
      "adminUser"
    ) || "null"
  )

  const customerUser = JSON.parse(
    localStorage.getItem(
      "customerUser"
    ) || "null"
  )

  const isAdmin =
    adminUser?.role === "admin"

  const isCustomer =
    !!customerUser

  const handleLogout = () => {

    localStorage.clear()

    navigate("/")
  }

  const isActive = (path) => {

    if (path === "/") {
      return location.pathname === "/"
    }

    return location.pathname.startsWith(path)
  }

  const openCart = () => {

    setAccountOpen(false)

    setCartOpen(true)
  }

  const openAccount = () => {

    setCartOpen(false)

    setAccountOpen(true)
  }

  return (
    <div style={nav}>

      {/* ================= LEFT ================= */}

      <div style={left}>

        <Link to="/">
          <img
            src={logo}
            style={logoStyle}
          />
        </Link>

        <NavItem
          to="/"
          active={isActive("/")}
        >
          Home
        </NavItem>

        <NavItem
          to="/store"
          active={isActive("/store")}
        >
          Store
        </NavItem>

        <NavItem
          to="/quote"
          active={isActive("/quote")}
        >
          Get Quote
        </NavItem>

        <NavItem
          to="/support"
          active={isActive("/support")}
        >
          Support
        </NavItem>

        {/* ================= CART ================= */}

        <button
          onClick={openCart}
          style={cartBtn}
        >

          🛒 Cart

          {cartCount > 0 && (

            <span style={badge}>
              {cartCount}
            </span>

          )}

        </button>

      </div>

      {/* ================= RIGHT ================= */}

      <div style={right}>

        {isCustomer && (

          <button
            onClick={openAccount}
            style={accountBtn}
          >

            <div style={accountRow}>

              <span>
                Account
              </span>

              {supportUnread > 0 && (

                <span style={badge}>
                  {supportUnread}
                </span>

              )}

            </div>

          </button>

        )}

        {(isCustomer || isAdmin) ? (

          <button
            onClick={handleLogout}
            style={logoutBtn}
          >
            Logout
          </button>

        ) : (

          <div style={authLinks}>

            <Link to="/customer-register">
              Register
            </Link>

            <Link to="/customer-login">
              Customer
            </Link>

            <Link to="/login">
              Admin
            </Link>

          </div>

        )}

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
        color: active
          ? "#22d3ee"
          : "#cbd5f5",

        fontWeight: active
          ? "600"
          : "400",

        textDecoration: "none"
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

  borderBottom:
    "1px solid #1e293b"
}

const left = {

  display: "flex",

  gap: 20,

  alignItems: "center"
}

const right = {

  display: "flex",

  gap: 16,

  alignItems: "center"
}

const authLinks = {

  display: "flex",

  gap: 12
}

const logoStyle = {

  height: 40
}

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

  fontSize: "11px",

  minWidth: 18,

  textAlign: "center"
}

const accountBtn = {

  background: "#22c55e",

  padding: "6px 12px",

  borderRadius: "6px",

  border: "none",

  color: "white",

  cursor: "pointer"
}

const accountRow = {

  display: "flex",

  alignItems: "center",

  gap: 8,

  position: "relative"
}

const logoutBtn = {

  background: "#ef4444",

  color: "#fff",

  padding: "6px 12px",

  borderRadius: "6px",

  border: "none",

  cursor: "pointer"
}

export default Navbar