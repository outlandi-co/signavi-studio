import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  quantity: 1,
  notes: ""
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

export default function QuotePage() {
  const navigate = useNavigate()

  const storedUser = getStoredCustomer()

  const [form, setForm] = useState({
    ...initialForm,
    customerName:
      storedUser?.name ||
      storedUser?.customerName ||
      "",
    email:
      storedUser?.email ||
      localStorage.getItem("customerEmail") ||
      ""
  })

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Math.max(1, Number(value || 1))
          : value
    }))
  }

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null
    setFile(selected)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")

    if (!form.customerName.trim()) {
      setError("Please enter your name")
      toast.error("Please enter your name")
      return
    }

    if (!form.email.trim()) {
      setError("Please enter your email")
      toast.error("Please enter your email")
      return
    }

    if (!file) {
      setError("Upload a file first")
      toast.error("Upload a file first")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append("customerName", form.customerName.trim())
      formData.append("email", form.email.trim().toLowerCase())
      formData.append("phone", form.phone.trim())
      formData.append("quantity", Number(form.quantity || 1))
      formData.append("notes", form.notes.trim())
      formData.append("printType", "custom")
      formData.append("serviceType", "custom")
      formData.append("serviceLabel", "Custom Quote")
      formData.append("artwork", file)

      const res = await api.post("/quotes", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      console.log("✅ QUOTE SUCCESS:", res.data)

      const quote =
        res.data?.data ||
        res.data?.quote ||
        res.data

      const quoteId = quote?._id

      if (!quoteId) {
        throw new Error("No ID returned from server")
      }

      toast.success("Quote submitted")

      navigate(`/quote/${quoteId}`)
    } catch (err) {
      console.error("❌ QUOTE ERROR:", err.response?.data || err)

      const message =
        err.response?.data?.message ||
        err.message ||
        "Server error"

      setError(message)
      toast.error(message)
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
            Submit a Quote
          </h1>

          <p className="mt-3 text-slate-400">
            Upload your artwork or reference file and we’ll review your project.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20"
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <input
              name="customerName"
              placeholder="Your Name"
              value={form.customerName}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="phone"
              placeholder="Phone optional"
              value={form.phone}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="quantity"
              type="number"
              min="1"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <textarea
              name="notes"
              rows="5"
              placeholder="Tell us about the project..."
              value={form.notes}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="rounded-2xl border border-dashed border-slate-700 bg-[#020617] p-5">
              <input
                type="file"
                onChange={handleFile}
                accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.psd"
                className="w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-bold file:text-black hover:file:bg-cyan-400"
              />

              {file && (
                <p className="mt-3 text-sm text-slate-400">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Submit Quote"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}