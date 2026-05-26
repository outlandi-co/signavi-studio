import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })

const formatStatus = (status = "") =>
  String(status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const statusOptions = [
  "all",
  "payment_required",
  "paid",
  "ready_for_production",
  "production",
  "shipping",
  "shipped",
  "delivered",
  "archive",
]

function Orders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    let mounted = true

    const loadOrders = async () => {
      try {
        const res = await api.get("/orders")

        if (!mounted) return

        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []

        setOrders(data)
      } catch (err) {
        console.error("❌ ORDERS LOAD ERROR:", err)

        if (mounted) {
          setOrders([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      loadOrders()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const filteredOrders = useMemo(() => {
    let data = [...orders]

    if (statusFilter !== "all") {
      data = data.filter((order) => order.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim()

      data = data.filter((order) => {
        return (
          String(order._id || "").toLowerCase().includes(term) ||
          String(order.customerName || "").toLowerCase().includes(term) ||
          String(order.email || "").toLowerCase().includes(term) ||
          String(order.status || "").toLowerCase().includes(term)
        )
      })
    }

    return data
  }, [orders, search, statusFilter])

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.finalPrice || order.total || order.subtotal || 0),
    0
  )

  const totalOrders = orders.length

  const activeOrders = orders.filter(
    (order) => !["delivered", "archive"].includes(order.status)
  ).length

  const paidOrders = orders.filter((order) =>
    [
      "paid",
      "ready_for_production",
      "production",
      "shipping",
      "shipped",
      "delivered",
    ].includes(order.status)
  ).length

  if (loading) {
    return (
      <main style={page}>
        <p style={mutedText}>Loading orders...</p>
      </main>
    )
  }

  return (
    <main style={page}>
      <section style={header}>
        <div>
          <p style={eyebrow}>Admin Orders</p>

          <h1 style={title}>📦 Orders</h1>

          <p style={subtitle}>
            View customer orders, production status, totals, and fulfillment
            details.
          </p>
        </div>
      </section>

      <section style={metricsGrid}>
        <MetricCard label="Total Orders" value={totalOrders} />
        <MetricCard label="Active Orders" value={activeOrders} />
        <MetricCard label="Paid / Production" value={paidOrders} />
        <MetricCard label="Revenue" value={money(totalRevenue)} />
      </section>

      <section style={filterPanel}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order ID, customer, email, or status..."
          style={searchInput}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={selectInput}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All Statuses" : formatStatus(status)}
            </option>
          ))}
        </select>
      </section>

      <section style={tableCard}>
        {filteredOrders.length === 0 ? (
          <div style={emptyState}>
            No orders found.
          </div>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <Th>ID</Th>
                  <Th>Customer</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Total</Th>
                  <Th>Qty</Th>
                  <Th>Date</Th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const quantity =
                    order.quantity ||
                    order.items?.reduce(
                      (sum, item) =>
                        sum + Number(item.quantity || 1),
                      0
                    ) ||
                    1

                  return (
                    <tr
                      key={order._id}
                      onClick={() =>
                        navigate(`/admin/order/${order._id}`)
                      }
                      style={row}
                    >
                      <Td>
                        #{String(order._id || "").slice(-6).toUpperCase()}
                      </Td>

                      <Td>{order.customerName || "Customer"}</Td>

                      <Td>{order.email || "No email"}</Td>

                      <Td>
                        <span style={statusBadge(order.status)}>
                          {formatStatus(order.status)}
                        </span>
                      </Td>

                      <Td>
                        {money(
                          order.finalPrice ||
                            order.total ||
                            order.subtotal ||
                            0
                        )}
                      </Td>

                      <Td>{quantity}</Td>

                      <Td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "No date"}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCard}>
      <p style={metricLabel}>{label}</p>
      <h2 style={metricValue}>{value}</h2>
    </div>
  )
}

function Th({ children }) {
  return <th style={th}>{children}</th>
}

function Td({ children }) {
  return <td style={td}>{children}</td>
}

const statusBadge = (status = "") => {
  const base = {
    display: "inline-flex",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    border: "1px solid #334155",
  }

  if (status === "paid" || status === "delivered") {
    return {
      ...base,
      color: "#22c55e",
      background: "rgba(34,197,94,0.12)",
      borderColor: "rgba(34,197,94,0.35)",
    }
  }

  if (status === "payment_required") {
    return {
      ...base,
      color: "#f97316",
      background: "rgba(249,115,22,0.12)",
      borderColor: "rgba(249,115,22,0.35)",
    }
  }

  if (status === "production" || status === "ready_for_production") {
    return {
      ...base,
      color: "#22d3ee",
      background: "rgba(34,211,238,0.12)",
      borderColor: "rgba(34,211,238,0.35)",
    }
  }

  if (status === "shipping" || status === "shipped") {
    return {
      ...base,
      color: "#a78bfa",
      background: "rgba(167,139,250,0.12)",
      borderColor: "rgba(167,139,250,0.35)",
    }
  }

  return {
    ...base,
    color: "#cbd5e1",
    background: "rgba(148,163,184,0.12)",
  }
}

const page = {
  minHeight: "100vh",
  background: "#020617",
  color: "#ffffff",
  padding: 30,
}

const header = {
  marginBottom: 24,
}

const eyebrow = {
  margin: "0 0 8px",
  color: "#22d3ee",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
}

const title = {
  margin: 0,
  fontSize: 34,
}

const subtitle = {
  marginTop: 10,
  color: "#94a3b8",
  maxWidth: 700,
}

const mutedText = {
  color: "#94a3b8",
}

const metricsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 20,
}

const metricCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 18,
}

const metricLabel = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
}

const metricValue = {
  margin: "8px 0 0",
  color: "#22d3ee",
  fontSize: 26,
  fontWeight: 900,
}

const filterPanel = {
  display: "grid",
  gridTemplateColumns: "1fr 220px",
  gap: 14,
  marginBottom: 20,
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 16,
}

const searchInput = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "#ffffff",
  boxSizing: "border-box",
}

const selectInput = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#020617",
  color: "#ffffff",
}

const tableCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  overflow: "hidden",
}

const tableWrap = {
  overflowX: "auto",
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 850,
}

const theadRow = {
  background: "#020617",
}

const th = {
  padding: "14px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
}

const td = {
  padding: "14px",
  color: "#e5e7eb",
  borderTop: "1px solid #1e293b",
}

const row = {
  cursor: "pointer",
  transition: "background 0.2s ease",
}

const emptyState = {
  padding: 24,
  color: "#94a3b8",
}

export default Orders