import { io }
  from "socket.io-client"

let socket = null

export const getSocket =
  () => {

    if (socket) {

      return socket
    }

    const URL =
      (
        import.meta.env.VITE_API_URL ||
        "https://signavi-backend.onrender.com/api"
      ).replace(
        "/api",
        ""
      )

    console.log(
      "🌐 SOCKET URL:",
      URL
    )

    socket = io(
      URL,
      {

        transports: [
          "websocket"
        ],

        reconnection: true,

        reconnectionAttempts: 999,

        reconnectionDelay: 1000,

        autoConnect: true
      }
    )

    socket.on(
      "connect",
      () => {

        console.log(
          "🟢 Socket connected:",
          socket.id
        )
      }
    )

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          "🔴 Socket disconnected:",
          reason
        )
      }
    )

    socket.on(
      "connect_error",
      (err) => {

        console.error(
          "❌ SOCKET ERROR:",
          err.message
        )
      }
    )

    return socket
  }