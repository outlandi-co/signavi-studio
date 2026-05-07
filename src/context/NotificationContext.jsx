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

    console.log(
      "👂 Listening for support:new-message"
    )

    /* ================= SUPPORT ================= */

    const handleSupport =
      (data) => {

        console.log(
          "🛟 SUPPORT EVENT:",
          data
        )

        const sender =
          String(
            data?.sender || ""
          )
            .trim()
            .toLowerCase()

        const adminUser =
          JSON.parse(
            localStorage.getItem("adminUser")
          )

        const customerUser =
          JSON.parse(
            localStorage.getItem("customerUser")
          )

        const currentRole =
          adminUser
            ? "admin"
            : customerUser
              ? "customer"
              : null

        console.log(
          "👤 CURRENT ROLE:",
          currentRole
        )

        console.log(
          "📨 EVENT SENDER:",
          sender
        )

        /* ================= IGNORE OWN EVENTS ================= */

        if (
          sender &&
          sender === currentRole
        ) {

          console.log(
            "🚫 Ignoring self notification"
          )

          return
        }

        /* ================= UPDATE BADGE ================= */

        setSupportUnread(prev => {

          const next =
            prev + 1

          console.log(
            "🔴 SUPPORT UNREAD:",
            next
          )

          return next
        })

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

        setEmailUnread(prev => {

          const next =
            prev + 1

          console.log(
            "📧 EMAIL UNREAD:",
            next
          )

          return next
        })

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

    /* ================= LISTENERS ================= */

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

      console.log(
        "🧹 CLEAR SUPPORT BADGE"
      )

      setSupportUnread(0)
    }

  const clearEmailUnread =
    () => {

      console.log(
        "🧹 CLEAR EMAIL BADGE"
      )

      setEmailUnread(0)
    }

  /* ================= CONTEXT VALUE ================= */

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