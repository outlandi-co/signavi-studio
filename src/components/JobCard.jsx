import React, { useState } from "react"
import api from "../services/api"

function JobCard({ job }) {
  const [showModal, setShowModal] = useState(false)
  const [zoom, setZoom] = useState(1)

  if (!job) return null

  const isQuote = job.source === "quote"

  /* ================= IMAGE LOGIC ================= */

  // ✅ Only use Cloudinary URLs (production-safe)
  const artworkUrl =
    typeof job?.artwork === "string" && job.artwork.startsWith("http")
      ? job.artwork
      : null

  // ✅ Always fallback (no broken images EVER)
  const displayImage = artworkUrl || "/placeholders/tshirt.png"

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()
    try {
      await api.patch(`/quotes/${job._id}/approve`)
      alert("✅ Approved — customer can now pay")
      window.location.reload()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
      alert("Error approving quote")
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async (e) => {
    e.stopPropagation()

    const reason = prompt("Reason for denial?")
    if (!reason) return

    const fee = prompt("Revision fee?", "15")

    try {
      await api.patch(`/quotes/${job._id}/deny`, {
        reason,
        fee: Number(fee) || 0
      })

      alert("❌ Denied")
      window.location.reload()

    } catch (err) {
      console.error("❌ DENY ERROR:", err)
      alert("Error denying quote")
    }
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

        {/* ================= IMAGE ================= */}
        <img
          src={displayImage}
          alt="artwork"
          style={{
            width: "100%",
            height: 120,
            objectFit: "cover",
            cursor: artworkUrl ? "pointer" : "default",
            borderRadius: 6
          }}
          onClick={() => {
            if (!artworkUrl) return
            setZoom(1)
            setShowModal(true)
          }}
          onError={(e) => {
            e.target.src = "/placeholders/tshirt.png"
          }}
        />

        {/* 🔥 Helpful UI hint */}
        {!artworkUrl && (
          <p style={{ color: "orange", fontSize: 12 }}>
            ⚠️ No artwork uploaded
          </p>
        )}

        <p><b>{job.customerName || "Guest"}</b></p>
        <p>Qty: {job.quantity}</p>
        <p>Status: {job.status}</p>

        {/* ================= QUOTE ACTIONS ================= */}
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
            alt="zoom"
            style={{
              maxHeight: "80vh",
              transform: `scale(${zoom})`,
              cursor: "zoom-in"
            }}
            onClick={(e) => {
              e.stopPropagation()
              setZoom((z) => z + 0.25)
            }}
          />
        </div>
      )}
    </>
  )
}

export default JobCard