import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import api from "../services/api"

// 🔥 CONNECT TO BACKEND
const socket = io("http://localhost:5050")

function Dashboard() {

  const [jobs, setJobs] = useState([])

  const loadJobs = async () => {
    try {
      const res = await api.get("/production")
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {

    loadJobs()

    // 🔥 SOCKET EVENTS
    socket.on("jobCreated", (job) => {
      setJobs(prev => [job, ...prev])
    })

    socket.on("jobUpdated", (job) => {
      setJobs(prev =>
        prev.map(j => j._id === job._id ? job : j)
      )
    })

    socket.on("jobDeleted", (id) => {
      setJobs(prev =>
        prev.filter(j => j._id !== id)
      )
    })

    return () => {
      socket.off("jobCreated")
      socket.off("jobUpdated")
      socket.off("jobDeleted")
    }

  }, [])

  return (
    <div>

      <h1>Production Dashboard</h1>

      {jobs.map(job => (

        <div
          key={job._id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{job.product}</h3>
          <p>{job.customerName}</p>
          <p>Status: {job.status}</p>
        </div>

      ))}

    </div>
  )
}

export default Dashboard