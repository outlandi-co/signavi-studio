import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom"

import {
  useState
} from "react"

import logo from "../assets/SignaVi_Logo.jpg"

import {
  useCartContext
} from "../context/useCartContext"

import useNotifications from "../hooks/useNotifications"

const safeParse = (key) => {
  try {
    return JSON.parse(
      localStorage.getItem(key) || "null"
    )
  } catch (err) {
    console.warn(`⚠️ Failed to parse ${key}:`, err)
    return null
  }
}



function Navbar({
  setCartOpen = () => {},
  setAccountOpen = () => {}
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)

  const { cartCount } = useCartContext()
  const { supportUnread } = useNotifications()

  const adminUser = safeParse("adminUser")
  const customerUser = safeParse("customerUser")

  const adminToken =
    localStorage.getItem("adminToken")

  const customerToken =
    localStorage.getItem("customerToken")

  const isAdmin =
    adminUser?.role === "admin" &&
    !!adminToken

  const isCustomer =
    !!customerUser &&
    !!customerToken

  const handleLogout = () => {
    localStorage.removeItem("adminUser")
    localStorage.removeItem("adminToken")
    localStorage.removeItem("customerUser")
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerEmail")

    setMobileOpen(false)
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
    setMobileOpen(false)
  }

  const openAccount = () => {
    setCartOpen(false)
    setAccountOpen(true)
    setMobileOpen(false)
  }

  const closeMobile = () => {
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#020617]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          onClick={closeMobile}
          className="flex items-center gap-3"
        >
         <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-slate-950 shadow-lg shadow-cyan-500/20">
  <img
    src={logo}
    alt="SignaVi Studio"
    className="h-full w-full object-contain"
  />
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
            to="/services"
            active={isActive("/services")}
          >
            Services
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
            Quote
          </NavItem>

          <NavItem
            to="/support"
            active={isActive("/support")}
          >
            Support
          </NavItem>

          {isCustomer && (
            <NavItem
              to="/my-orders"
              active={isActive("/my-orders")}
            >
              My Orders
            </NavItem>
          )}

          {isAdmin && (
            <NavItem
              to="/admin"
              active={isActive("/admin")}
            >
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
              className="hidden rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-400 hover:text-red-300 md:inline-flex"
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

          <button
            type="button"
            onClick={() =>
              setMobileOpen((prev) => !prev)
            }
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-white lg:hidden"
            aria-label="Open menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-800 bg-[#020617] px-6 py-5 lg:hidden">
          <div className="grid gap-3">
            <MobileNavItem
              to="/"
              onClick={closeMobile}
              active={isActive("/")}
            >
              Home
            </MobileNavItem>

            <MobileNavItem
              to="/store"
              onClick={closeMobile}
              active={isActive("/store")}
            >
              Store
            </MobileNavItem>

            <MobileNavItem
              to="/services"
              onClick={closeMobile}
              active={isActive("/services")}
            >
              Services
            </MobileNavItem>

            <MobileNavItem
              to="/gallery"
              onClick={closeMobile}
              active={isActive("/gallery")}
            >
              Gallery
            </MobileNavItem>

            <MobileNavItem
              to="/quote"
              onClick={closeMobile}
              active={isActive("/quote")}
            >
              Quote
            </MobileNavItem>

            <MobileNavItem
              to="/support"
              onClick={closeMobile}
              active={isActive("/support")}
            >
              Support
            </MobileNavItem>

            {isCustomer && (
              <MobileNavItem
                to="/my-orders"
                onClick={closeMobile}
                active={isActive("/my-orders")}
              >
                My Orders
              </MobileNavItem>
            )}

            {isAdmin && (
              <MobileNavItem
                to="/admin"
                onClick={closeMobile}
                active={isActive("/admin")}
              >
                Admin
              </MobileNavItem>
            )}

            {!isCustomer && !isAdmin && (
              <div className="mt-3 grid gap-3 border-t border-slate-800 pt-4">
                <MobileNavItem
                  to="/customer-register"
                  onClick={closeMobile}
                  active={isActive("/customer-register")}
                >
                  Register
                </MobileNavItem>

                <MobileNavItem
                  to="/customer-login"
                  onClick={closeMobile}
                  active={isActive("/customer-login")}
                >
                  Customer Login
                </MobileNavItem>

                <MobileNavItem
                  to="/login"
                  onClick={closeMobile}
                  active={isActive("/login")}
                >
                  Admin Login
                </MobileNavItem>
              </div>
            )}

            {(isCustomer || isAdmin) && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-left font-bold text-red-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
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

function MobileNavItem({
  to,
  children,
  active,
  onClick
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={
        active
          ? "rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 font-bold text-cyan-300"
          : "rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 font-bold text-slate-300"
      }
    >
      {children}
    </Link>
  )
}

export default Navbar