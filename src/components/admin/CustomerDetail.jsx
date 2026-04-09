import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"
import OrderModal from "../../components/modals/OrderModal"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "")

export default function CustomerDetail() {

  const { id } = useParams()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    try {
      const res = await api.get(`/customers/${id}`)
      setCustomer(res.data.customer)
      setOrders(res.data.orders)
    } catch (err) {
      console.error("❌ CUSTOMER DETAIL ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    load()
  }, [load])

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = () => {
      console.log("🔄 CUSTOMER DETAIL LIVE UPDATE")
      load()
    }

    socket.on("customerUpdated", handleUpdate)

    return () => {
      socket.off("customerUpdated", handleUpdate)
    }

  }, [load])

  /* ================= LOADING ================= */
  if (loading) return <p className="text-white">Loading...</p>
  if (!customer) return <p className="text-red-500">Customer not found</p>

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">👤 Customer Detail</h1>

      {/* CUSTOMER INFO */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-800">
        <p className="text-sm text-gray-400">{customer.email}</p>

        <div className="flex gap-6 mt-3">
          <p>Orders: <strong>{customer.totalOrders || 0}</strong></p>
          <p>Spent: <strong>${customer.totalSpent || 0}</strong></p>
        </div>
      </div>

      {/* ORDERS */}
      <h2 className="text-xl mb-4">📦 Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">No orders yet</p>
      ) : (
        <div className="grid gap-4">

          {orders.map(order => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-gray-900 border border-gray-800 p-4 rounded-lg cursor-pointer hover:border-cyan-500 transition"
            >
              <p>ID: {order._id}</p>
              <p>Status: {order.status}</p>
              <p>Qty: {order.quantity}</p>
              <p>Price: ${order.finalPrice || order.price || 0}</p>
            </div>
          ))}

        </div>
      )}

      {/* 🔥 ORDER MODAL */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={load}
        />
      )}

    </div>
  )
}