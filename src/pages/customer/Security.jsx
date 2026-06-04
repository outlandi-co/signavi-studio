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
    confirmPassword && newPassword === confirmPassword

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShow(false)
  }

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
        res.data?.message || "Password updated successfully"

      setMessage(successMessage)
      toast.success(successMessage)
      resetForm()
    } catch (err) {
      console.error(
        "❌ CHANGE PASSWORD ERROR:",
        err.response?.data || err
      )

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error updating password"

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-white shadow-xl shadow-black/20">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          Account Security
        </p>

        <h2 className="text-3xl font-extrabold">
          🔐 Security Settings
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Keep your SignaVi Studio customer account protected with a strong
          password and safe login habits.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
          <p className="text-sm font-bold text-slate-400">
            Password Status
          </p>
          <p className="mt-2 text-lg font-black text-emerald-400">
            Protected
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
          <p className="text-sm font-bold text-slate-400">
            Two-Factor Auth
          </p>
          <p className="mt-2 text-lg font-black text-yellow-300">
            Coming Soon
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">
          <p className="text-sm font-bold text-slate-400">
            Account Access
          </p>
          <p className="mt-2 text-lg font-black text-cyan-300">
            Customer Portal
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4"
      >
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Current Password
          </label>

          <input
            type={show ? "text" : "password"}
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            New Password
          </label>

          <input
            type={show ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>

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
              Use at least 8 characters with uppercase, lowercase,
              numbers, and a symbol.
            </p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Confirm Password
          </label>

          <input
            type={show ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>

        {confirmPassword && (
          <p
            className={
              passwordsMatch
                ? "text-sm font-bold text-emerald-400"
                : "text-sm font-bold text-red-400"
            }
          >
            {passwordsMatch
              ? "✅ Passwords match"
              : "❌ Passwords do not match"}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
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
            className="flex-1 rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>

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

      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-5">
        <h3 className="text-lg font-black text-white">
          Security Tips
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li>• Use a unique password for your SignaVi Studio account.</li>
          <li>• Avoid reusing passwords from other websites.</li>
          <li>• Add numbers, symbols, and uppercase letters for strength.</li>
          <li>• Never share your login information with anyone.</li>
        </ul>
      </div>
    </section>
  )
}