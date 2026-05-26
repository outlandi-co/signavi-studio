import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import api from "../services/api"

const categories = [
  "all",
  "general",
  "materials",
  "ads",
  "shipping",
  "tools",
  "equipment",
  "software",
  "rent",
  "utilities",
  "labor"
]

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getExpenseArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.expenses)) return data.expenses

  return []
}

function ExpenseManager({
  onChange = () => {}
}) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  const [editData, setEditData] = useState({
    name: "",
    amount: "",
    category: "general",
    note: ""
  })

  const [filter, setFilter] = useState("all")

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get("/expenses")

      setExpenses(getExpenseArray(res.data))
    } catch (err) {
      console.error("❌ LOAD EXPENSES ERROR:", err)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExpenses()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadExpenses])

  const filteredExpenses = useMemo(() => {
    if (filter === "all") return expenses

    return expenses.filter(
      (expense) => expense.category === filter
    )
  }, [
    expenses,
    filter
  ])

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    )
  }, [filteredExpenses])

  const remove = async (id) => {
    if (!window.confirm("Delete expense?")) return

    try {
      await api.delete(`/expenses/${id}`)
      await loadExpenses()
      onChange()
    } catch (err) {
      console.error("❌ DELETE EXPENSE ERROR:", err)
      alert("Failed to delete expense")
    }
  }

  const startEdit = (expense) => {
    setEditingId(expense._id)

    setEditData({
      name: expense.name || "",
      amount: expense.amount || "",
      category: expense.category || "general",
      note: expense.note || ""
    })
  }

  const updateEditField = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const cancelEdit = () => {
    setEditingId(null)

    setEditData({
      name: "",
      amount: "",
      category: "general",
      note: ""
    })
  }

  const saveEdit = async () => {
    const name = editData.name.trim()
    const amount = Number(editData.amount)

    if (!name || !amount || amount <= 0) {
      alert("Enter a valid expense name and amount")
      return
    }

    try {
      await api.patch(`/expenses/${editingId}`, {
        name,
        amount,
        category: editData.category,
        note: editData.note.trim()
      })

      cancelEdit()
      await loadExpenses()
      onChange()
    } catch (err) {
      console.error("❌ UPDATE EXPENSE ERROR:", err)

      try {
        await api.post("/expenses", {
          _id: editingId,
          name,
          amount,
          category: editData.category,
          note: editData.note.trim()
        })

        cancelEdit()
        await loadExpenses()
        onChange()
      } catch (fallbackErr) {
        console.error("❌ UPDATE FALLBACK ERROR:", fallbackErr)
        alert("Failed to update expense")
      }
    }
  }

  if (loading) {
    return (
      <section style={container}>
        <h3 style={heading}>
          🧾 Expenses
        </h3>

        <p style={muted}>
          Loading expenses...
        </p>
      </section>
    )
  }

  return (
    <section style={container}>
      <div style={header}>
        <div>
          <h3 style={heading}>
            🧾 Expenses
          </h3>

          <p style={muted}>
            Total: {money(totalExpenses)}
          </p>
        </div>

        <button
          type="button"
          onClick={loadExpenses}
          style={refreshButton}
        >
          Refresh
        </button>
      </div>

      <div style={filterBox}>
        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          style={input}
        >
          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category.replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
              )}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <p style={muted}>
          No expenses found.
        </p>
      ) : (
        <div style={list}>
          {filteredExpenses.map((expense) => (
            <article
              key={expense._id}
              style={row}
            >
              {editingId === expense._id ? (
                <div style={editGrid}>
                  <input
                    value={editData.name}
                    onChange={(event) =>
                      updateEditField(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Expense name"
                    style={input}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editData.amount}
                    onChange={(event) =>
                      updateEditField(
                        "amount",
                        event.target.value
                      )
                    }
                    placeholder="Amount"
                    style={input}
                  />

                  <select
                    value={editData.category}
                    onChange={(event) =>
                      updateEditField(
                        "category",
                        event.target.value
                      )
                    }
                    style={input}
                  >
                    {categories
                      .filter((category) => category !== "all")
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category.replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                          )}
                        </option>
                      ))}
                  </select>

                  <input
                    value={editData.note}
                    onChange={(event) =>
                      updateEditField(
                        "note",
                        event.target.value
                      )
                    }
                    placeholder="Note"
                    style={input}
                  />

                  <div style={actionRow}>
                    <button
                      type="button"
                      onClick={saveEdit}
                      style={saveButton}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p style={expenseName}>
                      {expense.name}
                    </p>

                    <p style={expenseMeta}>
                      {expense.category || "general"}
                      {expense.note ? ` • ${expense.note}` : ""}
                    </p>
                  </div>

                  <div style={rightSide}>
                    <strong style={amountText}>
                      {money(expense.amount)}
                    </strong>

                    <div style={actionRow}>
                      <button
                        type="button"
                        onClick={() => startEdit(expense)}
                        style={editButton}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(expense._id)}
                        style={deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const container = {
  marginTop: 20,
  background: "#0f172a",
  border: "1px solid #1e293b",
  color: "white",
  padding: 18,
  borderRadius: 18
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  marginBottom: 16
}

const heading = {
  margin: 0
}

const muted = {
  color: "#94a3b8",
  margin: "6px 0 0"
}

const refreshButton = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}

const filterBox = {
  marginBottom: 16
}

const list = {
  display: "grid",
  gap: 12
}

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 14
}

const editGrid = {
  width: "100%",
  display: "grid",
  gap: 10
}

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  boxSizing: "border-box"
}

const expenseName = {
  margin: 0,
  fontWeight: 900
}

const expenseMeta = {
  margin: "6px 0 0",
  color: "#94a3b8",
  fontSize: 13,
  textTransform: "capitalize"
}

const rightSide = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 8
}

const amountText = {
  color: "#22c55e"
}

const actionRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap"
}

const editButton = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer"
}

const deleteButton = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer"
}

const saveButton = {
  ...editButton,
  background: "#22c55e"
}

const cancelButton = {
  ...deleteButton,
  background: "#64748b"
}

export default ExpenseManager