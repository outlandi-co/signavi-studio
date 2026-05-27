import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    setMessage("")
    setError("")

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setError("Please enter your email address")
      return
    }

    try {
      setLoading(true)

      const res = await api.post(
        "/auth/forgot-password",
        {
          email: cleanEmail
        }
      )

      const successMessage =
        res.data?.message ||
        "Password reset email sent"

      setMessage(successMessage)

      toast.success("Reset email sent")

    } catch (err) {
      console.error(
        "❌ FORGOT PASSWORD ERROR:",
        err.response?.data || err
      )

      const errorMessage =
        err.response?.data?.message ||
        "Unable to send reset email"

      setError(errorMessage)

      toast.error(errorMessage)

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-slate-800
            bg-slate-950/80
            p-8
            shadow-2xl
            shadow-black/30
          "
        >
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SignaVi Studio
            </p>

            <h1 className="text-4xl font-extrabold">
              Forgot Password
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Enter your account email and we'll send you a password reset link.
            </p>
          </div>

          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          {message && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-emerald-500/30
                bg-emerald-500/10
                px-4
                py-3
                text-sm
                font-semibold
                text-emerald-300
              "
            >
              {message}
            </div>
          )}

          {error && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-500/30
                bg-red-500/10
                px-4
                py-3
                text-sm
                font-semibold
                text-red-300
              "
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-6
              w-full
              rounded-2xl
              bg-cyan-500
              px-6
              py-4
              text-lg
              font-black
              text-black
              transition
              hover:bg-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Sending Reset Link..."
              : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/customer-login")}
            className="
              mt-4
              w-full
              rounded-2xl
              border
              border-slate-700
              px-6
              py-3
              font-bold
              text-slate-300
              transition
              hover:border-cyan-400
              hover:text-cyan-300
            "
          >
            ← Back to Login
          </button>
        </form>
      </section>
    </main>
  )
}