import { useEffect, useState, useRef } from "react"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api"
const SOCKET_URL = API_URL.replace("/api", "")

export default function AdminCustomers() {

  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("latest")

  const socketRef = useRef(null)
  const navigate = useNavigate()

  /* ================= LOAD ================= */
  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers")
      setCustomers(res.data || [])
    } catch (err) {
      console.error("❌ CUSTOMER LOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = () => {
      console.log("🔄 CUSTOMER LIVE UPDATE")
      loadCustomers()
    }

    socket.on("customerUpdated", handleUpdate)

    return () => {
      socket.off("customerUpdated", handleUpdate)
    }

  }, [])

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...customers]

    if (search) {
      data = data.filter(c =>
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (sort === "spent") {
      data.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    }

    if (sort === "orders") {
      data.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
    }

    setFiltered(data)

  }, [search, sort, customers])

  /* ================= VIP ================= */
  const toggleVIP = async (id, current) => {
    try {
      await api.patch(`/customers/${id}`, {
        isVIP: !current
      })
    } catch (err) {
      console.error("VIP ERROR:", err)
    }
  }

  /* ================= NOTES ================= */
  const updateNotes = async (id, notes) => {
    try {
      await api.patch(`/customers/${id}`, { notes })
    } catch (err) {
      console.error("NOTES ERROR:", err)
    }
  }

  if (loading) return <p className="text-white">Loading...</p>

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">👥 Customers CRM</h1>

      {/* SEARCH + SORT */}
      <div className="flex gap-4 mb-6">

        <input
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg w-full"
        />

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg"
        >
          <option value="latest">Latest</option>
          <option value="spent">Top Spenders</option>
          <option value="orders">Most Orders</option>
        </select>

      </div>

      {/* LIST */}
      <div className="grid gap-4">

        {filtered.map(customer => (
          <div
            key={customer._id}
            className="bg-gray-900 border border-gray-800 p-4 rounded-lg"
          >

            {/* HEADER */}
            <div className="flex justify-between items-center">

              <div
                className="cursor-pointer"
                onClick={() => navigate(`/admin/customers/${customer._id}`)}
              >
                <p className="text-sm text-gray-400">{customer.email}</p>
                <p className="text-xs text-gray-500">
                  {customer.isVIP ? "⭐ VIP" : "Standard"}
                </p>
              </div>

              <button
                onClick={() => toggleVIP(customer._id, customer.isVIP)}
                className={`px-3 py-1 rounded ${
                  customer.isVIP
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700"
                }`}
              >
                VIP
              </button>

            </div>

            {/* STATS */}
            <div className="flex justify-between mt-3">
              <p>Orders: <strong>{customer.totalOrders || 0}</strong></p>
              <p>Spent: <strong>${customer.totalSpent || 0}</strong></p>
            </div>

            {/* NOTES */}
            <textarea
              defaultValue={customer.notes}
              onBlur={(e) =>
                updateNotes(customer._id, e.target.value)
              }
              placeholder="Add notes..."
              className="w-full mt-3 bg-gray-800 p-2 rounded text-sm"
            />

          </div>
        ))}

      </div>

    </div>
  )
}