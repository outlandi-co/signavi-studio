import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")
const FILE_URL = SOCKET_URL + "/uploads/"

const STATUS_COLUMNS = ["pending", "approved", "printing", "completed"]

const STATUS_COLORS = {
  pending: "#facc15",
  approved: "#38bdf8",
  printing: "#fb923c",
  completed: "#22c55e"
}

function ShopFloor() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadJobs = async () => {
      try {
        const res = await api.get("/jobs")
        setJobs(res.data)
      } catch (error) {
        console.error("❌ Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()

    /* 🔥 FIXED SOCKET */
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true
    })

    socket.on("connect", () => {
      console.log("🟢 ShopFloor connected:", socket.id)
    })

    socket.on("connect_error", (err) => {
      console.error("❌ SOCKET ERROR:", err.message)
    })

    socket.on("jobUpdated", loadJobs)

    return () => {
      socket.disconnect()
    }

  }, [])

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "white", background: "#111", height: "100vh" }}>
        Loading jobs...
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      gap: "20px",
      padding: "20px",
      height: "100vh",
      background: "#111",
      color: "white"
    }}>
      {STATUS_COLUMNS.map(status => {
        const columnJobs = jobs.filter(j => j.status === status)

        return (
          <div key={status} style={{
            flex: 1,
            background: "#1e293b",
            padding: "15px",
            borderRadius: "12px"
          }}>
            <h2 style={{
              textTransform: "uppercase",
              textAlign: "center",
              color: STATUS_COLORS[status]
            }}>
              {status} ({columnJobs.length})
            </h2>

            {columnJobs.map(job => (
              <div key={job._id} style={{
                background: "#020617",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "8px"
              }}>
                <strong>{job.product || "Custom Job"}</strong>
                <p>{job.customerName}</p>
                <p>Qty: {job.quantity}</p>

                {job.artwork && (
                  <img
                    src={`${FILE_URL}${job.artwork}`}
                    style={{ width: "100%", marginTop: "8px" }}
                  />
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default ShopFloor