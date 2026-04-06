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

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders")
        setOrders(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status })

      setOrders(prev =>
        prev.map(o =>
          o._id === id ? res.data.order : o
        )
      )

    } catch (err) {
      console.error(err)
    }
  }

  /* ================= BULK LABELS ================= */
  const handleBulkPrint = async () => {
    try {
      if (!selected.length) {
        alert("Select orders first")
        return
      }

      const res = await api.post(
        "/orders/bulk-labels",
        { ids: selected },
        { responseType: "blob" }
      )

      const url = window.URL.createObjectURL(res.data)
      window.open(url)

    } catch (err) {
      console.error("❌ BULK PRINT ERROR:", err)
      alert("Failed to generate labels")
    }
  }

  /* ================= PRINT ALL ================= */
  const printAll = async (id) => {
    try {
      const res = await api.get(`/orders/${id}/print-all`)

      if (res.data.label) {
        window.open(res.data.label, "_blank")
      }

      if (res.data.packingSlip) {
        window.open(res.data.packingSlip, "_blank")
      }

    } catch (err) {
      console.error("❌ PRINT ALL ERROR:", err)
    }
  }

  /* ================= INVOICE ================= */
  const printInvoice = (id) => {
    window.open(`/api/orders/${id}/invoice`, "_blank")
  }

  return (
    <div style={{ padding: 20 }}>

      <h1>📦 Orders</h1>

      {/* ================= BULK ACTION BAR ================= */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 12
      }}>
        <button
          onClick={handleBulkPrint}
          style={{
            padding: "8px 14px",
            background: selected.length ? "#22c55e" : "#374151",
            color: selected.length ? "#000" : "#9ca3af",
            border: "none",
            borderRadius: 6,
            cursor: selected.length ? "pointer" : "not-allowed",
            fontWeight: "bold"
          }}
        >
          🧾 Bulk Labels ({selected.length})
        </button>

        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            style={{
              padding: "8px 12px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            ❌ Clear
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Tracking</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(o => (
            <tr key={o._id}>

              {/* SELECT */}
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(o._id)}
                  onChange={() => {
                    setSelected(prev =>
                      prev.includes(o._id)
                        ? prev.filter(id => id !== o._id)
                        : [...prev, o._id]
                    )
                  }}
                />
              </td>

              <td>{o._id.slice(-6)}</td>
              <td>{o.customerName}</td>

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
              <td>
                {o.trackingNumber || "Not shipped"}
              </td>

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
                      🚀 Print All
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

    </div>
  )
}

export default Orders