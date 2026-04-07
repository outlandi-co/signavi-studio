import { useEffect, useState } from "react"
import api from "../../services/api"
import jsPDF from "jspdf"
import InvoiceEditor from "../InvoiceEditor"

function JobModal({ job, onClose, refresh }) {

  const [status, setStatus] = useState(job?.status || "pending")
  const [price, setPrice] = useState(Number(job?.price) || 0)
  const [tracking, setTracking] = useState(job?.trackingNumber || "")
  const [trackingLink, setTrackingLink] = useState(job?.trackingLink || "")
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [file, setFile] = useState(null)

  /* 🔥 NEW: EMAIL STATE */
  const [email, setEmail] = useState(job?.email || "")

  const isQuote = job?.status === "quote" || job?.type === "quote"

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  useEffect(() => {
    if (!job) return

    setEmail(job?.email || "")

    if (!job.artwork) setAiSuggestion("Upload artwork first")
    else if (job.quantity > 50) setAiSuggestion("Bulk order detected")
    else setAiSuggestion("Ready for pricing")
  }, [job])

  if (!job) return null

  const safeRefresh = (data) => {
    if (refresh) refresh(data || null)
  }

  /* ================= ACTIONS ================= */

  const convertToOrder = async () => {
    try {
      setLoading(true)
      await api.post(`/quotes/${job._id}/convert`)
      alert("Converted to Order")
      safeRefresh()
      onClose()
    } catch {
      alert("Conversion failed")
    } finally {
      setLoading(false)
    }
  }

  const generateAIPrice = async () => {
    try {
      const res = await api.post("/ai-pricing", {
        quantity: job.quantity,
        printType: job.printType
      })

      const suggested = Number(res.data.suggestedPrice)
      setPrice(suggested)
      setAiSuggestion(`Suggested: $${suggested}`)

    } catch {
      setAiSuggestion("AI pricing not available")
    }
  }

  const uploadArtwork = async () => {
    if (!file) return alert("Select file")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("artwork", file)

      const endpoint = isQuote
        ? `/quotes/${job._id}/artwork`
        : `/orders/${job._id}/artwork`

      const res = await api.patch(endpoint, formData)

      alert("Uploaded")
      safeRefresh(res.data)

    } catch {
      alert("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  /* 🔥 FIXED FUNCTION */
  const requestPayment = async () => {
    if (!price || price <= 0) return alert("Enter valid price")

    if (!email) {
      alert("Customer email is required")
      return
    }

    setLoading(true)

    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status: "payment_required",
        price,
        finalPrice: price,
        email // 🔥 THIS FIXES EVERYTHING
      })

      alert("Payment requested + email sent")
      safeRefresh(res.data)

    } catch {
      alert("Failed to request payment")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async () => {
    setLoading(true)

    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status,
        email // 🔥 always pass email
      })
      safeRefresh(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleTracking = async () => {
    setLoading(true)

    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status,
        trackingNumber: tracking,
        trackingLink,
        email // 🔥 always pass email
      })

      safeRefresh(res.data)

    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    doc.text("Work Order", 20, 20)
    doc.text(`Customer: ${job.customerName || "Unknown"}`, 20, 40)
    doc.text(`Order ID: ${job._id}`, 20, 50)
    doc.save(`order-${job._id}.pdf`)
  }

  /* ================= UI ================= */

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        <div style={header}>
          <h2>📦 Production Job</h2>
          <button onClick={onClose} style={closeBtn}>✖</button>
        </div>

        <p style={sub}>👤 {job.customerName || "Unknown"}</p>

        {isQuote && (
          <button onClick={convertToOrder} style={primary}>
            🔄 Convert to Order
          </button>
        )}

        {loading && <p>⏳ Processing...</p>}

        {/* 🔥 NEW EMAIL INPUT */}
        <section style={section}>
          <h3>📧 Customer Email</h3>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter customer email"
            style={input}
          />
        </section>

        {/* INVOICE */}
        <section style={section}>
          <h3>🧾 Invoice</h3>
          <InvoiceEditor
            order={job}
            onSave={(items, total) => setPrice(total)}
          />
        </section>

        {/* PRICING */}
        <section style={section}>
          <h3>💰 Pricing</h3>

          <input
            value={price}
            onChange={(e)=>setPrice(Number(e.target.value))}
            style={input}
          />

          {aiSuggestion && (
            <p style={{ color:"#06b6d4" }}>🤖 {aiSuggestion}</p>
          )}

          <div style={row}>
            <button onClick={generateAIPrice} style={btn}>AI Price</button>
            <button onClick={requestPayment} style={success}>Request Payment</button>
          </div>
        </section>

        {/* ARTWORK */}
        <section style={section}>
          <h3>🎨 Artwork</h3>

          <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
          <button onClick={uploadArtwork} style={btn}>Upload</button>
        </section>

        {/* STATUS */}
        <section style={section}>
          <h3>📦 Status</h3>

          <select value={status} onChange={(e)=>setStatus(e.target.value)} style={input}>
            <option value="payment_required">Payment Required</option>
            <option value="paid">Paid</option>
            <option value="production">Production</option>
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
          </select>

          <button onClick={updateStatus} style={btn}>Update Status</button>
        </section>

        {/* SHIPPING */}
        <section style={section}>
          <h3>🚚 Shipping</h3>

          <input
            value={tracking}
            onChange={(e)=>setTracking(e.target.value)}
            placeholder="Tracking #"
            style={input}
          />

          <input
            value={trackingLink}
            onChange={(e)=>setTrackingLink(e.target.value)}
            placeholder="Tracking Link"
            style={input}
          />

          <div style={row}>
            <button onClick={handleTracking} style={btn}>Save Tracking</button>
            <button onClick={generatePDF} style={btn}>Export PDF</button>
          </div>
        </section>

      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const overlay = {
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,0.6)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  zIndex:999
}

const modal = {
  background:"#020617",
  padding:"20px",
  borderRadius:"12px",
  width:"500px",
  maxHeight:"90vh",
  overflowY:"auto",
  color:"#fff"
}

const header = {
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
}

const sub = {
  opacity:0.7,
  marginBottom:"10px"
}

const section = {
  marginTop:"20px",
  paddingTop:"10px",
  borderTop:"1px solid #1e293b"
}

const input = {
  width:"100%",
  marginTop:"8px",
  padding:"8px",
  borderRadius:"6px",
  border:"1px solid #1e293b",
  background:"#020617",
  color:"#fff"
}

const row = {
  display:"flex",
  gap:"10px",
  marginTop:"10px"
}

const btn = {
  flex:1,
  padding:"10px",
  background:"#1e293b",
  border:"none",
  borderRadius:"6px",
  color:"#fff",
  cursor:"pointer"
}

const success = {
  flex:1,
  padding:"10px",
  background:"#22c55e",
  border:"none",
  borderRadius:"6px",
  color:"#fff",
  cursor:"pointer"
}

const primary = {
  padding:"10px",
  background:"#06b6d4",
  border:"none",
  borderRadius:"6px",
  color:"#fff",
  cursor:"pointer"
}

const closeBtn = {
  background:"none",
  border:"none",
  color:"#fff",
  cursor:"pointer",
  fontSize:"16px"
}

export default JobModal