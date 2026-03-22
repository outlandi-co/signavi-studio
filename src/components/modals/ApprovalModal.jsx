import { useState } from "react"
import api from "../../services/api"

function ApprovalModal({ job, onClose, refresh }) {
  const [price, setPrice] = useState("")
  const [shipping, setShipping] = useState("")

  const approve = async () => {
    await api.patch(`/orders/${job._id}/approve`, {
      price: Number(price),
      shipping: Number(shipping)
    })

    refresh()
    onClose()
  }

  const deny = async () => {
    await api.patch(`/orders/${job._id}/deny`)

    refresh()
    onClose()
  }

  return (
    <div style={modal}>
      <h3>Approve Order</h3>

      <p><strong>{job.customerName}</strong></p>

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={input}
      />

      <input
        placeholder="Shipping"
        value={shipping}
        onChange={(e) => setShipping(e.target.value)}
        style={input}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={approve}>✅ Approve</button>
        <button onClick={deny} style={{ marginLeft: "10px" }}>
          ❌ Deny
        </button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

const modal = {
  position: "fixed",
  top: "20%",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  color: "white",
  zIndex: 1000
}

const input = {
  display: "block",
  marginTop: "10px",
  padding: "8px",
  width: "100%"
}

export default ApprovalModal