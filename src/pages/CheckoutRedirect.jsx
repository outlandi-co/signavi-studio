import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

export default function CheckoutRedirect() {
  const { id } = useParams()
  const navigate = useNavigate()

  const hasRun = useRef(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const startCheckout = async () => {
    try {
      setLoading(true)
      setError("")

      if (!id || id === "null" || id === "undefined") {
        throw new Error("Invalid order ID")
      }

      console.log("💳 Starting checkout for:", id)

      let response = null

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await api.patch(`/orders/${id}/checkout`)
          break
        } catch (err) {
          if (attempt === 3) {
            throw err
          }

          console.log("⏳ Server waking up... retrying")
          await sleep(2500)
        }
      }

      const url = getPaymentUrl(response?.data)

      if (!url) {
        throw new Error("No payment URL returned")
      }

      console.log("🚀 Redirecting to:", url)
      toast.success("Redirecting to secure payment")

      window.location.assign(url)
    } catch (err) {
      console.error("❌ CHECKOUT REDIRECT ERROR:", err.response?.data || err)

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Checkout failed. Please try again."
      )

      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const timer = setTimeout(() => {
      startCheckout()
    }, 0)

    return () => clearTimeout(timer)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-xl shadow-black/20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          SignaVi Studio
        </p>

        <h1 className="text-4xl font-extrabold">
          Secure Checkout
        </h1>

        <p className="mt-3 text-xs text-slate-500">
          Order ID: {id || "Missing"}
        </p>

        {loading && !error && (
          <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <p className="font-bold text-cyan-300">
              🔐 Redirecting to secure payment...
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Your Square checkout page is being prepared.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="font-bold text-red-300">
              ⚠️ {error}
            </p>

            <button
              type="button"
              onClick={startCheckout}
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