import { useState } from "react"

const emptyForm = {
  poNumber: "",
  materialId: "",
  materialName: "",
  supplierName: "",
  quantity: 10,
  unitCost: 0,
  totalCost: 0,
  expectedArrival: "",
  status: "draft",
  notes: ""
}

const getInitialForm = (editingOrder) => {
  if (!editingOrder) return emptyForm

  return {
    poNumber: editingOrder.poNumber || editingOrder.id || "",
    materialId: editingOrder.materialId || "",
    materialName: editingOrder.materialName || "",
    supplierName:
      editingOrder.supplierName ||
      editingOrder.supplier ||
      "",
    quantity:
      editingOrder.quantity ||
      editingOrder.quantityToOrder ||
      10,
    unitCost:
      editingOrder.unitCost ||
      0,
    totalCost:
      editingOrder.totalCost ||
      editingOrder.estimatedCost ||
      0,
    expectedArrival:
      editingOrder.expectedArrival || "",
    status:
      editingOrder.status || "draft",
    notes:
      editingOrder.notes || ""
  }
}

export default function PurchaseOrderForm({
  editingOrder,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState(() => getInitialForm(editingOrder))

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value
      }

      if (name === "quantity" || name === "unitCost") {
        const quantity =
          name === "quantity"
            ? Number(value || 0)
            : Number(next.quantity || 0)

        const unitCost =
          name === "unitCost"
            ? Number(value || 0)
            : Number(next.unitCost || 0)

        next.totalCost = quantity * unitCost
      }

      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      unitCost: Number(form.unitCost || 0),
      totalCost: Number(form.totalCost || 0)
    }

    onSave?.(payload)

    setForm(emptyForm)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Purchase Order
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          {editingOrder
            ? "Edit Purchase Order"
            : "Create Purchase Order"}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Create or update material purchase orders tied to suppliers and inventory.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="PO Number"
            name="poNumber"
            value={form.poNumber}
            onChange={handleChange}
            placeholder="Example: PO-1001"
          />

          <Field
            label="Material ID"
            name="materialId"
            value={form.materialId}
            onChange={handleChange}
          />

          <Field
            label="Material"
            name="materialName"
            value={form.materialName}
            onChange={handleChange}
            required
          />

          <Field
            label="Supplier"
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            required
          />

          <Field
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <Field
            label="Unit Cost"
            name="unitCost"
            type="number"
            step="0.01"
            value={form.unitCost}
            onChange={handleChange}
          />

          <Field
            label="Total Cost"
            name="totalCost"
            type="number"
            step="0.01"
            value={form.totalCost}
            onChange={handleChange}
          />

          <Field
            label="Expected Arrival"
            name="expectedArrival"
            type="date"
            value={form.expectedArrival}
            onChange={handleChange}
          />
        </div>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Status
          </span>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <Textarea
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:border-cyan-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-500"
          >
            Save Purchase Order
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  step,
  required = false,
  placeholder = ""
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        type={type}
        name={name}
        step={step}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
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
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  )
}