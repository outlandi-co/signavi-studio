import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const STATUS_LIST = [
  "payment_required",
  "paid",
  "production",
  "shipping",
  "shipped",
  "delivered",
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

        console.error(
          "❌ LOAD ERROR:",
          err
        )

        setOrders([])

      } finally {

        setLoading(false)
      }

    }, 0)

    return () => clearTimeout(timer)

  }, [])

  const safeOrders =
    Array.isArray(orders)
      ? orders
      : []

  /* ================= FORMAT ================= */

  const formatDate = value => {

    if (!value) return "-"

    return new Date(value)
      .toLocaleString()
  }

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (
    id,
    status
  ) => {

    try {

      const res = await api.patch(
        `/orders/${id}/status`,
        { status }
      )

      const updatedOrder =
        res.data?.data ||
        res.data?.order

      if (!updatedOrder) return

      setOrders(prev =>
        prev.map(order =>
          order._id === id
            ? updatedOrder
            : order
        )
      )

    } catch (err) {

      console.error(
        "❌ STATUS ERROR:",
        err
      )
    }
  }

  /* ================= PRINT ALL ================= */

  const printAll = async id => {

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

    } catch (err) {

      console.error(
        "❌ PRINT ERROR:",
        err
      )
    }
  }

  /* ================= INVOICE ================= */

  const printInvoice = id => {

    window.open(
      `https://signavi-backend.onrender.com/api/orders/${id}/invoice`,
      "_blank"
    )
  }

  /* ================= RECEIPT ================= */

  const printReceipt = id => {

    window.open(
      `https://signavi-backend.onrender.com/api/orders/${id}/receipt`,
      "_blank"
    )
  }

  /* ================= UI ================= */

  if (loading) {

    return (
      <div style={center}>
        <h2>
          ⏳ Loading orders...
        </h2>
      </div>
    )
  }

  return (

    <div style={container}>

      <h1>
        📦 Orders
      </h1>

      {/* ================= TABLE ================= */}

      {safeOrders.length === 0 ? (

        <p>
          No orders found.
        </p>

      ) : (

        <table style={table}>

          <thead>

            <tr>

              <th></th>

              <th>ID</th>

              <th>Customer</th>

              <th>Status</th>

              <th>Created</th>

              <th>Paid</th>

              <th>Updated</th>

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

                <td>

                  <strong>
                    {order.customerName || "Unknown"}
                  </strong>

                  <div style={meta}>
                    {order.email || "No email"}
                  </div>

                  <div style={meta}>
                    {order.orderType || "store"}
                  </div>

                </td>

                {/* ================= STATUS ================= */}

                <td>

                  <div style={statusWrap}>

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
                          ...statusButton,

                          opacity:
                            order.status === status
                              ? 1
                              : 0.4
                        }}
                      >

                        {status}

                      </button>

                    ))}

                  </div>

                </td>

                {/* ================= CREATED ================= */}

                <td>

                  <div style={date}>
                    {formatDate(order.createdAt)}
                  </div>

                </td>

                {/* ================= PAID ================= */}

                <td>

                  <div style={date}>
                    {formatDate(order.paidAt)}
                  </div>

                </td>

                {/* ================= UPDATED ================= */}

                <td>

                  <div style={date}>
                    {formatDate(order.updatedAt)}
                  </div>

                </td>

                {/* ================= TRACKING ================= */}

                <td>

                  {order.trackingNumber ||
                    "Not shipped"}

                </td>

                {/* ================= ACTIONS ================= */}

                <td>

                  <div style={actionWrap}>

                    {order.orderType === "custom" ? (

                      <button
                        onClick={() =>
                          printInvoice(order._id)
                        }

                        style={invoiceButton}
                      >

                        🧾 Invoice

                      </button>

                    ) : (

                      <button
                        onClick={() =>
                          printReceipt(order._id)
                        }

                        style={receiptButton}
                      >

                        🧾 Receipt

                      </button>

                    )}

                    <button

                      onClick={() =>
                        printAll(order._id)
                      }

                      style={shipButton}
                    >

                      🚚 Print

                    </button>

                    <button

                      onClick={() =>

                        navigate(
                          `/admin/order/${order._id}`
                        )
                      }

                      style={viewButton}
                    >

                      View

                    </button>

                  </div>

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

  borderBottom:
    "1px solid #1e293b"
}

const meta = {

  fontSize: 12,

  opacity: 0.7,

  marginTop: 2
}

const linkButton = {

  background: "transparent",

  border: "none",

  color: "#38bdf8",

  cursor: "pointer",

  fontWeight: "bold"
}

const statusWrap = {

  display: "flex",

  flexWrap: "wrap",

  gap: 4
}

const statusButton = {

  border: "none",

  borderRadius: 6,

  padding: "6px 10px",

  cursor: "pointer"
}

const actionWrap = {

  display: "flex",

  gap: 6,

  flexWrap: "wrap"
}

const invoiceButton = {

  background: "#22c55e",

  color: "#020617",

  border: "none",

  padding: "6px 10px",

  borderRadius: 6,

  fontWeight: "bold",

  cursor: "pointer"
}

const receiptButton = {

  background: "#38bdf8",

  color: "#020617",

  border: "none",

  padding: "6px 10px",

  borderRadius: 6,

  fontWeight: "bold",

  cursor: "pointer"
}

const shipButton = {

  background: "#f59e0b",

  color: "#020617",

  border: "none",

  padding: "6px 10px",

  borderRadius: 6,

  fontWeight: "bold",

  cursor: "pointer"
}

const viewButton = {

  background: "#a855f7",

  color: "white",

  border: "none",

  padding: "6px 10px",

  borderRadius: 6,

  cursor: "pointer"
}

const date = {

  fontSize: 12,

  whiteSpace: "nowrap",

  opacity: 0.8
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