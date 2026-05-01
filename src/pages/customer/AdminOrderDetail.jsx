import { useParams } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import api from "../services/api"

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */
  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data.data)
    } catch (err) {
      console.error("❌ LOAD ORDER ERROR:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p style={{ color: "white", padding: 20 }}>Loading...</p>
  }

  if (!order) {
    return <p style={{ color: "white", padding: 20 }}>Order not found</p>
  }

  return (
    <div style={container}>
      <h1>📦 Order Detail</h1>

      <div style={card}>
        <p><b>Customer:</b> {order.customerName}</p>
        <p><b>Email:</b> {order.email}</p>
        <p><b>Status:</b> {order.status}</p>
        <p><b>Total:</b> ${Number(order.finalPrice || 0).toFixed(2)}</p>
        <p><b>Profit:</b> ${Number(order.profit || 0).toFixed(2)}</p>
        <p><b>Margin:</b> {Number(order.margin || 0).toFixed(2)}%</p>
      </div>

      {/* ================= ITEMS ================= */}
      <div style={card}>
        <h2>Items</h2>

        {order.items?.map((item, i) => (
          <div key={i} style={row}>
            <span>{item.name}</span>
            <span>{item.quantity}x</span>
            <span>${Number(item.price || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* ================= COST EDITOR ================= */}
      <CostEditor order={order} onSaved={load} />
    </div>
  )
}

/* ================= COST EDITOR ================= */

function CostEditor({ order, onSaved }) {
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)

  /* 🔥 SYNC ITEMS WHEN ORDER CHANGES */
  useEffect(() => {
    setItems(order.items || [])
  }, [order])

  const update = (i, value) => {
    const copy = [...items]
    copy[i] = {
      ...copy[i],
      cost: value
    }
    setItems(copy)
  }

  const save = async () => {
    try {
      setSaving(true)

      await api.patch(`/orders/${order._id}/cost`, {
        costs: items.map((item, i) => ({
          index: i,
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

      {items.map((item, i) => (
        <div key={i} style={row}>
          <span>{item.name}</span>

          <input
            type="number"
            placeholder="Cost"
            value={item.cost || ""}
            onChange={(e) => update(i, e.target.value)}
            style={input}
          />
        </div>
      ))}

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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8
}

const input = {
  width: 80,
  padding: 5,
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