import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../../services/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const getCustomerUser = () => {
  const stored = localStorage.getItem("customerUser")

  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    console.warn("⚠️ Failed to parse customerUser")
    return null
  }
}

const getCustomerEmail = (user) => {
  const fallbackEmail = localStorage.getItem("customerEmail")

  return String(
    user?.email ||
      fallbackEmail ||
      ""
  )
    .trim()
    .toLowerCase()
}

const normalizeOrders = (payload) => {
  const data =
    payload?.data ||
    payload?.orders ||
    payload?.myOrders ||
    payload ||
    []

  const list = Array.isArray(data) ? data : []

  return [...list].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
}

export default function CustomerProfile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError("")

        const customerUser = getCustomerUser()

        if (!customerUser) {
          navigate("/customer-login", {
            replace: true
          })
          return
        }

        const email = getCustomerEmail(customerUser)

        if (!email) {
          setUser(customerUser)
          setOrders([])
          setError("No customer email found. Please log in again.")
          return
        }

        if (!mounted) return

        setUser({
          ...customerUser,
          email
        })

        console.log("📧 PROFILE FETCH EMAIL:", email)

        const res = await api.get(
          `/orders/my-orders?email=${encodeURIComponent(email)}`
        )

        if (!mounted) return

        setOrders(normalizeOrders(res.data))
      } catch (err) {
        if (!mounted) return

        console.error(
          "❌ PROFILE ERROR:",
          err.response?.data || err.message
        )

        setOrders([])
        setError("Could not load your profile right now.")
        toast.error("Profile failed to load")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [navigate])

  const stats = useMemo(() => {
    const totalOrders = orders.length

    const activeOrders = orders.filter((order) => {
      return ![
        "delivered",
        "shipped",
        "archive",
        "denied"
      ].includes(order.status || "")
    }).length

    const totalSpent = orders.reduce((sum, order) => {
      return (
        sum +
        Number(
          order.finalPrice ||
            order.total ||
            order.subtotal ||
            0
        )
      )
    }, 0)

    const lastOrder = orders[0]

    return {
      totalOrders,
      activeOrders,
      totalSpent,
      lastOrder
    }
  }, [orders])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading profile...
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
            Customer Profile
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            My Profile
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View your customer details, order stats, and recent activity.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 text-3xl font-black text-black">
              {(user?.name || user?.email || "C")
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="text-2xl font-bold">
              {user?.name || "Customer"}
            </h2>

            <p className="mt-2 text-slate-400">
              {user?.email || "No email found"}
            </p>

            <div className="mt-6 space-y-3">
              <InfoRow
                label="Role"
                value={user?.role || "customer"}
              />

              <InfoRow
                label="Customer ID"
                value={user?._id || user?.id || "Not available"}
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/my-orders")}
              className="mt-8 w-full rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              View My Orders
            </button>
          </section>

          <section>
            <div className="grid gap-5 md:grid-cols-3">
              <StatCard
                label="Total Orders"
                value={stats.totalOrders}
                accent="text-cyan-300"
              />

              <StatCard
                label="Active Orders"
                value={stats.activeOrders}
                accent="text-blue-300"
              />

              <StatCard
                label="Total Spent"
                value={money(stats.totalSpent)}
                accent="text-emerald-300"
              />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    Recent Orders
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your latest customer activity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/my-orders")}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  View All
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#020617] p-6 text-center">
                  <h3 className="mb-2 font-bold">
                    No Orders Yet
                  </h3>

                  <p className="text-sm text-slate-500">
                    When you place an order, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <button
                      key={order._id}
                      type="button"
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="w-full rounded-2xl border border-slate-800 bg-[#020617] p-4 text-left transition hover:border-cyan-500"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            Order #
                            {String(order._id || "")
                              .slice(-6)
                              .toUpperCase()}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "No date"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-cyan-300">
                            {money(
                              order.finalPrice ||
                                order.total ||
                                order.subtotal ||
                                0
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.status || "pending"}
                          </p>
                        </div>
                      </div>
                    </button>
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
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <p className="mb-2 text-sm text-slate-400">
        {label}
      </p>

      <h2 className={`text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}