import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

import api from "../services/api"
import UploadArtwork from "../components/UploadArtwork"

const initialForm = {
  customerName: "",
  email: "",
  product: "",
  quantity: 1,
  productionType: "screenprint",
  notes: "",
  artwork: ""
}

export default function SubmitJob() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const setArtwork = (fileOrName) => {
    setForm((prev) => ({
      ...prev,
      artwork: fileOrName
    }))
  }

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

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (loading) return

    if (!form.customerName.trim()) {
      toast.error("Please enter customer name")
      return
    }

    if (!form.product.trim()) {
      toast.error("Please enter product")
      return
    }

    if (!Number(form.quantity)) {
      toast.error("Please enter quantity")
      return
    }

    try {
      setLoading(true)

      const payload = {
        customerName: form.customerName.trim(),
        email:
          form.email.trim().toLowerCase() ||
          "guest@signavi.com",
        quantity: Number(form.quantity || 1),
        product: form.product.trim(),
        productionType: form.productionType,
        notes: form.notes.trim(),
        artwork: form.artwork || "",
        serviceType: form.productionType,
        serviceLabel: form.product.trim(),
        status: "pending"
      }

      console.log("📤 SENDING QUOTE:", payload)

      const res = await api.post("/quotes", payload)

      const quote =
        res.data?.data ||
        res.data?.quote ||
        res.data

      const quoteId = quote?._id

      if (!quoteId) {
        throw new Error("Quote created but no ID returned")
      }

      toast.success("Quote submitted")

      setForm(initialForm)

      navigate(`/quote/${quoteId}`)
    } catch (err) {
      console.error("❌ QUOTE ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit quote"
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
            Request a Quote
          </h1>

          <p className="mt-3 text-slate-400">
            Submit a custom job request with artwork, quantity, and production notes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20"
        >
          <div className="grid gap-4">
            <input
              name="customerName"
              placeholder="Customer Name"
              value={form.customerName}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="email"
              type="email"
              placeholder="Email optional"
              value={form.email}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="product"
              placeholder="Product, service, or project type"
              value={form.product}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              type="number"
              name="quantity"
              min="1"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <select
              name="productionType"
              value={form.productionType}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            >
              <option value="screenprint">Screen Print</option>
              <option value="dtf">DTF Transfer</option>
              <option value="vinyl">Vinyl</option>
              <option value="laser">Laser Engraving</option>
              <option value="design">Graphic Design</option>
              <option value="signs">Signs & Banners</option>
              <option value="photo">Photography</option>
              <option value="web">Web Design</option>
              <option value="custom">Custom Project</option>
            </select>

            <textarea
              name="notes"
              placeholder="Notes, sizes, colors, deadline, materials, or special instructions"
              value={form.notes}
              onChange={handleChange}
              rows="5"
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="rounded-2xl border border-dashed border-slate-700 bg-[#020617] p-5">
              <h2 className="mb-4 text-lg font-bold">
                Upload Artwork
              </h2>

              <UploadArtwork setArtwork={setArtwork} />

              {form.artwork && (
                <p className="mt-3 break-all text-sm text-cyan-300">
                  Artwork attached: {String(form.artwork)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Quote"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}