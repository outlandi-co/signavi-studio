import { useEffect, useState } from "react"
import api from "../../services/api"

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications")

        if (!mounted) return

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []

        setNotifications(data)
      } catch (err) {
        console.error("❌ LOAD NOTIFICATIONS ERROR:", err)

        if (mounted) {
          setNotifications([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      loadNotifications()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (err) {
      console.error("❌ MARK READ ERROR:", err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      )
    } catch (err) {
      console.error("❌ DELETE NOTIFICATION ERROR:", err)
    }
  }

  if (loading) {
    return (
      <main style={page}>
        <p style={muted}>Loading notifications...</p>
      </main>
    )
  }

  return (
    <main style={page}>
      <div style={header}>
        <div>
          <p style={eyebrow}>Admin Center</p>

          <h1 style={title}>🔔 Notifications</h1>

          <p style={subtitle}>
            Track customer activity, support updates, email alerts, and order
            events.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={emptyCard}>
          No notifications yet.
        </div>
      ) : (
        <div style={list}>
          {notifications.map((notification) => (
            <article
              key={notification._id}
              style={{
                ...card,
                borderColor: notification.read
                  ? "#1e293b"
                  : "#22d3ee",
              }}
            >
              <div>
                <p style={type}>
                  {notification.type || "notification"}
                </p>

                <h2 style={message}>
                  {notification.message || "New notification"}
                </h2>

                <p style={date}>
                  {notification.createdAt
                    ? new Date(notification.createdAt).toLocaleString()
                    : "No date"}
                </p>
              </div>

              <div style={actions}>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification._id)}
                    style={readButton}
                  >
                    Mark Read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteNotification(notification._id)}
                  style={deleteButton}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "#ffffff",
  padding: 30,
}

const header = {
  marginBottom: 28,
}

const eyebrow = {
  margin: "0 0 8px",
  color: "#22d3ee",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
}

const title = {
  margin: 0,
  fontSize: 34,
}

const subtitle = {
  marginTop: 10,
  color: "#94a3b8",
  maxWidth: 680,
}

const list = {
  display: "grid",
  gap: 14,
}

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
}

const type = {
  margin: "0 0 6px",
  color: "#22d3ee",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
}

const message = {
  margin: 0,
  fontSize: 18,
}

const date = {
  margin: "8px 0 0",
  color: "#94a3b8",
  fontSize: 13,
}

const actions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
}

const readButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
}

const deleteButton = {
  background: "#ef4444",
  color: "#ffffff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
}

const emptyCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 24,
  color: "#94a3b8",
}

const muted = {
  color: "#94a3b8",
}