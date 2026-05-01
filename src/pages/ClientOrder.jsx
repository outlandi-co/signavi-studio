import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function ClientOrder() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || id === "null") {
      console.warn("⚠️ Invalid order ID:", id)
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}/client`)
        setOrder(res.data)
      } catch (err) {
        console.error("❌ CLIENT ORDER ERROR:", err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>
  if (!order) return <p style={{ padding: 20 }}>Order not found</p>

  const approve = async () => {
    try {
      await api.patch(`/orders/${id}/client-approve`)
      alert("Approved!")
    } catch (err) {
      console.error("❌ APPROVE ERROR:", err)
    }
  }

  const deny = async () => {
    try {
      await api.patch(`/orders/${id}/client-deny`)
      alert("Denied")
    } catch (err) {
      console.error("❌ DENY ERROR:", err)
    }
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Order Approval</h2>

      <p><b>{order.customerName}</b></p>
      <p>{order.email}</p>

      {order.items?.map((item, i) => (
        <div key={i}>
          <p>{item.name} x {item.quantity}</p>
        </div>
      ))}

      <h3>Total: ${order.finalPrice}</h3>

      {order.approvalStatus === "pending" && (
        <>
          <button onClick={approve}>✅ Approve</button>
          <button onClick={deny}>❌ Deny</button>
        </>
      )}

      {order.trackingNumber && (
        <a href={order.trackingLink} target="_blank" rel="noreferrer">
          Track Package
        </a>
      )}
    </div>
  )
}

export default ClientOrder