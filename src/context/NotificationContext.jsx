```jsx
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

  /* ================= STATE ================= */

  const [
    supportUnread,
    setSupportUnread
  ] = useState(0)

  const [
    emailUnread,
    setEmailUnread
  ] = useState(0)

  const [
    alerts,
    setAlerts
  ] = useState([])

  /* ================= SAFE STORAGE ================= */

  const getStoredUser = (key) => {

    try {

      const raw =
        localStorage.getItem(key)

      return raw
        ? JSON.parse(raw)
        : null

    } catch (err) {

      console.warn(
        "Failed parsing storage:",
        key,
        err
      )

      return null
    }
  }

  /* ================= ALERT ADDER ================= */

  const addAlert = (
    type,
    message
  ) => {

    const newAlert = {

      id:
        crypto.randomUUID(),

      type,

      message,

      timestamp:
        Date.now()
    }

    setAlerts(prev => {

      const updated = [
        newAlert,
        ...prev
      ]

      return updated.slice(0, 20)
    })
  }

  /* ================= SOCKET ================= */

  useEffect(() => {

    console.log(
      "NotificationProvider mounted"
    )

    const socket =
      getSocket()

    if (!socket) {

      console.warn(
        "Socket failed"
      )

      return
    }

    console.log(
      "Socket ready"
    )

    /* ================= SUPPORT ================= */

    const handleSupport =
      (data) => {

        console.log(
          "Support socket event:",
          data
        )

        const sender =
          String(
            data?.sender || ""
          )
            .trim()
            .toLowerCase()

        const adminUser =
          getStoredUser(
            "adminUser"
          )

        const customerUser =
          getStoredUser(
            "customerUser"
          )

        let currentRole =
          "guest"

        if (
          adminUser?.role === "admin"
        ) {

          currentRole =
            "admin"
        }

        else if (
          customerUser
        ) {

          currentRole =
            "customer"
        }

        console.log(
          "Current role:",
          currentRole
        )

        console.log(
          "Sender:",
          sender
        )

        /* ================= IGNORE OWN ================= */

        if (
          sender === currentRole
        ) {

          console.log(
            "Ignoring own message"
          )

          return
        }

        /* ================= UPDATE ================= */

        setSupportUnread(
          prev => prev + 1
        )

        addAlert(
          "support",
          data?.message ||
          "New support reply"
        )
      }

    /* ================= EMAIL ================= */

    const handleEmail =
      (data) => {

        console.log(
          "Email socket event:",
          data
        )

        setEmailUnread(
          prev => prev + 1
        )

        addAlert(
          "email",
          data?.message ||
          "New email received"
        )
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

    console.log(
      "Socket listeners attached"
    )

    /* ================= CLEANUP ================= */

    return () => {

      console.log(
        "Removing socket listeners"
      )

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

  /* ================= CONTEXT ================= */

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
```
