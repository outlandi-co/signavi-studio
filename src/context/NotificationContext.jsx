import { io } from "socket.io-client"

let socket = null

export const getSocket = () => {

  /* ================= REUSE ================= */

  if (socket) {

    return socket
  }

  /* ================= URL ================= */

  const URL = (
    import.meta.env.VITE_API_URL ||
    "https://signavi-backend.onrender.com/api"
  ).replace("/api", "")

  console.log(
    "🌐 SOCKET URL:",
    URL
  )

  /* ================= SOCKET ================= */

  socket = io(
    URL,
    {
      transports: ["websocket"],

      withCredentials: true,

      autoConnect: true,

      reconnection: true,

      reconnectionAttempts: 5,

      reconnectionDelay: 1000
    }
  )

  /* ================= CONNECT ================= */

  socket.on(
    "connect",
    () => {

      console.log(
        "🟢 Socket connected:",
        socket.id
      )
    }
  )

  /* ================= DISCONNECT ================= */

  socket.on(
    "disconnect",
    (reason) => {

      console.log(
        "🔴 Socket disconnected:",
        reason
      )
    }
  )

  /* ================= ERROR ================= */

  socket.on(
    "connect_error",
    (err) => {

      console.warn(
        "⚠️ Socket error:",
        err.message
      )
    }
  )

  /* ================= RECONNECT ================= */

  socket.io.on(
    "reconnect_attempt",
    (attempt) => {

      console.log(
        "🔄 Reconnect attempt:",
        attempt
      )
    }
  )

  socket.io.on(
    "reconnect",
    (attempt) => {

      console.log(
        "🟡 Socket reconnected:",
        attempt
      )
    }
  )

  return socket
}