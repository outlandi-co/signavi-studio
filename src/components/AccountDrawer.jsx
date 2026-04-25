import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function AccountDrawer({ open, onClose, user }) {

  const navigate = useNavigate()

  const [tab, setTab] = useState("security")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handlePasswordChange = async () => {
    try {
      setMessage("")

      if (!passwords.current || !passwords.newPass) {
        return setMessage("❌ Fill all fields")
      }

      if (passwords.newPass !== passwords.confirm) {
        return setMessage("❌ Passwords do not match")
      }

      setLoading(true)

      await api.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      })

      setMessage("✅ Password updated")

      setPasswords({
        current: "",
        newPass: "",
        confirm: ""
      })

    } catch (err) {
      setMessage(err?.response?.data?.error || "❌ Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && <div onClick={onClose} style={overlay} />}

      <div
        style={{
          ...drawer,
          transform: open ? "translateX(0)" : "translateX(100%)"
        }}
      >

        <button onClick={onClose} style={closeBtn}>✕</button>

        <h2>👤 Account</h2>

        {user && (
          <>
            <p><b>{user.name}</b></p>
            <p style={{ opacity: 0.6 }}>{user.email}</p>
          </>
        )}

        {/* TABS */}
        <div style={tabs}>

          {/* 🔥 ORDERS → NAVIGATE */}
          <span
            onClick={() => {
              onClose()
              navigate("/my-orders")
            }}
            style={tabStyle(false)}
          >
            Orders
          </span>

          {/* 🔥 SECURITY → STAY IN DRAWER */}
          <span
            onClick={() => setTab("security")}
            style={tabStyle(tab === "security")}
          >
            Security
          </span>

        </div>

        {/* SECURITY */}
        {tab === "security" && (
          <>
            <input
              placeholder="Current password"
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              style={input}
            />

            <input
              placeholder="New password"
              type="password"
              value={passwords.newPass}
              onChange={(e) =>
                setPasswords({ ...passwords, newPass: e.target.value })
              }
              style={input}
            />

            <input
              placeholder="Confirm password"
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              style={input}
            />

            <button onClick={handlePasswordChange} style={btn}>
              {loading ? "Updating..." : "Update Password"}
            </button>

            {message && <p>{message}</p>}
          </>
        )}

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear()
            navigate("/customer-login")
          }}
          style={logout}
        >
          Logout
        </button>

      </div>
    </>
  )
}

/* STYLES */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 999
}

const drawer = {
  position: "fixed",
  top: 0,
  right: 0,
  width: "340px",
  height: "100%",
  background: "#020617",
  padding: "20px",
  zIndex: 1000,
  transition: "transform 0.35s ease"
}

const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer"
}

const tabs = {
  display: "flex",
  gap: 20,
  marginTop: 20
}

const tabStyle = (active) => ({
  cursor: "pointer",
  color: active ? "#22c55e" : "#94a3b8"
})

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 6,
  color: "white"
}

const btn = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  background: "#22c55e",
  border: "none",
  borderRadius: 6
}

const logout = {
  marginTop: 30,
  width: "100%",
  padding: 10,
  background: "#ef4444",
  border: "none",
  borderRadius: 6
}