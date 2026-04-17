import React from "react"
import api from "../services/api"

function JobCard({ job, updateStatus }) {

  if (!job) return null

  /* ================= TYPES ================= */
  const isQuote = job.source === "quote"
  const isLocked =
    job.status === "payment_required"

  const isPaid = job.status === "paid"

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()

    try {
      await api.patch(`/quotes/${job._id}/approve`)
      alert("✅ Approved — customer can now pay")
      window.location.reload()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
      alert("Approve failed")
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async (e) => {
    e.stopPropagation()

    const reason = prompt(
      "Reason for denial?\n(e.g. low resolution, wrong file, not print ready)"
    )
    if (!reason) return

    const fee = prompt("Add revision fee? (optional)", "15")

    try {
      await api.patch(`/quotes/${job._id}/deny`, {
        reason,
        fee: Number(fee) || 0
      })

      alert("❌ Denied — email sent to customer")
      window.location.reload()

    } catch (err) {
      console.error("❌ DENY ERROR:", err)
      alert("Deny failed")
    }
  }

  return (
    <div
      className="shadow p-3 rounded mb-3 transition-all"
      style={{
        background: isQuote ? "#1e293b" : "#ffffff",
        opacity: isQuote ? 0.9 : 1,
        cursor: isQuote ? "default" : "default"
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

      {/* ================= QUOTE STATE ================= */}
      {isQuote && (
        <div className="mt-2">

          {/* PENDING APPROVAL */}
          {job.approvalStatus !== "approved" && (
            <>
              <p className="text-xs text-yellow-400">
                ⏳ Awaiting artwork approval
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleApprove}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  ✅ Approve
                </button>

                <button
                  onClick={handleDeny}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  ❌ Deny
                </button>
              </div>
            </>
          )}

          {/* APPROVED */}
          {job.approvalStatus === "approved" && (
            <p className="text-xs text-green-400 mt-2">
              ✅ Approved — waiting for payment
            </p>
          )}

          {/* DENIED */}
          {job.approvalStatus === "denied" && (
            <p className="text-xs text-red-400 mt-2">
              ❌ Denied — revision required
            </p>
          )}

        </div>
      )}

      {/* ================= LOCK MESSAGE ================= */}
      {isLocked && !isQuote && (
        <p className="text-xs text-red-400 mt-2">
          🔒 Awaiting payment
        </p>
      )}

      {/* ================= ACTIONS ================= */}
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