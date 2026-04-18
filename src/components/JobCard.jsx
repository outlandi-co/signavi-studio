import React, { useState } from "react"
import api from "../services/api"

function JobCard({ job }) {
  const [showModal, setShowModal] = useState(false)
  const [zoom, setZoom] = useState(1)

  if (!job) return null

  const isQuote = job.source === "quote"

  /* ================= IMAGE ================= */
  const artworkUrl =
    typeof job?.artwork === "string" && job.artwork.startsWith("http")
      ? job.artwork
      : null

  const displayImage = artworkUrl || "/placeholders/tshirt.png"

  /* ================= STATUS COLORS ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "quotes": return "#64748b"
      case "payment_required": return "#f59e0b"
      case "production": return "#3b82f6"
      case "shipping": return "#10b981"
      case "denied": return "#ef4444"
      default: return "#64748b"
    }
  }

  /* ================= APPROVE ================= */
  const handleApprove = async (e) => {
    e.stopPropagation()
    try {
      await api.patch(`/quotes/${job._id}/approve`)
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
    }
  }

  /* ================= DENY ================= */
  const handleDeny = async (e) => {
    e.stopPropagation()

    const reason = prompt("Reason for denial?")
    if (!reason) return

    let fee = 0

    if (reason.toLowerCase().includes("rework")) {
      fee = Number(prompt("Rework fee?", "25")) || 0
    }

    try {
      await api.patch(`/quotes/${job._id}/deny`, {
        reason,
        fee
      })
    } catch (err) {
      console.error("❌ DENY ERROR:", err)
    }
  }

  return (
    <>
      <div style={card}>

        {/* ================= IMAGE ================= */}
        <img
          src={displayImage}
          alt="artwork"
          style={img}
          onClick={() => artworkUrl && setShowModal(true)}
          onError={(e) => {
            e.target.src = "/placeholders/tshirt.png"
          }}
        />

        {/* ================= DOWNLOAD BUTTONS ================= */}
        {artworkUrl && (
          <div style={{ marginTop: 6 }}>
            <a
              href={artworkUrl}
              target="_blank"
              rel="noreferrer"
              style={link}
            >
              🔍 View Full Image
            </a>

            <a
              href={`${artworkUrl}?fl_attachment`}
              target="_blank"
              rel="noreferrer"
              style={link}
            >
              ⬇ Download Original (Full Resolution)
            </a>
          </div>
        )}

        {!artworkUrl && (
          <p style={warning}>⚠️ No artwork uploaded</p>
        )}

        <p><b>{job.customerName || "Guest"}</b></p>
        <p>Qty: {job.quantity}</p>

        {/* ================= STATUS ================= */}
        <p>
          Status:{" "}
          <span style={{
            background: getStatusColor(job.status),
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 12
          }}>
            {job.status}
          </span>
        </p>

        {/* ================= QUOTE ACTIONS ================= */}
        {isQuote && job.approvalStatus !== "approved" && (
          <>
            <p style={{ color: "yellow" }}>Awaiting approval</p>

            <button onClick={handleApprove}>Approve</button>
            <button onClick={handleDeny}>Deny</button>
          </>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && artworkUrl && (
        <div style={modal} onClick={() => setShowModal(false)}>
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

/* ================= STYLES ================= */

const card = {
  background: "#020617",
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
  border: "1px solid #1e293b"
}

const img = {
  width: "100%",
  height: 120,
  objectFit: "cover",
  borderRadius: 6,
  cursor: "pointer"
}

const link = {
  display: "block",
  fontSize: 12,
  color: "#38bdf8",
  marginTop: 4
}

const warning = {
  color: "orange",
  fontSize: 12
}

const modal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
}

export default JobCard