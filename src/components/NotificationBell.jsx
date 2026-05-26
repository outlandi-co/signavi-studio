import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import notifySound from "../assets/notify.mp3"

import {
  getSocket
} from "../services/socket"

import {
  NotificationContext
} from "../context/NotificationContextObject"

const safeParse = (key) => {
  try {
    return JSON.parse(
      localStorage.getItem(key) || "null"
    )
  } catch (err) {
    console.error(`❌ ${key} PARSE ERROR:`, err)
    return null
  }
}

const formatStatus = (status = "") => {
  return String(status || "updated")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function NotificationBell() {
  const {
    supportUnread = 0,
    emailUnread = 0
  } = useContext(NotificationContext)

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  const audioRef = useRef(null)
  const dropdownRef = useRef(null)

  const user = useMemo(() => {
    const adminUser = safeParse("adminUser")
    const customerUser = safeParse("customerUser")

    return adminUser || customerUser || null
  }, [])

  const userEmail =
    user?.email || ""

  const playSound = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.currentTime = 0

    audioRef.current
      .play()
      .catch(() => {})
  }, [])

  const addNotification = useCallback(
    (text, type = "info") => {
      const newNotification = {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,

        text,
        type,
        time:
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
      }

      setNotifications((prev) => [
        newNotification,
        ...prev.slice(0, 9)
      ])

      playSound()
    },
    [playSound]
  )

  useEffect(() => {
    if (!userEmail) return undefined

    let socketRef = null
    let mounted = true

    const handleJobUpdated = (job) => {
      if (job?.email && job.email !== userEmail) return

      addNotification(
        `Order updated: ${formatStatus(job?.status)}`,
        "order"
      )
    }

    const handleJobCreated = (job) => {
      if (job?.email && job.email !== userEmail) return

      addNotification(
        "Your order was created",
        "order"
      )
    }

    const handleJobDeleted = (job) => {
      if (job?.email && job.email !== userEmail) return

      addNotification(
        "Order removed",
        "order"
      )
    }

    const handleSupportMessage = (data) => {
      addNotification(
        data?.message ||
          "New support reply",
        "support"
      )
    }

    const handleEmailNew = (data) => {
      addNotification(
        data?.message ||
          "New email received",
        "email"
      )
    }

    const init = async () => {
      const socket = await getSocket()

      if (!mounted) return

      if (!socket) {
        console.warn("⚠️ SOCKET FAILED")
        return
      }

      socketRef = socket

      socket.on("jobUpdated", handleJobUpdated)
      socket.on("jobCreated", handleJobCreated)
      socket.on("jobDeleted", handleJobDeleted)
      socket.on("support:new-message", handleSupportMessage)
      socket.on("email:new", handleEmailNew)
    }

    const timer = setTimeout(() => {
      init()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)

      socketRef?.off("jobUpdated", handleJobUpdated)
      socketRef?.off("jobCreated", handleJobCreated)
      socketRef?.off("jobDeleted", handleJobDeleted)
      socketRef?.off("support:new-message", handleSupportMessage)
      socketRef?.off("email:new", handleEmailNew)
    }
  }, [
    userEmail,
    addNotification
  ])

  useEffect(() => {
    if (!open) return undefined

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [open])

  const unreadCount =
    notifications.length +
    Number(supportUnread || 0) +
    Number(emailUnread || 0)

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={notifySound}
        preload="auto"
      />

      <div
        ref={dropdownRef}
        style={wrapper}
      >
        <button
          type="button"
          onClick={() =>
            setOpen((prev) => !prev)
          }
          style={bell}
          aria-label="Open notifications"
        >
          🔔

          {unreadCount > 0 && (
            <span style={badge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div style={dropdown}>
            <div style={dropdownHeader}>
              <h4 style={dropdownTitle}>
                Notifications
              </h4>

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

            <div style={summaryBox}>
              <span>
                Support: {supportUnread}
              </span>

              <span>
                Email: {emailUnread}
              </span>
            </div>

            {notifications.length === 0 ? (
              <p style={emptyText}>
                No live notifications yet.
              </p>
            ) : (
              <div style={list}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={item}
                  >
                    <p style={itemText}>
                      {notification.text}
                    </p>

                    <small style={time}>
                      {notification.time}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

const wrapper = {
  position: "relative"
}

const bell = {
  cursor: "pointer",
  fontSize: 20,
  position: "relative",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#020617",
  border: "1px solid #1e293b",
  color: "white"
}

const badge = {
  position: "absolute",
  top: -6,
  right: -6,
  background: "#ef4444",
  color: "white",
  borderRadius: 999,
  minWidth: 20,
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: "bold",
  padding: "0 6px"
}

const dropdown = {
  position: "absolute",
  right: 0,
  top: 46,
  width: 310,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 14,
  zIndex: 999,
  color: "white",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)"
}

const dropdownHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 10
}

const dropdownTitle = {
  margin: 0
}

const clearButton = {
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#94a3b8",
  borderRadius: 999,
  padding: "5px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800
}

const summaryBox = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: "8px 10px",
  color: "#94a3b8",
  fontSize: 12,
  marginBottom: 10
}

const emptyText = {
  opacity: 0.65,
  margin: "14px 0 4px",
  fontSize: 13
}

const list = {
  display: "grid",
  gap: 8,
  maxHeight: 320,
  overflowY: "auto"
}

const item = {
  padding: 10,
  borderRadius: 12,
  background: "#0f172a",
  border: "1px solid #1e293b",
  fontSize: 13
}

const itemText = {
  margin: 0,
  lineHeight: 1.4
}

const time = {
  display: "block",
  marginTop: 6,
  fontSize: 10,
  opacity: 0.6
}