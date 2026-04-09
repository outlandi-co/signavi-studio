import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const socket = io("https://signavi-backend.onrender.com")

export default function NotificationPanel({ onSelectJob }) {

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  /* ================= SOCKET ================= */
  useEffect(() => {

    const addNotification = (msg, job = null) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          message: msg,
          job
        },
        ...prev.slice(0, 9) // keep last 10
      ])
    }

    socket.on("jobCreated", (job) => {
      addNotification(`🆕 New Job: ${job.customerName}`, job)
    })

    socket.on("jobUpdated", (job) => {
      addNotification(`🔄 Updated: ${job.customerName} → ${job.status}`, job)
    })

    socket.on("pricingUpdated", () => {
      addNotification(`💰 Pricing updated`)
    })

    return () => {
      socket.off("jobCreated")
      socket.off("jobUpdated")
      socket.off("pricingUpdated")
    }

  }, [])

  return (
    <>
      {/* 🔔 BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "#0ea5e9",
          border: "none",
          padding: "10px 15px",
          borderRadius: 10,
          color: "white",
          cursor: "pointer",
          zIndex: 1000
        }}
      >
        🔔 {notifications.length}
      </button>

      {/* PANEL */}
      {open && (
        <div style={{
          position: "fixed",
          top: 60,
          right: 20,
          width: 320,
          maxHeight: 500,
          overflowY: "auto",
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: 12,
          padding: 10,
          zIndex: 1000
        }}>

          <h3 style={{ color: "white", marginBottom: 10 }}>
            Notifications
          </h3>

          {notifications.length === 0 && (
            <p style={{ color: "#64748b" }}>
              No activity yet
            </p>
          )}

          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => n.job && onSelectJob?.(n.job)}
              style={{
                padding: 10,
                marginBottom: 8,
                borderRadius: 8,
                background: "#0f172a",
                cursor: n.job ? "pointer" : "default",
                border: "1px solid #1e293b"
              }}
            >
              <p style={{ color: "white", fontSize: 14 }}>
                {n.message}
              </p>
            </div>
          ))}

        </div>
      )}
    </>
  )
}