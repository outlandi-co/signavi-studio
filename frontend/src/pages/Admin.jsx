import { useEffect, useState } from "react"
import api from "../services/api"
import { io } from "socket.io-client"

const socket = io("http://localhost:5050")

function Admin() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders")
      setOrders(res.data || [])
    } catch (err) {
      console.error("❌ FETCH ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    socket.on("orderCreated", (order) => {
      setOrders(prev => [order, ...prev])
    })

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders(prev =>
        prev.map(o =>
          o._id === updatedOrder._id ? updatedOrder : o
        )
      )
    })

    return () => {
      socket.off("orderCreated")
      socket.off("orderUpdated")
    }
  }, [])

  /* 🔥 UPDATE STATUS */
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id)

      const res = await api.put(`/orders/${id}/status`, { status })

      setOrders(prev =>
        prev.map(o =>
          o._id === id ? res.data : o
        )
      )

    } catch (err) {
      console.error("❌ ERROR:", err)

      setOrders(prev =>
        prev.map(o =>
          o._id === id ? { ...o, status } : o
        )
      )

    } finally {
      setUpdatingId(null)
    }
  }

  const getOrders = (status) =>
    orders.filter(o => o.status === status)

  /* 🔥 COLUMN COMPONENT */
  const Column = ({ title, status, color }) => (
    <div className="card flex flex-col gap-3">

      <h3 className="text-sm font-semibold tracking-wide" style={{ color }}>
        {title}
      </h3>

      {getOrders(status).length === 0 && (
        <p className="text-xs text-gray-400">No orders</p>
      )}

      {getOrders(status).map(order => (
        <div
          key={order._id}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-sm flex flex-col gap-2"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <strong className="text-sm">{order.orderId}</strong>
            <span className="text-xs text-gray-400">
              ${order.total}
            </span>
          </div>

          {/* ITEMS */}
          <div className="text-xs text-gray-500">
            {order.items?.map(item => (
              <p key={item._id}>
                {item.name} x{item.quantity}
              </p>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-2 flex-wrap">

            {status === "paid" && (
              <button
                className="btn btn-primary"
                disabled={updatingId === order._id}
                onClick={() => updateStatus(order._id, "printing")}
              >
                ▶ Start
              </button>
            )}

            {status === "printing" && (
              <button
                className="btn btn-info"
                disabled={updatingId === order._id}
                onClick={() => updateStatus(order._id, "completed")}
              >
                ✔ Done
              </button>
            )}

            {status === "completed" && (
              <button
                className="btn btn-warning"
                disabled={updatingId === order._id}
                onClick={() => updateStatus(order._id, "shipped")}
              >
                🚚 Ship
              </button>
            )}

            {status === "shipped" && (
              <button
                className="btn btn-success"
                disabled={updatingId === order._id}
                onClick={() => updateStatus(order._id, "delivered")}
              >
                📬 Deliver
              </button>
            )}

          </div>

          {/* LOADING INDICATOR */}
          {updatingId === order._id && (
            <p className="text-xs text-purple-400 animate-pulse">
              Updating...
            </p>
          )}

        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Production Workflow
        </h2>
        <span className="text-sm text-gray-400">
          Live updates enabled
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <Column title="🟡 Paid" status="paid" color="gold" />
        <Column title="🔵 Printing" status="printing" color="skyblue" />
        <Column title="🟢 Completed" status="completed" color="limegreen" />
        <Column title="📦 Shipped" status="shipped" color="orange" />
        <Column title="📬 Delivered" status="delivered" color="lightgreen" />

      </div>

    </div>
  )
}

export default Admin