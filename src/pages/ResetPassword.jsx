import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

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

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => {
    return getPasswordStrength(password)
  }, [password])

  const passwordsMatch =
    confirm &&
    password === confirm

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setMessage("")

    if (!token) {
      setError("Reset token is missing")
      return
    }

    if (!password || !confirm) {
      setError("All fields are required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      const res = await api.post(
        `/auth/reset-password/${token}`,
        {
          password
        }
      )

      const successMessage =
        res.data?.message ||
        "Password reset successful"

      setMessage(successMessage)
      toast.success(successMessage)

      setPassword("")
      setConfirm("")

      setTimeout(() => {
        navigate("/customer-login", {
          replace: true
        })
      }, 1500)
    } catch (err) {
      console.error("❌ RESET PASSWORD ERROR:", err.response?.data || err)

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Reset failed"

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
              🔐 Reset Password
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Create a new password for your account.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            {password && (
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
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />

            {confirm && (
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

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="mt-4 w-full rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showPassword ? "🙈 Hide Passwords" : "👁 Show Passwords"}
          </button>

          {message && (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/customer-login")}
            className="mt-4 w-full rounded-2xl border border-slate-700 px-6 py-3 font-bold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Back to Login
          </button>
        </form>
      </section>
    </main>
  )
}