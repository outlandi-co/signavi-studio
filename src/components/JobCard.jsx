import { useState } from "react"
import api from "../services/api"

export default function JobCard({

  job,

  onApprove,

  onDeny,

  isQuoteCard = false

}) {

  const [price, setPrice] =
    useState(
      job.finalPrice ||
      job.price ||
      0
    )

  const [loading, setLoading] =
    useState(false)

  /* ================= SAVE ================= */

  const handleSave = async () => {

    try {

      setLoading(true)

      await api.patch(

        `/quotes/${job._id}`,

        {
          finalPrice:
            Number(price)
        }
      )

      console.log(
        "💾 Price saved"
      )

    } catch (err) {

      console.error(
        "❌ SAVE ERROR:",
        err
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: "#020617",

        padding: 10,

        borderRadius: 10,

        marginBottom: 10,

        color: "white",

        border:
          "1px solid #1e293b"
      }}
    >

      {/* ================= NAME ================= */}

      <div
        style={{
          fontWeight: "bold",
          fontSize: 16
        }}
      >
        {job.customerName || "Unknown"}
      </div>

      {/* ================= STATUS ================= */}

      <div
        style={{
          color: "#38bdf8",
          marginTop: 4
        }}
      >
        {job.status}
      </div>

      {/* ================= PRICE ================= */}

      <div
        style={{
          color: "#22c55e",
          marginTop: 4,
          fontWeight: "600"
        }}
      >
        $
        {Number(price).toFixed(2)}
      </div>

      {/* ================= QUOTE CONTROLS ================= */}

      {isQuoteCard && (

        <>
          {/* PRICE INPUT */}

          <input
            type="number"

            value={price}

            onChange={(e) =>
              setPrice(e.target.value)
            }

            style={{
              width: "100%",

              marginTop: 10,

              padding: 8,

              borderRadius: 6,

              border: "none"
            }}
          />

          {/* SAVE */}

          <button
            onClick={handleSave}

            disabled={loading}

            style={{
              width: "100%",

              marginTop: 8,

              background: "#2563eb",

              color: "white",

              padding: 8,

              borderRadius: 6,

              border: "none",

              cursor: "pointer"
            }}
          >
            {loading
              ? "Saving..."
              : "Save Price"}
          </button>

          {/* APPROVE / DENY */}

          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 8
            }}
          >

            <button
              onClick={() =>
                onApprove(job)
              }

              style={{
                flex: 1,

                background: "#16a34a",

                color: "white",

                padding: 8,

                borderRadius: 6,

                border: "none",

                cursor: "pointer"
              }}
            >
              Approve
            </button>

            <button
              onClick={() =>
                onDeny(job)
              }

              style={{
                flex: 1,

                background: "#dc2626",

                color: "white",

                padding: 8,

                borderRadius: 6,

                border: "none",

                cursor: "pointer"
              }}
            >
              Deny
            </button>

          </div>

        </>

      )}

    </div>
  )
}