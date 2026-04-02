import { useEffect, useState, useRef, useCallback } from "react"
import api from "../services/api"
import { io } from "socket.io-client"
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core"
import JobModal from "../components/modals/JobModal"
import Scanner from "../components/Scanner"
import toast from "react-hot-toast"

/* ================= CONFIG ================= */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "").replace(/\/$/, "")

/* ================= AUTO PRINT ================= */
const autoPrintLabel = (url) => {
  try {
    const iframe = document.createElement("iframe")

    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"

    iframe.src = url

    document.body.appendChild(iframe)

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      }, 500)
    }

  } catch (err) {
    console.error("Print error:", err)
  }
}

/* ================= STATUS COLORS ================= */
const statusColors = {
  pending: "#facc15",
  payment_required: "#22c55e",
  production: "#3b82f6",
  shipped: "#10b981",
  denied: "#ef4444",
  archive: "#64748b"
}

/* ================= NORMALIZER ================= */
const normalizeJobs = (data = {}) => ({
  pending: data.pending || [],
  payment_required: data.payment_required || [],
  production: data.production || [],
  shipped: data.shipped || [],
  denied: data.denied || [],
  archive: data.archive || []
})

/* ================= CARD ================= */
function Card({ job, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  return (
    <div
      ref={setNodeRef}
      className="job-card"
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : "none",
        border: `1px solid ${statusColors[job.status]}`
      }}
    >
      <div {...listeners} {...attributes} style={{ cursor: "grab" }}>
        ⠿
      </div>

      <div onClick={() => onClick(job)}>
        <strong>{job.customerName}</strong>
        <p>#{job._id.slice(-6)}</p>
        <p>{job.status}</p>
      </div>

      {job.status === "shipped" && job.shippingLabel && (
        <button
          onClick={() => window.open(job.shippingLabel, "_blank")}
          style={printBtn}
        >
          🖨️ Print Label
        </button>
      )}
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ id, jobs, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minHeight: "500px",
        padding: "10px",
        border: isOver ? "2px solid #3b82f6" : "1px dashed #1e293b",
        borderRadius: "10px",
        background: "#020617"
      }}
    >
      <h3 style={{ color: "white" }}>{id.toUpperCase()}</h3>

      {(jobs || []).map(j => (
        <Card key={j._id} job={j} onClick={onClick} />
      ))}
    </div>
  )
}

/* ================= MAIN ================= */
function ProductionBoard() {

  const [jobs, setJobs] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanBuffer, setScanBuffer] = useState("")
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true)

  const socketRef = useRef(null)
  const openedLabels = useRef(new Set())

  const sensors = useSensors(useSensor(PointerSensor))

  /* 🔊 SOUND */
  const playMoveSound = () => {
    const audio = new Audio("/sounds/move.mp3")
    audio.play().catch(() => {})
  }

  /* ================= PROCESS SCAN ================= */
  const processScan = useCallback(async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: "shipped"
      })

      playMoveSound()
      toast.success("📦 Order shipped!")

    } catch (err) {
      console.error(err)
      toast.error("❌ Scan failed")
    }
  }, [])

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/production")
      setJobs(normalizeJobs(res.data))
    }
    load()
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {

    socketRef.current = io(SOCKET_URL)

    socketRef.current.on("jobUpdated", (updatedOrder) => {

      setJobs(prev => {
        const updated = { ...prev }

        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(j => j._id !== updatedOrder._id)
        })

        if (!updated[updatedOrder.status]) {
          updated[updatedOrder.status] = []
        }

        updated[updatedOrder.status].unshift(updatedOrder)

        return updated
      })

      playMoveSound()

      if (
        updatedOrder.status === "shipped" &&
        updatedOrder.shippingLabel &&
        autoPrintEnabled &&
        !openedLabels.current.has(updatedOrder._id)
      ) {
        openedLabels.current.add(updatedOrder._id)

        autoPrintLabel(updatedOrder.shippingLabel)

        setTimeout(() => {
          window.open(updatedOrder.shippingLabel, "_blank")
        }, 1500)
      }
    })

    return () => socketRef.current.disconnect()

  }, [autoPrintEnabled])

  /* ================= SCANNER ================= */
  useEffect(() => {

    const handleKeyDown = (e) => {

      if (document.activeElement.tagName === "INPUT") return

      if (e.key === "Enter") {
        if (scanBuffer.length > 5) {
          processScan(scanBuffer)
        }
        setScanBuffer("")
        return
      }

      setScanBuffer(prev => prev + e.key)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)

  }, [scanBuffer, processScan])

  /* ================= DRAG ================= */
  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    playMoveSound()

    try {
      await api.patch(`/orders/${jobId}/status`, {
        status: newStatus
      })
    } catch {
      toast.error("Update failed")
    }
  }

  return (
    <div style={{ padding: 20, background: "#020617", minHeight: "100vh" }}>

      {/* 📷 SCANNER */}
      <button
        onClick={() => setScannerOpen(true)}
        style={btnTop}
      >
        📷 Scan
      </button>

      {/* 🖨️ AUTO PRINT TOGGLE */}
      <button
        onClick={() => setAutoPrintEnabled(prev => !prev)}
        style={{
          ...btnTop,
          top: 70,
          background: autoPrintEnabled ? "#22c55e" : "#ef4444"
        }}
      >
        🖨️ Auto Print: {autoPrintEnabled ? "ON" : "OFF"}
      </button>

      {/* DEBUG INPUT */}
      <input
        value={scanBuffer}
        readOnly
        style={debugInput}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: 20 }}>
          {Object.entries(jobs).map(([k, v]) => (
            <Column key={k} id={k} jobs={v} onClick={setSelectedJob} />
          ))}
        </div>
      </DndContext>

      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {scannerOpen && (
        <Scanner onClose={() => setScannerOpen(false)} />
      )}

      <style>{`
        .job-card {
          background: #020617;
          padding: 12px;
          border-radius: 12px;
          color: white;
          margin-bottom: 10px;
          transition: all 0.2s ease;
          animation: flash 0.3s ease;
        }

        @keyframes flash {
          0% { background: #22c55e33; }
          100% { background: #020617; }
        }
      `}</style>

    </div>
  )
}

/* ================= STYLES ================= */
const printBtn = {
  marginTop: 8,
  width: "100%",
  background: "#22c55e",
  color: "black",
  padding: "6px",
  borderRadius: "6px",
  fontWeight: "bold"
}

const btnTop = {
  position: "fixed",
  top: 20,
  right: 20,
  padding: "10px",
  background: "#22c55e",
  borderRadius: "6px",
  zIndex: 1000
}

const debugInput = {
  position: "fixed",
  bottom: 20,
  left: 20,
  padding: 10,
  background: "#000",
  color: "#22c55e",
  borderRadius: 6
}

export default ProductionBoard