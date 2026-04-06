import { useEffect, useState } from "react"
import api from "../services/api"

function AdminQuotes() {

  const [quotes, setQuotes] = useState([])
  const [prices, setPrices] = useState({})

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/quotes")
      setQuotes(res.data)
    }
    load()
  }, [])

  const handleSend = async (id) => {
    await api.patch(`/quotes/${id}/send-to-payment`, {
      price: prices[id]
    })

    alert("Sent to payment")
  }

  return (
    <div style={{ padding:40, background:"#0f172a", color:"#fff" }}>

      <h1>Admin Quotes</h1>

      {quotes.map(q => (
        <div key={q._id} style={{ marginBottom:20, padding:20, background:"#1e293b" }}>

          <p>{q.customerName}</p>
          <p>{q.email}</p>

          <input
            type="number"
            placeholder="Set price"
            onChange={(e)=>setPrices({
              ...prices,
              [q._id]: e.target.value
            })}
          />

          <button onClick={()=>handleSend(q._id)}>
            Send to Payment
          </button>

        </div>
      ))}
    </div>
  )
}

export default AdminQuotes