import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"

import {
  useNavigate,
  useParams
} from "react-router-dom"

import api from "../../services/api"
import { io } from "socket.io-client"
import OrderModal from "../../components/modals/OrderModal"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL =
  API_URL.replace("/api", "")

const money = (value = 0) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  })
}

const formatStatus = (status = "") => {
  return String(status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const socketRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get(`/customers/${id}`)

      const customerData =
        res.data?.customer ||
        res.data?.data?.customer ||
        res.data?.data ||
        res.data ||
        null

      const orderData =
        res.data?.orders ||
        res.data?.data?.orders ||
        customerData?.orders ||
        []

      setCustomer(customerData)
      setOrders(Array.isArray(orderData) ? orderData : [])
    } catch (err) {
      console.error("❌ CUSTOMER DETAIL ERROR:", err)
      setCustomer(null)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = () => {
      load()
    }

    socket.on("customerUpdated", handleUpdate)
    socket.on("orderUpdated", handleUpdate)
    socket.on("jobUpdated", handleUpdate)

    return () => {
      socket.off("customerUpdated", handleUpdate)
      socket.off("orderUpdated", handleUpdate)
      socket.off("jobUpdated", handleUpdate)
    }
  }, [load])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        Loading customer...
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-red-400">
        Customer not found.
      </main>
    )
  }

  const customerName =
    customer.customerName ||
    customer.name ||
    "Customer"

  const totalOrders =
    customer.totalOrders ||
    orders.length ||
    0

  const totalSpent =
    customer.totalSpent ||
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.finalPrice ||
            order.total ||
            order.price ||
            0
        ),
      0
    )

  const averageOrder =
    totalOrders > 0
      ? totalSpent / totalOrders
      : 0

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/admin/customers")}
          className="mb-8 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          ← Back to Customers
        </button>

        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Customer CRM
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            {customerName}
          </h1>

          <p className="mt-3 text-slate-400">
            {customer.email || "No email provided"}
          </p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <MetricCard
            label="Orders"
            value={totalOrders}
            accent="text-cyan-300"
          />

          <MetricCard
            label="Total Spent"
            value={money(totalSpent)}
            accent="text-emerald-300"
          />

          <MetricCard
            label="Average Order"
            value={money(averageOrder)}
            accent="text-blue-300"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-5 text-2xl font-bold">
              Customer Information
            </h2>

            <div className="grid gap-4">
              <Info
                label="Name"
                value={customerName}
              />

              <Info
                label="Email"
                value={customer.email || "Not provided"}
              />

              <Info
                label="Phone"
                value={customer.phone || "Not provided"}
              />

              <Info
                label="VIP"
                value={customer.isVIP ? "Yes" : "No"}
              />

              <Info
                label="Created"
                value={
                  customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString()
                    : "Not available"
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Orders
                </h2>

                <p className="text-sm text-slate-500">
                  Recent orders and production history.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-cyan-400"
              >
                View All Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#020617] p-8 text-center">
                <p className="text-slate-400">
                  No orders yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => {
                  const total = Number(
                    order.finalPrice ||
                      order.total ||
                      order.price ||
                      0
                  )

                  return (
                    <button
                      key={order._id}
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-2xl border border-slate-800 bg-[#020617] p-4 text-left transition hover:border-cyan-400"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <p className="font-mono text-sm font-bold text-cyan-300">
                            #{String(order._id || "").slice(-6).toUpperCase()}
                          </p>

                          <p className="mt-2 font-bold text-white">
                            {order.items?.[0]?.name ||
                              order.serviceLabel ||
                              "Order"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "No date"}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                            {formatStatus(order.status)}
                          </span>

                          <p className="mt-3 font-bold text-emerald-300">
                            {money(total)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdated={load}
          />
        )}
      </section>
    </main>
  )
}

function MetricCard({
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

function Info({
  label,
  value
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-white">
        {value}
      </p>
    </div>
  )
}