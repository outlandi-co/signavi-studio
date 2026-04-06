import { useState, useEffect } from "react"
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

  const isQuote = job?.status === "quote" || job?.type === "quote"

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  useEffect(() => {
    if (!job) return

    if (!job.artwork) setAiSuggestion("Upload artwork first")
    else if (job.quantity > 50) setAiSuggestion("Bulk order detected")
    else setAiSuggestion("Ready for pricing")
  }, [job])

  if (!job) return null

  const safeRefresh = (data) => {
    if (refresh) refresh(data || null)
  }

  /* ================= CONVERT ================= */
  const convertToOrder = async () => {
    try {
      setLoading(true)

      await api.post(`/quotes/${job._id}/convert`)

      alert("Converted to Order")
      safeRefresh()
      onClose()

    } catch (error) {
      console.error(error)
      alert("Conversion failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= AI ================= */
  const generateAIPrice = async () => {
    try {
      const res = await api.post("/ai-pricing", {
        quantity: job.quantity,
        printType: job.printType
      })

      const suggested = Number(res.data.suggestedPrice)
      setPrice(suggested)
      setAiSuggestion(`Suggested: $${suggested}`)

    } catch (error) {
      console.error(error)
      setAiSuggestion("AI pricing not set up")
    }
  }

  /* ================= UPLOAD ================= */
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

    } catch (error) {
      console.error(error)
      alert("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= APPROVE ================= */
  const handleApprove = async () => {
    if (isQuote) return alert("Convert quote first")

    if (!price || price <= 0) return alert("Enter price")

    setLoading(true)

    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status: "payment_required",
        price,
        finalPrice: price
      })

      safeRefresh(res.data)
      alert("Payment requested")

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  /* ================= STATUS ================= */
  const updateStatus = async () => {
    if (isQuote) return alert("Convert quote first")

    setLoading(true)

    try {
      const res = await api.patch(`/orders/${job._id}/status`, { status })
      safeRefresh(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  /* ================= TRACKING ================= */
  const handleTracking = async () => {
    if (isQuote) return alert("Convert quote first")

    setLoading(true)

    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status,
        trackingNumber: tracking,
        trackingLink
      })

      safeRefresh(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  /* ================= PDF ================= */
  const generatePDF = () => {
    const doc = new jsPDF()
    doc.text("Work Order", 20, 20)
    doc.text(`Customer: ${job.customerName || "Unknown"}`, 20, 40)
    doc.text(`Order ID: ${job._id}`, 20, 50)
    doc.save(`order-${job._id}.pdf`)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose} style={closeBtn}>✖</button>

        <h2>Production</h2>
        <p>👤 {job.customerName || "Unknown"}</p>

        {isQuote && (
          <button onClick={convertToOrder} style={{...btn, background:"#22c55e"}}>
            🔄 Convert to Order
          </button>
        )}

        {loading && <p>⏳ Processing...</p>}

        <InvoiceEditor
          order={job}
          onSave={(items, total) => setPrice(total)}
        />

        <p>💰 Price: ${price}</p>

        {/* 🔥 FIXED AI DISPLAY */}
        {aiSuggestion && (
          <p style={{ color:"#06b6d4", marginTop:10 }}>
            🤖 {aiSuggestion}
          </p>
        )}

        <button onClick={generateAIPrice} style={btn}>
          🤖 AI Price
        </button>

        <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
        <button onClick={uploadArtwork} style={btn}>Upload Artwork</button>

        <input value={price} onChange={(e)=>setPrice(Number(e.target.value))} style={input} />

        <button onClick={handleApprove} style={{...btn, background:"#22c55e"}}>
          Request Payment
        </button>

        <select value={status} onChange={(e)=>setStatus(e.target.value)} style={input}>
          <option value="payment_required">Payment Required</option>
          <option value="paid">Paid</option>
          <option value="production">Production</option>
          <option value="shipping">Shipping</option>
          <option value="shipped">Shipped</option>
        </select>

        <button onClick={updateStatus} style={btn}>Update Status</button>

        <input value={tracking} onChange={(e)=>setTracking(e.target.value)} placeholder="Tracking #" style={input}/>
        <input value={trackingLink} onChange={(e)=>setTrackingLink(e.target.value)} placeholder="Tracking Link" style={input}/>

        <button onClick={handleTracking} style={{...btn, background:"#2563eb"}}>
          Add Tracking
        </button>

        <button onClick={generatePDF} style={{...btn, background:"#2563eb"}}>
          Export PDF
        </button>

      </div>
    </div>
  )
}

/* ================= STYLES ================= */
const overlay = {
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,0.5)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center"
}

const modal = {
  background:"#020617",
  padding:"20px",
  borderRadius:"12px",
  width:"420px",
  color:"#fff"
}

const btn = {
  padding:"10px",
  marginTop:"8px",
  cursor:"pointer",
  borderRadius:"6px",
  border:"none"
}

const input = {
  width:"100%",
  marginTop:"8px",
  padding:"8px"
}

const closeBtn = {
  float:"right",
  background:"none",
  border:"none",
  color:"#fff",
  cursor:"pointer"
}

export default JobModal