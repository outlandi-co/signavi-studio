import { io } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL
const SOCKET_URL = API_URL.replace("/api", "")

let socket = null

export const getSocket = async () => {
  if (socket) return socket

  try {
    // 🔥 Wake backend (Render sleep fix)
    await fetch(API_URL)

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    })

    socket.on("connect", () => {
      console.log("✅ Socket connected")
    })

    socket.on("connect_error", () => {
      console.warn("⚠️ Socket failed — continuing without realtime")
    })

    return socket

  } catch (err) {
    console.error("❌ SOCKET INIT ERROR:", err)
  }
}