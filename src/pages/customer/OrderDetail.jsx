import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:5050"

export default function OrderDetail() {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data)
      } catch (err) {
        console.error("❌ ORDER LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* ================= SOCKET ================= */
  useEffect(() => {

    // 🔥 prevent multiple connections
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder)
      }
    }

    socket.on("jobUpdated", handleUpdate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
    }

  }, [id])

  if (loading) return <p>Loading...</p>
  if (!order) return <p>Order not found</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Order Detail</h1>

      <p><strong>ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Customer:</strong> {order.customerName}</p>
      <p><strong>Quantity:</strong> {order.quantity}</p>
    </div>
  )
}