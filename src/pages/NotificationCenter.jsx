import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const filters = [
  "all",
  "order",
  "payment",
  "admin",
  "system"
]

const getToken = () => {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("adminToken") ||
    sessionStorage.getItem("customerToken") ||
    sessionStorage.getItem("token") ||
    ""
  )
}

const normalizeNotifications = (payload) => {
  const data =
    payload?.data ||
    payload?.notifications ||
    payload ||
    []

  return Array.isArray(data) ? data : []
}

const getColorClass = (type = "system") => {
  switch (type) {
    case "order":
      return "border-l-emerald-500"

    case "payment":
      return "border-l-blue-500"

    case "admin":
      return "border-l-yellow-500"

    case "system":
      return "border-l-slate-500"

    default:
      return "border-l-cyan-500"
  }
}

const getNotificationTarget = (notification = {}) => {
  if (notification.orderId) {
    return `/order/${notification.orderId}`
  }

  if (notification.quoteId) {
    return `/quote/${notification.quoteId}`
  }

  if (notification.ticketId) {
    return `/support/${notification.ticketId}`
  }

  if (notification.url) {
    return notification.url
  }

  return ""
}

export default function NotificationCenter() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError("")

      const token = getToken()

      const res = await api.get("/notifications", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {}
      })

      setNotifications(normalizeNotifications(res.data))
    } catch (err) {
      console.error("❌ LOAD NOTIFICATIONS ERROR:", err.response?.data || err)

      setNotifications([])
      setError("Failed to load notifications")
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return notifications

    return notifications.filter(
      (notification) => notification.type === filter
    )
  }, [filter, notifications])

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.read
    ).length
  }, [notifications])

  const markAllRead = async () => {
    try {
      const token = getToken()

      await api.put(
        "/notifications/read",
        {},
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        }
      )

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true
        }))
      )

      toast.success("Notifications marked read")
    } catch (err) {
      console.error("❌ MARK READ ERROR:", err.response?.data || err)
      toast.error("Could not mark notifications read")
    }
  }

  const handleOpen = (notification) => {
    const target = getNotificationTarget(notification)

    if (!target) return

    if (target.startsWith("http")) {
      window.open(target, "_blank")
      return
    }

    navigate(target)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading notifications...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              🔔 Notifications
            </h1>

            <p className="mt-3 text-slate-400">
              {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={!notifications.length}
            className="rounded-full bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark All Read
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? "rounded-full border border-cyan-400 bg-cyan-400 px-5 py-2 font-bold capitalize text-black"
                  : "rounded-full border border-slate-700 bg-[#020617] px-5 py-2 font-semibold capitalize text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
              }
            >
              {item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
            <h2 className="mb-3 text-2xl font-bold">
              No Notifications
            </h2>

            <p className="text-slate-400">
              New order, payment, admin, and system updates will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleOpen(notification)}
                className={`w-full rounded-3xl border border-slate-800 border-l-4 bg-slate-950/80 p-5 text-left shadow-xl shadow-black/20 transition hover:border-cyan-500 ${
                  getColorClass(notification.type)
                } ${
                  notification.read
                    ? "opacity-75"
                    : "bg-slate-900"
                }`}
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="font-bold text-white">
                      {notification.text ||
                        notification.message ||
                        "Notification"}
                    </p>

                    <p className="mt-2 text-sm capitalize text-slate-500">
                      {notification.type || "system"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    {!notification.read && (
                      <span className="mb-2 inline-block rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-black">
                        New
                      </span>
                    )}

                    <p className="text-sm text-slate-500">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : "No date"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}