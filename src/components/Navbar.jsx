import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom"

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

  const { cartCount } = useCartContext()
  const { supportUnread } = useNotifications()

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "null"
  )

  const customerUser = JSON.parse(
    localStorage.getItem("customerUser") || "null"
  )

  const isAdmin = adminUser?.role === "admin"
  const isCustomer = !!customerUser

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
    <nav className="navbar">

      <div className="navbar-left">
        <Link
          to="/"
          className="brand-link"
        >
          <div className="brand-icon">
            S
          </div>

          <span className="brand-name">
            Signavi
          </span>
        </Link>
      </div>

      <div className="navbar-center">

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
          to="/gallery"
          active={isActive("/gallery")}
        >
          Gallery
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

      </div>

      <div className="navbar-right">

        <button
          type="button"
          onClick={openCart}
          className="nav-icon-button"
          aria-label="Open cart"
        >
          🛒

          {cartCount > 0 && (
            <span className="nav-badge">
              {cartCount}
            </span>
          )}

        </button>

        {isCustomer && (
          <button
            type="button"
            onClick={openAccount}
            className="nav-icon-button"
            aria-label="Open account"
          >
            👤

            {supportUnread > 0 && (
              <span className="nav-badge">
                {supportUnread}
              </span>
            )}

          </button>
        )}

        {(isCustomer || isAdmin) ? (

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>

        ) : (

          <div className="auth-links">

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

    </nav>
  )
}

function NavItem({
  to,
  children,
  active
}) {
  return (
    <Link
      to={to}
      className={
        active
          ? "nav-link active"
          : "nav-link"
      }
    >
      {children}
    </Link>
  )
}

export default Navbar