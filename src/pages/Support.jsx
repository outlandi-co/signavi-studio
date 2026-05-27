import { useState } from "react"
import toast from "react-hot-toast"
import api from "../services/api"

const initialForm = {
  customerName: "",
  email: "",
  subject: "",
  message: "",
  orderNumber: ""
}

const getStoredCustomer = () => {
  try {
    return JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )
  } catch {
    return null
  }
}

export default function Support() {
  const storedCustomer = getStoredCustomer()

  const [form, setForm] = useState({
    ...initialForm,
    customerName:
      storedCustomer?.name ||
      storedCustomer?.customerName ||
      "",
    email:
      storedCustomer?.email ||
      localStorage.getItem("customerEmail") ||
      ""
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const validate = () => {
    if (!form.customerName.trim()) {
      toast.error("Please enter your name")
      return false
    }

    if (!form.email.trim()) {
      toast.error("Please enter your email")
      return false
    }

    if (!form.subject.trim()) {
      toast.error("Please enter a subject")
      return false
    }

    if (!form.message.trim()) {
      toast.error("Please enter a message")
      return false
    }

    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (loading) return
    if (!validate()) return

    try {
      setLoading(true)
      setSuccess("")

      const payload = {
        customerName: form.customerName.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        orderNumber: form.orderNumber.trim(),
        status: "open",
        priority: "medium"
      }

      const res = await api.post("/support", payload)

      const ticket =
        res.data?.data ||
        res.data?.ticket ||
        res.data

      toast.success("Support ticket submitted")

      setSuccess(
        ticket?._id
          ? `Ticket submitted. Reference #${String(ticket._id).slice(-6).toUpperCase()}`
          : "Support ticket submitted successfully."
      )

      setForm({
        ...initialForm,
        customerName:
          storedCustomer?.name ||
          storedCustomer?.customerName ||
          "",
        email:
          storedCustomer?.email ||
          localStorage.getItem("customerEmail") ||
          ""
      })
    } catch (err) {
      console.error("❌ SUPPORT ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Failed to submit support ticket"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            🛟 Contact Support
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Need help with an order, quote, shipping, payment, artwork proof,
            or production update? Send a support ticket and we’ll review it.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20"
        >
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid gap-4">
            <input
              type="text"
              name="customerName"
              placeholder="Full Name"
              value={form.customerName}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              type="text"
              name="orderNumber"
              placeholder="Order Number optional"
              value={form.orderNumber}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <textarea
              name="message"
              placeholder="How can we help you?"
              value={form.message}
              onChange={handleChange}
              rows={8}
              required
              className="resize-y rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}