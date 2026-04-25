import { useState, useEffect } from "react"
import api from "../services/api"

/* 🔥 COMPANY INFO */
const COMPANY = {
  name: "SignaVi Studio",
  website: "www.signavistudio.store",
  email: "support@signavistudio.store"
}

export default function InvoiceEditor({ order = {}, onSave }) {

  const [items, setItems] = useState(order.items || [])
  const [shipping, setShipping] = useState(order.shipping || 0)
  const [taxRate, setTaxRate] = useState(0.0825)
  const [loading, setLoading] = useState(false)

  const isLocked = order.status === "paid"

  /* 🔄 SYNC ORDER */
  useEffect(() => {
    setItems(order.items || [])
    setShipping(order.shipping || 0)
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
    setItems([...items, { name: "", quantity: 1, price: 0 }])
  }

  const removeItem = (index) => {
    if (isLocked) return
    setItems(items.filter((_, i) => i !== index))
  }

  /* 🔥 CALCULATIONS */
  const subtotal = items.reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.quantity || 0))
  }, 0)

  const tax = subtotal * taxRate
  const total = subtotal + tax + Number(shipping || 0)

  /* 💾 SAVE */
  const handleSave = async () => {
    if (isLocked) {
      alert("Invoice is locked after payment")
      return
    }

    if (!items.length) {
      alert("Add at least one item")
      return
    }

    try {
      setLoading(true)

      await api.patch(`/orders/${order._id}/invoice`, {
        items,
        subtotal,
        tax,
        shipping,
        total
      })

      alert("✅ Invoice saved")

      if (onSave) {
        onSave({ items, subtotal, tax, shipping, total })
      }

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

      {/* 🔥 INVOICE HEADER */}
      <div
        style={{
          marginBottom: 25,
          borderBottom: "2px solid #000",
          paddingBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}
      >

        {/* LEFT: COMPANY */}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: 1
            }}
          >
            {COMPANY.name}
          </h1>

          <p style={{ margin: 0 }}>
            {COMPANY.website}
          </p>

          <p style={{ margin: 0 }}>
            {COMPANY.email}
          </p>
        </div>

        {/* RIGHT: INVOICE INFO */}
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0 }}>INVOICE</h2>

          {order?._id && (
            <p style={{ margin: 0 }}>
              #{order._id.slice(-6)}
            </p>
          )}

          {order?.createdAt && (
            <p style={{ margin: 0 }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

      </div>

      <h3>🧾 Edit Invoice</h3>

      {isLocked && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          🔒 Invoice locked after payment
        </p>
      )}

      {/* 🔥 ITEMS */}
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

      {/* 🔥 SHIPPING */}
      <div style={{ marginTop: 15 }}>
        <label>Shipping:</label>
        <input
          type="number"
          value={shipping}
          disabled={isLocked}
          onChange={(e) => setShipping(Number(e.target.value) || 0)}
        />
      </div>

      {/* 🔥 TAX */}
      <div style={{ marginTop: 10 }}>
        <label>Tax Rate:</label>
        <input
          type="number"
          step="0.01"
          value={taxRate}
          disabled={isLocked}
          onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
        />
      </div>

      {/* 🔥 TOTALS */}
      <div style={{ marginTop: 20 }}>
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <p>Shipping: ${Number(shipping).toFixed(2)}</p>

        <h3>Total: ${total.toFixed(2)}</h3>
      </div>

      {/* 🔥 SAVE */}
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