import { useEffect, useState } from "react"
import api from "../services/api"
import { io } from "socket.io-client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable
} from "@dnd-kit/core"

const socket = io("http://localhost:5050")

/* ================= CARD ================= */
function DraggableCard({ job }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job._id
  })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border rounded-xl p-4 shadow hover:shadow-lg cursor-grab"
    >
      <p className="text-xs text-cyan-500">
        {job.type === "quote" ? "Custom Request" : "Store Order"}
      </p>

      <p className="font-semibold">
        {job.customerName || "No Name"}
      </p>

      <p className="text-sm text-gray-500">
        {job.printType || "—"}
      </p>

      {job.quantity > 50 && (
        <p className="text-xs text-red-500 font-bold mt-1">
          🔥 Bulk Order
        </p>
      )}
    </div>
  )
}

/* ================= COLUMN ================= */
function Column({ id, title, jobs }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      id={id}
      className="min-w-[320px] flex-shrink-0 bg-white rounded-xl border shadow flex flex-col"
    >
      <div className="p-4 border-b flex justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span>{jobs.length}</span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {jobs.map(job => (
          <DraggableCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  )
}

/* ================= MAIN ================= */
function ProductionBoard() {

  const [jobs, setJobs] = useState({
    pending: [],
    printing: [],
    ready: [],
    shipped: []
  })

  const fetchJobs = async () => {
    const res = await api.get("/production")
    setJobs(res.data)
  }

  useEffect(() => {
    fetchJobs()

    socket.on("jobUpdated", fetchJobs)

    return () => socket.off("jobUpdated")
  }, [])

  const updateStatus = async (job, status) => {
    const endpoint =
      job.type === "quote"
        ? `/quotes/${job._id}/status`
        : `/orders/${job._id}/status`

    await api.patch(endpoint, { status })
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return

    const jobId = active.id
    const newStatus = over.id

    let foundJob = null
    let sourceCol = null

    Object.entries(jobs).forEach(([col, arr]) => {
      arr.forEach(job => {
        if (job._id === jobId) {
          foundJob = job
          sourceCol = col
        }
      })
    })

    if (!foundJob || sourceCol === newStatus) return

    /* 🔥 OPTIMISTIC UPDATE */
    setJobs(prev => {
      const updated = { ...prev }

      updated[sourceCol] = updated[sourceCol].filter(j => j._id !== jobId)
      updated[newStatus] = [
        { ...foundJob, status: newStatus },
        ...updated[newStatus]
      ]

      return updated
    })

    await updateStatus(foundJob, newStatus)
  }

  /* 🔥 STATS (CORRECT LOCATION) */
  const stats = {
    total:
      jobs.pending.length +
      jobs.printing.length +
      jobs.ready.length +
      jobs.shipped.length,
    pending: jobs.pending.length,
    printing: jobs.printing.length,
    ready: jobs.ready.length,
    shipped: jobs.shipped.length
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* HEADER + STATS */}
      <div className="p-6 bg-white border-b">

        <h1 className="text-2xl font-bold mb-4">
          Production Dashboard
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Total Jobs</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded-xl">
            <p className="text-sm text-yellow-700">Requests</p>
            <p className="text-xl font-bold">{stats.pending}</p>
          </div>

          <div className="bg-blue-100 p-4 rounded-xl">
            <p className="text-sm text-blue-700">In Production</p>
            <p className="text-xl font-bold">{stats.printing}</p>
          </div>

          <div className="bg-green-100 p-4 rounded-xl">
            <p className="text-sm text-green-700">Ready</p>
            <p className="text-xl font-bold">{stats.ready}</p>
          </div>

          <div className="bg-gray-200 p-4 rounded-xl">
            <p className="text-sm text-gray-700">Completed</p>
            <p className="text-xl font-bold">{stats.shipped}</p>
          </div>

        </div>

      </div>

      {/* BOARD */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

        <div className="w-full overflow-x-auto">

          <div className="flex gap-6 p-6 min-w-max">

            <Column id="pending" title="Requests" jobs={jobs.pending} />
            <Column id="printing" title="In Production" jobs={jobs.printing} />
            <Column id="ready" title="Ready" jobs={jobs.ready} />
            <Column id="shipped" title="Completed" jobs={jobs.shipped} />

          </div>

        </div>

      </DndContext>

    </div>
  )
}

export default ProductionBoard