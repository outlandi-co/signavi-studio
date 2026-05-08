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
          "🛟 SUPPORT EVENT RECEIVED:",
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
          adminUser?.role
            ? "admin"
            : customerUser
              ? "customer"
              : "guest"

        console.log(
          "👤 CURRENT ROLE:",
          currentRole
        )

        console.log(
          "📨 EVENT SENDER:",
          sender
        )

        /* ================= IGNORE SELF ================= */

        if (
          sender === currentRole
        ) {

          console.log(
            "🚫 Ignoring own notification"
          )

          return
        }

        console.log(
          "✅ APPLYING NOTIFICATION"
        )

        /* ================= UPDATE BADGE ================= */

        setSupportUnread(prev => {

          const updated =
            Number(prev || 0) + 1

          console.log(
            "🔴 SUPPORT UNREAD:",
            updated
          )

          return updated
        })

        /* ================= ALERTS ================= */

        setAlerts(prev => [

          {
            id: Date.now(),

            type: "support",

            message:
              data?.message ||
              "New support activity",

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

          const updated =
            Number(prev || 0) + 1

          console.log(
            "📧 EMAIL UNREAD:",
            updated
          )

          return updated
        })

        setAlerts(prev => [

          {
            id: Date.now(),

            type: "email",

            message:
              data?.message ||
              "New email received",

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