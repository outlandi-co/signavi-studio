import React from "react"

function JobCard({ job, updateStatus }) {

  if (!job) return null

  /* ================= LOCK LOGIC ================= */
  const isLocked =
    job.source === "quote" ||
    job.status === "payment_required"

  const isPaid = job.status === "paid"

  return (
    <div
      className="shadow p-3 rounded mb-3 transition-all"
      style={{
        background: isLocked ? "#1e293b" : "#ffffff",
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? "not-allowed" : "default"
      }}
    >

      {/* IMAGE */}
      {job.artwork && (
        <img
          src={`https://signavi-backend.onrender.com/uploads/${job.artwork}`}
          alt="artwork"
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}

      {/* INFO */}
      <h3 className="font-bold">
        {job.printType || "Custom Job"}
      </h3>

      <p className="text-sm text-gray-600">
        {job.customerName || "Walk-in"}
      </p>

      <p className="text-sm">
        Qty: {job.quantity || job.items?.length || 0}
      </p>

      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
        {job.status}
      </span>

      {/* 🔒 LOCK MESSAGE */}
      {isLocked && (
        <p className="text-xs text-red-400 mt-2">
          🔒 Awaiting payment approval
        </p>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2 mt-2">

        {/* START PRODUCTION */}
        {isPaid && job.status === "paid" && (
          <button
            onClick={() => updateStatus(job._id, "production")}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Start
          </button>
        )}

        {/* READY */}
        {job.status === "production" && (
          <button
            onClick={() => updateStatus(job._id, "shipping")}
            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
          >
            Ready
          </button>
        )}

        {/* DELIVER */}
        {job.status === "shipping" && (
          <button
            onClick={() => updateStatus(job._id, "delivered")}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Deliver
          </button>
        )}

      </div>

    </div>
  )
}

export default JobCard