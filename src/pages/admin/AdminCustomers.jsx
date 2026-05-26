import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from "react"

import api from "../../services/api"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL =
  API_URL.replace("/api", "")

const money = (value = 0) =>
  Number(value || 0).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD"
    }
  )

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("latest")

  const socketRef = useRef(null)
  const navigate = useNavigate()

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get("/customers")

      const data =
        Array.isArray(res.data?.data)
          ? res.data.data
          : []

      setCustomers(data)
    } catch (err) {
      console.error(
        "❌ CUSTOMER LOAD ERROR:",
        err
      )

      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadCustomers])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(
        SOCKET_URL,
        {
          transports: ["websocket"]
        }
      )
    }

    const socket =
      socketRef.current

    const refresh = () => {
      loadCustomers()
    }

    socket.on(
      "customerUpdated",
      refresh
    )

    socket.on(
      "jobCreated",
      refresh
    )

    socket.on(
      "jobUpdated",
      refresh
    )

    return () => {
      socket.off(
        "customerUpdated",
        refresh
      )

      socket.off(
        "jobCreated",
        refresh
      )

      socket.off(
        "jobUpdated",
        refresh
      )
    }
  }, [loadCustomers])

  const filtered =
    useMemo(() => {
      let data = [...customers]

      if (search.trim()) {
        const term =
          search
            .toLowerCase()
            .trim()

        data = data.filter(
          customer =>
            String(
              customer.email || ""
            )
              .toLowerCase()
              .includes(term) ||

            String(
              customer.customerName || ""
            )
              .toLowerCase()
              .includes(term) ||

            String(
              customer.name || ""
            )
              .toLowerCase()
              .includes(term)
        )
      }

      if (sort === "spent") {
        data.sort(
          (a, b) =>
            Number(
              b.totalSpent || 0
            ) -
            Number(
              a.totalSpent || 0
            )
        )
      }

      if (sort === "orders") {
        data.sort(
          (a, b) =>
            Number(
              b.totalOrders || 0
            ) -
            Number(
              a.totalOrders || 0
            )
        )
      }

      if (sort === "latest") {
        data.sort(
          (a, b) => {
            const dateA =
              new Date(
                a.updatedAt ||
                a.createdAt ||
                0
              ).getTime()

            const dateB =
              new Date(
                b.updatedAt ||
                b.createdAt ||
                0
              ).getTime()

            return dateB - dateA
          }
        )
      }

      return data
    }, [
      customers,
      search,
      sort
    ])

  const totalCustomers =
    customers.length

  const vipCustomers =
    customers.filter(
      customer =>
        customer.isVIP
    ).length

  const totalRevenue =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.totalSpent || 0
        ),
      0
    )

  const totalOrders =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.totalOrders || 0
        ),
      0
    )

  const toggleVIP =
    async (
      id,
      current
    ) => {
      try {
        await api.patch(
          `/customers/${id}`,
          {
            isVIP: !current
          }
        )

        loadCustomers()
      } catch (err) {
        console.error(
          "VIP ERROR:",
          err
        )
      }
    }

  const updateNotes =
    async (
      id,
      notes
    ) => {
      try {
        await api.patch(
          `/customers/${id}`,
          {
            notes
          }
        )
      } catch (err) {
        console.error(
          "NOTES ERROR:",
          err
        )
      }
    }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading customers...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Customer CRM
          </h1>

          <p className="mt-3 text-slate-400 max-w-2xl">
            Manage customer
            relationships,
            spending history,
            VIP accounts,
            notes,
            and activity.
          </p>
        </div>

        <div className="grid gap-5 mb-8 md:grid-cols-2 xl:grid-cols-4">

          <Card
            label="Customers"
            value={totalCustomers}
            accent="text-cyan-300"
          />

          <Card
            label="VIP Customers"
            value={vipCustomers}
            accent="text-yellow-300"
          />

          <Card
            label="Orders"
            value={totalOrders}
            accent="text-blue-300"
          />

          <Card
            label="Customer Revenue"
            value={money(totalRevenue)}
            accent="text-emerald-300"
          />

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 mb-6">

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">

            <input
              value={search}
              onChange={e =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search customer name or email..."
              className="w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white"
            />

            <select
              value={sort}
              onChange={e =>
                setSort(
                  e.target.value
                )
              }
              className="rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-white"
            >
              <option value="latest">
                Latest
              </option>

              <option value="spent">
                Top Spenders
              </option>

              <option value="orders">
                Most Orders
              </option>
            </select>

          </div>

        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center">
            <h2 className="text-2xl font-bold">
              No Customers Found
            </h2>
          </div>
        ) : (
          <div className="grid gap-5">
            {filtered.map(
              customer => (
                <article
                  key={customer._id}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:justify-between">

                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/admin/customers/${customer._id}`
                        )
                      }
                    >
                      <h2 className="text-xl font-bold">
                        {customer.customerName ||
                          customer.name ||
                          "Customer"}
                      </h2>

                      <p className="text-slate-400">
                        {customer.email}
                      </p>

                      <p className="text-sm mt-2">
                        {customer.isVIP
                          ? "⭐ VIP Customer"
                          : "Standard Customer"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        toggleVIP(
                          customer._id,
                          customer.isVIP
                        )
                      }
                      className={`rounded-full px-4 py-2 font-bold ${
                        customer.isVIP
                          ? "bg-yellow-400 text-black"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      VIP
                    </button>

                  </div>

                  <div className="grid gap-4 mt-6 md:grid-cols-3">

                    <Info
                      label="Orders"
                      value={
                        customer.totalOrders || 0
                      }
                    />

                    <Info
                      label="Spent"
                      value={money(
                        customer.totalSpent
                      )}
                    />

                    <Info
                      label="Phone"
                      value={
                        customer.phone ||
                        "Not Provided"
                      }
                    />

                  </div>

                  <textarea
                    defaultValue={
                      customer.notes || ""
                    }
                    onBlur={e =>
                      updateNotes(
                        customer._id,
                        e.target.value
                      )
                    }
                    placeholder="Customer notes..."
                    className="w-full mt-5 rounded-2xl border border-slate-700 bg-[#020617] p-4 text-sm text-white"
                  />
                </article>
              )
            )}
          </div>
        )}

      </section>
    </main>
  )
}

function Card({
  label,
  value,
  accent
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <h2 className={`mt-2 text-3xl font-extrabold ${accent}`}>
        {value}
      </h2>
    </div>
  )
}

function Info({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  )
}