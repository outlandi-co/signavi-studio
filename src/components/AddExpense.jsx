import { useState } from "react"
import api from "../services/api"

function AddExpense({ onAdded = () => {} }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("general")
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!name || !amount) {
      alert("Fill all fields")
      return
    }

    try {
      setLoading(true)

      await api.post("/expenses", {
        name,
        amount: Number(amount),
        category
      })

      setName("")
      setAmount("")
      setCategory("general")

      onAdded()
      alert("✅ Expense added")

    } catch (err) {
      console.error(err)
      alert("❌ Failed to add expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <h3>➕ Add Expense</h3>

      <input
        placeholder="Expense name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={input}
      />

      <input
        placeholder="Amount ($)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={input}
        type="number"
      />

      {/* 🔥 NEW: CATEGORY */}
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={input}
      >
        <option value="general">General</option>
        <option value="materials">Materials</option>
        <option value="ads">Ads</option>
        <option value="shipping">Shipping</option>
        <option value="tools">Tools</option>
      </select>

      <button
        onClick={submit}
        style={button}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px"
}

const input = {
  display: "block",
  marginBottom: "10px",
  padding: "8px",
  width: "100%",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const button = {
  padding: "8px 12px",
  background: "#22c55e",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
}

export default AddExpense