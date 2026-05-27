import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const pricing = {
  laser: {
    label: "Laser Engraving",
    base: 15,
    setup: 10,
    minimum: 25,
    description:
      "Tumblers, keychains, leather patches, wood, acrylic, awards, and custom gifts."
  },
  vinyl: {
    label: "Vinyl Printing",
    base: 5,
    setup: 0,
    minimum: 25,
    description:
      "Decals, stickers, simple apparel graphics, names, numbers, and small runs."
  },
  digital: {
    label: "Digital Services",
    base: 75,
    setup: 0,
    minimum: 75,
    description:
      "Graphic design, branding, logo cleanup, layout design, and digital mockups."
  },
  apparel: {
    label: "Custom Apparel",
    base: 18,
    setup: 15,
    minimum: 45,
    description:
      "Shirts, hoodies, hats, uniforms, event merch, and branded apparel."
  },
  signs: {
    label: "Signs & Banners",
    base: 45,
    setup: 15,
    minimum: 60,
    description:
      "Business signs, event banners, decals, promotional displays, and graphics."
  },
  photography: {
    label: "Photography",
    base: 150,
    setup: 0,
    minimum: 150,
    description:
      "Portraits, products, events, branding, real estate, and commercial photography."
  },
  video: {
    label: "Videography",
    base: 300,
    setup: 0,
    minimum: 300,
    description:
      "Commercial video production, social media content, interviews, reels, and events."
  },
  web: {
    label: "Website Design",
    base: 500,
    setup: 0,
    minimum: 500,
    description:
      "Custom websites, ecommerce stores, UX/UI design, frontend builds, and development."
  }
}

const getServiceFromSearch = (search) => {
  const params = new URLSearchParams(search)
  const service = params.get("service") || ""
  const normalized = service.toLowerCase()

  if (normalized.includes("laser")) return "laser"
  if (normalized.includes("vinyl")) return "vinyl"
  if (normalized.includes("digital")) return "digital"
  if (normalized.includes("apparel")) return "apparel"
  if (normalized.includes("sign")) return "signs"
  if (normalized.includes("photo")) return "photography"
  if (normalized.includes("video")) return "video"
  if (normalized.includes("web")) return "web"

  return "laser"
}

