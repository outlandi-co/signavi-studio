import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"
import { fetchStudioPaymentConfirmation } from "../utils/studioPaymentConfirmation.js"
import { resolveStudioConfirmationAttemptKey } from "../utils/resolveStudioConfirmationAttemptKey.js"
import { finalizeStudioPaidCheckout } from "../utils/finalizeStudioPaidCheckout.js"


export default function Success() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const orderId = useMemo(() => {
    const urlOrderId =
      searchParams.get("orderId") ||
      searchParams.get("order_id") ||
      searchParams.get("id")

    const storedOrderId =
      localStorage.getItem("lastOrderId")

    return urlOrderId || storedOrderId || ""
  }, [searchParams])

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        if (!orderId) {
          throw new Error("No order ID found")
        }

        // Capture the key BEFORE awaiting backend verification.
        const confirmationAttemptKey = resolveStudioConfirmationAttemptKey({
          storage: sessionStorage,
          orderId
        })

        const loadedOrder = await fetchStudioPaymentConfirmation({
          api,
          orderId,
          storage: sessionStorage
        })

        if (!mounted) return

        setOrder(loadedOrder)
        localStorage.setItem("lastOrderId", loadedOrder.orderId)

        if (loadedOrder.paymentStatus === "paid") {
          // Fail closed: unpaid or mismatched attempts are never retired.
          finalizeStudioPaidCheckout({
            storage: sessionStorage,
            confirmation: loadedOrder,
            orderId,
            attemptKey: confirmationAttemptKey
          })
        }
      } catch (err) {
        if (!mounted) return

        console.error("❌ FAILED TO LOAD ORDER:", err.response?.data || err)

        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load order details"
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [orderId])

  useEffect(() => {
    if (loading || !orderId || error || order?.paymentStatus !== "paid") return

    const timer = setTimeout(() => {
      navigate(`/track/${orderId}`)
    }, 3500)

    return () => clearTimeout(timer)
  }, [loading, orderId, error, navigate, order?.paymentStatus])

  const handleTrackOrder = () => {
    const finalId =
      order?.orderId ||
      orderId ||
      localStorage.getItem("lastOrderId")

    if (!finalId) {
      toast.error("Order not found")
      return
    }

    navigate(`/track/${finalId}`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-16 text-white">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-2xl shadow-black/30 md:p-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

            <p className="text-slate-400">
              Loading payment confirmation...
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-5xl">
              🎉
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold md:text-5xl">
              {order?.paymentStatus === "paid" && !error ? "Payment Successful" : "Payment Not Confirmed"}
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
              {order?.paymentStatus === "paid" && !error ? "Your payment is recorded as paid. You will be redirected to tracking shortly." : "We cannot confirm payment for this order yet. Please check your order status before attempting another purchase."}
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-300">
                {error}
              </div>
            )}

            {order && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-6 text-left">
                <SummaryRow
                  label="Order ID"
                  value={`#${String(order.orderId || orderId).slice(-6).toUpperCase()}`}
                />

                <SummaryRow
                  label="Status"
                  value={order.paymentStatus || "Not confirmed"}
                />


              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleTrackOrder}
                className="rounded-2xl bg-emerald-500 px-5 py-4 font-black text-black transition hover:bg-emerald-400"
              >
                📦 Track Order
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-2xl border border-slate-700 px-5 py-4 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                🏠 Back Home
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

function SummaryRow({
  label,
  value,
  strong = false
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-slate-400">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-xl font-extrabold text-cyan-300"
            : "font-bold text-white"
        }
      >
        {value || "N/A"}
      </span>
    </div>
  )
}