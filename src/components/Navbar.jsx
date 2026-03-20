import { Link, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user") || "null")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div style={{ padding: "10px", borderBottom: "1px solid #333" }}>

      <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
      <Link to="/store" style={{ marginRight: "10px" }}>Store</Link>

      {user?.role === "admin" && (
        <Link to="/admin/production" style={{ marginRight: "10px" }}>
          Production
        </Link>
      )}

      {user?.role === "customer" && (
        <Link to="/account" style={{ marginRight: "10px" }}>
          Account
        </Link>
      )}

      {user ? (
        <button onClick={handleLogout} style={{ float: "right" }}>
          Logout
        </button>
      ) : (
        <Link to="/login" style={{ float: "right" }}>
          Login
        </Link>
      )}

    </div>
  )
}

export default Navbar