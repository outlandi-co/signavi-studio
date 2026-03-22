import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import { io } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")
const FILE_URL = SOCKET_URL + "/uploads/"

function JobDetail() {

  const { id } = useParams()
  const [job, setJob] = useState(null)

  useEffect(() => {

    const loadJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`)
        setJob(res.data)
      } catch (error) {
        console.error("❌ Failed to load job:", error)
      }
    }

    loadJob()

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    })

    socket.on("jobUpdated", loadJob)

    return () => socket.disconnect()

  }, [id])

  if (!job) return <p>Loading...</p>

  return (
    <div style={{ padding: "30px" }}>
      <h1>{job.product}</h1>
      <p>{job.customerName}</p>

      {job.artwork && (
        <img src={`${FILE_URL}${job.artwork}`} style={{ width: "300px" }} />
      )}
    </div>
  )
}

export default JobDetail