import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

export default function QuotePage() {
  const navigate = useNavigate()

  const storedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("customerUser") || "null"
      )
    } catch {
      return null
    }
  })()

  const [form, setForm] = useState({
    customerName: storedUser?.name || "",
    email:
      storedUser?.email ||
      localStorage.getItem("customerEmail") ||
      "",
    quantity: 1,
    notes: ""
  })

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Number(value || 1)
          : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.customerName.trim()) {
      toast.error("Enter your name")
      return
    }

    if (!form.email.trim()) {
      toast.error("Enter your email")
      return
    }

    if (!file) {
      toast.error("Upload a file first")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append(
        "customerName",
        form.customerName.trim()
      )

      formData.append(
        "email",
        form.email.trim().toLowerCase()
      )

      formData.append(
        "quantity",
        Number(form.quantity || 1)
      )

      formData.append(
        "notes",
        form.notes.trim()
      )

      formData.append(
        "artwork",
        file
      )

      const res = await api.post(
        "/quotes",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      )

      console.log(
        "✅ QUOTE SUCCESS:",
        res.data
      )

      const quote =
        res.data?.data ||
        res.data?.quote ||
        res.data

      const quoteId = quote?._id

      if (!quoteId) {
        throw new Error(
          "No quote ID returned"
        )
      }

      toast.success(
        "Quote submitted successfully"
      )

      navigate(`/quote/${quoteId}`)
    } catch (err) {
      console.error(
        "❌ QUOTE ERROR:",
        err.response?.data || err
      )

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Server error"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#020617]
        px-6
        py-16
        text-white
      "
    >
      <section
        className="
          mx-auto
          max-w-3xl
        "
      >
        <div className="mb-10 text-center">
          <p
            className="
              mb-3
              text-sm
              font-bold
              uppercase
              tracking-[0.25em]
              text-cyan-400
            "
          >
            SignaVi Studio
          </p>

          <h1
            className="
              text-4xl
              font-extrabold
              md:text-5xl
            "
          >
            Submit A Quote
          </h1>

          <p className="mt-3 text-slate-400">
            Upload your artwork,
            logo, design, or project
            files and we'll review
            your request.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-950/80
            p-8
            shadow-xl
            shadow-black/20
          "
        >
          <div className="grid gap-4">
            <input
              name="customerName"
              placeholder="Your Name"
              value={form.customerName}
              onChange={handleChange}
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                focus:border-cyan-400
              "
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                focus:border-cyan-400
              "
            />

            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                focus:border-cyan-400
              "
            />

            <textarea
              name="notes"
              rows="5"
              placeholder="Tell us about your project..."
              value={form.notes}
              onChange={handleChange}
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                focus:border-cyan-400
              "
            />

            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-slate-700
                bg-[#020617]
                p-5
              "
            >
              <input
                type="file"
                accept="
                  .png,
                  .jpg,
                  .jpeg,
                  .pdf,
                  .svg,
                  .ai,
                  .psd
                "
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
                className="
                  w-full
                  text-sm
                  text-slate-400
                "
              />

              {file && (
                <p
                  className="
                    mt-3
                    text-sm
                    text-cyan-300
                  "
                >
                  📎 {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-2xl
                bg-cyan-500
                px-5
                py-4
                font-black
                text-black
                transition
                hover:bg-cyan-400
                disabled:opacity-50
              "
            >
              {loading
                ? "Uploading..."
                : "Submit Quote"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}