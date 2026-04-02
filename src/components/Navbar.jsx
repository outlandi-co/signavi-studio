import { Link, useNavigate, useLocation } from "react-router-dom"
import logo from "../assets/SignaVi_Logo.jpg"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem("user") || "null")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  return (
    <div style={nav}>

      {/* LEFT SIDE */}
      <div style={left}>

        {/* LOGO */}
        <Link to="/" style={logoWrap}>
          <img src={logo} alt="Logo" style={logoStyle} />
        </Link>

        {/* MAIN LINKS */}
        <div style={linkGroup}>
          <NavLink to="/" active={isActive("/")}>Home</NavLink>
          <NavLink to="/store" active={isActive("/store")}>Store</NavLink>
        </div>

        {/* ADMIN LINKS */}
        {user?.role === "admin" && (
          <div style={adminGroup}>
            <NavLink to="/admin/production" active={isActive("/admin/production")}>
              Production
            </NavLink>
            <NavLink to="/admin/orders" active={isActive("/admin/orders")}>
              Orders
            </NavLink>
            <NavLink to="/admin/customers" active={isActive("/admin/customers")}>
              Customers
            </NavLink>
            <NavLink to="/admin/pricing" active={isActive("/admin/pricing")}>
              Pricing
            </NavLink>
            <NavLink to="/admin/inventory" active={isActive("/admin/inventory")}>
              Inventory
            </NavLink>
            <NavLink to="/admin/mockups" active={isActive("/admin/mockups")}>
              Mockups
            </NavLink>
          </div>
        )}

        {/* CUSTOMER */}
        {user?.role === "customer" && (
          <div style={linkGroup}>
            <NavLink to="/account" active={isActive("/account")}>
              Account
            </NavLink>
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div>
        {user ? (
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        ) : (
          <NavLink to="/login" active={isActive("/login")}>
            Login
          </NavLink>
        )}
      </div>
    </div>
  )
}

/* ================= NAV LINK COMPONENT ================= */

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        ...link,
        ...(active ? activeLink : {})
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
  alignItems: "center",
  padding: "12px 20px",
  background: "#020617",
  borderBottom: "1px solid #1e293b",
  color: "white"
}

const left = {
  display: "flex",
  alignItems: "center",
  gap: "25px"
}

const logoWrap = {
  display: "flex",
  alignItems: "center"
}

const logoStyle = {
  height: "40px",
  objectFit: "contain"
}

const linkGroup = {
  display: "flex",
  gap: "15px"
}

const adminGroup = {
  display: "flex",
  gap: "12px",
  marginLeft: "20px",
  paddingLeft: "20px",
  borderLeft: "1px solid #1e293b"
}

const link = {
  textDecoration: "none",
  color: "#94a3b8",
  fontWeight: "500",
  fontSize: "14px",
  transition: "0.2s",
  padding: "4px 6px",
  borderRadius: "4px"
}

const activeLink = {
  color: "#22c55e",
  background: "#22c55e22"
}

const logoutBtn = {
  padding: "6px 12px",
  background: "#ef4444",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontSize: "14px"
}

export default Navbar