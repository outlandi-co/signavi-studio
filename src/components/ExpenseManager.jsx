import { useEffect, useState } from "react"
import api from "../services/api"

function ExpenseManager({ onChange = () => {} }) {
  const [expenses, setExpenses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ name: "", amount: "" })

  /* ================= LOAD ================= */
  const loadExpenses = async () => {
    try {
      const res = await api.get("/expenses")
      setExpenses(res.data)
    } catch (err) {
      console.error("❌ Load expenses error:", err)
    }
  }

  /* ✅ FIXED EFFECT (INLINE ASYNC) */
  useEffect(() => {
    const init = async () => {
      await loadExpenses()
    }
    init()
  }, [])

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!window.confirm("Delete expense?")) return

    try {
      await api.delete(`/expenses/${id}`)
      await loadExpenses()
      onChange()
    } catch (err) {
      console.error("❌ Delete error:", err)
    }
  }

  /* ================= EDIT ================= */
  const startEdit = (exp) => {
    setEditingId(exp._id)
    setEditData({
      name: exp.name,
      amount: exp.amount
    })
  }

  const saveEdit = async () => {
    try {
      await api.post("/expenses", {
        _id: editingId,
        name: editData.name,
        amount: Number(editData.amount)
      })

      setEditingId(null)
      await loadExpenses()
      onChange()

    } catch (err) {
      console.error("❌ Update error:", err)
    }
  }

  return (
    <div style={container}>
      <h3>🧾 Expenses</h3>

      {expenses.map(exp => (
        <div key={exp._id} style={row}>
          {editingId === exp._id ? (
            <>
              <input
                value={editData.name}
                onChange={e =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />

              <input
                type="number"
                value={editData.amount}
                onChange={e =>
                  setEditData({ ...editData, amount: e.target.value })
                }
              />

              <button onClick={saveEdit}>💾</button>
              <button onClick={() => setEditingId(null)}>❌</button>
            </>
          ) : (
            <>
              <span>{exp.name}</span>
              <span>${exp.amount}</span>

              <button onClick={() => startEdit(exp)}>✏️</button>
              <button onClick={() => remove(exp._id)}>🗑</button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  marginTop: 20,
  background: "#0f172a",
  padding: 15,
  borderRadius: 10
}

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
  gap: 10
}

export default ExpenseManager