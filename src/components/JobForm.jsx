import { useState } from "react"
import api from "../services/api"
import Button from "../components/UI/Button"
import ProductionSelector from "../components/ProductionSelector"

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  productionType: "",
  product: "",
  quantity: "",
  price: "",
  dueDate: "",
  priority: "medium",
  notes: ""
}

function JobForm({
  refreshJobs
}) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setSuccess("")
    setError("")
  }

  const validateForm = () => {
    if (!form.customerName.trim()) {
      return "Customer name is required"
    }

    if (!form.product.trim()) {
      return "Product or service name is required"
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      return "Quantity must be greater than 0"
    }

    if (!form.productionType) {
      return "Production type is required"
    }

    return ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (loading) return

    const validationError = validateForm()

    if (validationError) {
      setError(`❌ ${validationError}`)
      setSuccess("")
      return
    }

    try {
      setLoading(true)
      setSuccess("")
      setError("")

      const quantity = Number(form.quantity)
      const price = Number(form.price || 0)

      const payload = {
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        productionType: form.productionType,
        product: form.product.trim(),
        quantity,
        price,
        finalPrice: price * quantity,
        dueDate: form.dueDate || null,
        priority: form.priority,
        notes: form.notes.trim(),
        status: "pending"
      }

      await api.post("/jobs", payload)

      resetForm()

      setSuccess("✅ Job created successfully!")

      refreshJobs?.()

    } catch (err) {
      console.error(
        "❌ JOB CREATION FAILED:",
        err.response?.data || err
      )

      setError(
        err.response?.data?.message ||
        "❌ Failed to create job"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 max-w-3xl rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20"
    >
      <div className="mb-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          SignaVi Studio
        </p>

        <h2 className="text-3xl font-extrabold">
          Create Job
        </h2>

        <p className="mt-2 text-slate-400">
          Add a new production job to the workflow.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 font-bold text-emerald-300">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 font-bold text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4">

        <label className="block">
          <span className={labelClass}>
            Customer Name *
          </span>

          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">

          <label className="block">
            <span className={labelClass}>
              Email
            </span>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>
              Phone
            </span>

            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

        </div>

        <label className="block">
          <span className={labelClass}>
            Product / Service *
          </span>

          <input
            name="product"
            value={form.product}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">

          <label className="block">
            <span className={labelClass}>
              Quantity *
            </span>

            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>
              Unit Price
            </span>

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

        </div>

        <div>
          <span className={labelClass}>
            Production Type *
          </span>

          <ProductionSelector
            value={form.productionType}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                productionType: value
              }))
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <label className="block">
            <span className={labelClass}>
              Due Date
            </span>

            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>
              Priority
            </span>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>
            </select>
          </label>

        </div>

        <label className="block">
          <span className={labelClass}>
            Notes
          </span>

          <textarea
            name="notes"
            rows={4}
            value={form.notes}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">

          <Button
            type="submit"
            loading={loading}
          >
            ➕ Create Job
          </Button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

        </div>

      </div>
    </form>
  )
}

const labelClass =
  "mb-2 block text-sm font-bold text-slate-300"

const inputClass =
  "w-full rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"

export default JobForm