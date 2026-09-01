import { useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"

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

const getPriorityColor = (priority = "medium") => {
  if (priority === "high") {
    return "border-red-500/40 bg-red-500/10 text-red-300"
  }

  if (priority === "low") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
  }

  return "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
}

const getPriorityLabel = (priority = "medium") => {
  if (priority === "high") {
    return "🔴 High Priority"
  }

  if (priority === "low") {
    return "🟢 Low Priority"
  }

  return "🟡 Medium Priority"
}

const isOverdue = (dueDate) => {
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  return due < today
}

const getCustomerName = (job = {}) => {
  return (
    job.customerName ||
    job.name ||
    job.customer?.name ||
    "Unknown Customer"
  )
}

const getInitialPrice = (job = {}) => {
  return Number(
    job.finalPrice ??
      job.total ??
      job.totalPrice ??
      job.price ??
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
    getInitialPrice(job)
  )

  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [denying, setDenying] = useState(false)

  const customerName = getCustomerName(job)

  const status = formatStatus(
    job.status
  )

  const numericPrice = Number(price || 0)

  const displayedTotal = isQuoteCard
    ? numericPrice
    : getInitialPrice(job)

  const email =
    job.email ||
    job.customerEmail ||
    job.customer?.email ||
    ""

  const phone =
    job.phone ||
    job.customerPhone ||
    job.customer?.phone ||
    ""

  const quantity =
    Number(
      job.quantity ||
        job.items?.[0]?.quantity ||
        1
    )

  const service =
    job.serviceLabel ||
    job.serviceType ||
    job.printType ||
    job.type ||
    "Project"

  const priority =
    job.priority || "medium"

  const dueDate =
    job.dueDate || ""

  const overdue =
    isOverdue(dueDate)

  const adminNotes =
    job.adminNotes || ""

  const customerNotes =
    job.notes || ""

  const artworkUrl =
    job.artworkUrl ||
    job.artwork ||
    ""

  const turnaround =
    job.turnaround || ""

  const handleSave = async () => {
    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      toast.error(
        "Enter a valid quote price"
      )

      return
    }

    try {
      setSaving(true)

      await api.patch(
        `/quotes/${job._id}`,
        {
          finalPrice: numericPrice,
          price: numericPrice
        }
      )

      toast.success(
        "Quote price saved"
      )
    } catch (err) {
      console.error(
        "❌ SAVE ERROR:",
        err.response?.data ||
          err
      )

      toast.error(
        err.response?.data
          ?.message ||
          "Could not save quote price"
      )
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      toast.error(
        "Enter a valid final price before approving"
      )

      return
    }

    try {
      setApproving(true)

      /*
       * Pass the CURRENT edited
       * price to ProductionBoard.
       *
       * This prevents approval from
       * using the old job.finalPrice.
       */
      await onApprove?.({
        ...job,
        price: numericPrice,
        finalPrice: numericPrice
      })
    } finally {
      setApproving(false)
    }
  }

  const handleDeny = async () => {
    try {
      setDenying(true)

      await onDeny?.(job)
    } finally {
      setDenying(false)
    }
  }

  const busy =
    saving ||
    approving ||
    denying

  return (
    <article className="mb-4 rounded-2xl border border-slate-800 bg-[#020617] p-4 text-white shadow-lg shadow-black/20 transition hover:border-cyan-500/70">

      {/* HEADER */}

      <div className="mb-3 flex items-start justify-between gap-3">

        <div>
          <h4 className="text-lg font-bold leading-tight">
            {customerName}
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            #
            {String(
              job._id || ""
            )
              .slice(-6)
              .toUpperCase()}
          </p>
        </div>

        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          {isQuoteCard
            ? "Quote"
            : status}
        </span>

      </div>

      {/* PRIORITY / DUE DATE */}

      {!isQuoteCard && (
        <div className="mb-4 flex flex-wrap gap-2">

          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${getPriorityColor(
              priority
            )}`}
          >
            {getPriorityLabel(
              priority
            )}
          </span>

          {dueDate && (
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              📅{" "}
              {new Date(
                dueDate
              ).toLocaleDateString()}
            </span>
          )}

          {overdue && (
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
              ⚠️ OVERDUE
            </span>
          )}

        </div>
      )}

      {/* TOTAL + QUANTITY */}

      <div className="mb-4 grid grid-cols-2 gap-3">

        <InfoBox
          label={
            isQuoteCard
              ? "Quote"
              : "Total"
          }
          value={money(
            displayedTotal
          )}
          color="text-emerald-300"
        />

        <InfoBox
          label="Quantity"
          value={quantity}
          color="text-cyan-300"
        />

      </div>

      {/* SERVICE */}

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">

        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Service
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-200">
          {formatStatus(
            service
          )}
        </p>

      </div>

      {/* TURNAROUND */}

      {isQuoteCard &&
        turnaround && (
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">

            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Turnaround
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-200">
              {formatStatus(
                turnaround
              )}
            </p>

          </div>
        )}

      {/* CUSTOMER PROJECT DESCRIPTION */}

      {isQuoteCard &&
        customerNotes && (
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">

            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Project Description
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {customerNotes}
            </p>

          </div>
        )}

      {/* ARTWORK */}

      {isQuoteCard &&
        artworkUrl && (
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">

            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Customer Artwork
            </p>

            <a
              href={artworkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/20"
            >
              View Artwork
            </a>

          </div>
        )}

      {/* ADMIN NOTES */}

      {adminNotes &&
        !isQuoteCard && (
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">

            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Admin Notes
            </p>

            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-300">
              {adminNotes}
            </p>

          </div>
        )}

      {/* CONTACT */}

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

      {/* QUOTE ADMIN CONTROLS */}

      {isQuoteCard && (
        <div className="mt-4 border-t border-slate-800 pt-4">

          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Final Quote Price
          </label>

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
              $
            </span>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-8 pr-4 text-white outline-none transition focus:border-cyan-400"
            />

          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Review the customer&apos;s
            request and adjust the final
            amount before approval.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Price"}
          </button>

          <div className="mt-3 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={
                handleApprove
              }
              disabled={busy}
              className="rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approving
                ? "Approving..."
                : "Approve"}
            </button>

            <button
              type="button"
              onClick={
                handleDeny
              }
              disabled={busy}
              className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {denying
                ? "Denying..."
                : "Deny"}
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

      <p
        className={`mt-1 text-lg font-bold ${color}`}
      >
        {value}
      </p>

    </div>
  )
}