import {
  useEffect,
  useRef,
  useState
} from "react"

import { io } from "socket.io-client"

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "https://signavi-backend.onrender.com"

export default function NotificationPanel({
  onSelectJob
}) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  const socketRef = useRef(null)

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const addNotification = (
      message,
      job = null,
      type = "info"
    ) => {
      setNotifications((prev) => [
        {
          id:
            typeof crypto !== "undefined" &&
            crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,
          message,
          job,
          type,
          createdAt: new Date().toISOString()
        },
        ...prev.slice(0, 9)
      ])
    }

    const handleJobCreated = (job) => {
      addNotification(
        `🆕 New Job: ${job?.customerName || "Guest"}`,
        job,
        "created"
      )
    }

    const handleJobUpdated = (job) => {
      addNotification(
        `🔄 Updated: ${job?.customerName || "Guest"} → ${job?.status || "updated"}`,
        job,
        "updated"
      )
    }

    const handlePricingUpdated = () => {
      addNotification(
        "💰 Pricing updated",
        null,
        "pricing"
      )
    }

    socket.on("jobCreated", handleJobCreated)
    socket.on("jobUpdated", handleJobUpdated)
    socket.on("pricingUpdated", handlePricingUpdated)

    return () => {
      socket.off("jobCreated", handleJobCreated)
      socket.off("jobUpdated", handleJobUpdated)
      socket.off("pricingUpdated", handlePricingUpdated)
    }
  }, [])

  const clearNotifications = () => {
    setNotifications([])
  }

  const handleSelect = (notification) => {
    if (!notification.job) return

    onSelectJob?.(notification.job)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={bellButton}
      >
        🔔 {notifications.length}
      </button>

      {open && (
        <aside style={panel}>
          <div style={header}>
            <h3 style={title}>
              Notifications
            </h3>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                style={clearButton}
              >
                Clear
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={emptyText}>
              No activity yet
            </p>
          ) : (
            <div style={list}>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleSelect(notification)}
                  style={{
                    ...item,
                    cursor: notification.job
                      ? "pointer"
                      : "default"
                  }}
                >
                  <p style={message}>
                    {notification.message}
                  </p>

                  <small style={time}>
                    {new Date(
                      notification.createdAt
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </small>
                </button>
              ))}
            </div>
          )}
        </aside>
      )}
    </>
  )
}

const bellButton = {
  position: "fixed",
  top: 20,
  right: 20,
  background: "#0ea5e9",
  border: "none",
  padding: "10px 15px",
  borderRadius: 12,
  color: "white",
  cursor: "pointer",
  zIndex: 1000,
  fontWeight: 900,
  boxShadow: "0 12px 30px rgba(14,165,233,0.25)"
}

const panel = {
  position: "fixed",
  top: 64,
  right: 20,
  width: 340,
  maxHeight: 500,
  overflowY: "auto",
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 14,
  zIndex: 1000,
  color: "white",
  boxShadow: "0 24px 70px rgba(0,0,0,0.45)"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 12
}

const title = {
  margin: 0
}

const clearButton = {
  background: "#0f172a",
  color: "#94a3b8",
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "6px 10px",
  cursor: "pointer",
  fontWeight: 800
}

const emptyText = {
  color: "#64748b",
  margin: 0
}

const list = {
  display: "grid",
  gap: 8
}

const item = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  background: "#0f172a",
  border: "1px solid #1e293b",
  textAlign: "left",
  color: "white"
}

const message = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.4
}

const time = {
  display: "block",
  marginTop: 6,
  color: "#94a3b8",
  fontSize: 11
}