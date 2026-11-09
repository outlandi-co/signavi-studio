import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"

const emptyPackage = {
  name: "",
  carrier: "Generic",
  type: "box",
  lengthIn: "",
  widthIn: "",
  heightIn: "",
  tareWeightOz: "",
  maxWeightOz: "",
  clearanceIn: "0",
  active: false
}

const fields = [
  ["lengthIn", "Length (in)"],
  ["widthIn", "Width (in)"],
  ["heightIn", "Height (in)"],
  ["tareWeightOz", "Empty weight (oz)"],
  ["maxWeightOz", "Maximum packed weight (oz)"],
  ["clearanceIn", "Clearance (in)"]
]

const inputClass =
  "w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"

function toForm(record) {
  const form = { ...emptyPackage }

  for (const key of Object.keys(form)) {
    if (record[key] !== undefined && record[key] !== null) {
      form[key] = typeof form[key] === "boolean"
        ? record[key]
        : String(record[key])
    }
  }

  return form
}

function toPayload(form) {
  const payload = {
    name: form.name.trim(),
    carrier: form.carrier.trim(),
    type: form.type,
    active: form.active
  }

  for (const [field] of fields) {
    payload[field] = Number(form[field])
  }

  return payload
}

export default function AdminShipping() {
  const [packages, setPackages] = useState([])
  const [form, setForm] = useState({ ...emptyPackage })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get("/shipping-packages")
      setPackages(
        Array.isArray(response.data?.data)
          ? response.data.data
          : []
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load shipping packages."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  const change = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  const reset = () => {
    setEditingId(null)
    setForm({ ...emptyPackage })
    setError("")
    setMessage("")
  }

  const edit = (record) => {
    setEditingId(record._id)
    setForm(toForm(record))
    setError("")
    setMessage("")
  }

  const save = async (event) => {
    event.preventDefault()

    const payload = toPayload(form)

    if (!payload.name || !payload.carrier) {
      setError("Enter a package name and carrier.")
      return
    }

    if (
      fields.some(([key]) =>
        String(form[key]).trim() === "" ||
        !Number.isFinite(payload[key])
      )
    ) {
      setError("Enter valid numbers for every measurement.")
      return
    }

    if (
      payload.lengthIn <= 0 ||
      payload.widthIn <= 0 ||
      payload.heightIn <= 0 ||
      payload.maxWeightOz <= 0 ||
      payload.tareWeightOz < 0 ||
      payload.clearanceIn < 0 ||
      payload.maxWeightOz <= payload.tareWeightOz
    ) {
      setError("Check the package dimensions and weight limits.")
      return
    }

    if (
      payload.active &&
      !window.confirm(
        "Activate this physically verified package for customer shipping?"
      )
    ) {
      return
    }

    try {
      setSaving(true)
      setError("")
      setMessage("")

      if (editingId) {
        await api.patch(
          `/shipping-packages/${editingId}`,
          payload
        )
      } else {
        // New packages are always saved as inactive drafts.
        await api.post("/shipping-packages", {
          ...payload,
          active: false
        })
      }

      await loadPackages()
      reset()
      setMessage("Shipping package saved successfully.")
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save shipping package."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold">
            Shipping Management
          </h1>
          <p className="mt-2 text-slate-400">
            Manage reusable shipping packages for Smart Shipping.
          </p>
          <Link
            to="/admin/signavi-store/shipping/calculator"
            className="mt-4 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black"
          >
            Open Shipping Calculator
          </Link>
        </header>

        {error && (
          <p role="alert" className="rounded-lg bg-red-950 p-4 text-red-200">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="rounded-lg bg-slate-800 p-4 text-emerald-300">
            {message}
          </p>
        )}

        <section className="rounded-xl border border-slate-700 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Saved Packages ({packages.length})
            </h2>
            <button
              type="button"
              onClick={loadPackages}
              className="rounded-lg border border-slate-500 px-4 py-2"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading packages...</p>
          ) : packages.length === 0 ? (
            <p className="text-slate-400">
              No saved packages yet. Add your first package below.
            </p>
          ) : (
            <div className="space-y-3">
              {packages.map(pkg => (
                <div
                  key={pkg._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900 p-4"
                >
                  <div>
                    <p className="font-semibold">{pkg.name}</p>
                    <p className="text-sm text-slate-400">
                      {pkg.lengthIn} × {pkg.widthIn} × {pkg.heightIn} in
                      {" · "}{pkg.type}
                      {" · "}{pkg.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => edit(pkg)}
                    className="rounded-lg border border-cyan-500 px-4 py-2 text-cyan-300"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-700 p-5">
          <h2 className="mb-5 text-xl font-bold">
            {editingId ? "Edit Shipping Package" : "Add Shipping Package"}
          </h2>

          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span>Package name</span>
                <input
                  required
                  className={inputClass}
                  value={form.name}
                  onChange={e => change("name", e.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span>Carrier</span>
                <input
                  required
                  className={inputClass}
                  value={form.carrier}
                  onChange={e => change("carrier", e.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span>Package type</span>
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={e => change("type", e.target.value)}
                >
                  <option value="box">Box</option>
                  <option value="mailer">Mailer</option>
                  <option value="oversized">Oversized</option>
                </select>
              </label>

              {fields.map(([key, label]) => (
                <label key={key} className="space-y-2">
                  <span>{label}</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    className={inputClass}
                    value={form[key]}
                    onChange={e => change(key, e.target.value)}
                  />
                </label>
              ))}
            </div>

            {editingId && (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => change("active", e.target.checked)}
                />
                Active — available for customer shipping
              </label>
            )}

            {!editingId && (
              <p className="text-sm text-slate-400">
                New packages are saved inactive. Verify the physical
                measurements before activating them.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Package"}
              </button>

              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-slate-500 px-6 py-3"
              >
                Cancel / New Package
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
