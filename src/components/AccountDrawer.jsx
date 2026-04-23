import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function AccountDrawer({ open, onClose, user, setActiveTab }) {

  const navigate = useNavigate()

  const [activeTab, setLocalTab] = useState("orders")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleTabChange = (tab) => {
    setLocalTab(tab)
    if (setActiveTab) setActiveTab(tab)
  }

  const handlePasswordChange = async () => {
    try {
      setMessage("")

      if (!passwords.current || !passwords.newPass) {
        setMessage("❌ Fill all fields")
        return
      }

      if (passwords.newPass !== passwords.confirm) {
        setMessage("❌ Passwords do not match")
        return
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
      {/* OVERLAY */}
      {open && (
        <div onClick={onClose} style={overlay} />
      )}

      {/* DRAWER */}
      <div style={{
        ...drawer,
        transform: open ? "translateX(0)" : "translateX(100%)"
      }}>

        {/* CLOSE */}
        <button onClick={onClose} style={closeBtn}>✕</button>

        <h2>👤 Account</h2>

        {user && (
          <>
            <p><b>{user.name}</b></p>
            <p style={{ opacity: 0.6 }}>{user.email}</p>
          </>
        )}

        {/* ================= TABS (UPDATED) ================= */}
        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          position: "relative",
          borderBottom: "1px solid #1e293b",
          paddingBottom: 6
        }}>
          {[
            { key: "orders", label: "Orders" },
            { key: "history", label: "Reorders" },
            { key: "security", label: "Security" }
          ].map(tab => (
            <div
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                position: "relative",
                padding: "6px 0",
                cursor: "pointer",
                color: activeTab === tab.key ? "#22c55e" : "#94a3b8",
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}

              {/* 🔥 UNDERLINE */}
              {activeTab === tab.key && (
                <div style={{
                  position: "absolute",
                  bottom: -7,
                  left: 0,
                  width: "100%",
                  height: 2,
                  background: "#22c55e",
                  borderRadius: 2,
                  transition: "all 0.3s ease"
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ================= SECURITY ================= */}
        {activeTab === "security" && (
          <div style={{ marginTop: 20 }}>
            <h3>🔐 Change Password</h3>

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

            <button
              onClick={handlePasswordChange}
              disabled={loading}
              style={btn}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            {message && <p style={{ marginTop: 10 }}>{message}</p>}
          </div>
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

/* ================= STYLES ================= */

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
  fontSize: 18,
  cursor: "pointer"
}

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
  borderRadius: 6,
  cursor: "pointer"
}

const logout = {
  marginTop: 30,
  width: "100%",
  padding: 10,
  background: "#ef4444",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
}