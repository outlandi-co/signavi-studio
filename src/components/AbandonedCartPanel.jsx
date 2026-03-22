import { useState } from "react"
import api from "../services/api"

function AbandonedCartPanel() {

  const [carts, setCarts] = useState([])
  const [loaded, setLoaded] = useState(false)

  /* ✅ LOAD FUNCTION */
  const load = async () => {
    try {
      const res = await api.get("/abandoned")
      setCarts(res.data)
      setLoaded(true)
    } catch (err) {
      console.error("Abandoned load error:", err)
    }
  }

  /* ✅ RUN ON FIRST RENDER (NO useEffect) */
  if (!loaded) {
    load()
  }

  const resend = async (id) => {
    try {
      await api.post(`/abandoned/resend/${id}`)
      alert("📧 Email resent")

      load() // refresh
    } catch (err) {
      console.error(err)
    }
  }

  const totalLost = carts.reduce((acc, c) => acc + c.total, 0)

  return (
    <div style={panel}>
      <h2>🧠 Abandoned Carts</h2>

      <p>💰 Potential Revenue: ${totalLost.toFixed(2)}</p>

      {carts.length === 0 && (
        <p style={{ color: "#64748b" }}>
          No abandoned carts 👌
        </p>
      )}

      {carts.map(cart => (
        <div key={cart._id} style={card}>
          <p><b>{cart.email}</b></p>
          <p>${cart.total.toFixed(2)}</p>

          {cart.discountCode && (
            <p style={{ color: "#22c55e" }}>
              🎯 {cart.discountPercent}% OFF — {cart.discountCode}
            </p>
          )}

          <button onClick={() => resend(cart._id)}>
            Resend Email
          </button>
        </div>
      ))}
    </div>
  )
}

/* ================= STYLES ================= */

const panel = {
  background: "#020617",
  padding: "20px",
  borderRadius: "12px",
  color: "white"
}

const card = {
  borderBottom: "1px solid #1e293b",
  padding: "10px 0"
}

export default AbandonedCartPanel