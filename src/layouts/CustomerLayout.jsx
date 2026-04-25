import { useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"

export default function CustomerLayout() {

  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  /* 🔥 FIX: USE NEW SESSION */
  const customerUser = JSON.parse(localStorage.getItem("customerUser") || "null")

  const go = (path) => {
    setDrawerOpen(false)
    navigate(path)
  }

  const logout = () => {
    localStorage.removeItem("customerUser")
    localStorage.removeItem("customerToken")
    navigate("/customer-login")
  }

  return (
    <div style={container}>

      {/* 🔥 HEADER */}
      <div style={header}>
        <h2>Dashboard</h2>

        {/* 🔥 ACCOUNT BUTTON (ONLY IF CUSTOMER LOGGED IN) */}
        {customerUser && (
          <button
            style={accountBtn}
            onClick={() => setDrawerOpen(true)}
          >
            Account
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div>
        <Outlet />
      </div>

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <div
            style={overlay}
            onClick={() => setDrawerOpen(false)}
          />

          <div style={drawer}>
            <h3 style={{ marginBottom: 20 }}>Account</h3>

            <div style={navStack}>

              <button style={drawerBtn} onClick={() => go("/my-orders")}>
                📦 Orders
              </button>

              <button style={drawerBtn} onClick={() => go("/dashboard")}>
                🏠 Dashboard
              </button>

              <button style={drawerBtn} onClick={() => go("/security")}>
                🔐 Security
              </button>

            </div>

            <button
              style={drawerBtn}
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </button>

            <button
              style={logoutBtn}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* STYLES */
const container = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "white"
}

const header = {
  display: "flex",
  marginBottom: 20,
  alignItems: "center"
}

const accountBtn = {
  marginLeft: "auto",
  padding: "8px 16px",
  background: "#22c55e",
  color: "black",
  borderRadius: 6,
  cursor: "pointer"
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 900
}

const drawer = {
  position: "fixed",
  right: 0,
  top: 0,
  width: 260,
  height: "100%",
  background: "#020617",
  padding: 20,
  borderLeft: "1px solid #1e293b",
  zIndex: 1000
}

const navStack = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginBottom: 20
}

const drawerBtn = {
  padding: 12,
  background: "#0f172a",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  border: "1px solid #1e293b"
}

const logoutBtn = {
  marginTop: 20,
  background: "#ef4444",
  padding: 12,
  borderRadius: 6,
  cursor: "pointer",
  color: "white",
  border: "none"
}