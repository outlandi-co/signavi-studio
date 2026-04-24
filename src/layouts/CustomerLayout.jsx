import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CustomerLayout({ children }) {

  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h2>Dashboard</h2>

        <button
          style={accountBtn}
          onClick={() => setDrawerOpen(true)}
        >
          Account
        </button>
      </div>

      {/* PAGE CONTENT */}
      {children}

      {/* ACCOUNT DRAWER */}
      {drawerOpen && (
        <>
          <div style={overlay} onClick={()=>setDrawerOpen(false)} />

          <div style={drawer}>
            <h3>Account</h3>

            <div style={navStack}>
              <button
                style={drawerBtn}
                onClick={()=>{
                  setDrawerOpen(false)
                  navigate("/dashboard")
                }}
              >
                📦 Orders
              </button>

              <button
                style={drawerBtn}
                onClick={()=>{
                  setDrawerOpen(false)
                  navigate("/security")
                }}
              >
                🔐 Security
              </button>
            </div>

            <button
              style={drawerBtn}
              onClick={()=>setDrawerOpen(false)}
            >
              Close
            </button>

            <button
              style={logoutBtn}
              onClick={()=>{
                localStorage.clear()
                navigate("/customer-login")
              }}
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
  marginBottom: 20
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
  background: "rgba(0,0,0,0.5)"
}

const drawer = {
  position: "fixed",
  right: 0,
  top: 0,
  width: 260,
  height: "100%",
  background: "#020617",
  padding: 20
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
  cursor: "pointer"
}

const logoutBtn = {
  marginTop: 20,
  background: "#ef4444",
  padding: 12,
  borderRadius: 6,
  cursor: "pointer"
}