export default function CustomQuote() {
  const location = useLocation()
  const navigate = useNavigate()

  const initialPrintType = getServiceFromSearch(location.search)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    quantity: 1,
    printType: initialPrintType,
    turnaround: "",
    notes: location.state?.idea || ""
  })

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedService = pricing[form.printType] || pricing.laser
  const qty = Math.max(Number(form.quantity || 1), 1)

  let discount = 1
  let discountMsg = ""

  if (qty >= 100) {
    discount = 0.75
    discountMsg = "25% bulk discount estimate applied"
  } else if (qty >= 50) {
    discount = 0.85
    discountMsg = "15% bulk discount estimate applied"
  } else if (qty >= 12) {
    discount = 0.93
    discountMsg = "7% bulk discount estimate applied"
  } else {
    discountMsg = "Order 12+ to unlock possible bulk pricing"
  }

  const rushFee = form.turnaround === "rush" ? 25 : 0

  const rawEstimate =
    selectedService.base * qty * discount +
    selectedService.setup +
    rushFee

  const estimate = Math.max(rawEstimate, selectedService.minimum)
  const perItemEstimate = estimate / qty

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Number(value)
          : value
    }))
  }

  const handleServiceSelect = (key) => {
    setForm((prev) => ({
      ...prev,
      printType: key
    }))
  }

  const handleFile = (event) => {
    const selected = event.target.files?.[0]

    if (!selected) return

    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email")
      return
    }

    try {
      setLoading(true)

      const API =
        import.meta.env.VITE_API_URL ||
        "https://signavi-backend.onrender.com/api"

      const formData = new FormData()

      formData.append("customerName", form.name.trim())
      formData.append("email", form.email.trim().toLowerCase())
      formData.append("phone", form.phone.trim())

      formData.append("quantity", qty)
      formData.append("printType", form.printType)
      formData.append("serviceType", form.printType)
      formData.append("serviceLabel", selectedService.label)
      formData.append("turnaround", form.turnaround)

      formData.append("price", estimate)
      formData.append("finalPrice", estimate)
      formData.append("notes", form.notes)

      formData.append(
        "items",
        JSON.stringify([
          {
            name: selectedService.label,
            quantity: qty,
            price: estimate
          }
        ])
      )

      if (file) {
        formData.append("artwork", file)
      }

      const res = await axios.post(
        `${API}/quotes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      const quoteId =
        res?.data?.data?._id ||
        res?.data?.quote?._id ||
        res?.data?._id

      if (!quoteId) {
        throw new Error("Quote created but no ID returned")
      }

      toast.success("Quote submitted")
      navigate(`/quote/${quoteId}`)
    } catch (err) {
      console.error("❌ QUOTE ERROR:", err.response?.data || err)

      toast.error(
        err.response?.data?.message ||
          "Failed to submit quote"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Custom Quote
          </p>

          <h1 className="mb-5 text-5xl font-bold leading-tight md:text-7xl">
            Start Your
            <br />
            Custom Project
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-400">
            Tell us what you want to create. This estimate gives a starting
            point, and your final quote will be reviewed before approval.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 backdrop-blur md:p-8"
          >
            <h2 className="mb-6 text-2xl font-bold">
              Project Details
            </h2>

            <div className="mb-8 grid gap-4 md:grid-cols-2">
              {Object.entries(pricing).map(([key, service]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleServiceSelect(key)}
                  className={
                    form.printType === key
                      ? "rounded-2xl border border-cyan-400 bg-cyan-400/10 p-5 text-left shadow-lg shadow-cyan-500/10"
                      : "rounded-2xl border border-slate-800 bg-[#020617] p-5 text-left transition hover:border-cyan-400/60"
                  }
                >
                  <h3 className="mb-2 font-bold text-white">
                    {service.label}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-400">
                    {service.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-300">
                  Name
                </span>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-300">
                  Email
                </span>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-300">
                  Phone
                </span>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-300">
                  Quantity
                </span>

                <input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  min="1"
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-300">
                  Preferred Turnaround
                </span>

                <select
                  name="turnaround"
                  value={form.turnaround}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="">
                    Select preferred turnaround
                  </option>

                  <option value="standard">
                    Standard
                  </option>

                  <option value="1-2-weeks">
                    1–2 Weeks
                  </option>

                  <option value="rush">
                    Rush Service
                  </option>
                </select>

                <span className="text-xs text-slate-500">
                  Final scheduling is confirmed by SignaVi Studio after review.
                </span>
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-300">
                  Project Description
                </span>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Describe your project, sizes, colors, material, logo placement, or any important details..."
                  rows="6"
                  className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Upload Artwork / Reference
                </span>

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

                  {preview && file?.type?.startsWith("image/") && (
                    <img
                      src={preview}
                      alt="Artwork preview"
                      className="mt-4 max-h-56 rounded-xl border border-slate-800 object-contain"
                    />
                  )}
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Quote Request"}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20 backdrop-blur md:p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Estimate Preview
            </p>

            <h2 className="mb-4 text-3xl font-bold">
              {selectedService.label}
            </h2>

            <div className="mb-6 rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-6">
              <p className="text-sm text-slate-400">
                Starting Estimate
              </p>

              <p className="mt-2 text-5xl font-bold text-cyan-300">
                ${estimate.toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                About ${perItemEstimate.toFixed(2)} per item
              </p>
            </div>

            <div className="space-y-4 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span>Quantity</span>
                <strong>{qty}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span>Setup</span>
                <strong>${selectedService.setup.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span>Minimum</span>
                <strong>${selectedService.minimum.toFixed(2)}</strong>
              </div>

              {form.turnaround === "rush" && (
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span>Rush Estimate Add-on</span>
                  <strong>${rushFee.toFixed(2)}</strong>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4 text-sm text-cyan-300">
                {discountMsg}
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-500">
              Final pricing may change based on material, artwork complexity,
              turnaround time, product availability, setup, shipping, and
              production requirements.
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}