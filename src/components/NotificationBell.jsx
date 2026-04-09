import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import notifySound from "../assets/notify.mp3"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "")

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  const audioRef = useRef(null)

  const user = JSON.parse(localStorage.getItem("user") || "null")
  const userEmail = user?.email // ✅ USED PROPERLY

  const addNotification = (text) => {
    const newNotif = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString()
    }

    setNotifications(prev => [newNotif, ...prev.slice(0, 9)])

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (!userEmail) return // 🔥 prevents unnecessary socket if no user

    const socket = io(SOCKET_URL)

    socket.on("jobUpdated", (job) => {
      if (job.email !== userEmail) return
      addNotification(`📦 Order updated → ${job.status}`)
    })

    socket.on("jobCreated", (job) => {
      if (job.email !== userEmail) return
      addNotification("🆕 Your order was created")
    })

    socket.on("jobDeleted", (job) => {
      if (job.email !== userEmail) return
      addNotification("🗑 Order removed")
    })

    return () => socket.disconnect()

  }, [userEmail]) // ✅ FIXED DEPENDENCY

  const unreadCount = notifications.length

  return (
    <>
      <audio ref={audioRef} src={notifySound} preload="auto" />

      <div style={{ position: "relative" }}>

        {/* 🔔 BELL */}
        <div
          onClick={() => setOpen(!open)}
          style={bell}
        >
          🔔

          {unreadCount > 0 && (
            <span style={badge}>{unreadCount}</span>
          )}
        </div>

        {/* DROPDOWN */}
        {open && (
          <div style={dropdown}>
            <h4 style={{ marginBottom: 10 }}>Notifications</h4>

            {notifications.length === 0 && (
              <p style={{ opacity: 0.6 }}>No notifications</p>
            )}

            {notifications.map(n => (
              <div key={n.id} style={item}>
                <p style={{ margin: 0 }}>{n.text}</p>
                <small style={time}>{n.time}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ================= STYLES ================= */

const bell = {
  cursor: "pointer",
  fontSize: 20,
  position: "relative",
  padding: "6px 10px",
  borderRadius: 6,
  background: "#020617",
  border: "1px solid #1e293b"
}

const badge = {
  position: "absolute",
  top: -6,
  right: -6,
  background: "#ef4444",
  color: "white",
  borderRadius: "50%",
  padding: "2px 6px",
  fontSize: 10
}

const dropdown = {
  position: "absolute",
  right: 0,
  top: 40,
  width: 260,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: 12,
  zIndex: 999
}

const item = {
  padding: 10,
  borderRadius: 6,
  background: "#0f172a",
  marginBottom: 6,
  fontSize: 13
}

const time = {
  fontSize: 10,
  opacity: 0.6
}