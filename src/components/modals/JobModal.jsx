import { useState, useEffect } from "react"
import api from "../../services/api"
import jsPDF from "jspdf"
import InvoiceEditor from "../InvoiceEditor"

function JobModal({ job, onClose, refresh }) {

  const [status, setStatus] = useState(job?.status || "pending")
  const [price, setPrice] = useState(job?.price || "")
  const [shipping, setShipping] = useState(job?.shippingCost || "")
  const [tracking, setTracking] = useState(job?.trackingNumber || "")
  const [trackingLink, setTrackingLink] = useState(job?.trackingLink || "")
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(null)

  /* 🔥 LOCK BACKGROUND SCROLL */
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  useEffect(() => {
    if (!job) return

    if (!job.artwork) setAiSuggestion("reject ❌")
    else if (job.quantity > 50) setAiSuggestion("approve ✅")
    else setAiSuggestion("review ⚠️")
  }, [job])

  if (!job) return null

  const safeRefresh = (data) => {
    if (refresh) refresh(data || null)
  }

  const costTotal = (job?.items || []).reduce((sum, item) => {
    const cost = Number(item.cost || 0)
    return sum + (cost * Number(item.quantity || 0))
  }, 0)

  const sellTotal = Number(job?.total || job?.finalPrice || 0)
  const profit = sellTotal - costTotal
  const margin = sellTotal ? (profit / sellTotal) * 100 : 0

  const handleApprove = async () => {
    if (!price) return alert("Enter price")

    setLoading(true)
    try {
      const res = await api.patch(`/orders/${job._id}/approve`, {
        price: Number(price),
        shipping: Number(shipping || 0)
      })

      safeRefresh(res.data)
      onClose()
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
      alert("Approve failed")
    } finally {
      setLoading(false)
    }
  }

  const sendForApproval = async () => {
    setLoading(true)
    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status: "artwork_sent"
      })

      safeRefresh(res.data)
      alert("📧 Sent to customer for approval!")
    } catch (err) {
      console.error("❌ SEND ERROR:", err)
      alert("Failed")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async () => {
    setLoading(true)
    try {
      const res = await api.patch(`/orders/${job._id}/status`, { status })
      safeRefresh(res.data)
    } catch (err) {
      console.error("STATUS ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    setLoading(true)
    try {
      const res = await api.patch(`/orders/${job._id}/status`, {
        status: "denied"
      })

      safeRefresh(res.data)
      onClose()
    } catch (err) {
      console.error("DENY ERROR:", err)
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
        trackingLink
      })

      safeRefresh(res.data)
    } catch (err) {
      console.error("TRACKING ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    doc.text("Production Work Order", 20, 20)
    doc.text(`Customer: ${job.customerName}`, 20, 40)
    doc.text(`Order ID: ${job._id}`, 20, 50)
    doc.text(`Status: ${job.status}`, 20, 60)
    doc.save(`order-${job._id}.pdf`)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose} style={closeBtn}>✖</button>

        <h2>Production Control</h2>

        {/* 🔥 LOADING FIX */}
        {loading && (
          <p style={{ color: "#22c55e", marginBottom: "10px" }}>
            ⏳ Processing...
          </p>
        )}

        <InvoiceEditor order={job} />

        <div style={profitBox}>
          <p>💸 Cost: ${costTotal.toFixed(2)}</p>
          <p>💰 Sell: ${sellTotal.toFixed(2)}</p>
          <p>📈 Profit: ${profit.toFixed(2)}</p>
          <p>📊 Margin: {margin.toFixed(1)}%</p>
        </div>

        {aiSuggestion && <p style={aiBox}>🤖 {aiSuggestion}</p>}

        <p><b>{job.customerName}</b></p>
        <p>{job.email}</p>

        {/* ================= ITEMS TABLE ================= */}
{job.items && job.items.length > 0 && (
  <div style={{ marginTop: "15px" }}>
    <h3>Items</h3>

    <div style={{
      borderTop: "1px solid #1e293b",
      marginTop: "8px",
      paddingTop: "10px"
    }}>
      {job.items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px"
          }}
        >
          <span>{item.name}</span>
          <span>
            x{item.quantity} • ${item.price}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

        <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price" style={input}/>
        <input value={shipping} onChange={(e)=>setShipping(e.target.value)} placeholder="Shipping" style={input}/>

        <button disabled={loading} onClick={handleApprove} style={{...btn, background:"#22c55e"}}>Approve</button>
        <button disabled={loading} onClick={sendForApproval} style={{...btn, background:"#06b6d4"}}>Send Approval</button>
        <button disabled={loading} onClick={handleDeny} style={{...btn, background:"#ef4444"}}>Deny</button>

        <select value={status} onChange={(e)=>setStatus(e.target.value)} style={input}>
          <option value="approved">Approved</option>
          <option value="printing">Printing</option>
          <option value="shipping">Shipping</option>
          <option value="shipped">Shipped</option>
        </select>

        <button disabled={loading} onClick={updateStatus} style={btn}>Update Status</button>

        <input value={tracking} onChange={(e)=>setTracking(e.target.value)} placeholder="Tracking #" style={input}/>
        <input value={trackingLink} onChange={(e)=>setTrackingLink(e.target.value)} placeholder="Tracking Link" style={input}/>

        <button disabled={loading} onClick={handleTracking} style={{...btn, background:"#2563eb"}}>Add Tracking</button>

        <button onClick={generatePDF} style={{...btn, background:"#2563eb"}}>Export PDF</button>

      </div>
    </div>
  )
}

/* 🔥 FINAL CORRECT STYLES */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
}

const modal = {
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  width: "450px",
  maxWidth: "90%",
  color: "#fff",

  /* 🔥 REAL FIX */
  maxHeight: "85vh",
  overflowY: "auto",

  boxShadow: "0 0 30px rgba(0,0,0,0.6)"
}

const btn = { padding:"10px", borderRadius:"6px", border:"none", marginTop:"8px", color:"#fff", cursor:"pointer" }
const input = { width:"100%", marginTop:"8px", padding:"8px" }
const closeBtn = { float:"right", background:"none", border:"none", color:"#fff", cursor:"pointer" }
const aiBox = { background:"#020617", padding:"6px", borderRadius:"6px", color:"#06b6d4" }
const profitBox = { marginTop:15, padding:10, border:"1px solid #1e293b", borderRadius:8 }

export default JobModal