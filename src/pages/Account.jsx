import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

export default function Account() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const res = await api.get("/auth/me")

        const userData =
          res.data?.user ||
          res.data?.data ||
          res.data

        if (!mounted) return

        setUser(userData)
      } catch (err) {
        if (!mounted) return

        console.error(
          "❌ ACCOUNT LOAD ERROR:",
          err.response?.data || err
        )

        setError("Unable to load account information.")
        toast.error("Failed to load account")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading account...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      </main>
    )
  }

  const badges = Array.isArray(user?.badges)
    ? user.badges
    : []

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Customer Account
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Welcome, {user?.name || "Customer"}
          </h1>

          <p className="mt-3 text-slate-400">
            Manage your account, membership, rewards, and badges.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">

          {/* PROFILE CARD */}

          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">

            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500 text-4xl font-black text-black">
              {(user?.name || "C")
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="text-2xl font-bold">
              {user?.name || "Customer"}
            </h2>

            <p className="mt-2 text-slate-400">
              {user?.email || "No email available"}
            </p>

            <div className="mt-6 space-y-3">

              <InfoRow
                label="Membership"
                value={
                  user?.membershipTier ||
                  "Standard"
                }
              />

              <InfoRow
                label="Points"
                value={
                  Number(user?.points || 0)
                }
              />

              <InfoRow
                label="Role"
                value={
                  user?.role ||
                  "customer"
                }
              />

            </div>
          </section>

          {/* MEMBERSHIP + BADGES */}

          <section className="space-y-6">

            <div className="grid gap-5 md:grid-cols-2">

              <StatCard
                title="Membership Tier"
                value={
                  user?.membershipTier ||
                  "Standard"
                }
                accent="text-cyan-300"
              />

              <StatCard
                title="Reward Points"
                value={
                  Number(user?.points || 0)
                }
                accent="text-emerald-300"
              />

            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">

              <h2 className="mb-5 text-2xl font-bold">
                🏅 Badges
              </h2>

              {badges.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#020617] p-6 text-center">
                  <p className="text-slate-500">
                    No badges earned yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge, index) => (
                    <div
                      key={`${badge}-${index}`}
                      className="
                        rounded-full
                        border
                        border-cyan-500/30
                        bg-cyan-500/10
                        px-4
                        py-2
                        font-bold
                        text-cyan-300
                      "
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              )}

            </div>

          </section>

        </div>
      </section>
    </main>
  )
}

function InfoRow({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function StatCard({
  title,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {title}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}