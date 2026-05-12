import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import api from "../../services/api"

export default function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get(`/orders/${id}`)
      setOrder(res.data?.data || null)

    } catch (err) {
      console.error("❌ LOAD ORDER ERROR:", err)
      setOrder(null)

    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  if (loading) {
    return <p style={{ color: "white", padding: 20 }}>Loading...</p>
  }

  if (!order) {
    return <p style={{ color: "white", padding: 20 }}>Order not found</p>
  }

  const address = order.address || {}

  return (
    <div style={container}>
      <button
        onClick={() => navigate("/admin/orders")}
        style={backButton}
      >
        ← Back to Orders
      </button>

      <h1>📦 Order Detail #{order._id?.slice(-6)}</h1>

      <div style={card}>
        <h2>Customer Info</h2>

        <p><b>Customer:</b> {order.customerName || "Customer"}</p>
        <p><b>Email:</b> {order.email || "Not provided"}</p>
        <p><b>Phone:</b> {order.phone || "Not provided"}</p>
        <p><b>Status:</b> {order.status}</p>
      </div>

      <div style={card}>
        <h2>Shipping Address</h2>

        {address.street ? (
          <>
            <p>{address.street}</p>
            <p>
              {address.city || ""}, {address.state || ""} {address.zip || ""}
            </p>
            <p>{address.country || "US"}</p>
          </>
        ) : (
          <p style={{ opacity: 0.7 }}>No address provided</p>
        )}
      </div>

      <div style={card}>
        <h2>Order Summary</h2>

        <p><b>Subtotal:</b> ${Number(order.subtotal || 0).toFixed(2)}</p>
        <p><b>Tax:</b> ${Number(order.tax || 0).toFixed(2)}</p>
        <p><b>Total:</b> ${Number(order.finalPrice || 0).toFixed(2)}</p>
        <p><b>COGS:</b> ${Number(order.cogs || 0).toFixed(2)}</p>
        <p><b>Profit:</b> ${Number(order.profit || 0).toFixed(2)}</p>
        <p><b>Margin:</b> {Number(order.margin || 0).toFixed(2)}%</p>
      </div>

      {/* ================= ITEMS ================= */}
      <div style={card}>
        <h2>Items</h2>

        {order.items?.length ? (
          order.items.map((item, index) => (
            <div key={`${item.name}-${index}`} style={row}>
              <span>{item.name || "Item"}</span>
              <span>{item.quantity || 1}x</span>
              <span>${Number(item.price || 0).toFixed(2)}</span>
              <span>
                {item.variant?.color || "-"} / {item.variant?.size || "-"}
              </span>
            </div>
          ))
        ) : (
          <p style={{ opacity: 0.7 }}>No items found</p>
        )}
      </div>

      {/* ================= COST EDITOR ================= */}
      <CostEditor order={order} onSaved={load} />
    </div>
  )
}

/* ================= COST EDITOR ================= */

function CostEditor({ order, onSaved }) {
  const [items, setItems] = useState(order.items || [])
  const [saving, setSaving] = useState(false)

  const update = (index, value) => {
    setItems(prevItems => {
      const copy = [...prevItems]

      copy[index] = {
        ...copy[index],
        cost: value
      }

      return copy
    })
  }

  const save = async () => {
    try {
      setSaving(true)

      await api.patch(`/orders/${order._id}/cost`, {
        costs: items.map((item, index) => ({
          index,
          cost: Number(item.cost || 0)
        }))
      })

      alert("✅ Costs updated")
      onSaved()

    } catch (err) {
      console.error("❌ SAVE COST ERROR:", err)
      alert("Failed to update costs")

    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={card}>
      <h2>💰 Edit Costs</h2>

      {items.length ? (
        items.map((item, index) => (
          <div key={`${item.name}-${index}`} style={row}>
            <span>{item.name || "Item"}</span>

            <input
              type="number"
              placeholder="Cost"
              value={item.cost || ""}
              onChange={(e) => update(index, e.target.value)}
              style={input}
            />
          </div>
        ))
      ) : (
        <p style={{ opacity: 0.7 }}>No editable items found</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{
          ...button,
          opacity: saving ? 0.6 : 1
        }}
      >
        {saving ? "Saving..." : "Save Costs"}
      </button>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  background: "#020617",
  color: "white",
  minHeight: "100vh"
}

const card = {
  background: "#1e293b",
  padding: 15,
  marginTop: 10,
  borderRadius: 10
}

const row = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: 10,
  alignItems: "center",
  marginTop: 8
}

const input = {
  width: 100,
  padding: 7,
  borderRadius: 4,
  border: "none"
}

const button = {
  marginTop: 15,
  padding: "10px 15px",
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold"
}

const backButton = {
  marginBottom: 15,
  padding: "8px 12px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
}