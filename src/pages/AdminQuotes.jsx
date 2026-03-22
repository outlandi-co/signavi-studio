import { useEffect, useState } from "react"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050"

function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await api.get("/quotes")
        setQuotes(res.data)
      } catch (err) {
        console.error("❌ Error fetching quotes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>

  return (
    <div style={{ padding: "40px", background: "#0f172a", minHeight: "100vh", color: "#fff" }}>
      
      <h1 style={{ marginBottom: "20px" }}>📋 Admin Quotes</h1>

      {quotes.length === 0 && <p>No quotes yet</p>}

      <div style={{ display: "grid", gap: "20px" }}>
        {quotes.map(q => (
          <div
            key={q._id}
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
            }}
          >
            <p><strong>Name:</strong> {q.customerName}</p>
            <p><strong>Email:</strong> {q.email}</p>
            <p><strong>Quantity:</strong> {q.quantity}</p>
            <p><strong>Print Type:</strong> {q.printType}</p>

            {q.notes && (
              <p><strong>Notes:</strong> {q.notes}</p>
            )}

            {/* 🔥 ARTWORK PREVIEW */}
            {q.artwork && (
              <img
                src={`${API_URL}/uploads/${q.artwork}`}
                alt="artwork"
                style={{
                  width: "200px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #334155"
                }}
              />
            )}

            <p style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
              {new Date(q.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminQuotes