import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function AdminInbox() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications")
      setNotifications(res.data.data || [])
    } catch (error) {
      console.error("LOAD INBOX ERROR:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/notifications")

        if (mounted) {
          setNotifications(res.data.data || [])
        }
      } catch (error) {
        console.error("LOAD INBOX ERROR:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const openNotification = async (item) => {
    if (!item?.link) return

    if (!item.read) {
      try {
        await api.patch(`/notifications/${item._id}/read`)
      } catch (error) {
        console.error("MARK READ BEFORE OPEN ERROR:", error)
      }
    }

    navigate(item.link)
  }

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    await loadNotifications()
  }

  const archiveNotification = async (id) => {
    await api.patch(`/notifications/${id}/archive`)
    await loadNotifications()
  }

  const markAllRead = async () => {
    await api.patch("/notifications/read-all")
    await loadNotifications()
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={heading}>Inbox</h1>
          <p style={subheading}>
            Payments, final proof approvals, and admin alerts.
          </p>
        </div>

        <button type="button" onClick={markAllRead} style={button}>
          Mark All Read
        </button>
      </div>

      {loading ? (
        <p>Loading inbox...</p>
      ) : notifications.length === 0 ? (
        <div style={emptyCard}>
          <h2>No notifications yet</h2>
          <p>Payment and proof approval alerts will show here.</p>
        </div>
      ) : (
        <div style={list}>
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => openNotification(item)}
              role={item.link ? "button" : "article"}
              tabIndex={item.link ? 0 : -1}
              onKeyDown={(e) => {
                if (
                  item.link &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault()
                  openNotification(item)
                }
              }}
              style={{
                ...card,
                cursor: item.link ? "pointer" : "default",
                borderColor: item.read ? "#1e293b" : "#22d3ee",
                borderLeft:
                  item.type === "payment"
                    ? "5px solid #22c55e"
                    : item.type === "proof"
                      ? "5px solid #3b82f6"
                      : item.type === "invoice"
                        ? "5px solid #f59e0b"
                        : item.type === "order"
                          ? "5px solid #a78bfa"
                          : "5px solid #64748b",
                opacity: item.read ? 0.78 : 1
              }}
            >
              <div style={cardTop}>
                <span style={typeBadge}>
                  {getIcon(item.type)} {item.type || "system"}
                </span>

                {!item.read && <span style={unreadBadge}>Unread</span>}
              </div>

              <h2 style={cardTitle}>
                {item.title || "Notification"}
              </h2>

              <p style={text}>{item.text}</p>

              {item.link && (
                <p style={openText}>
                  Open →
                </p>
              )}

              <p style={date}>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ""}
              </p>

              <div style={actions}>
                {item.link && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openNotification(item)
                    }}
                    style={linkButton}
                  >
                    Open
                  </button>
                )}

                {!item.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      markRead(item._id)
                    }}
                    style={smallButton}
                  >
                    Mark Read
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    archiveNotification(item._id)
                  }}
                  style={archiveButton}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getIcon(type) {
  if (type === "payment") return "💳"
  if (type === "proof") return "✅"
  if (type === "invoice") return "🧾"
  if (type === "order") return "📦"
  if (type === "production") return "🏭"
  return "📥"
}

const page = {
  color: "#e5e7eb"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 28
}

const heading = {
  fontSize: 36,
  fontWeight: 900,
  margin: 0
}

const subheading = {
  color: "#94a3b8",
  margin: "8px 0 0"
}

const button = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer"
}

const emptyCard = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 28
}

const list = {
  display: "grid",
  gap: 16
}

const card = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 22,
  transition: "0.2s ease"
}

const cardTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12
}

const typeBadge = {
  color: "#22d3ee",
  fontWeight: 900,
  textTransform: "capitalize"
}

const unreadBadge = {
  background: "#ef4444",
  color: "#fff",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 900
}

const cardTitle = {
  margin: "0 0 8px",
  fontSize: 22
}

const text = {
  color: "#cbd5e1",
  lineHeight: 1.6
}

const openText = {
  marginTop: 12,
  color: "#38bdf8",
  fontWeight: 900,
  fontSize: 14
}

const date = {
  color: "#64748b",
  fontSize: 13
}

const actions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 16
}

const linkButton = {
  background: "#22d3ee",
  color: "#020617",
  border: "none",
  textDecoration: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}

const smallButton = {
  background: "#a78bfa",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}

const archiveButton = {
  background: "#334155",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer"
}