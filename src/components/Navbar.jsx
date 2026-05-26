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
    if (path === "/") return location.pathname === "/"
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
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#020617]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white shadow-lg shadow-cyan-500/20">
            S
          </div>

          <div>
            <span className="block text-lg font-bold text-white">
              SignaVi Studio
            </span>

            <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Veteran Owned
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <NavItem to="/" active={isActive("/")}>
            Home
          </NavItem>

          <NavItem to="/store" active={isActive("/store")}>
            Store
          </NavItem>

          <NavItem to="/services" active={isActive("/services")}>
            Services
          </NavItem>

          <NavItem to="/gallery" active={isActive("/gallery")}>
            Gallery
          </NavItem>

          <NavItem to="/quote" active={isActive("/quote")}>
            Quote
          </NavItem>

          <NavItem to="/support" active={isActive("/support")}>
            Support
          </NavItem>

          {isAdmin && (
            <NavItem to="/admin" active={isActive("/admin")}>
              Admin
            </NavItem>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-white transition hover:border-cyan-400 hover:text-cyan-300"
            aria-label="Open cart"
          >
            🛒

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-xs font-bold text-black">
                {cartCount}
              </span>
            )}
          </button>

          {isCustomer && (
            <button
              type="button"
              onClick={openAccount}
              className="relative rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-white transition hover:border-cyan-400 hover:text-cyan-300"
              aria-label="Open account"
            >
              👤

              {supportUnread > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {supportUnread}
                </span>
              )}
            </button>
          )}

          {isCustomer || isAdmin ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-400 hover:text-red-300"
            >
              Logout
            </button>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/customer-register"
                className="text-sm text-slate-300 transition hover:text-cyan-300"
              >
                Register
              </Link>

              <Link
                to="/customer-login"
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Customer
              </Link>

              <Link
                to="/login"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-105"
              >
                Admin
              </Link>
            </div>
          )}
        </div>
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
          ? "rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300"
          : "rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
      }
    >
      {children}
    </Link>
  )
}

export default Navbar