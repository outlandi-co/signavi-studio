import { useEffect, useState } from "react"
import api from "../services/api"

export default function AdminCarts() {
  const [carts, setCarts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resendingId, setResendingId] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        const [cartRes, statRes] = await Promise.all([
          api.get("/admin/carts"),
          api.get("/admin/carts/stats"),
        ])

        if (!mounted) return

        setCarts(
          Array.isArray(cartRes.data)
            ? cartRes.data
            : cartRes.data?.data || []
        )

        setStats(statRes.data || null)
      } catch (err) {
        console.error("❌ ADMIN CARTS LOAD ERROR:", err)
        if (mounted) {
          setCarts([])
          setStats(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const timeout = setTimeout(() => {
      loadData()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [])

  const resend = async (id) => {
    try {
      setResendingId(id)

      await api.post(`/admin/carts/resend/${id}`)

      alert("Email resent")
    } catch (err) {
      console.error("❌ RESEND CART EMAIL ERROR:", err)
      alert("Failed to resend email")
    } finally {
      setResendingId(null)
    }
  }

  if (loading) {
    return (
      <div style={page}>
        <p style={mutedText}>Loading abandoned carts...</p>
      </div>
    )
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <p style={eyebrow}>Cart Recovery</p>

          <h1 style={title}>
            🛒 Abandoned Carts
          </h1>

          <p style={subtitle}>
            Review abandoned checkout sessions and resend recovery emails.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={refreshButton}
        >
          Refresh
        </button>
      </div>

      {stats && (
        <div style={statsWrap}>
          <StatCard
            label="Total"
            value={stats.totalCarts || 0}
          />

          <StatCard
            label="Abandoned"
            value={stats.abandoned || 0}
          />

          <StatCard
            label="Recovered"
            value={stats.recovered || 0}
          />

          <StatCard
            label="Lost Revenue"
            value={`$${Number(stats.lostRevenue || 0).toFixed(2)}`}
          />
        </div>
      )}

      <div style={listWrap}>
        {carts.length === 0 ? (
          <div style={emptyCard}>
            No abandoned carts found.
          </div>
        ) : (
          carts.map((cart) => (
            <div key={cart._id} style={card}>
              <div>
                <strong style={emailText}>
                  {cart.email || "No email"}
                </strong>

                <p style={smallText}>
                  {(cart.items || []).length} item(s)
                </p>

                <p style={smallText}>
                  Status:{" "}
                  <span
                    style={{
                      color: cart.recovered
                        ? "#22c55e"
                        : "#f97316",
                      fontWeight: "bold",
                    }}
                  >
                    {cart.recovered
                      ? "Recovered"
                      : "Abandoned"}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => resend(cart._id)}
                disabled={resendingId === cart._id}
                style={{
                  ...btn,
                  opacity: resendingId === cart._id ? 0.6 : 1,
                  cursor:
                    resendingId === cart._id
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {resendingId === cart._id
                  ? "Sending..."
                  : "📧 Resend"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <p style={statLabel}>{label}</p>
      <h2 style={statValue}>{value}</h2>
    </div>
  )
}

const page = {
  padding: 30,
  color: "#ffffff",
  background: "#020617",
  minHeight: "100vh",
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  flexWrap: "wrap",
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
}

const statsWrap = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginTop: 24,
}

const statCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  padding: 18,
  borderRadius: 16,
}

const statLabel = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
}

const statValue = {
  margin: "8px 0 0",
  color: "#22d3ee",
  fontSize: 26,
}

const listWrap = {
  marginTop: 24,
  display: "grid",
  gap: 12,
}

const card = {
  background: "#0f172a",
  padding: 18,
  borderRadius: 16,
  border: "1px solid #1e293b",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
}

const emptyCard = {
  background: "#0f172a",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #1e293b",
  color: "#94a3b8",
}

const emailText = {
  color: "#ffffff",
}

const smallText = {
  margin: "6px 0 0",
  color: "#94a3b8",
}

const mutedText = {
  color: "#94a3b8",
}

const btn = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: "bold",
}

const refreshButton = {
  background: "transparent",
  color: "#22d3ee",
  border: "1px solid #22d3ee",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: "bold",
  cursor: "pointer",
}