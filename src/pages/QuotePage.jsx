import { useState } from "react"
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

  const [submittedQuote, setSubmittedQuote] =
    useState(null)

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target

    setForm((prev) => ({
      ...prev,

      [name]:
        name === "quantity"
          ? Math.max(
              1,
              Number(value || 1)
            )
          : value
    }))
  }

  const handleFile = (event) => {
    const selected =
      event.target.files?.[0] ||
      null

    setFile(selected)
  }

  const resetForm = () => {
    setForm({
      ...initialForm,

      customerName:
        storedUser?.name ||
        storedUser?.customerName ||
        "",

      email:
        storedUser?.email ||
        localStorage.getItem(
          "customerEmail"
        ) ||
        ""
    })

    setFile(null)
    setError("")
    setSubmittedQuote(null)
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    setError("")

    if (
      !form.customerName.trim()
    ) {
      const message =
        "Please enter your name"

      setError(message)
      toast.error(message)

      return
    }

    if (
      !form.email.trim()
    ) {
      const message =
        "Please enter your email"

      setError(message)
      toast.error(message)

      return
    }

    if (!file) {
      const message =
        "Upload a file first"

      setError(message)
      toast.error(message)

      return
    }

    try {
      setLoading(true)

      const formData =
        new FormData()

      formData.append(
        "customerName",
        form.customerName.trim()
      )

      formData.append(
        "email",
        form.email
          .trim()
          .toLowerCase()
      )

      formData.append(
        "phone",
        form.phone.trim()
      )

      formData.append(
        "quantity",
        Number(
          form.quantity || 1
        )
      )

      formData.append(
        "notes",
        form.notes.trim()
      )

      formData.append(
        "printType",
        "custom"
      )

      formData.append(
        "serviceType",
        "custom"
      )

      formData.append(
        "serviceLabel",
        "Custom Quote"
      )

      formData.append(
        "projectType",
        "Custom Project"
      )

      formData.append(
        "source",
        "quote"
      )

      formData.append(
        "artwork",
        file
      )

      const res =
        await api.post(
          "/quotes",
          formData
        )

      console.log(
        "✅ QUOTE SUCCESS:",
        res.data
      )

      const quote =
        res.data?.data ||
        res.data?.quote ||
        res.data

      if (!quote?._id) {
        throw new Error(
          "No quote ID returned from server"
        )
      }

      setSubmittedQuote(
        quote
      )

      localStorage.setItem(
        "customerEmail",
        form.email
          .trim()
          .toLowerCase()
      )

      toast.success(
        "Quote request submitted"
      )
    } catch (err) {
      console.error(
        "❌ QUOTE ERROR:",
        err.response?.data ||
        err
      )

      const message =
        err.response?.data
          ?.message ||
        err.message ||
        "Server error"

      setError(message)

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (submittedQuote) {
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
          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-950/80
              p-8
              text-center
              shadow-xl
              shadow-black/20
              md:p-12
            "
          >
            <div
              className="
                mx-auto
                mb-6
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-cyan-500/10
                text-3xl
              "
            >
              ✓
            </div>

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
              Quote Request Received
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-lg
                leading-8
                text-slate-300
              "
            >
              Thank you,
              {" "}
              {submittedQuote.customerName ||
                form.customerName}.
              We received your
              project information
              and artwork.
            </p>

            <p
              className="
                mx-auto
                mt-3
                max-w-xl
                text-slate-400
              "
            >
              Our team will review
              your request and
              contact you with
              pricing and the next
              steps.
            </p>

            <div
              className="
                mx-auto
                mt-8
                max-w-md
                rounded-2xl
                border
                border-slate-800
                bg-[#020617]
                p-5
                text-left
              "
            >
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Quote Request
              </p>

              <p
                className="
                  mt-2
                  break-all
                  font-mono
                  text-sm
                  text-cyan-300
                "
              >
                #
                {submittedQuote._id}
              </p>

              <p
                className="
                  mt-4
                  text-sm
                  text-slate-400
                "
              >
                Confirmation email:
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {submittedQuote.email ||
                  form.email}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="
                mt-8
                rounded-2xl
                bg-cyan-500
                px-8
                py-4
                font-black
                text-black
                transition
                hover:bg-cyan-400
              "
            >
              Submit Another Quote
            </button>
          </div>
        </section>
      </main>
    )
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
        <div
          className="
            mb-10
            text-center
          "
        >
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
            Submit a Quote
          </h1>

          <p
            className="
              mt-3
              text-slate-400
            "
          >
            Upload your artwork
            or reference file and
            we’ll review your
            project.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
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
          {error && (
            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-500/30
                bg-red-500/10
                p-4
                text-sm
                font-semibold
                text-red-300
              "
            >
              {error}
            </div>
          )}

          <div
            className="
              grid
              gap-4
            "
          >
            <input
              name="customerName"
              placeholder="Your Name"
              value={
                form.customerName
              }
              onChange={
                handleChange
              }
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                transition
                focus:border-cyan-400
              "
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                transition
                focus:border-cyan-400
              "
            />

            <input
              name="phone"
              type="tel"
              placeholder="Phone (optional)"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                transition
                focus:border-cyan-400
              "
            />

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-400
                "
              >
                Quantity
              </label>

              <input
                name="quantity"
                type="number"
                min="1"
                value={
                  form.quantity
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-700
                  bg-[#020617]
                  px-5
                  py-4
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                "
              />
            </div>

            <textarea
              name="notes"
              rows="5"
              placeholder="Tell us about the project..."
              value={
                form.notes
              }
              onChange={
                handleChange
              }
              className="
                rounded-2xl
                border
                border-slate-700
                bg-[#020617]
                px-5
                py-4
                text-white
                outline-none
                transition
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
              <p
                className="
                  mb-3
                  text-sm
                  font-semibold
                  text-slate-400
                "
              >
                Artwork / Reference File
              </p>

              <input
                type="file"
                onChange={
                  handleFile
                }
                accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.psd"
                className="
                  w-full
                  text-sm
                  text-slate-400
                  file:mr-4
                  file:rounded-full
                  file:border-0
                  file:bg-cyan-500
                  file:px-4
                  file:py-2
                  file:font-bold
                  file:text-black
                  hover:file:bg-cyan-400
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
                  Selected:
                  {" "}
                  {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading
              }
              className="
                rounded-2xl
                bg-cyan-500
                px-5
                py-4
                font-black
                text-black
                transition
                hover:bg-cyan-400
                disabled:cursor-not-allowed
                disabled:opacity-60
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