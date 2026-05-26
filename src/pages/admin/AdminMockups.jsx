import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import html2canvas from "html2canvas"
import api from "../../services/api"

const productImage =
  "https://www.bellacanvas.com/wp-content/uploads/2018/10/3001_white.jpg"

const API_URL =
  (import.meta.env.VITE_API_URL ||
    "https://signavi-backend.onrender.com/api").replace(/\/api\/?$/, "")

const resolveArtworkUrl = (artwork = "") => {
  if (!artwork) return null
  if (artwork.startsWith("http")) return artwork
  if (artwork.startsWith("/uploads")) return `${API_URL}${artwork}`
  if (artwork.startsWith("uploads")) return `${API_URL}/${artwork}`

  return `${API_URL}/uploads/${artwork}`
}

export default function AdminMockups() {
  const location = useLocation()
  const job = location.state?.job || null

  const mockupRef = useRef(null)

  const [image, setImage] = useState(
    resolveArtworkUrl(job?.artwork)
  )

  const [placement, setPlacement] = useState("front")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    return () => {
      if (image?.startsWith("blob:")) {
        URL.revokeObjectURL(image)
      }
    }
  }, [image])

  const handleUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (image?.startsWith("blob:")) {
      URL.revokeObjectURL(image)
    }

    setImage(URL.createObjectURL(file))
  }

  const saveMockup = async () => {
    if (!job || !mockupRef.current) {
      alert("No job connected")
      return
    }

    try {
      setLoading(true)

      const canvas = await html2canvas(mockupRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
      })

      const imageData = canvas.toDataURL("image/png")

      await api.post(`/orders/${job._id}/mockup`, {
        image: imageData,
      })

      alert("Mockup saved!")
    } catch (err) {
      console.error("❌ SAVE MOCKUP ERROR:", err)
      alert("Save failed")
    } finally {
      setLoading(false)
    }
  }

  const sendForApproval = async () => {
    if (!job) {
      alert("No job connected")
      return
    }

    try {
      setSending(true)

      await api.post(`/orders/send-artwork/${job._id}`)

      alert("Sent for approval!")
    } catch (err) {
      console.error("❌ SEND APPROVAL ERROR:", err)
      alert("Failed to send for approval")
    } finally {
      setSending(false)
    }
  }

  const resetMockup = () => {
    if (image?.startsWith("blob:")) {
      URL.revokeObjectURL(image)
    }

    setImage(resolveArtworkUrl(job?.artwork))
    setPlacement("front")
  }

  return (
    <main style={page}>
      <div style={header}>
        <div>
          <p style={eyebrow}>Artwork Proofing</p>

          <h1 style={title}>
            🎨 Mockup Generator
          </h1>

          <p style={subtitle}>
            Preview customer artwork on product mockups before saving or
            sending for approval.
          </p>
        </div>
      </div>

      {!job && (
        <div style={warningBox}>
          ⚠ Manual Mode — no order/job is connected.
        </div>
      )}

      {job && (
        <section style={jobCard}>
          <div>
            <p style={jobName}>
              {job.customerName || "Customer"}
            </p>

            <p style={jobText}>
              {job.email || "No email"}
            </p>

            <p style={jobId}>
              Order ID: {job._id}
            </p>
          </div>
        </section>
      )}

      <section style={panel}>
        <div style={controls}>
          <label style={label}>
            Upload Artwork
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleUpload}
              style={fileInput}
            />
          </label>

          <label style={label}>
            Placement
            <select
              value={placement}
              onChange={(event) => setPlacement(event.target.value)}
              style={select}
            >
              <option value="front">Front Center</option>
              <option value="leftChest">Left Chest</option>
              <option value="sleeve">Sleeve</option>
            </select>
          </label>
        </div>

        <div style={previewWrap}>
          <div ref={mockupRef} style={mockupBox}>
            <img
              src={productImage}
              alt="Shirt mockup"
              style={shirtImage}
              crossOrigin="anonymous"
            />

            {image && (
              <img
                src={image}
                alt="Customer artwork"
                style={{
                  ...artworkImage,
                  ...placementStyles[placement],
                }}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>

        <div style={actions}>
          <button
            type="button"
            onClick={sendForApproval}
            disabled={sending || !job}
            style={{
              ...button,
              ...sendButton,
              opacity: sending || !job ? 0.6 : 1,
            }}
          >
            {sending ? "Sending..." : "Send For Approval"}
          </button>

          <button
            type="button"
            onClick={saveMockup}
            disabled={loading || !job}
            style={{
              ...button,
              ...saveButton,
              opacity: loading || !job ? 0.6 : 1,
            }}
          >
            {loading ? "Saving..." : "Save Mockup"}
          </button>

          <button
            type="button"
            onClick={resetMockup}
            style={{
              ...button,
              ...resetButton,
            }}
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  )
}

const page = {
  padding: "30px",
  minHeight: "100vh",
  background: "#020617",
  color: "#ffffff",
}

const header = {
  marginBottom: "24px",
}

const eyebrow = {
  margin: "0 0 8px",
  color: "#22d3ee",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
}

const title = {
  margin: 0,
  fontSize: "34px",
}

const subtitle = {
  marginTop: "10px",
  color: "#94a3b8",
  maxWidth: "680px",
}

const warningBox = {
  marginBottom: "20px",
  padding: "14px",
  borderRadius: "14px",
  background: "#facc15",
  color: "#020617",
  fontWeight: 800,
}

const jobCard = {
  marginBottom: "20px",
  padding: "18px",
  borderRadius: "18px",
  background: "#0f172a",
  border: "1px solid #1e293b",
}

const jobName = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 800,
}

const jobText = {
  margin: "6px 0 0",
  color: "#cbd5e1",
}

const jobId = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "12px",
}

const panel = {
  padding: "22px",
  borderRadius: "20px",
  background: "#0f172a",
  border: "1px solid #1e293b",
}

const controls = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
}

const label = {
  display: "grid",
  gap: "8px",
  fontWeight: 700,
  color: "#cbd5e1",
}

const fileInput = {
  color: "#cbd5e1",
}

const select = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#020617",
  color: "#ffffff",
}

const previewWrap = {
  display: "flex",
  justifyContent: "center",
  padding: "28px",
  borderRadius: "18px",
  background: "#020617",
  border: "1px solid #1e293b",
}

const mockupBox = {
  position: "relative",
  width: "320px",
}

const shirtImage = {
  width: "100%",
  display: "block",
}

const artworkImage = {
  position: "absolute",
  objectFit: "contain",
  pointerEvents: "none",
}

const placementStyles = {
  front: {
    top: "31%",
    left: "50%",
    width: "34%",
    transform: "translateX(-50%)",
  },
  leftChest: {
    top: "28%",
    left: "38%",
    width: "16%",
    transform: "translateX(-50%)",
  },
  sleeve: {
    top: "35%",
    left: "21%",
    width: "16%",
    transform: "translateX(-50%)",
  },
}

const actions = {
  display: "flex",
  gap: "12px",
  marginTop: "22px",
  flexWrap: "wrap",
}

const button = {
  border: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 900,
  cursor: "pointer",
}

const sendButton = {
  background: "#22c55e",
  color: "#020617",
}

const saveButton = {
  background: "#2563eb",
  color: "#ffffff",
}

const resetButton = {
  background: "#ef4444",
  color: "#ffffff",
}