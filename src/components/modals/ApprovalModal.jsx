import { useState, useEffect } from "react"
import api from "../../services/api"

function ApprovalModal({ job, onClose, refresh }) {
  const [price, setPrice] = useState("")
  const [shipping, setShipping] = useState("")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const approve = async () => {
    await api.patch(`/production/orders/${job._id}/approve`, {
      price: Number(price),
      shipping: Number(shipping)
    })
    refresh()
    onClose()
  }

  const deny = async () => {
    await api.patch(`/production/orders/${job._id}/deny`)
    refresh()
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e)=>e.stopPropagation()}>

        <h3>Approve Order</h3>

        <p><strong>{job.customerName}</strong></p>

        <input placeholder="Price" value={price} onChange={(e)=>setPrice(e.target.value)} style={input}/>
        <input placeholder="Shipping" value={shipping} onChange={(e)=>setShipping(e.target.value)} style={input}/>

        <div style={{ marginTop:"10px" }}>
          <button onClick={approve}>✅ Approve</button>
          <button onClick={deny} style={{ marginLeft:"10px" }}>❌ Deny</button>
          <button onClick={onClose} style={{ marginLeft:"10px" }}>Cancel</button>
        </div>

      </div>
    </div>
  )
}

const overlay = {
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,0.5)",
  display:"flex",
  justifyContent:"center",
  alignItems:"flex-start",
  overflowY:"auto",
  padding:"40px 0",
  zIndex:1000
}

const modal = {
  background:"#020617",
  padding:"20px",
  borderRadius:"12px",
  color:"white",
  width:"400px"
}

const input = {
  display:"block",
  marginTop:"10px",
  padding:"8px",
  width:"100%"
}

export default ApprovalModal