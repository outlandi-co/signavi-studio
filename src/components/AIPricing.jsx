import { useState } from "react"
import api from "../services/api"

function AIPricing() {

  const [form, setForm] = useState({
    quantity: 10,
    printType: "screenprint",
    colors: 2
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const calculate = async () => {
    setLoading(true)

    try {
      const res = await api.post("/ai-pricing", form)
      setResult(res.data)
    } catch (err) {
      console.error("AI pricing error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={box}>

      <h3>🤖 AI Pricing Calculator</h3>

      {/* INPUTS */}
      <input
        name="quantity"
        type="number"
        value={form.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        style={input}
      />

      <select
        name="printType"
        value={form.printType}
        onChange={handleChange}
        style={input}
      >
        <option value="screenprint">Screenprint</option>
        <option value="dtf">DTF</option>
      </select>

      <input
        name="colors"
        type="number"
        value={form.colors}
        onChange={handleChange}
        placeholder="Colors"
        style={input}
      />

      {/* BUTTON */}
      <button onClick={calculate} style={btn}>
        {loading ? "Calculating..." : "Calculate"}
      </button>

      {/* RESULT */}
      {result && (
        <div style={resultBox}>
          <p>📦 Cost: ${result.totalCost}</p>
          <p>💰 Price: ${result.suggestedPrice}</p>
          <p>📈 Profit: ${result.profit}</p>
          <p>🎯 Margin: {result.margin}%</p>
        </div>
      )}

    </div>
  )
}

/* ================= STYLES ================= */

const box = {
  background: "rgba(15,23,42,0.7)",
  backdropFilter: "blur(10px)",
  padding: "15px",
  borderRadius: "12px",
  color: "white",
  width: "280px",
  border: "1px solid rgba(255,255,255,0.05)"
}

const input = {
  width: "100%",
  marginBottom: "10px",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white"
}

const btn = {
  width: "100%",
  padding: "10px",
  background: "linear-gradient(90deg, #06b6d4, #2563eb)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
}

const resultBox = {
  marginTop: "10px",
  background: "rgba(2,6,23,0.8)",
  padding: "10px",
  borderRadius: "8px"
}

export default AIPricing