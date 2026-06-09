import { useState } from "react"

import {
  updateMaterial
} from "./services/materialService"

const getInitialForm = (material) => ({
  price: material?.price ?? "",
  regularPrice: material?.regularPrice ?? "",

  sourceUrl: material?.source?.url ?? "",

  quantityOnHand: material?.inventory?.quantityOnHand ?? 0,
  reorderPoint: material?.inventory?.reorderPoint ?? 5,

  imageUrl: material?.image?.url ?? "",
  imageAlt:
    material?.image?.alt ||
    material?.fullName ||
    material?.productName ||
    ""
})

export default function MaterialEditor({
  material,
  onClose,
  onSaved
}) {
  const [form, setForm] = useState(() => getInitialForm(material))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  if (!material) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setStatus("")

      const payload = {
        price: Number(form.price || 0),
        regularPrice: Number(form.regularPrice || 0),

        image: {
          url: form.imageUrl,
          alt: form.imageAlt
        },

        source: {
          ...material.source,
          url: form.sourceUrl
        },

        inventory: {
          ...material.inventory,
          quantityOnHand: Number(form.quantityOnHand || 0),
          reorderPoint: Number(form.reorderPoint || 0)
        },

        priceWatch: {
          ...material.priceWatch,
          previousPrice: material.price,
          currentPrice: Number(form.price || 0),
          lastChecked: new Date()
        }
      }

      const updated = await updateMaterial(material.id, payload)

      setStatus("✅ Material updated successfully")
      onSaved?.(updated)

      setTimeout(() => {
        onClose?.()
      }, 700)
    } catch (err) {
      console.error("❌ MATERIAL UPDATE ERROR:", err)

      setStatus(
        err?.response?.data?.message ||
          "❌ Failed to update material"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Edit Material
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {material.fullName || material.productName}
          </h2>

          <p className="mt-1 text-slate-400">
            {material.brand} • {material.category}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
        >
          Close
        </button>
      </div>

      {status && (
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
          {status}
        </div>
      )}

      {form.imageUrl && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-slate-300">
            Image Preview
          </p>

          <img
            src={form.imageUrl}
            alt={form.imageAlt || "Material preview"}
            className="h-56 w-full rounded-xl border border-slate-700 object-cover"
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2"
      >
        <Field
          label="Current Price"
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
        />

        <Field
          label="Regular Price"
          name="regularPrice"
          type="number"
          step="0.01"
          value={form.regularPrice}
          onChange={handleChange}
        />

        <Field
          label="Quantity On Hand"
          name="quantityOnHand"
          type="number"
          value={form.quantityOnHand}
          onChange={handleChange}
        />

        <Field
          label="Reorder Point"
          name="reorderPoint"
          type="number"
          value={form.reorderPoint}
          onChange={handleChange}
        />

        <div className="md:col-span-2">
          <Field
            label="Image URL"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Field
            label="Image Alt Text"
            name="imageAlt"
            value={form.imageAlt}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Field
            label="Supplier Source URL"
            name="sourceUrl"
            type="url"
            value={form.sourceUrl}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:border-cyan-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Material"}
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
  step
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        name={name}
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  )
}