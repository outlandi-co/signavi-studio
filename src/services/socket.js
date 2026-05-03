import { io } from "socket.io-client"

let socket = null

export const getSocket = () => {
  if (socket) return socket

  const URL = import.meta.env.VITE_API_URL.replace("/api", "")

  socket = io(URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5
  })

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id)
  })

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected")
  })

  socket.on("connect_error", (err) => {
    console.warn("⚠️ Socket error:", err.message)
  })

  return socket
}