import { useEffect, useState } from "react"

export default function AdminCarts() {

  const [carts, setCarts] = useState([])
  const [stats, setStats] = useState(null)

  /* 🔥 SAFE LOAD */
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("https://signavi-backend.onrender.com/api/admin/carts")
        const data = await res.json()
        setCarts(data)

        const statRes = await fetch("https://signavi-backend.onrender.com/api/admin/carts/stats")
        const statData = await statRes.json()
        setStats(statData)

      } catch (err) {
        console.error("LOAD ERROR:", err)
      }
    }

    loadData()
  }, [])

  const resend = async (id) => {
    await fetch(`https://signavi-backend.onrender.com/api/admin/carts/resend/${id}`, {
      method: "POST"
    })

    alert("Email resent")
  }

  return (
    <div style={{ padding: 30, color: "white" }}>

      <h1>🛒 Abandoned Carts</h1>

      {stats && (
        <div style={statsWrap}>
          <div>📦 Total: {stats.totalCarts}</div>
          <div>⚠️ Abandoned: {stats.abandoned}</div>
          <div>✅ Recovered: {stats.recovered}</div>
          <div>💸 Lost Revenue: ${stats.lostRevenue}</div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {carts.map(cart => (
          <div key={cart._id} style={card}>

            <div>
              <strong>{cart.email}</strong>
              <p>{cart.items.length} items</p>
              <p>Status: {cart.recovered ? "Recovered" : "Abandoned"}</p>
            </div>

            <button onClick={() => resend(cart._id)} style={btn}>
              📧 Resend
            </button>

          </div>
        ))}
      </div>

    </div>
  )
}

const statsWrap = {
  display: "flex",
  gap: 20,
  marginTop: 20,
  background: "#020617",
  padding: 15,
  borderRadius: 10
}

const card = {
  background: "#020617",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
  display: "flex",
  justifyContent: "space-between"
}

const btn = {
  background: "#22c55e",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer"
}