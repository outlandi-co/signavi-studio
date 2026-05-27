import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import api from "../../services/api"

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const normalizeCustomers = (payload) => {
  const data =
    payload?.data ||
    payload?.customers ||
    payload ||
    []

  return Array.isArray(data) ? data : []
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const res = await api.get("/customers")

        if (!mounted) return

        setCustomers(normalizeCustomers(res.data))
      } catch (err) {
        if (!mounted) return

        console.error("❌ LOAD CUSTOMERS ERROR:", err.response?.data || err)

        setCustomers([])
        setError("Failed to load customers")
        toast.error("Failed to load customers")
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return customers

    return customers.filter((customer) => {
      return [
        customer.name,
        customer.customerName,
        customer.email,
        customer.phone
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    })
  }, [customers, search])

  const stats = useMemo(() => {
    const totalOrders = customers.reduce(
      (sum, customer) =>
        sum + Number(customer.totalOrders || customer.ordersCount || 0),
      0
    )

    const totalSpent = customers.reduce(
      (sum, customer) =>
        sum + Number(customer.totalSpent || customer.revenue || 0),
      0
    )

    return {
      totalCustomers: customers.length,
      totalOrders,
      totalSpent,
      averageSpent:
        customers.length > 0
          ? totalSpent / customers.length
          : 0
    }
  }, [customers])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        Loading customers...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            👥 Customer CRM
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Search customers, view order activity, and track customer value.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-950/40 p-6 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Customers"
            value={stats.totalCustomers}
            accent="text-cyan-300"
          />

          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            accent="text-blue-300"
          />

          <StatCard
            label="Total Spent"
            value={money(stats.totalSpent)}
            accent="text-emerald-300"
          />

          <StatCard
            label="Avg Customer Value"
            value={money(stats.averageSpent)}
            accent="text-purple-300"
          />
        </div>

        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/20">
          <input
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-xl shadow-black/20">
            <h2 className="mb-3 text-2xl font-bold">
              No Customers Found
            </h2>

            <p className="text-slate-400">
              Customer records will show here once orders or accounts are created.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20">
            <div className="hidden grid-cols-[1.2fr_1.4fr_.7fr_.8fr] border-b border-slate-800 bg-[#020617] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 md:grid">
              <span>Name</span>
              <span>Email</span>
              <span>Orders</span>
              <span className="text-right">Total Spent</span>
            </div>

            {filtered.map((customer) => {
              const name =
                customer.name ||
                customer.customerName ||
                "Customer"

              const email =
                customer.email ||
                "No email"

              const orders =
                customer.totalOrders ||
                customer.ordersCount ||
                0

              const spent =
                customer.totalSpent ||
                customer.revenue ||
                0

              return (
                <article
                  key={customer._id || email}
                  className="grid gap-3 border-b border-slate-800 px-5 py-5 last:border-b-0 md:grid-cols-[1.2fr_1.4fr_.7fr_.8fr] md:items-center"
                >
                  <div>
                    <p className="font-bold text-white">
                      {name}
                    </p>

                    {customer.phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        {customer.phone}
                      </p>
                    )}
                  </div>

                  <p className="text-slate-400">
                    {email}
                  </p>

                  <p className="font-bold text-cyan-300">
                    {orders}
                  </p>

                  <p className="font-bold text-emerald-300 md:text-right">
                    {money(spent)}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
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