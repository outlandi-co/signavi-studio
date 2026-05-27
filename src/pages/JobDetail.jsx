import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "")

const resolveFileUrl = (value = "") => {
  if (!value) return ""

  if (value.startsWith("http")) return value
  if (value.startsWith("/uploads")) return `${SOCKET_URL}${value}`
  if (value.startsWith("uploads")) return `${SOCKET_URL}/${value}`

  return `${SOCKET_URL}/uploads/${value}`
}

const formatStatus = (status = "pending") => {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const socketRef = useRef(null)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadJob = useCallback(async () => {
    try {
      setError("")

      if (!id || id === "null" || id === "undefined") {
        throw new Error("Invalid job ID")
      }

      const res = await api.get(`/jobs/${id}`)

      const jobData =
        res.data?.data ||
        res.data?.job ||
        res.data

      setJob(jobData)
    } catch (err) {
      console.error("❌ FAILED TO LOAD JOB:", err.response?.data || err)

      setJob(null)
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load job"
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJob()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadJob])

  useEffect(() => {
    if (!id || id === "null" || id === "undefined") return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"]
      })
    }

    const socket = socketRef.current

    const handleJobUpdated = (updatedJob) => {
      if (!updatedJob?._id || updatedJob._id === id) {
        loadJob()
      }
    }

    socket.on("jobUpdated", handleJobUpdated)
    socket.on("orderUpdated", handleJobUpdated)

    return () => {
      socket.off("jobUpdated", handleJobUpdated)
      socket.off("orderUpdated", handleJobUpdated)
    }
  }, [id, loadJob])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading job...
      </main>
    )
  }

  if (error || !job) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-red-500/40 bg-red-950/40 p-8 text-center text-red-300">
          <h1 className="mb-3 text-3xl font-bold">
            Job Not Found
          </h1>

          <p>{error || "This job could not be loaded."}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/production")}
            className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Back to Production
          </button>
        </section>
      </main>
    )
  }

  const artworkUrl = resolveFileUrl(
    job.artwork ||
      job.artworkUrl ||
      job.file ||
      job.fileUrl ||
      job.proof ||
      job.proofUrl ||
      ""
  )

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/admin/production")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Production
        </button>

        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            {job.product || job.name || job.title || "Job Detail"}
          </h1>

          <p className="mt-3 text-slate-400">
            Job #{String(job._id || id).slice(-6).toUpperCase()}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-5 text-2xl font-bold">
              Artwork / Proof
            </h2>

            {artworkUrl ? (
              <a
                href={artworkUrl}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <img
                  src={artworkUrl}
                  alt={job.product || "Job artwork"}
                  className="max-h-[600px] w-full rounded-2xl border border-slate-800 object-contain"
                  onError={(event) => {
                    event.currentTarget.src =
                      "/image_placeholder/placeholder.png"
                  }}
                />

                <p className="mt-4 text-sm font-semibold text-cyan-300">
                  Open artwork in new tab →
                </p>
              </a>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#020617] text-slate-500">
                No artwork uploaded
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 text-2xl font-bold">
                Job Info
              </h2>

              <InfoRow
                label="Customer"
                value={job.customerName || job.customer || "Not provided"}
              />

              <InfoRow
                label="Email"
                value={job.email || "Not provided"}
              />

              <InfoRow
                label="Product"
                value={job.product || job.name || "Not provided"}
              />

              <InfoRow
                label="Status"
                value={formatStatus(job.status)}
              />

              <InfoRow
                label="Quantity"
                value={job.quantity || job.qty || 1}
              />

              <InfoRow
                label="Due Date"
                value={
                  job.dueDate
                    ? new Date(job.dueDate).toLocaleDateString()
                    : "Not set"
                }
              />
            </section>

            {job.notes && (
              <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
                <h2 className="mb-4 text-2xl font-bold">
                  Notes
                </h2>

                <p className="leading-7 text-slate-300">
                  {job.notes}
                </p>
              </section>
            )}

            {job.items?.length > 0 && (
              <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
                <h2 className="mb-4 text-2xl font-bold">
                  Items
                </h2>

                <div className="space-y-3">
                  {job.items.map((item, index) => (
                    <div
                      key={`${item.name || "item"}-${index}`}
                      className="rounded-2xl border border-slate-800 bg-[#020617] p-4"
                    >
                      <p className="font-bold">
                        {item.name || "Item"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <button
              type="button"
              onClick={loadJob}
              className="w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400"
            >
              Refresh Job
            </button>
          </aside>
        </div>
      </section>
    </main>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-slate-800 py-3 last:border-b-0">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}