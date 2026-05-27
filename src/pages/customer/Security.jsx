import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import api from "../../services/api"

const getStrength = (password = "") => {
  if (!password) {
    return {
      label: "",
      score: 0,
      className: "text-slate-500",
      bar: "w-0 bg-slate-700"
    }
  }

  let score = 0

  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) {
    return {
      label: "Weak",
      score,
      className: "text-red-400",
      bar: "w-1/3 bg-red-500"
    }
  }

  if (score === 3 || score === 4) {
    return {
      label: "Medium",
      score,
      className: "text-yellow-300",
      bar: "w-2/3 bg-yellow-400"
    }
  }

  return {
    label: "Strong",
    score,
    className: "text-emerald-400",
    bar: "w-full bg-emerald-500"
  }
}

export default function Security() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [show, setShow] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const strength = useMemo(() => {
    return getStrength(newPassword)
  }, [newPassword])

  const passwordsMatch =
    confirmPassword &&
    newPassword === confirmPassword

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setMessage("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      })

      const successMessage =
        res.data?.message ||
        "Password updated successfully"

      setMessage(successMessage)
      toast.success(successMessage)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("❌ CHANGE PASSWORD ERROR:", err.response?.data || err)

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error updating password"

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <div className="mb-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          Account Security
        </p>

        <h2 className="text-3xl font-extrabold">
          🔐 Change Password
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Keep your SignaVi Studio customer account protected with a strong password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4"
      >
        <input
          type={show ? "text" : "password"}
          placeholder="Current Password"
          value={currentPassword}
          onChange={(event) =>
            setCurrentPassword(event.target.value)
          }
          autoComplete="current-password"
          className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
        />

        <input
          type={show ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(event) =>
            setNewPassword(event.target.value)
          }
          autoComplete="new-password"
          className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
        />

        {newPassword && (
          <div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${strength.bar}`}
              />
            </div>

            <p className={`text-sm font-bold ${strength.className}`}>
              Strength: {strength.label}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Use at least 8 characters with uppercase, lowercase, numbers, and a symbol.
            </p>
          </div>
        )}

        <input
          type={show ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          autoComplete="new-password"
          className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
        />

        {confirmPassword && (
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

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          {show ? "🙈 Hide Passwords" : "👁 Show Passwords"}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="block w-full rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}