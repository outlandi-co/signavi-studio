import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

function ProductChart({ data = [] }) {
  return (
    <div style={{
      background: "#020617",
      padding: 16,
      borderRadius: 10,
      marginTop: 20,
      color: "white"
    }}>
      <h2>🧾 Revenue by Product</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProductChart