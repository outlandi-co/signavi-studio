import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerProfile() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("customerUser")

        if (!stored) {
          navigate("/customer-login")
          return
        }

        const parsedUser = JSON.parse(stored)
        setUser(parsedUser)

        const email = localStorage.getItem("customerEmail")

        if (!email) {
          console.error("❌ No email found")
          setOrders([])
          return
        }

        const res = await api.get(`/orders/my-orders?email=${email}`)

        const data =
          res.data?.data ||
          res.data?.orders ||
          res.data ||
          []

        setOrders(Array.isArray(data) ? data : [])

      } catch (err) {
        console.error("❌ PROFILE ERROR:", err.response?.data || err.message)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  if (loading) return <p style={{ padding: 40 }}>Loading profile...</p>

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + (o.finalPrice || 0), 0)

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto", color: "white" }}>
      <h1>My Profile</h1>

      <div style={card}>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={card}>
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>

        <div style={card}>
          <h3>Total Spent</h3>
          <p>${totalSpent.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

const card = {
  background: "#020617",
  padding: 20,
  borderRadius: 10,
  border: "1px solid #1e293b"
}