import { useEffect, useRef, useState } from "react"

export default function TopNav({ user, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  const handleNavigate = (section) => {
    onNavigate?.(section)
    setOpen(false)
  }

  const handleLogout = () => {
    onLogout?.()
    setOpen(false)
  }

  return (
    <div style={nav}>
      <button
        type="button"
        onClick={() => handleNavigate("dashboard")}
        style={brandButton}
        aria-label="Go to dashboard"
      >
        <span style={brandMark}>S</span>
        <span style={brandText}>SignaVi</span>
      </button>

      <div ref={ref} style={accountWrapper}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={avatarBtn}
          title="Account"
          aria-label="Open account menu"
          aria-expanded={open}
        >
          {initials}
        </button>

        {open && (
          <div style={dropdown}>
            <div style={dropdownHeader}>
              <div style={userName}>{user?.name || "User"}</div>

              {user?.email && (
                <div style={userEmail}>{user.email}</div>
              )}
            </div>

            <MenuItem onClick={() => handleNavigate("orders")}>
              📦 My Orders
            </MenuItem>

            <MenuItem onClick={() => handleNavigate("history")}>
              🔁 Reorders
            </MenuItem>

            <MenuItem onClick={() => handleNavigate("security")}>
              🔐 Security
            </MenuItem>

            <MenuItem onClick={() => handleNavigate("support")}>
              🛟 Support
            </MenuItem>

            <div style={divider} />

            <MenuItem onClick={handleLogout} danger>
              🚪 Logout
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({ children, onClick, danger = false }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...item,
        color: danger ? "#f87171" : "#e5e7eb",
        background: hovered
          ? danger
            ? "rgba(248, 113, 113, 0.12)"
            : "rgba(6, 182, 212, 0.12)"
          : "transparent",
      }}
    >
      {children}
    </button>
  )
}

const nav = {
  position: "sticky",
  top: 0,
  zIndex: 1000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  background: "rgba(2, 6, 23, 0.94)",
  borderBottom: "1px solid #1e293b",
  backdropFilter: "blur(14px)",
}

const brandButton = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "transparent",
  border: "none",
  color: "#ffffff",
  cursor: "pointer",
  padding: 0,
}

const brandMark = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #06b6d4, #2563eb)",
  color: "#ffffff",
  fontWeight: 800,
  boxShadow: "0 0 20px rgba(6, 182, 212, 0.35)",
}

const brandText = {
  fontWeight: 800,
  letterSpacing: 0.5,
  fontSize: 18,
}

const accountWrapper = {
  position: "relative",
}

const avatarBtn = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 800,
}

const dropdown = {
  position: "absolute",
  right: 0,
  top: 48,
  width: 240,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
}

const dropdownHeader = {
  padding: 14,
  borderBottom: "1px solid #1e293b",
}

const userName = {
  color: "#ffffff",
  fontWeight: 700,
}

const userEmail = {
  marginTop: 4,
  color: "#94a3b8",
  fontSize: 12,
  wordBreak: "break-word",
}

const item = {
  width: "100%",
  padding: "11px 14px",
  cursor: "pointer",
  border: "none",
  textAlign: "left",
  fontSize: 14,
  transition: "background 0.2s ease",
}

const divider = {
  height: 1,
  background: "#1e293b",
  margin: "6px 0",
}