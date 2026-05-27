import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { io } from "socket.io-client"
import api from "../services/api"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "")

const STATUS_COLUMNS = [
  {
    key: "pending",
    label: "Pending",
    color: "text-yellow-300",
    border: "border-yellow-500/30"
  },
  {
    key: "approved",
    label: "Approved",
    color: "text-cyan-300",
    border: "border-cyan-500/30"
  },
  {
    key: "printing",
    label: "Printing",
    color: "text-orange-300",
    border: "border-orange-500/30"
  },
  {
    key: "completed",
    label: "Completed",
    color: "text-emerald-300",
    border: "border-emerald-500/30"
  }
]

const normalizeJobs = (payload) => {
  const data =
    payload?.data ||
    payload?.jobs ||
    payload ||
    []

  return Array.isArray(data) ? data : []
}

const resolveFileUrl = (value = "") => {
  if (!value || typeof value !== "string") {
    return ""
  }

  if (value.startsWith("http")) return value
  if (value.startsWith("/uploads")) return `${SOCKET_URL}${value}`
  if (value.startsWith("uploads")) return `${SOCKET_URL}/${value}`

  return `${SOCKET_URL}/uploads/${value}`
}

export default function ShopFloor() {
  const socketRef = useRef(null)
  const loadingRef = useRef(false)

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadJobs = useCallback(async () => {
    if (loadingRef.current) return

    try {
      loadingRef.current = true
      setError("")

      const res = await api.get("/jobs")

      setJobs(normalizeJobs(res.data))
      setLastUpdated(new Date())
    } catch (err) {
      console.error("❌ FAILED TO FETCH JOBS:", err.response?.data || err)

      setJobs([])
      setError("Failed to load shop floor jobs")
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadJobs])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true
      })
    }

    const socket = socketRef.current

    const handleConnect = () => {
      console.log("🟢 ShopFloor connected:", socket.id)
    }

    const handleConnectError = (err) => {
      console.error("❌ SOCKET ERROR:", err.message)
    }

    socket.on("connect", handleConnect)
    socket.on("connect_error", handleConnectError)
    socket.on("jobUpdated", loadJobs)
    socket.on("jobCreated", loadJobs)
    socket.on("jobDeleted", loadJobs)
    socket.on("orderUpdated", loadJobs)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("connect_error", handleConnectError)
      socket.off("jobUpdated", loadJobs)
      socket.off("jobCreated", loadJobs)
      socket.off("jobDeleted", loadJobs)
      socket.off("orderUpdated", loadJobs)
    }
  }, [loadJobs])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const groupedJobs = useMemo(() => {
    return STATUS_COLUMNS.reduce((acc, column) => {
      acc[column.key] = jobs.filter(
        (job) => job.status === column.key
      )

      return acc
    }, {})
  }, [jobs])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading shop floor...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <section className="mx-auto max-w-[1800px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              🏭 Shop Floor
            </h1>

            <p className="mt-3 text-slate-400">
              Live production board for active jobs.
            </p>

            {lastUpdated && (
              <p className="mt-2 text-sm text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={loadJobs}
            className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-5 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-4">
          {STATUS_COLUMNS.map((column) => {
            const columnJobs = groupedJobs[column.key] || []

            return (
              <section
                key={column.key}
                className={`min-h-[70vh] rounded-3xl border ${column.border} bg-slate-950/80 p-4 shadow-xl shadow-black/20`}
              >
                <div className="mb-4 border-b border-slate-800 pb-4 text-center">
                  <h2 className={`text-lg font-black uppercase ${column.color}`}>
                    {column.label} ({columnJobs.length})
                  </h2>
                </div>

                {columnJobs.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-800 bg-[#020617] p-6 text-center text-sm text-slate-500">
                    No jobs
                  </p>
                ) : (
                  <div className="space-y-4">
                    {columnJobs.map((job) => {
                      const artworkUrl = resolveFileUrl(
                        job.artwork ||
                          job.artworkUrl ||
                          job.proofUrl ||
                          job.fileUrl ||
                          ""
                      )

                      return (
                        <article
                          key={job._id}
                          className="rounded-2xl border border-slate-800 bg-[#020617] p-4 transition hover:border-cyan-500"
                        >
                          <div className="mb-3">
                            <p className="text-sm font-black text-cyan-300">
                              #{String(job._id || "").slice(-6).toUpperCase()}
                            </p>

                            <h3 className="mt-1 text-lg font-bold">
                              {job.product ||
                                job.name ||
                                job.title ||
                                "Custom Job"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {job.customerName || "No customer"}
                            </p>
                          </div>

                          <div className="grid gap-2 text-sm text-slate-300">
                            <p>
                              <strong>Qty:</strong>{" "}
                              {job.quantity || job.qty || 1}
                            </p>

                            <p>
                              <strong>Type:</strong>{" "}
                              {job.productionType || "Not specified"}
                            </p>

                            {job.dueDate && (
                              <p>
                                <strong>Due:</strong>{" "}
                                {new Date(job.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          {artworkUrl && (
                            <a
                              href={artworkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 block"
                            >
                              <img
                                src={artworkUrl}
                                alt={job.product || "Artwork"}
                                className="max-h-64 w-full rounded-xl border border-slate-800 object-contain"
                                onError={(event) => {
                                  event.currentTarget.src =
                                    "/image_placeholder/placeholder.png"
                                }}
                              />

                              <p className="mt-2 text-sm font-semibold text-cyan-300">
                                Open Artwork →
                              </p>
                            </a>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </section>
    </main>
  )
}