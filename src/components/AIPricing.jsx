import { useState } from "react"
import api from "../services/api"

export default function AIPricing() {
  const [form, setForm] = useState({
    quantity: 12,
    printType: "screenprint",
    colors: 2,
    garmentCost: 4.5
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const calculate = async () => {
    try {
      setLoading(true)

      const payload = {
        quantity: Number(form.quantity),
        colors: Number(form.colors),
        garmentCost: Number(form.garmentCost),
        printType: form.printType
      }

      const res = await api.post(
        "/ai-pricing",
        payload
      )

      setResult(
        res.data?.data ||
        res.data
      )
    } catch (err) {
      console.error(
        "❌ AI PRICING ERROR:",
        err.response?.data || err
      )

      alert(
        err.response?.data?.message ||
        "Unable to calculate pricing"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
          SignaVi AI
        </p>

        <h3 className="text-2xl font-bold">
          🤖 Pricing Calculator
        </h3>

        <p className="mt-2 text-slate-400">
          Estimate pricing, profit, and margins.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) =>
              updateField(
                "quantity",
                e.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Print Method
          </label>

          <select
            value={form.printType}
            onChange={(e) =>
              updateField(
                "printType",
                e.target.value
              )
            }
            className={inputClass}
          >
            <option value="screenprint">
              Screen Print
            </option>

            <option value="dtf">
              DTF
            </option>

            <option value="embroidery">
              Embroidery
            </option>

            <option value="laser">
              Laser Engraving
            </option>

            <option value="vinyl">
              HTV / Vinyl
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Ink / Thread Colors
          </label>

          <input
            type="number"
            min="1"
            value={form.colors}
            onChange={(e) =>
              updateField(
                "colors",
                e.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Garment Cost
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            value={form.garmentCost}
            onChange={(e) =>
              updateField(
                "garmentCost",
                e.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <button
          type="button"
          onClick={calculate}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Calculating..."
            : "Calculate Pricing"}
        </button>
      </div>

      {result && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#020617] p-5">
          <h4 className="mb-4 text-lg font-bold text-cyan-300">
            Pricing Results
          </h4>

          <div className="grid gap-3">
            <ResultRow
              label="Cost"
              value={`$${Number(
                result.totalCost || 0
              ).toFixed(2)}`}
            />

            <ResultRow
              label="Suggested Price"
              value={`$${Number(
                result.suggestedPrice || 0
              ).toFixed(2)}`}
            />

            <ResultRow
              label="Profit"
              value={`$${Number(
                result.profit || 0
              ).toFixed(2)}`}
              color="#22c55e"
            />

            <ResultRow
              label="Margin"
              value={`${Number(
                result.margin || 0
              ).toFixed(1)}%`}
              color="#38bdf8"
            />
          </div>
        </div>
      )}
    </section>
  )
}

function ResultRow({
  label,
  value,
  color = "#ffffff"
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
      <span className="text-slate-400">
        {label}
      </span>

      <strong style={{ color }}>
        {value}
      </strong>
    </div>
  )
}

const inputClass =
  "w-full rounded-2xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"