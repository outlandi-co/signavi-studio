import { useCallback, useEffect, useState } from "react"
import api from "../services/api"

export default function MyJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const res = await api.get("/jobs")

      const data =
        res.data?.data ||
        res.data?.jobs ||
        res.data ||
        []

      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("❌ JOB LOAD ERROR:", err)

      setError(
        err?.response?.data?.message ||
          "Failed to load jobs"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
  const timer = setTimeout(() => {
    loadJobs()
  }, 0)

  return () => clearTimeout(timer)
}, [loadJobs])

  const getStatusColor = (status = "") => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f59e0b"

      case "ready_for_production":
        return "#3b82f6"

      case "production":
        return "#06b6d4"

      case "shipping":
        return "#8b5cf6"

      case "shipped":
        return "#22c55e"

      case "completed":
        return "#22c55e"

      default:
        return "#64748b"
    }
  }

  if (loading) {
    return (
      <div style={container}>
        <h2>Loading production jobs...</h2>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>
            🏭 Production Jobs
          </h1>

          <p style={subtitle}>
            {jobs.length} active job
            {jobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={loadJobs}
          style={refreshButton}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {!jobs.length && !error && (
        <div style={emptyCard}>
          <h3>No Production Jobs</h3>

          <p>
            New jobs will appear here when
            orders enter production.
          </p>
        </div>
      )}

      <div style={grid}>
        {jobs.map((job) => (
          <div
            key={job._id}
            style={card}
          >
            <div style={cardHeader}>
              <h3 style={jobTitle}>
                {job.product ||
                  job.name ||
                  "Untitled Job"}
              </h3>

              <span
                style={{
                  ...statusBadge,
                  background:
                    getStatusColor(
                      job.status
                    )
                }}
              >
                {job.status || "pending"}
              </span>
            </div>

            <div style={details}>
              <p>
                <strong>
                  Production Type:
                </strong>{" "}
                {job.productionType ||
                  "Not specified"}
              </p>

              <p>
                <strong>
                  Quantity:
                </strong>{" "}
                {job.quantity || 0}
              </p>

              <p>
                <strong>
                  Customer:
                </strong>{" "}
                {job.customerName ||
                  "Unknown"}
              </p>

              <p>
                <strong>
                  Job ID:
                </strong>{" "}
                {String(
                  job._id || ""
                ).slice(-6)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "30px"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  flexWrap: "wrap",
  gap: "12px"
}

const title = {
  margin: 0,
  fontSize: "36px",
  fontWeight: 800
}

const subtitle = {
  color: "#94a3b8",
  marginTop: "6px"
}

const refreshButton = {
  padding: "12px 18px",
  background: "#06b6d4",
  border: "none",
  borderRadius: "12px",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer"
}

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(300px,1fr))",
  gap: "20px"
}

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  padding: "20px",
  boxShadow:
    "0 10px 30px rgba(0,0,0,.25)"
}

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  gap: "10px"
}

const jobTitle = {
  margin: 0,
  fontSize: "20px"
}

const statusBadge = {
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
  color: "white",
  textTransform: "capitalize"
}

const details = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  color: "#cbd5e1"
}

const emptyCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  padding: "40px",
  textAlign: "center",
  color: "#94a3b8"
}

const errorBox = {
  background: "rgba(239,68,68,.12)",
  border: "1px solid rgba(239,68,68,.25)",
  color: "#fca5a5",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "20px"
}