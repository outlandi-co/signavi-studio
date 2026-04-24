import { useEffect, useState } from "react"
import api from "../../services/api"

const STATUS_LIST = [
  "pending",
  "payment_required",
  "production",
  "shipping",
  "shipped",
  "archive"
]

function Orders() {

  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders")

        const safeOrders = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : []

        setOrders(safeOrders)

      } catch (err) {
        console.error("❌ LOAD ERROR:", err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const safeOrders = Array.isArray(orders) ? orders : []

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status })

      const updatedOrder = res.data?.data || res.data?.order

      setOrders(prev =>
        prev.map(o => (o._id === id ? updatedOrder : o))
      )
    } catch (err) {
      console.error("❌ STATUS ERROR:", err)
    }
  }

  /* ================= BULK LABELS ================= */
  const handleBulkPrint = async () => {
    try {
      if (!selected.length) return alert("Select orders first")

      const res = await api.post(
        "/orders/bulk-labels",
        { ids: selected },
        { responseType: "blob" }
      )

      const url = window.URL.createObjectURL(res.data)
      window.open(url)
    } catch (err) {
      console.error("❌ BULK PRINT ERROR:", err)
    }
  }

  /* ================= PRINT ================= */
  const printAll = async (id) => {
    try {
      const res = await api.get(`/orders/${id}/print-all`)

      if (res.data?.label) window.open(res.data.label)
      if (res.data?.packingSlip) window.open(res.data.packingSlip)

    } catch (err) {
      console.error("❌ PRINT ERROR:", err)
    }
  }

  const printInvoice = (id) => {
    window.open(`/api/orders/${id}/invoice`, "_blank")
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <div style={center}>
        <h2>⏳ Loading orders...</h2>
      </div>
    )
  }

  return (
    <div style={container}>

      <h1>📦 Orders</h1>

      {/* BULK BAR */}
      <div style={toolbar}>
        <button
          onClick={handleBulkPrint}
          style={{
            ...button,
            background: selected.length ? "#22c55e" : "#374151",
            color: selected.length ? "#000" : "#9ca3af"
          }}
        >
          🧾 Bulk Labels ({selected.length})
        </button>

        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            style={{ ...button, background: "#ef4444" }}
          >
            ❌ Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      {safeOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Customer / Items</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {safeOrders.map(o => (
              <tr key={o._id}>

                {/* SELECT */}
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(o._id)}
                    onChange={() =>
                      setSelected(prev =>
                        prev.includes(o._id)
                          ? prev.filter(id => id !== o._id)
                          : [...prev, o._id]
                      )
                    }
                  />
                </td>

                {/* ID */}
                <td>{o._id?.slice(-6)}</td>

                {/* CUSTOMER + ITEMS */}
                <td>
                  <strong>{o.customerName || "Unknown"}</strong>

                  <div style={items}>
                    {(o.items || []).map((item, i) => (
                      <div key={i}>
                        {item.name} × {item.quantity}

                        {item.variant && (
                          <span style={variantTag}>
                            {item.variant.color} / {item.variant.size}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>

                {/* STATUS */}
                <td>
                  {STATUS_LIST.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o._id, s)}
                      style={{
                        marginRight: 4,
                        opacity: o.status === s ? 1 : 0.4
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </td>

                {/* TRACKING */}
                <td>{o.trackingNumber || "Not shipped"}</td>

                {/* ACTIONS */}
                <td>
                  {o.status === "production" && (
                    <button onClick={() => updateStatus(o._id, "shipping")}>
                      🚚 Ship
                    </button>
                  )}

                  {o.status === "shipping" && (
                    <>
                      <button onClick={() => printAll(o._id)}>
                        🚀 Print
                      </button>

                      <button onClick={() => printInvoice(o._id)}>
                        🧾 Invoice
                      </button>
                    </>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  background: "#020617",
  minHeight: "100vh",
  color: "white"
}

const table = {
  width: "100%",
  borderCollapse: "collapse"
}

const toolbar = {
  display: "flex",
  gap: 10,
  marginBottom: 12
}

const button = {
  padding: "8px 14px",
  border: "none",
  borderRadius: 6,
  fontWeight: "bold",
  cursor: "pointer"
}

const items = {
  fontSize: "12px",
  opacity: 0.7,
  marginTop: 4
}

const variantTag = {
  marginLeft: 6,
  color: "#38bdf8"
}

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#020617",
  color: "white"
}

export default Orders