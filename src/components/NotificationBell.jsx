import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:5050"

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  const addNotification = (text) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        text,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ])
  }

  useEffect(() => {
    const socket = io(SOCKET_URL)

    socket.on("jobUpdated", (job) => {
      addNotification(`Order updated: ${job.status}`)
    })

    socket.on("jobCreated", () => {
      addNotification("New order created")
    })

    socket.on("jobDeleted", () => {
      addNotification("Order removed")
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", fontSize: 20 }}
      >
        🔔
      </div>

      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: 30,
          width: 250,
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: 8,
          padding: 10
        }}>
          {notifications.map(n => (
            <div key={n.id}>
              <p>{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}