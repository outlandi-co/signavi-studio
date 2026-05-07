import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  NotificationContext
} from "./NotificationContextObject"

import {
  getSocket
} from "../services/socket"

export function NotificationProvider({
  children
}) {

  const [supportUnread, setSupportUnread] =
    useState(0)

  const [emailUnread, setEmailUnread] =
    useState(0)

  const [alerts, setAlerts] =
    useState([])

  /* ================= SOCKET ================= */

  useEffect(() => {

    console.log(
      "🟡 NotificationProvider mounted"
    )

    const socket =
      getSocket()

    if (!socket) {

      console.warn(
        "❌ SOCKET FAILED"
      )

      return
    }

    console.log(
      "✅ SOCKET INSTANCE READY"
    )

    /* ================= SUPPORT ================= */

    const handleSupport =
      (data) => {

        console.log(
          "🛟 SUPPORT EVENT:",
          data
        )

        setSupportUnread(prev =>
          prev + 1
        )

        setAlerts(prev => [

          {
            type: "support",

            message:
              data.message,

            timestamp:
              Date.now()
          },

          ...prev
        ])
      }

    /* ================= EMAIL ================= */

    const handleEmail =
      (data) => {

        console.log(
          "📧 EMAIL EVENT:",
          data
        )

        setEmailUnread(prev =>
          prev + 1
        )

        setAlerts(prev => [

          {
            type: "email",

            message:
              data.message,

            timestamp:
              Date.now()
          },

          ...prev
        ])
      }

    socket.on(
      "support:new-message",
      handleSupport
    )

    socket.on(
      "email:new",
      handleEmail
    )

    /* ================= CLEANUP ================= */

    return () => {

      socket.off(
        "support:new-message",
        handleSupport
      )

      socket.off(
        "email:new",
        handleEmail
      )
    }

  }, [])

  /* ================= CLEAR ================= */

  const clearSupportUnread =
    () => {

      setSupportUnread(0)
    }

  const clearEmailUnread =
    () => {

      setEmailUnread(0)
    }

  const value = useMemo(() => ({

    supportUnread,

    emailUnread,

    alerts,

    clearSupportUnread,

    clearEmailUnread

  }), [

    supportUnread,

    emailUnread,

    alerts
  ])

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  )
}