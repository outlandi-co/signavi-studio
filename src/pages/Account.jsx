import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../services/api"

const getInitials = (name = "Customer") => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const getUserData = (payload = {}) => {
  return payload?.user || payload?.data || payload || null
}

export default function Account() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const badges = Array.isArray(user?.badges) ? user.badges : []

  const initials = useMemo(() => {
    return getInitials(user?.name || form.name || "Customer")
  }, [user?.name, form.name])

  useEffect(() => {
    let mounted = true

    const loadAccount = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await api.get("/auth/profile")
        const userData = getUserData(res.data)

        if (!mounted) return

        setUser(userData)

        setForm({
          name: userData?.name || "",
          email: userData?.email || "",
          phone: userData?.phone || "",
          company: userData?.company || "",
          street: userData?.address?.street || "",
          city: userData?.address?.city || "",
          state: userData?.address?.state || "",
          zip: userData?.address?.zip || "",
          country: userData?.address?.country || "USA"
        })
      } catch (err) {
        if (!mounted) return

        console.error("❌ ACCOUNT LOAD ERROR:", err.response?.data || err)

        setError("Unable to load account information.")
        toast.error("Failed to load account")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAccount()

    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError("")

      const payload = {
        name: form.name,
        phone: form.phone,
        company: form.company,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country
        }
      }

      const res = await api.patch("/auth/profile", payload)

      const updatedUser = getUserData(res.data)

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
        ...payload
      }))

      toast.success("Account updated successfully")
    } catch (err) {
      console.error("❌ ACCOUNT SAVE ERROR:", err.response?.data || err)

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to update account"

      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading account...
      </main>
    )
  }

  if (error && !user) {
    return (
      <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      </main>
    )
  }

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
            Account Center
          </h1>

          <p className="mt-3 text-slate-400">
            Manage your profile, contact details, shipping address,
            membership, rewards, and account security.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500 text-4xl font-black text-black shadow-lg shadow-cyan-500/20">
                {initials}
              </div>

              <h2 className="text-2xl font-bold">
                {user?.name || "Customer"}
              </h2>

              <p className="mt-2 break-words text-slate-400">
                {user?.email || "No email available"}
              </p>

              <div className="mt-6 space-y-3">
                <InfoRow
                  label="Membership"
                  value={user?.membershipTier || "Standard"}
                />

                <InfoRow
                  label="Points"
                  value={Number(user?.points || 0)}
                />

                <InfoRow
                  label="Role"
                  value={user?.role || "customer"}
                />

                <InfoRow
                  label="Status"
                  value={user?.isActive === false ? "Inactive" : "Active"}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <h2 className="mb-4 text-xl font-black">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <ActionButton
                  label="View Orders"
                  onClick={() => navigate("/dashboard/orders")}
                />

                <ActionButton
                  label="Security Settings"
                  onClick={() => navigate("/dashboard/security")}
                />

                <ActionButton
                  label="Support Center"
                  onClick={() => navigate("/dashboard/support")}
                />

                <ActionButton
                  label="Start Custom Quote"
                  onClick={() => navigate("/custom-quote")}
                />
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              <StatCard
                title="Membership Tier"
                value={user?.membershipTier || "Standard"}
                accent="text-cyan-300"
              />

              <StatCard
                title="Reward Points"
                value={Number(user?.points || 0)}
                accent="text-emerald-300"
              />

              <StatCard
                title="Badges Earned"
                value={badges.length}
                accent="text-yellow-300"
              />
            </div>

            <form
              onSubmit={handleSave}
              className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black">
                  Edit Profile
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Update your customer information for quotes,
                  orders, invoices, and shipping.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />

                <InputField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  disabled
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />

                <InputField
                  label="Company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Business or company name"
                />
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-lg font-black">
                  Shipping Address
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Street Address"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="Street address"
                  />

                  <InputField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />

                  <InputField
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                  />

                  <InputField
                    label="ZIP Code"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="ZIP code"
                  />

                  <InputField
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-cyan-500 px-6 py-4 font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Account"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/security")}
                  className="rounded-2xl border border-slate-700 bg-[#020617] px-6 py-4 font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Security Settings
                </button>
              </div>
            </form>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
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
                      className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-bold text-cyan-300"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </section>
    </main>
  )
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
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
          placeholder:text-slate-600
          focus:border-cyan-400
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      />
    </label>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value || "—"}
      </p>
    </div>
  )
}

function StatCard({ title, value, accent }) {
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

function ActionButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-800 bg-[#020617] px-4 py-3 text-left text-sm font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
    >
      {label}
    </button>
  )
}