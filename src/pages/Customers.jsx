import { useEffect, useState } from "react"
import api from "../../services/api"

export default function Customers() {

  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers")
        setCustomers(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchCustomers()
  }, [])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 20 }}>
      <h1>👥 Customer CRM</h1>

      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 10, width: "100%", marginTop: 10 }}
      />

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Total Spent</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.totalOrders}</td>
              <td>${c.totalSpent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}