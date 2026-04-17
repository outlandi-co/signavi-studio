import React, { useState } from "react"
import api from "../services/api"

function JobCard({ job }) {

  const [showModal, setShowModal] = useState(false)
  const [zoom, setZoom] = useState(1)

  if (!job) return null

  const isQuote = job.source === "quote"

  const artworkUrl = job.artwork
    ? `https://signavi-backend.onrender.com/uploads/${job.artwork}`
    : null

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()

    await api.patch(`/quotes/${job._id}/approve`)

    alert("✅ Approved — customer can now pay")
    window.location.reload()
  }

  /* ================= DENY ================= */
  const handleDeny = async (e) => {
    e.stopPropagation()

    const reason = prompt("Reason for denial?")
    if (!reason) return

    const fee = prompt("Revision fee?", "15")

    await api.patch(`/quotes/${job._id}/deny`, {
      reason,
      fee: Number(fee) || 0
    })

    alert("❌ Denied")
    window.location.reload()
  }

  return (
    <>
      <div
        style={{
          background: "#020617",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          border: "1px solid #1e293b"
        }}
      >

        {/* IMAGE */}
        {artworkUrl && (
          <img
            src={artworkUrl}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              cursor: "pointer"
            }}
            onClick={() => {
              setZoom(1)
              setShowModal(true)
            }}
          />
        )}

        <p><b>{job.customerName}</b></p>
        <p>Qty: {job.quantity}</p>
        <p>Status: {job.status}</p>

        {/* ================= QUOTE ================= */}
        {isQuote && (
          <>
            {job.approvalStatus !== "approved" && (
              <>
                <p style={{ color: "yellow" }}>
                  Awaiting approval
                </p>

                <button onClick={handleApprove}>Approve</button>
                <button onClick={handleDeny}>Deny</button>
              </>
            )}

            {job.approvalStatus === "approved" && (
              <p style={{ color: "green" }}>
                Approved — waiting for payment
              </p>
            )}

            {job.approvalStatus === "denied" && (
              <p style={{ color: "red" }}>
                Denied — revision required
              </p>
            )}
          </>
        )}

      </div>

      {/* ================= MODAL ================= */}
      {showModal && artworkUrl && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <img
            src={artworkUrl}
            style={{
              maxHeight: "80vh",
              transform: `scale(${zoom})`
            }}
            onClick={() => setZoom(z => z + 0.25)}
          />
        </div>
      )}
    </>
  )
}

export default JobCard