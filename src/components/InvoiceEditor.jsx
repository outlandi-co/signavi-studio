import { useState } from "react"

export default function InvoiceEditor({ order = {}, onSave }) {
  const [items, setItems] = useState(order.items || [])

  const updateItem = (index, field, value) => {
    const updated = [...items]

    updated[index][field] =
      field === "name"
        ? value
        : Number(value) || 0

    setItems(updated)
  }

  const addItem = () => {
    setItems([
      ...items,
      { name: "New Item", quantity: 1, price: 0 }
    ])
  }

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
  }

  const total = items.reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.quantity || 0))
  }, 0)

  const handleSave = () => {
    console.log("🧾 SAVE CLICKED")
    console.log("🧾 ITEMS:", items)
    console.log("🧾 TOTAL:", total)
    console.log("🧾 onSave:", onSave)

    if (typeof onSave !== "function") {
      console.error("❌ onSave is not a function")
      alert("Save function not connected")
      return
    }

    onSave(items, total)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>🧾 Edit Invoice</h3>

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
            onChange={(e) =>
              updateItem(i, "name", e.target.value)
            }
          />

          <input
            type="number"
            value={item.quantity || 0}
            onChange={(e) =>
              updateItem(i, "quantity", e.target.value)
            }
          />

          <input
            type="number"
            value={item.price || 0}
            onChange={(e) =>
              updateItem(i, "price", e.target.value)
            }
          />

          <button onClick={() => removeItem(i)}>
            ❌
          </button>
        </div>
      ))}

      <button onClick={addItem}>+ Add Item</button>

      <h3 style={{ marginTop: 20 }}>
        Total: ${total.toFixed(2)}
      </h3>

      <button
        onClick={handleSave}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "black",
          color: "white",
          cursor: "pointer"
        }}
      >
        Save Changes
      </button>
    </div>
  )
}

