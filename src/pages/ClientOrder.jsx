import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function ClientOrder() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}/client`)
      .then(res => setOrder(res.data))
  }, [id])

  if (!order) return <p>Loading...</p>

  const approve = async () => {
    await api.patch(`/orders/${id}/client-approve`)
    alert("Approved!")
  }

  const deny = async () => {
    await api.patch(`/orders/${id}/client-deny`)
    alert("Denied")
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Order Approval</h2>

      <p><b>{order.customerName}</b></p>
      <p>{order.email}</p>

      {/* ITEMS */}
      {order.items?.map((item, i) => (
        <div key={i}>
          <p>{item.name} x {item.quantity}</p>
        </div>
      ))}

      {/* PRICE */}
      <h3>Total: ${order.finalPrice}</h3>

      {/* ACTIONS */}
      {order.approvalStatus === "pending" && (
        <>
          <button onClick={approve}>✅ Approve</button>
          <button onClick={deny}>❌ Deny</button>
        </>
      )}

      {/* TRACKING */}
      {order.trackingNumber && (
        <a href={order.trackingLink} target="_blank">
          Track Package
        </a>
      )}
    </div>
  )
}

export default ClientOrder