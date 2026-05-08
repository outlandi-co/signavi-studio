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

        upgrade: false,

        reconnection: true,

        reconnectionAttempts: Infinity,

        reconnectionDelay: 1000,

        timeout: 20000,

        autoConnect: true
      }
    )

    /* ================= CONNECT ================= */

    socket.on(
      "connect",
      () => {

        console.log(
          "🟢 SOCKET CONNECTED:",
          socket.id
        )
      }
    )

    /* ================= DISCONNECT ================= */

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          "🔴 SOCKET DISCONNECTED:",
          reason
        )
      }
    )

    /* ================= ERROR ================= */

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