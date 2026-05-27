import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
}

const getPasswordStrength = (password = "") => {
  let score = 0

  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (!password) {
    return {
      label: "",
      className: "text-slate-500",
      bar: "w-0 bg-slate-700"
    }
  }

  if (score <= 2) {
    return {
      label: "Weak",
      className: "text-red-400",
      bar: "w-1/3 bg-red-500"
    }
  }

  if (score <= 4) {
    return {
      label: "Medium",
      className: "text-yellow-300",
      bar: "w-2/3 bg-yellow-400"
    }
  }

  return {
    label: "Strong",
    className: "text-emerald-400",
    bar: "w-full bg-emerald-500"
  }
}

export default function CustomerRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const strength = useMemo(() => {
    return getPasswordStrength(form.password)
  }, [form.password])

  const passwordsMatch =
    form.confirmPassword &&
    form.password === form.confirmPassword

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "email"
          ? value.toLowerCase()
          : value
    }))
  }

  const validate = () => {
    const cleanName = form.name.trim()
    const cleanEmail = form.email.trim().toLowerCase()

    if (!cleanName || !cleanEmail || !form.password) {
      setError("Name, email, and password are required")
      return false
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email")
      return false
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    setError("")
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (loading) return
    if (!validate()) return

    try {
      setLoading(true)
      setError("")

      console.log("🔥 CUSTOMER REGISTER REQUEST")

      const res = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "customer"
      })

      console.log("✅ REGISTER RESPONSE:", res.data)

      const token =
        res.data?.token ||
        res.data?.data?.token

      const user =
        res.data?.user ||
        res.data?.data?.user

      if (!token || !user) {
        throw new Error("Invalid server response")
      }

      const cleanUser = {
        _id: user._id || user.id || "",
        name: user.name || form.name.trim(),
        email: user.email || form.email.trim().toLowerCase(),
        role: user.role || "customer"
      }

      localStorage.setItem("customerToken", token)
      localStorage.setItem("customerUser", JSON.stringify(cleanUser))
      localStorage.setItem("customerEmail", cleanUser.email)

      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")

      console.log("✅ CUSTOMER STORED:", cleanUser)

      toast.success("Account created")

      navigate("/store", {
        replace: true
      })
    } catch (err) {
      console.error("❌ REGISTER ERROR:", err.response?.data || err)

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Server may be waking up — try again in a few seconds."

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30"
        >
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold">
              Create Account
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Create your customer account to track orders, payments, quotes,
              and support requests.
            </p>
          </div>

          <div className="space-y-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            {form.password && (
              <div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${strength.bar}`}
                  />
                </div>

                <p className={`text-sm font-bold ${strength.className}`}>
                  Strength: {strength.label}
                </p>
              </div>
            )}

            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            {form.confirmPassword && (
              <p
                className={
                  passwordsMatch
                    ? "text-sm font-bold text-emerald-400"
                    : "text-sm font-bold text-red-400"
                }
              >
                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="mt-4 w-full rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showPassword ? "🙈 Hide Passwords" : "👁 Show Passwords"}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/customer-login")}
            className="mt-4 w-full text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            Already have an account? Log in
          </button>
        </form>
      </section>
    </main>
  )
}