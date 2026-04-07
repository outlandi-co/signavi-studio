import { useEffect, useState, useRef, useMemo } from "react"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom"
import notifySound from "../assets/notify.mp3"

const SOCKET_URL = "http://localhost:5050"

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  const audioRef = useRef(null)
  const socketRef = useRef(null)
  const navigate = useNavigate()

  /* 🔥 SAFE USER (ADMIN + CUSTOMER SPLIT) */
  const { userEmail } = useMemo(() => {
    try {
      const admin = JSON.parse(localStorage.getItem("adminUser") || "null")
      const customer = JSON.parse(localStorage.getItem("customerUser") || "null")

      return {
        userEmail: customer?.email || admin?.email || null
      }
    } catch {
      return { userEmail: null }
    }
  }, [])

  /* ================= ADD ================= */
  const addNotification = (job, text) => {
    const newNotif = {
      id: Date.now(),
      orderId: job._id,
      text,
      time: new Date().toLocaleTimeString(),
      read: false
    }

    setNotifications(prev => [newNotif, ...prev.slice(0, 9)])

    /* 🔊 SAFE AUDIO */
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      } catch {
        // silent fail (no audio file or blocked autoplay)
      }
    }
  }

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!userEmail) return

    /* 🔥 CREATE ONLY ONCE */
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true
      })
    }

    const socket = socketRef.current

    const handleUpdate = (job) => {
      if (job.email !== userEmail) return
      addNotification(job, `📦 Order updated → ${job.status}`)
    }

    const handleCreate = (job) => {
      if (job.email !== userEmail) return
      addNotification(job, "🆕 Your order was created")
    }

    const handleDelete = (job) => {
      if (job.email !== userEmail) return
      addNotification(job, "🗑 Order removed")
    }

    socket.on("connect", () => {
      console.log("🔔 Socket connected:", socket.id)
    })

    socket.on("jobUpdated", handleUpdate)
    socket.on("jobCreated", handleCreate)
    socket.on("jobDeleted", handleDelete)

    /* 🔥 CLEAN LISTENERS ONLY (NOT SOCKET) */
    return () => {
      socket.off("jobUpdated", handleUpdate)
      socket.off("jobCreated", handleCreate)
      socket.off("jobDeleted", handleDelete)
    }

  }, [userEmail])

  /* ================= CLICK ================= */
  const handleClick = (notif) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notif.id ? { ...n, read: true } : n
      )
    )

    if (notif.orderId) {
      navigate(`/order/${notif.orderId}`)
    }

    setOpen(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* 🔊 AUDIO */}
      <audio ref={audioRef} src={notifySound} preload="auto" />

      <div style={{ position: "relative" }}>

        {/* 🔔 BELL */}
        <div onClick={() => setOpen(!open)} style={bell}>
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
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  ...item,
                  background: n.read ? "#020617" : "#1e293b",
                  cursor: "pointer"
                }}
              >
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
  marginBottom: 6,
  fontSize: 13
}

const time = {
  fontSize: 10,
  opacity: 0.6
}