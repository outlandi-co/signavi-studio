import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../../../services/api"

// Signavi Store Admin — Shippo TEST-mode calculator.
// Enter measurements for each PACKED parcel. This does not auto-pack cart items,
// calculate customer checkout shipping, or purchase shipping labels.

const emptyParcel = (number) => ({
  key: `${Date.now()}-${number}`,
  title: `Package ${number}`,
  kind: "Box",
  itemsInside: "1",
  length: "12",
  width: "10",
  height: "4",
  weight: "2",
  mass_unit: "lb"
})

const fieldClass =
  "w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
const labelClass = "mb-1 block text-xs font-semibold text-slate-300"
const panelClass = "rounded-2xl border border-slate-700 bg-slate-800/70 p-4"

const money = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount || 0))

const dimWeight = (p) => {
  const volume = Number(p.length) * Number(p.width) * Number(p.height)
  return Number.isFinite(volume) && volume > 0 ? (volume / 139).toFixed(2) : "—"
}

export default function ShippingCalculator() {
  const [destination, setDestination] = useState({
    name: "",
    street1: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  })
  const [parcels, setParcels] = useState([emptyParcel(1)])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const resetQuote = () => {
    setResult(null)
    setError("")
  }

  const changeAddress = (field, value) => {
    setDestination((prev) => ({ ...prev, [field]: value }))
    resetQuote()
  }

  const changeParcel = (key, field, value) => {
    setParcels((prev) => prev.map((p) => p.key === key ? { ...p, [field]: value } : p))
    resetQuote()
  }

  const addParcel = () => {
    if (parcels.length >= 10) return
    setParcels((prev) => [...prev, emptyParcel(prev.length + 1)])
    resetQuote()
  }

  const removeParcel = (key) => {
    setParcels((prev) => prev.length > 1 ? prev.filter((p) => p.key !== key) : prev)
    resetQuote()
  }

  const calculate = async (event) => {
    event.preventDefault()
    if (loading) return
    setError("")
    setResult(null)
    setLoading(true)
    try {
      const payload = {
        address_to: destination,
        parcels: parcels.map((p) => ({
          length: p.length,
          width: p.width,
          height: p.height,
          weight: p.weight,
          mass_unit: p.mass_unit
        }))
      }
      const response = await api.post("/shipping/admin/compare", payload)
      if (response.data?.testMode !== false) {
        throw new Error("The server did not confirm Shippo LIVE mode.")
      }
      setResult(response.data)
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 403) {
        setError("Admin login required. Sign in to your existing admin account and retry.")
      } else {
        setError(err.response?.data?.message || err.message || "Shipping quote failed.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">

        <Link
          to="/admin/signavi-store/shipping"
          className="inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          ← Back to Shipping &amp; Fulfillment
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">Signavi Store / Shipping</p>
            <h1 className="mt-2 text-3xl font-bold">Shipping Calculator</h1>
            <p className="mt-2 text-sm text-slate-300">Compare Shippo carrier rates for the packages you actually packed.</p>
          </div>
          <span className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300">
            TEST MODE — NO CHARGES
          </span>
        </header>

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <strong>Manual parcel test:</strong> Weights and dimensions must describe each <em>packed box or mailer</em>,
          including packaging. The number of shirts inside is a note, not an automatic packing calculation.
          No checkout charges or shipping labels are created from this page.
        </div>

        <form onSubmit={calculate} className="space-y-5">
          <section className={panelClass}>
            <h2 className="mb-4 text-lg font-semibold">1. Destination address</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["name", "Recipient name"],
                ["street1", "Street address"],
                ["city", "City"],
                ["state", "State (e.g. CA)"],
                ["zip", "ZIP code"],
                ["country", "Country code (e.g. US)"]
              ].map(([field, label]) => (
                <label key={field}>
                  <span className={labelClass}>{label}</span>
                  <input className={fieldClass} value={destination[field]}
                    onChange={(e) => changeAddress(field, e.target.value)}
                    required={field !== "name"} maxLength={200} autoComplete="off" />
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">Your shipping origin is configured privately on the backend, not entered here.</p>
          </section>

          <section className={panelClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">2. Actual packed parcels</h2>
                <p className="mt-1 text-xs text-slate-400">Add one entry for each box or mailer that will be shipped.</p>
              </div>
              <button type="button" onClick={addParcel} disabled={parcels.length >= 10}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
                + Add package
              </button>
            </div>
            <div className="space-y-4">
              {parcels.map((p, index) => (
                <div key={p.key} className="rounded-xl border border-slate-600 bg-slate-900/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-semibold">Package {index + 1}</h3>
                    {parcels.length > 1 && (
                      <button type="button" onClick={() => removeParcel(p.key)} className="text-sm text-rose-300 hover:text-rose-200">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label>
                      <span className={labelClass}>Packaging type (note)</span>
                      <select className={fieldClass} value={p.kind} onChange={(e) => changeParcel(p.key, "kind", e.target.value)}>
                        {[
                          "Box", "Poly mailer", "Padded mailer", "Rigid carton", "Oversized carton"
                        ].map((kind) => <option key={kind}>{kind}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>Items inside (note)</span>
                      <input type="number" min="1" step="1" className={fieldClass} value={p.itemsInside}
                        onChange={(e) => changeParcel(p.key, "itemsInside", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Length (in)</span>
                      <input type="number" min="0.1" max="120" step="any" required className={fieldClass} value={p.length}
                        onChange={(e) => changeParcel(p.key, "length", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Width (in)</span>
                      <input type="number" min="0.1" max="120" step="any" required className={fieldClass} value={p.width}
                        onChange={(e) => changeParcel(p.key, "width", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Height (in)</span>
                      <input type="number" min="0.1" max="120" step="any" required className={fieldClass} value={p.height}
                        onChange={(e) => changeParcel(p.key, "height", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Packed weight</span>
                      <input type="number" min="0.01" max="150" step="any" required className={fieldClass} value={p.weight}
                        onChange={(e) => changeParcel(p.key, "weight", e.target.value)} />
                    </label>
                    <label>
                      <span className={labelClass}>Weight unit</span>
                      <select className={fieldClass} value={p.mass_unit}
                        onChange={(e) => changeParcel(p.key, "mass_unit", e.target.value)}>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                      </select>
                    </label>
                    <div className="self-end rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-slate-300">
                      Dim. weight estimate: <strong>{dimWeight(p)} lb</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">Dimensional-weight example uses 139 in³/lb; carrier rules and billable weights vary.</p>
          </section>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60">
            {loading ? "Checking live shipping rates..." : "Compare shipping rates"}
          </button>
        </form>

        {error && <div role="alert" className="rounded-xl border border-red-500/50 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>}

        {result && (
          <section className={panelClass} aria-live="polite">
            <h2 className="text-lg font-semibold">3. Live shipping-rate comparison</h2>
            <p className="my-2 text-sm text-slate-300">
              {result.parcelCount} packed parcel(s) · {result.rates?.length || 0} service options
            </p>
            {!result.rates?.length ? (
              <p className="rounded-xl bg-slate-900 p-4 text-sm text-amber-200">No carrier rates returned. Review address, dimensions, available carriers and test account settings.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {result.rates.map((rate, i) => (
                  <div key={rate.id || i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-600 bg-slate-900 p-3">
                    <div>
                      <p className="font-semibold">{rate.provider} — {rate.service}</p>
                      <p className="text-xs text-slate-400">{rate.estimatedDays != null ? `Estimated ${rate.estimatedDays} transit day(s)` : "Transit estimate unavailable"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-300">{money(rate.amount, rate.currency)}</p>
                      <p className="text-xs text-amber-300">TEST RATE ONLY</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-slate-400">No carrier quote shown here will be sent to Square or used to buy postage.</p>
          </section>
        )}
      </div>
    </main>
  )
}
