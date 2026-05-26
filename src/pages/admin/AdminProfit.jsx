import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"

const money = (value = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })

const percent = (value = 0) =>
  `${Number(value || 0).toFixed(1)}%`

const safeSummary = (data = {}) => ({
  revenue: Number(data.revenue || data.totalRevenue || 0),
  profit: Number(data.profit || data.totalProfit || 0),
  count: Number(data.count || data.orders || data.totalOrders || 0),
  avgMargin: Number(data.avgMargin || data.margin || 0),
  cogs: Number(data.cogs || data.totalCogs || 0),
})

export default function AdminProfit() {
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          api.get("/orders/profit-summary"),
          api.get("/orders").catch(() => ({
            data: {
              data: [],
            },
          })),
        ])

        if (!mounted) return

        const summaryData =
          summaryRes.data?.data ||
          summaryRes.data ||
          {}

        const orderData = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.data)
            ? ordersRes.data.data
            : []

        setData(safeSummary(summaryData))
        setOrders(orderData)
      } catch (err) {
        console.error("❌ LOAD PROFIT:", err)

        if (mounted) {
          setData(safeSummary({}))
          setOrders([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders

    return orders.filter((order) => {
      const revenue = Number(
        order.finalPrice ||
          order.total ||
          order.subtotal ||
          0
      )

      const cogs = Number(order.cogs || order.cost || 0)
      const profit = Number(order.profit || revenue - cogs)

      const margin =
        Number(order.margin) ||
        (revenue > 0 ? (profit / revenue) * 100 : 0)

      if (filter === "profitable") return profit > 0
      if (filter === "low-margin") return margin < 30
      if (filter === "loss") return profit < 0

      return true
    })
  }, [orders, filter])

  const calculatedRevenue = orders.reduce(
    (sum, order) =>
      sum +
      Number(
        order.finalPrice ||
          order.total ||
          order.subtotal ||
          0
      ),
    0
  )

  const calculatedProfit = orders.reduce(
    (sum, order) => sum + Number(order.profit || 0),
    0
  )

  const calculatedCogs = orders.reduce(
    (sum, order) =>
      sum + Number(order.cogs || order.cost || 0),
    0
  )

  const taxesCollected = orders.reduce(
    (sum, order) => sum + Number(order.tax || 0),
    0
  )

  const revenue = data?.revenue || calculatedRevenue
  const profit = data?.profit || calculatedProfit
  const cogs = data?.cogs || calculatedCogs
  const count = data?.count || orders.length

  const avgMargin =
    data?.avgMargin ||
    (revenue > 0 ? (profit / revenue) * 100 : 0)

  if (loading) {
    return (
      <main style={container}>
        <p style={muted}>Loading profit dashboard...</p>
      </main>
    )
  }

  return (
    <main style={container}>
      <div style={header}>
        <div>
          <p style={eyebrow}>SignaVi Studio</p>
          <h1 style={title}>💰 Profit Dashboard</h1>
          <p style={subtitle}>
            Track revenue, profit, taxes, COGS, margins, and order performance.
          </p>
        </div>
      </div>

      <div style={grid}>
        <Card title="Revenue" value={money(revenue)} color="#22d3ee" />
        <Card title="Profit" value={money(profit)} color="#22c55e" />
        <Card title="COGS" value={money(cogs)} color="#fb923c" />
        <Card title="Taxes" value={money(taxesCollected)} color="#facc15" />
        <Card title="Orders" value={count} color="#60a5fa" />
        <Card title="Avg Margin" value={percent(avgMargin)} color="#a78bfa" />
      </div>

      <section style={panel}>
        <div>
          <h2 style={sectionTitle}>Order Profit Review</h2>
          <p style={muted}>
            Review profitable, low-margin, and negative-profit orders.
          </p>
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={select}
        >
          <option value="all">All Orders</option>
          <option value="profitable">Profitable</option>
          <option value="low-margin">Low Margin</option>
          <option value="loss">Negative Profit</option>
        </select>
      </section>

      <section style={tableCard}>
        {filteredOrders.length === 0 ? (
          <p style={empty}>No orders match this filter.</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr style={thead}>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Revenue</Th>
                  <Th>COGS</Th>
                  <Th>Profit</Th>
                  <Th>Margin</Th>
                  <Th>Tax</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const orderRevenue = Number(
                    order.finalPrice ||
                      order.total ||
                      order.subtotal ||
                      0
                  )

                  const orderCogs = Number(order.cogs || order.cost || 0)

                  const orderProfit = Number(
                    order.profit || orderRevenue - orderCogs
                  )

                  const orderMargin =
                    Number(order.margin) ||
                    (orderRevenue > 0
                      ? (orderProfit / orderRevenue) * 100
                      : 0)

                  return (
                    <tr key={order._id} style={row}>
                      <Td>
                        #{String(order._id || "").slice(-6).toUpperCase()}
                      </Td>

                      <Td>
                        <strong>{order.customerName || "Unknown"}</strong>
                        <p style={small}>{order.email || "No email"}</p>
                      </Td>

                      <Td>{money(orderRevenue)}</Td>
                      <Td>{money(orderCogs)}</Td>

                      <Td>
                        <span
                          style={{
                            color: orderProfit >= 0 ? "#22c55e" : "#ef4444",
                            fontWeight: 800,
                          }}
                        >
                          {money(orderProfit)}
                        </span>
                      </Td>

                      <Td>
                        <span
                          style={{
                            color: orderMargin >= 30 ? "#22c55e" : "#facc15",
                            fontWeight: 800,
                          }}
                        >
                          {percent(orderMargin)}
                        </span>
                      </Td>

                      <Td>{money(order.tax)}</Td>

                      <Td>
                        {String(order.status || "unknown").replaceAll("_", " ")}
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

function Card({ title, value, color }) {
  return (
    <div style={card}>
      <p style={cardTitle}>{title}</p>
      <h2 style={{ ...cardValue, color }}>{value}</h2>
    </div>
  )
}

function Th({ children }) {
  return <th style={th}>{children}</th>
}

function Td({ children }) {
  return <td style={td}>{children}</td>
}

const container = {
  padding: 30,
  color: "#ffffff",
  background: "#020617",
  minHeight: "100vh",
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
  maxWidth: 720,
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 20,
  marginTop: 20,
  marginBottom: 24,
}

const card = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #1e293b",
}

const cardTitle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
}

const cardValue = {
  margin: "8px 0 0",
  fontSize: 26,
  fontWeight: 900,
}

const panel = {
  display: "grid",
  gridTemplateColumns: "1fr 220px",
  gap: 18,
  alignItems: "center",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
}

const sectionTitle = {
  margin: 0,
  fontSize: 22,
}

const select = {
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
  minWidth: 900,
  borderCollapse: "collapse",
}

const thead = {
  background: "#020617",
}

const th = {
  padding: 14,
  textAlign: "left",
  color: "#94a3b8",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
}

const td = {
  padding: 14,
  borderTop: "1px solid #1e293b",
  color: "#e5e7eb",
}

const row = {
  transition: "background 0.2s ease",
}

const small = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 12,
}

const muted = {
  color: "#94a3b8",
  margin: 0,
}

const empty = {
  padding: 24,
  color: "#94a3b8",
}