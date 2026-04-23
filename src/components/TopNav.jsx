import { useState, useRef, useEffect } from "react"

export default function TopNav({ user, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()
    : "U"

  return (
    <div style={nav}>
      {/* LEFT: Brand */}
      <div style={brand}>SignaVi</div>

      {/* RIGHT: Avatar */}
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={avatarBtn}
          title="Account"
        >
          {initials}
        </button>

        {open && (
          <div style={dropdown}>
            <div style={dropdownHeader}>
              <div style={{ fontWeight: 600 }}>{user?.name || "User"}</div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>{user?.email}</div>
            </div>

            <MenuItem onClick={() => { onNavigate("orders"); setOpen(false) }}>
              📦 My Orders
            </MenuItem>

            <MenuItem onClick={() => { onNavigate("history"); setOpen(false) }}>
              🔁 Reorders
            </MenuItem>

            <MenuItem onClick={() => { onNavigate("security"); setOpen(false) }}>
              🔐 Security
            </MenuItem>

            <div style={divider} />

            <MenuItem onClick={() => { onLogout(); setOpen(false) }} danger>
              🚪 Logout
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({ children, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...item,
        color: danger ? "#f87171" : "#e5e7eb"
      }}
    >
      {children}
    </div>
  )
}

/* ================= STYLES ================= */

const nav = {
  position: "sticky",
  top: 0,
  zIndex: 1000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  background: "#020617",
  borderBottom: "1px solid #1e293b"
}

const brand = {
  fontWeight: 700,
  letterSpacing: 0.5
}

const avatarBtn = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e5e7eb",
  cursor: "pointer"
}

const dropdown = {
  position: "absolute",
  right: 0,
  top: 44,
  width: 220,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
}

const dropdownHeader = {
  padding: 12,
  borderBottom: "1px solid #1e293b"
}

const item = {
  padding: "10px 12px",
  cursor: "pointer"
}

const divider = {
  height: 1,
  background: "#1e293b",
  margin: "6px 0"
}