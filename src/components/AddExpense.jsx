import { useState } from "react"
import api from "../services/api"

const categories = [
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

function AddExpense({
  onAdded = () => {}
}) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "general",
    note: ""
  })

  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const submit = async () => {
    const name = form.name.trim()
    const amount = Number(form.amount)

    if (!name || !amount || amount <= 0) {
      alert("Fill out a valid expense name and amount")
      return
    }

    try {
      setLoading(true)

      await api.post("/expenses", {
        name,
        amount,
        category: form.category,
        note: form.note.trim()
      })

      setForm({
        name: "",
        amount: "",
        category: "general",
        note: ""
      })

      onAdded()
      alert("✅ Expense added")
    } catch (err) {
      console.error("❌ ADD EXPENSE ERROR:", err.response?.data || err)
      alert(err.response?.data?.message || "Failed to add expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <h3 className="mb-5 text-2xl font-bold">
        ➕ Add Expense
      </h3>

      <div className="grid gap-4">
        <input
          placeholder="Expense name"
          value={form.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          className={inputClass}
        />

        <input
          placeholder="Amount ($)"
          value={form.amount}
          onChange={(event) =>
            updateField("amount", event.target.value)
          }
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
        />

        <select
          value={form.category}
          onChange={(event) =>
            updateField("category", event.target.value)
          }
          className={inputClass}
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

        <textarea
          rows={3}
          placeholder="Optional note"
          value={form.note}
          onChange={(event) =>
            updateField("note", event.target.value)
          }
          className={inputClass}
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </div>
    </section>
  )
}

const inputClass =
  "w-full rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"

export default AddExpense