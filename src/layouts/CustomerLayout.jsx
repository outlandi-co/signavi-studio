import { useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import api from "../../services/api"

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const navigate = useNavigate()

  const go = (path) => {
    setDrawerOpen(false)
    navigate(path)
  }

  const logout = () => {
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerUser")
    navigate("/customer-login")
  }

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h2>Dashboard</h2>

        <button style={accountBtn} onClick={() => setDrawerOpen(true)}>
          Account
        </button>
      </div>

      {/* PAGE */}
      <Outlet />

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <div style={overlay} onClick={() => setDrawerOpen(false)} />

          <div style={drawer}>
            <h3 style={{ marginBottom: 20 }}>Account</h3>

            <div style={navStack}>
              <button style={drawerBtn} onClick={() => go("/my-orders")}>
                📦 Orders
              </button>

              <button style={drawerBtn} onClick={() => go("/dashboard")}>
                🏠 Dashboard
              </button>

              {/* 🔥 PASSWORD MODAL TRIGGER */}
              <button
                style={drawerBtn}
                onClick={() => {
                  setDrawerOpen(false)
                  setShowPasswordModal(true)
                }}
              >
                🔐 Change Password
              </button>
            </div>

            <button style={drawerBtn} onClick={() => setDrawerOpen(false)}>
              Close
            </button>

            <button style={logoutBtn} onClick={logout}>
              Logout
            </button>
          </div>
        </>
      )}

      {/* 🔥 PASSWORD MODAL */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  )
}

/* ================= PASSWORD MODAL ================= */
function PasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword) {
      alert("Fill out both fields")
      return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem("customerToken")

      if (!token) {
        alert("Session expired. Please log in again.")
        return
      }

      await api.post(
        "/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("✅ Password updated successfully")
      onClose()

    } catch (err) {
      console.error("❌ PASSWORD ERROR:", err)

      alert(
        err?.response?.data?.message ||
        "Failed to update password"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={modalOverlay}>
      <div style={modal}>
        <h3>🔐 Change Password</h3>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={input}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>

          <button onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

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
  borderRadius: 6
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
  borderRadius: 6
}

const logoutBtn = {
  marginTop: 20,
  background: "#ef4444",
  padding: 12,
  borderRadius: 6
}

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000
}

const modal = {
  background: "#020617",
  padding: 20,
  borderRadius: 10,
  width: 300
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  background: "#0f172a",
  color: "white",
  border: "1px solid #1e293b"
}