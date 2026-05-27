import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import api from "../services/api"

const REASONS = [
  "Low resolution",
  "Incorrect file format",
  "Artwork not print-ready",
  "Design needs cleanup",
  "Other"
]

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const normalizeQuotes = (payload) => {
  const data =
    payload?.data ||
    payload?.quotes ||
    payload ||
    []

  const list = Array.isArray(data) ? data : []

  return [...list].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
}

const formatStatus = (status = "pending") => {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const statusClass = (status = "pending") => {
  const key = String(status || "pending").toLowerCase()

  if (key === "approved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  }

  if (key === "denied") {
    return "border-red-500/30 bg-red-500/10 text-red-300"
  }

  if (key === "payment_required") {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [prices, setPrices] = useState({})
  const [shipping, setShipping] = useState({})
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState(null)

  const reload = async () => {
    try {
      setLoading(true)

      const res = await api.get("/quotes")
      const data = normalizeQuotes(res.data)

      setQuotes(data)

      const priceMap = {}
      const shippingMap = {}

      data.forEach((quote) => {
        priceMap[quote._id] =
          quote.price ||
          quote.finalPrice ||
          ""

        shippingMap[quote._id] =
          quote.shippingCost ||
          quote.shipping ||
          ""
      })

      setPrices(priceMap)
      setShipping(shippingMap)
    } catch (err) {
      console.error("❌ LOAD QUOTES ERROR:", err.response?.data || err)
      toast.error("Failed to load quotes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      reload()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const filteredQuotes = useMemo(() => {
    if (!search.trim()) return quotes

    const term = search.trim().toLowerCase()

    return quotes.filter((quote) => {
      return [
        quote._id,
        quote.customerName,
        quote.name,
        quote.email,
        quote.phone,
        quote.serviceLabel,
        quote.printType,
        quote.approvalStatus,
        quote.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    })
  }, [quotes, search])

  const stats = useMemo(() => {
    const pending = quotes.filter(
      (quote) =>
        (quote.approvalStatus || "pending") === "pending"
    ).length

    const approved = quotes.filter(
      (quote) => quote.approvalStatus === "approved"
    ).length

    const denied = quotes.filter(
      (quote) => quote.approvalStatus === "denied"
    ).length

    const totalValue = quotes.reduce((sum, quote) => {
      return (
        sum +
        Number(
          quote.finalPrice ||
            quote.price ||
            0
        )
      )
    }, 0)

    return {
      total: quotes.length,
      pending,
      approved,
      denied,
      totalValue
    }
  }, [quotes])

  const updatePrice = (id, value) => {
    setPrices((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const updateShipping = (id, value) => {
    setShipping((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleApprove = async (id) => {
    try {
      setLoadingId(id)

      await api.patch(`/quotes/${id}`, {
        approvalStatus: "approved",
        price: Number(prices[id] || 0),
        shippingCost: Number(shipping[id] || 0)
      })

      toast.success("Quote approved — customer notified")
      await reload()
    } catch (err) {
      console.error("❌ APPROVE QUOTE ERROR:", err.response?.data || err)
      toast.error(
        err.response?.data?.message ||
          "Approve failed"
      )
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeny = async (id) => {
    try {
      const reason = prompt(
        `Enter reason:\n\n${REASONS.join("\n")}`
      )

      if (!reason) return

      const fee =
        prompt("Revision fee? Optional, enter 0 if none.") ||
        0

      setLoadingId(id)

      await api.patch(`/quotes/${id}`, {
        approvalStatus: "denied",
        denialReason: reason,
        fee: Number(fee || 0)
      })

      toast.success("Quote denied — customer notified")
      await reload()
    } catch (err) {
      console.error("❌ DENY QUOTE ERROR:", err.response?.data || err)
      toast.error(
        err.response?.data?.message ||
          "Deny failed"
      )
    } finally {
      setLoadingId(null)
    }
  }

  const handleSendToPayment = async (id) => {
    try {
      setLoadingId(id)

      await api.patch(`/quotes/${id}/send-to-payment`, {
        price: Number(prices[id] || 0),
        shippingCost: Number(shipping[id] || 0)
      })

      toast.success("Quote sent to payment")
      await reload()
    } catch (err) {
      console.error("❌ SEND TO PAYMENT ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Must approve before sending to payment"
      )
    } finally {
      setLoadingId(null)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading quotes...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-extrabold md:text-5xl">
                📄 Admin Quotes
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Review custom quote requests, set pricing, approve artwork, deny revisions, and send approved quotes to payment.
              </p>
            </div>

            <button
              type="button"
              onClick={reload}
              className="rounded-full bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Quotes"
            value={stats.total}
            accent="text-cyan-300"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            accent="text-yellow-300"
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            accent="text-emerald-300"
          />

          <StatCard
            label="Denied"
            value={stats.denied}
            accent="text-red-300"
          />

          <StatCard
            label="Quote Value"
            value={money(stats.totalValue)}
            accent="text-blue-300"
          />
        </div>

        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search quote, customer, email, service, status..."
            className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
            <h2 className="mb-3 text-2xl font-bold">
              No Quotes Found
            </h2>

            <p className="text-slate-400">
              Quote requests will show up here once customers submit them.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote._id}
                quote={quote}
                price={prices[quote._id] || ""}
                shippingCost={shipping[quote._id] || ""}
                loading={loadingId === quote._id}
                updatePrice={updatePrice}
                updateShipping={updateShipping}
                onApprove={handleApprove}
                onDeny={handleDeny}
                onSendToPayment={handleSendToPayment}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function QuoteCard({
  quote,
  price,
  shippingCost,
  loading,
  updatePrice,
  updateShipping,
  onApprove,
  onDeny,
  onSendToPayment
}) {
  const status =
    quote.approvalStatus ||
    quote.status ||
    "pending"

  const priceNumber = Number(price || 0)
  const shippingNumber = Number(shippingCost || 0)
  const total = priceNumber + shippingNumber

  const artwork =
    quote.artwork ||
    quote.artworkUrl ||
    quote.fileUrl ||
    quote.uploadedFile ||
    quote.proofUrl ||
    ""

  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            Quote Request
          </p>

          <h2 className="text-2xl font-bold">
            {quote.customerName ||
              quote.name ||
              "Customer"}
          </h2>

          <p className="mt-1 text-slate-400">
            {quote.email || "No email"}
          </p>

          {quote.phone && (
            <p className="mt-1 text-sm text-slate-500">
              {quote.phone}
            </p>
          )}
        </div>

        <span
          className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${statusClass(status)}`}
        >
          {formatStatus(status)}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-5 grid gap-3 md:grid-cols-4">
            <DetailBox
              label="Service"
              value={
                quote.serviceLabel ||
                quote.printType ||
                quote.service ||
                "Custom Quote"
              }
            />

            <DetailBox
              label="Quantity"
              value={quote.quantity || 1}
            />

            <DetailBox
              label="Price"
              value={money(priceNumber)}
            />

            <DetailBox
              label="Total"
              value={money(total)}
            />
          </div>

          {quote.message && (
            <div className="mb-5 rounded-2xl border border-slate-800 bg-[#020617] p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                Customer Notes
              </p>

              <p className="text-sm text-slate-300">
                {quote.message}
              </p>
            </div>
          )}

          {quote.denialReason && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-red-300">
                Denial Reason
              </p>

              <p className="text-sm text-red-200">
                {quote.denialReason}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Set price"
              value={price}
              onChange={(event) =>
                updatePrice(
                  quote._id,
                  event.target.value
                )
              }
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Shipping cost"
              value={shippingCost}
              onChange={(event) =>
                updateShipping(
                  quote._id,
                  event.target.value
                )
              }
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onApprove(quote._id)}
              disabled={loading}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Working..." : "✅ Approve"}
            </button>

            <button
              type="button"
              onClick={() => onDeny(quote._id)}
              disabled={loading}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-60"
            >
              ❌ Deny
            </button>

            <button
              type="button"
              onClick={() => onSendToPayment(quote._id)}
              disabled={
                loading ||
                status !== "approved"
              }
              className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              💳 Send to Payment
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            Artwork / Proof
          </p>

          {artwork ? (
            <a
              href={artwork}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={artwork}
                alt="Customer artwork"
                className="h-52 w-full rounded-xl object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none"
                }}
              />

              <p className="mt-3 text-sm font-semibold text-cyan-300">
                Open Artwork
              </p>
            </a>
          ) : (
            <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-700 text-center text-sm text-slate-500">
              No artwork uploaded
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function StatCard({
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}

function DetailBox({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}