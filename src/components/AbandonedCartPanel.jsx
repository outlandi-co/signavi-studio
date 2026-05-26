import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"

import api from "../services/api"

function AbandonedCartPanel() {
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [resendingId, setResendingId] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const res = await api.get("/abandoned")

      const safeCarts = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : []

      setCarts(safeCarts)
    } catch (err) {
      console.error("❌ ABANDONED LOAD ERROR:", err)
      setCarts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  const resend = async (id) => {
    try {
      setResendingId(id)

      await api.post(`/abandoned/resend/${id}`)

      alert("📧 Email resent")

      await load()
    } catch (err) {
      console.error("❌ RESEND ERROR:", err)
      alert("Failed to resend email")
    } finally {
      setResendingId(null)
    }
  }

  const totalLost = useMemo(() => {
    return carts.reduce(
      (acc, cart) =>
        acc + Number(cart.total || 0),
      0
    )
  }, [carts])

  if (loading) {
    return (
      <section style={panel}>
        <h2>🧠 Abandoned Carts</h2>
        <p style={muted}>Loading abandoned carts...</p>
      </section>
    )
  }

  return (
    <section style={panel}>
      <div style={header}>
        <div>
          <h2 style={title}>🧠 Abandoned Carts</h2>

          <p style={muted}>
            Recover lost checkout revenue with resend reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          style={refreshButton}
        >
          Refresh
        </button>
      </div>

      <div style={summaryCard}>
        <p style={summaryLabel}>Potential Revenue</p>

        <h3 style={summaryValue}>
          ${totalLost.toFixed(2)}
        </h3>
      </div>

      {carts.length === 0 ? (
        <p style={muted}>
          No abandoned carts 👌
        </p>
      ) : (
        <div style={list}>
          {carts.map((cart) => (
            <article
              key={cart._id}
              style={card}
            >
              <div>
                <p style={email}>
                  {cart.email || "No email"}
                </p>

                <p style={amount}>
                  ${Number(cart.total || 0).toFixed(2)}
                </p>

                {cart.discountCode && (
                  <p style={discount}>
                    🎯 {cart.discountPercent || 0}% OFF — {cart.discountCode}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => resend(cart._id)}
                disabled={resendingId === cart._id}
                style={{
                  ...resendButton,
                  opacity: resendingId === cart._id ? 0.6 : 1,
                  cursor:
                    resendingId === cart._id
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {resendingId === cart._id
                  ? "Sending..."
                  : "Resend Email"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const panel = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 20,
  padding: 24,
  color: "white"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 20
}

const title = {
  margin: 0
}

const muted = {
  color: "#94a3b8",
  margin: "8px 0 0"
}

const refreshButton = {
  background: "#38bdf8",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer"
}

const summaryCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 18,
  marginBottom: 18
}

const summaryLabel = {
  color: "#94a3b8",
  margin: 0,
  fontSize: 14
}

const summaryValue = {
  color: "#22c55e",
  margin: "8px 0 0",
  fontSize: 30
}

const list = {
  display: "grid",
  gap: 12
}

const card = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  border: "1px solid #1e293b",
  background: "#0f172a",
  borderRadius: 16,
  padding: 16
}

const email = {
  margin: 0,
  fontWeight: 900
}

const amount = {
  margin: "6px 0 0",
  color: "#22c55e",
  fontWeight: 900
}

const discount = {
  margin: "6px 0 0",
  color: "#38bdf8",
  fontSize: 13,
  fontWeight: 800
}

const resendButton = {
  background: "#22c55e",
  color: "#020617",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 900
}

export default AbandonedCartPanel