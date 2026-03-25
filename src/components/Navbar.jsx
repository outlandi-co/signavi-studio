import { Link, useNavigate } from "react-router-dom"
import logo from "../assets/SignaVi_Logo.jpg"

function Navbar() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user") || "null")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#020617",
        color: "white"
      }}
    >
      {/* 🔥 LEFT SIDE (LOGO + NAV) */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

        {/* LOGO ONLY */}
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </Link>

        {/* NAV LINKS */}
        <Link to="/">Home</Link>
        <Link to="/store">Store</Link>

        {user?.role === "admin" && (
          <Link to="/admin/production">
            Production
          </Link>
        )}

        {user?.role === "customer" && (
          <Link to="/account">
            Account
          </Link>
        )}
      </div>

      {/* 🔥 RIGHT SIDE (AUTH) */}
      <div>
        {user ? (
          <button onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  )
}

export default Navbar