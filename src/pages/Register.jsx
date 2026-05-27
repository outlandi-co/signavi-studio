import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

export default function Register() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const register = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error("Enter your name")
      return
    }

    if (!form.email.trim()) {
      toast.error("Enter your email")
      return
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "customer"
      })

      const token = res.data?.token
      const user = res.data?.user

      if (!token || !user) {
        throw new Error("Invalid registration response")
      }

      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")

      localStorage.setItem(
        "customerToken",
        token
      )

      localStorage.setItem(
        "customerUser",
        JSON.stringify(user)
      )

      localStorage.setItem(
        "customerEmail",
        user.email
      )

      toast.success("Account created successfully")

      navigate("/dashboard")
    } catch (error) {
      console.error(
        "❌ REGISTER ERROR:",
        error.response?.data || error
      )

      toast.error(
        error.response?.data?.message ||
          "Registration failed"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold">
            Create Account
          </h1>

          <p className="mt-3 text-slate-400">
            Create your customer account to manage quotes,
            orders, invoices, and support tickets.
          </p>
        </div>

        <form
          onSubmit={register}
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20"
        >
          <div className="grid gap-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-4 text-slate-400"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-2xl border border-slate-700 px-5 py-4 font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Already have an account?
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}