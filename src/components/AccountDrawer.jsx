import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function AccountDrawer({
  open,
  onClose,
  user
}) {
  const navigate = useNavigate()

  const [tab, setTab] = useState("security")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const updatePasswordField = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const closeAndNavigate = (path) => {
    onClose?.()
    navigate(path)
  }

  const handlePasswordChange = async () => {
    try {
      setMessage("")

      if (
        !passwords.current ||
        !passwords.newPass ||
        !passwords.confirm
      ) {
        setMessage("❌ Fill all password fields")
        return
      }

      if (passwords.newPass.length < 8) {
        setMessage("❌ New password must be at least 8 characters")
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
      console.error("❌ CHANGE PASSWORD ERROR:", err.response?.data || err)

      setMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "❌ Failed to update password"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerUser")
    localStorage.removeItem("customerEmail")

    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")

    onClose?.()
    navigate("/customer-login")
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close account drawer"
          onClick={onClose}
          style={overlay}
        />
      )}

      <aside
        aria-hidden={!open}
        style={{
          ...drawer,
          transform: open
            ? "translateX(0)"
            : "translateX(100%)"
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={closeBtn}
        >
          ✕
        </button>

        <p style={eyebrow}>
          SignaVi Studio
        </p>

        <h2 style={heading}>
          👤 Account
        </h2>

        {user ? (
          <div style={profileCard}>
            <p style={profileName}>
              {user.name ||
                user.customerName ||
                "Customer"}
            </p>

            <p style={profileEmail}>
              {user.email || "No email"}
            </p>

            {user.role && (
              <span style={roleBadge}>
                {user.role}
              </span>
            )}
          </div>
        ) : (
          <p style={muted}>
            No account loaded.
          </p>
        )}

        <nav style={tabs}>
          <button
            type="button"
            onClick={() =>
              closeAndNavigate("/my-orders")
            }
            style={tabButton(false)}
          >
            Orders
          </button>

          <button
            type="button"
            onClick={() =>
              closeAndNavigate("/customer/support")
            }
            style={tabButton(false)}
          >
            Support
          </button>

          <button
            type="button"
            onClick={() => setTab("security")}
            style={tabButton(tab === "security")}
          >
            Security
          </button>
        </nav>

        {tab === "security" && (
          <section style={section}>
            <h3 style={sectionTitle}>
              Password Security
            </h3>

            <input
              placeholder="Current password"
              type="password"
              value={passwords.current}
              onChange={(event) =>
                updatePasswordField(
                  "current",
                  event.target.value
                )
              }
              style={input}
            />

            <input
              placeholder="New password"
              type="password"
              value={passwords.newPass}
              onChange={(event) =>
                updatePasswordField(
                  "newPass",
                  event.target.value
                )
              }
              style={input}
            />

            <input
              placeholder="Confirm password"
              type="password"
              value={passwords.confirm}
              onChange={(event) =>
                updatePasswordField(
                  "confirm",
                  event.target.value
                )
              }
              style={input}
            />

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={loading}
              style={{
                ...btn,
                opacity: loading ? 0.6 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

            {message && (
              <p style={messageStyle}>
                {message}
              </p>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={logout}
        >
          Logout
        </button>
      </aside>
    </>
  )
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 999,
  border: "none"
}

const drawer = {
  position: "fixed",
  top: 0,
  right: 0,
  width: "360px",
  maxWidth: "92vw",
  height: "100%",
  background: "#020617",
  color: "white",
  padding: "24px",
  zIndex: 1000,
  transition: "transform 0.35s ease",
  boxShadow: "-24px 0 60px rgba(0,0,0,0.45)",
  borderLeft: "1px solid #1e293b",
  boxSizing: "border-box",
  overflowY: "auto"
}

const closeBtn = {
  position: "absolute",
  top: 16,
  right: 16,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 999,
  color: "white",
  cursor: "pointer",
  width: 36,
  height: 36,
  fontWeight: 900
}

const eyebrow = {
  margin: "0 0 8px",
  color: "#22d3ee",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: 12,
  fontWeight: 900
}

const heading = {
  margin: "0 0 20px",
  fontSize: 30
}

const profileCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 18,
  marginBottom: 18
}

const profileName = {
  margin: 0,
  fontSize: 18,
  fontWeight: 900
}

const profileEmail = {
  margin: "6px 0 0",
  color: "#94a3b8",
  fontSize: 14
}

const roleBadge = {
  display: "inline-block",
  marginTop: 12,
  background: "rgba(34,211,238,0.12)",
  border: "1px solid rgba(34,211,238,0.35)",
  color: "#67e8f9",
  borderRadius: 999,
  padding: "5px 10px",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "capitalize"
}

const muted = {
  color: "#94a3b8"
}

const tabs = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 8,
  marginBottom: 22
}

const tabButton = (active) => ({
  cursor: "pointer",
  border: active
    ? "1px solid #22d3ee"
    : "1px solid #334155",
  background: active
    ? "rgba(34,211,238,0.14)"
    : "#0f172a",
  color: active ? "#67e8f9" : "#cbd5e1",
  padding: "10px 8px",
  borderRadius: 12,
  fontWeight: 900
})

const section = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 18
}

const sectionTitle = {
  margin: "0 0 12px",
  fontSize: 18
}

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 12,
  color: "white",
  boxSizing: "border-box",
  outline: "none"
}

const btn = {
  width: "100%",
  marginTop: 14,
  padding: 12,
  background: "#22c55e",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  fontWeight: 900
}

const messageStyle = {
  margin: "12px 0 0",
  color: "#cbd5e1",
  fontSize: 14
}

const logout = {
  marginTop: 24,
  width: "100%",
  padding: 12,
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}