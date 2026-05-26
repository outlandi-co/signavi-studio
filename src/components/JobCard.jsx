import { useState } from "react"
import api from "../services/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (status = "") => {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getCustomerName = (job) => {
  return (
    job.customerName ||
    job.name ||
    job.customer?.name ||
    "Unknown Customer"
  )
}

const getTotal = (job, price) => {
  return (
    job.finalPrice ||
    job.total ||
    job.totalPrice ||
    job.price ||
    price ||
    0
  )
}

export default function JobCard({
  job,
  onApprove,
  onDeny,
  isQuoteCard = false
}) {
  const [price, setPrice] = useState(
    job.finalPrice ||
      job.price ||
      job.total ||
      0
  )

  const [loading, setLoading] = useState(false)

  const customerName = getCustomerName(job)
  const status = formatStatus(job.status)
  const total = getTotal(job, price)

  const email = job.email || job.customerEmail || job.customer?.email || ""
  const phone = job.phone || job.customerPhone || job.customer?.phone || ""
  const quantity = job.quantity || job.items?.[0]?.quantity || 1
  const service =
    job.serviceLabel ||
    job.serviceType ||
    job.printType ||
    job.type ||
    "Project"

  const handleSave = async () => {
    try {
      setLoading(true)

      await api.patch(`/quotes/${job._id}`, {
        finalPrice: Number(price)
      })

      console.log("💾 Price saved")
    } catch (err) {
      console.error("❌ SAVE ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="mb-4 rounded-2xl border border-slate-800 bg-[#020617] p-4 text-white shadow-lg shadow-black/20 transition hover:border-cyan-500/70">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold leading-tight">
            {customerName}
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            #{String(job._id || "").slice(-6).toUpperCase()}
          </p>
        </div>

        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          {status}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <InfoBox
          label="Total"
          value={money(total)}
          color="text-emerald-300"
        />

        <InfoBox
          label="Quantity"
          value={quantity}
          color="text-cyan-300"
        />
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Service
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-200">
          {formatStatus(service)}
        </p>
      </div>

      {(email || phone) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Email
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Call
            </a>
          )}
        </div>
      )}

      {isQuoteCard && (
        <div className="mt-4 border-t border-slate-800 pt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Quote Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Price"}
          </button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onApprove?.(job)}
              className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500"
            >
              Approve
            </button>

            <button
              type="button"
              onClick={() => onDeny?.(job)}
              className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-500"
            >
              Deny
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

function InfoBox({
  label,
  value,
  color
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className={`mt-1 text-lg font-bold ${color}`}>
        {value}
      </p>
    </div>
  )
}