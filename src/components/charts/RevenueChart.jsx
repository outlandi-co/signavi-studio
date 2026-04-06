import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

function RevenueChart({ data = [] }) {
  return (
    <div style={{
      background: "#020617",
      padding: 16,
      borderRadius: 10,
      marginTop: 20,
      color: "white"
    }}>
      <h2>📊 Monthly Revenue</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="revenue" />
          <Bar dataKey="profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart