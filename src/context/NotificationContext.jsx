import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  NotificationContext,
} from "./NotificationContextObject"

import {
  getSocket,
} from "../services/socket"

const MAX_ALERTS = 20

function getStoredUser(key) {
  try {
    const raw = localStorage.getItem(key)

    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn("Failed parsing storage:", key, err)
    return null
  }
}

function getCurrentRole() {
  const adminUser = getStoredUser("adminUser")
  const customerUser = getStoredUser("customerUser")

  if (adminUser?.role === "admin") return "admin"
  if (customerUser) return "customer"

  return "guest"
}

function createAlert(type, message) {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: Date.now(),
  }
}

export function NotificationProvider({ children }) {
  const [supportUnread, setSupportUnread] = useState(0)
  const [emailUnread, setEmailUnread] = useState(0)
  const [alerts, setAlerts] = useState([])

  const addAlert = useCallback((type, message) => {
    const newAlert = createAlert(type, message)

    setAlerts((prev) => {
      const updated = [newAlert, ...prev]
      return updated.slice(0, MAX_ALERTS)
    })
  }, [])

  useEffect(() => {
    const socket = getSocket()

    if (!socket) {
      console.warn("Socket failed")
      return undefined
    }

    const handleSupport = (data) => {
      const sender = String(data?.sender || "")
        .trim()
        .toLowerCase()

      const currentRole = getCurrentRole()

      if (sender && sender === currentRole) {
        return
      }

      setSupportUnread((prev) => prev + 1)

      addAlert(
        "support",
        data?.message || "New support reply"
      )
    }

    const handleEmail = (data) => {
      setEmailUnread((prev) => prev + 1)

      addAlert(
        "email",
        data?.message || "New email received"
      )
    }

    socket.on("support:new-message", handleSupport)
    socket.on("email:new", handleEmail)

    return () => {
      socket.off("support:new-message", handleSupport)
      socket.off("email:new", handleEmail)
    }
  }, [addAlert])

  const clearSupportUnread = useCallback(() => {
    setSupportUnread(0)
  }, [])

  const clearEmailUnread = useCallback(() => {
    setEmailUnread(0)
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  const removeAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.filter((alert) => alert.id !== alertId)
    )
  }, [])

  const value = useMemo(
    () => ({
      supportUnread,
      emailUnread,
      alerts,
      clearSupportUnread,
      clearEmailUnread,
      clearAlerts,
      removeAlert,
    }),
    [
      supportUnread,
      emailUnread,
      alerts,
      clearSupportUnread,
      clearEmailUnread,
      clearAlerts,
      removeAlert,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}