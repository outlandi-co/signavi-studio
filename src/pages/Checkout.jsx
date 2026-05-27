import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const getPaymentUrl = (payload = {}) => {
  return (
    payload?.paymentUrl ||
    payload?.url ||
    payload?.checkoutUrl ||
    payload?.squarePaymentUrl ||
    payload?.data?.paymentUrl ||
    payload?.data?.url ||
    payload?.data?.checkoutUrl ||
    payload?.data?.squarePaymentUrl ||
    ""
  )
}

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const timer = setTimeout(async () => {
      try {
        console.log("🔥 START CHECKOUT:", id)

        if (!id || id === "null" || id === "undefined") {
          throw new Error("Invalid order ID")
        }

        const res = await api.patch(`/orders/${id}/checkout`)

        const url = getPaymentUrl(res.data)

        if (!url) {
          throw new Error("No payment URL returned")
        }

        console.log("✅ REDIRECTING:", url)

        window.location.href = url
      } catch (err) {
        console.error("❌ AUTO CHECKOUT ERROR:", err.response?.data || err)

        setError(
          err?.response?.data?.message ||
            err.message ||
            "Checkout failed"
        )

        setLoading(false)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [id])

  const handleRetry = async () => {
    try {
      setLoading(true)
      setError("")

      if (!id || id === "null" || id === "undefined") {
        throw new Error("Invalid order ID")
      }

      const res = await api.patch(`/orders/${id}/checkout`)

      const url = getPaymentUrl(res.data)

      if (!url) {
        throw new Error("No payment URL returned")
      }

      toast.success("Redirecting to payment")

      window.location.href = url
    } catch (err) {
      console.error("❌ RETRY CHECKOUT ERROR:", err.response?.data || err)

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Checkout failed again. Please contact support."
      )

      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-xl shadow-black/20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          SignaVi Studio
        </p>

        <h1 className="text-4xl font-extrabold">
          Checkout
        </h1>

        <p className="mt-3 text-xs text-slate-500">
          Order ID: {id || "Missing"}
        </p>

        {loading && !error && (
          <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <p className="font-bold text-cyan-300">
              🔄 Redirecting to secure payment...
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Your Square checkout page is being prepared.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="font-bold text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? "Retrying..." : "🔁 Try Again"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/my-orders")}
              className="mt-3 w-full rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Back to Orders
            </button>
          </div>
        )}

        <p className="mt-6 text-sm text-slate-500">
          Payments are securely processed through Square.
        </p>
      </section>
    </main>
  )
}