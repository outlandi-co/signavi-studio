import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  /* ================= LOAD ================= */

  useEffect(() => {
    const timer = setTimeout(async () => {
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
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const safeOrders = Array.isArray(orders) ? orders : []

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, {
        status
      })

      const updatedOrder =
        res.data?.data || res.data?.order

      if (!updatedOrder) return

      setOrders(prev =>
        prev.map(order =>
          order._id === id
            ? updatedOrder
            : order
        )
      )

    } catch (err) {
      console.error("❌ STATUS ERROR:", err)
    }
  }

  /* ================= BULK LABELS ================= */

  const handleBulkPrint = async () => {
    try {
      if (!selected.length) {
        return alert("Select orders first")
      }

      const res = await api.post(
        "/orders/bulk-labels",
        { ids: selected },
        { responseType: "blob" }
      )

      const url =
        window.URL.createObjectURL(res.data)

      window.open(url)

    } catch (err) {
      console.error("❌ BULK PRINT ERROR:", err)

      alert(
        "Bulk labels route not ready yet."
      )
    }
  }

  /* ================= PRINT ================= */

  const printAll = async (id) => {
    try {
      const res = await api.get(
        `/orders/${id}/print-all`
      )

      if (res.data?.label) {
        window.open(res.data.label)
      }

      if (res.data?.packingSlip) {
        window.open(res.data.packingSlip)
      }

      if (
        !res.data?.label &&
        !res.data?.packingSlip
      ) {
        alert(
          "No shipping label or packing slip has been generated yet."
        )
      }

    } catch (err) {
      console.error("❌ PRINT ERROR:", err)

      if (err?.response?.status === 404) {
        alert(
          "Print route is not built on backend yet."
        )
      } else {
        alert(
          "Failed to load print assets."
        )
      }
    }
  }

  /* ================= PRINT INVOICE ================= */

  const printInvoice = (id) => {
    window.open(
      `/api/orders/${id}/invoice`,
      "_blank"
    )
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

      {/* ================= TOOLBAR ================= */}

      <div style={toolbar}>
        <button
          onClick={handleBulkPrint}
          style={{
            ...button,
            background: selected.length
              ? "#22c55e"
              : "#374151",

            color: selected.length
              ? "#000"
              : "#9ca3af"
          }}
        >
          🧾 Bulk Labels ({selected.length})
        </button>

        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            style={{
              ...button,
              background: "#ef4444"
            }}
          >
            ❌ Clear
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}

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
            {safeOrders.map(order => (
              <tr
                key={order._id}
                style={row}
              >
                {/* ================= SELECT ================= */}

                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(order._id)}
                    onChange={() =>
                      setSelected(prev =>
                        prev.includes(order._id)
                          ? prev.filter(
                              id => id !== order._id
                            )
                          : [...prev, order._id]
                      )
                    }
                  />
                </td>

                {/* ================= ID ================= */}

                <td>
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/order/${order._id}`
                      )
                    }
                    style={linkButton}
                  >
                    #{order._id?.slice(-6)}
                  </button>
                </td>

                {/* ================= CUSTOMER ================= */}

                <td
                  onClick={() =>
                    navigate(
                      `/admin/order/${order._id}`
                    )
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >
                  <strong>
                    {order.customerName || "Unknown"}
                  </strong>

                  <div style={meta}>
                    {order.email || "No email"}
                  </div>

                  {order.phone && (
                    <div style={meta}>
                      📞 {order.phone}
                    </div>
                  )}

                  {(order.items || []).length > 0 && (
                    <div style={items}>
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                        >
                          {item.name} × {item.quantity}

                          {item.variant && (
                            <span style={variantTag}>
                              {item.variant.color || "-"} /{" "}
                              {item.variant.size || "-"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                {/* ================= STATUS ================= */}

                <td>
                  {STATUS_LIST.map(status => (
                    <button
                      key={status}
                      onClick={() =>
                        updateStatus(
                          order._id,
                          status
                        )
                      }
                      style={{
                        marginRight: 4,
                        marginBottom: 4,
                        opacity:
                          order.status === status
                            ? 1
                            : 0.4
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </td>

                {/* ================= TRACKING ================= */}

                <td>
                  {order.trackingNumber ||
                    "Not shipped"}
                </td>

                {/* ================= ACTIONS ================= */}

                <td>
                  {order.status === "production" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          order._id,
                          "shipping"
                        )
                      }
                    >
                      🚚 Ship
                    </button>
                  )}

                  {order.status === "shipping" && (
                    <>
                      <button
                        onClick={() =>
                          printAll(order._id)
                        }
                      >
                        🚀 Print
                      </button>

                      <button
                        onClick={() =>
                          printInvoice(order._id)
                        }
                      >
                        🧾 Invoice
                      </button>
                    </>
                  )}

                  <button
                    onClick={() =>
                      navigate(
                        `/admin/order/${order._id}`
                      )
                    }
                    style={{
                      marginLeft: 6
                    }}
                  >
                    View
                  </button>
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

const row = {
  borderBottom: "1px solid #1e293b"
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

const linkButton = {
  background: "transparent",
  border: "none",
  color: "#38bdf8",
  cursor: "pointer",
  fontWeight: "bold"
}

const meta = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 2
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