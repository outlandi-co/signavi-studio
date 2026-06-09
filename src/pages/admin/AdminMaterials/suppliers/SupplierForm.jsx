import { useState } from "react"

const emptyForm = {
  id: "",
  name: "",
  website: "",
  email: "",
  phone: "",
  leadTime: "",
  shippingNotes: "",
  notes: ""
}

const getInitialForm = (editingSupplier) => {
  return editingSupplier || emptyForm
}

const createSupplierId = (name = "") => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function SupplierForm({
  editingSupplier,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState(() => getInitialForm(editingSupplier))
  const [status, setStatus] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setStatus("Supplier name is required")
      return
    }

    const supplierId =
      form.id.trim() || createSupplierId(form.name)

    onSave?.({
      ...form,
      id: supplierId
    })

    setStatus("")
    setForm(emptyForm)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
    >
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Supplier Form
        </p>

        <h3 className="mt-1 text-xl font-bold text-white">
          {editingSupplier ? "Edit Supplier" : "Add Supplier"}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Store supplier contact details, lead times, websites, and notes.
        </p>
      </div>

      {status && (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm font-semibold text-red-300">
          {status}
        </div>
      )}

      <div className="grid gap-5">
        <Section title="Supplier Identity">
          <Field
            label="Supplier Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Field
            label="Supplier ID"
            name="id"
            value={form.id}
            onChange={handleChange}
            placeholder="Auto-generated if blank"
          />

          <Field
            label="Website"
            name="website"
            type="url"
            value={form.website}
            onChange={handleChange}
          />
        </Section>

        <Section title="Contact Information">
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </Section>

        <Section title="Purchasing Details">
          <Field
            label="Lead Time"
            name="leadTime"
            value={form.leadTime}
            onChange={handleChange}
            placeholder="Example: 3-7 business days"
          />

          <Textarea
            label="Shipping Notes"
            name="shippingNotes"
            value={form.shippingNotes}
            onChange={handleChange}
          />

          <Textarea
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </Section>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm)
            setStatus("")
            onCancel?.()
          }}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 hover:border-cyan-400"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-500"
        >
          Save Supplier
        </button>
      </div>
    </form>
  )
}

function Section({
  title,
  children
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h4>

      <div className="grid gap-4">
        {children}
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = ""
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  )
}

function Textarea({
  label,
  name,
  value,
  onChange
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <textarea
        name={name}
        value={value}
        rows={3}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  )
}