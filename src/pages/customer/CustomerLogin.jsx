import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../services/api"

export default function CustomerLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("customerToken")

    if (token) {
      navigate("/dashboard", { replace: true })
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !password) {
      setError("Please enter your email and password")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password
      })

      const user = res.data?.user
      const token = res.data?.token

      if (!user?.email || !token) {
        throw new Error("Invalid login response")
      }

      const cleanUser = {
        _id: user._id || user.id || "",
        email: user.email,
        name: user.name || user.customerName || "Customer",
        role: user.role || "customer"
      }

      localStorage.setItem("customerToken", token)
      localStorage.setItem("customerUser", JSON.stringify(cleanUser))
      localStorage.setItem("customerEmail", user.email)

      toast.success("Welcome back")
      navigate("/dashboard", { replace: true })
    } catch (err) {
      console.error("❌ CUSTOMER LOGIN ERROR:", err.response?.data || err)

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password"

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
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30"
        >
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold">
              Customer Login
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Enter your email and password to view your orders,
              quotes, and project updates.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 pr-14 text-white outline-none transition focus:border-cyan-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-black text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/store")}
              className="text-sm text-slate-400 transition hover:text-cyan-300"
            >
              Continue shopping as guest
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}