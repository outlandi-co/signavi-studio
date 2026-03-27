import { useState, useEffect } from "react"
import api from "../services/api"

export default function InvoiceEditor({ order = {}, onSave }) {
  const [items, setItems] = useState(order.items || [])
  const [loading, setLoading] = useState(false)

  /* 🔒 LOCK IF PAID */
  const isLocked = order.status === "paid"

  /* 🔄 SYNC WHEN ORDER CHANGES (IMPORTANT FIX) */
  useEffect(() => {
    setItems(order.items || [])
  }, [order])

  const updateItem = (index, field, value) => {
    const updated = [...items]

    updated[index][field] =
      field === "name"
        ? value
        : Number(value) || 0

    setItems(updated)
  }

  const addItem = () => {
    if (isLocked) return

    setItems([
      ...items,
      { name: "", quantity: 1, price: 0 }
    ])
  }

  const removeItem = (index) => {
    if (isLocked) return
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.quantity || 0))
  }, 0)

  const handleSave = async () => {
    if (isLocked) {
      alert("Invoice is locked after payment")
      return
    }

    /* 🚨 PREVENT EMPTY SAVE */
    if (!items.length) {
      alert("Add at least one item")
      return
    }

    try {
      setLoading(true)

      console.log("🧾 Saving invoice:", items, total)

      await api.patch(`/orders/${order._id}/invoice`, {
        items,
        total
      })

      alert("✅ Invoice saved")

      if (onSave) onSave(items, total)

    } catch (err) {
      console.error("❌ Save error:", err)

      alert(
        err.response?.data?.message ||
        "Failed to save invoice"
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>🧾 Edit Invoice</h3>

      {isLocked && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          🔒 Invoice locked after payment
        </p>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10
          }}
        >
          <input
            value={item.name || ""}
            placeholder="Item name"
            disabled={isLocked}
            onChange={(e) =>
              updateItem(i, "name", e.target.value)
            }
          />

          <input
            type="number"
            min="1"
            value={item.quantity || 1}
            disabled={isLocked}
            onChange={(e) =>
              updateItem(i, "quantity", e.target.value)
            }
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={item.price || 0}
            disabled={isLocked}
            onChange={(e) =>
              updateItem(i, "price", e.target.value)
            }
          />

          <button
            onClick={() => removeItem(i)}
            disabled={isLocked}
          >
            ❌
          </button>
        </div>
      ))}

      <button onClick={addItem} disabled={isLocked}>
        + Add Item
      </button>

      <h3 style={{ marginTop: 20 }}>
        Total: ${total.toFixed(2)}
      </h3>

      <button
        onClick={handleSave}
        disabled={isLocked || loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: isLocked ? "#555" : "black",
          color: "white",
          cursor: isLocked ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}