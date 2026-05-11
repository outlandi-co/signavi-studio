import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

export default function OrderDetail() {
  const { id } = useParams()

  const invalidId = !id || id === "null" || id === "undefined"

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(!invalidId)

  const socketRef = useRef(null)

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    if (invalidId) {
      console.warn("⚠️ Invalid order ID:", id)
      return
    }

    let isMounted = true

    const loadOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        const data = res.data?.data || res.data

        if (!isMounted) return

        if (data?._id) {
          setOrder(data)
        } else {
          setOrder(null)
        }
      } catch (err) {
        console.error("❌ ORDER LOAD ERROR:", err.response?.data || err)

        if (isMounted) {
          setOrder(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      isMounted = false
    }
  }, [id, invalidId])

  /* ================= SOCKET UPDATES ================= */
  useEffect(() => {
    if (invalidId) return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleSocketUpdate = (updatedOrder) => {
      if (updatedOrder?._id === id) {
        console.log("🔄 Live order update received")
        setOrder(updatedOrder)
      }
    }

    socket.on("jobUpdated", handleSocketUpdate)
    socket.on("orderUpdated", handleSocketUpdate)

    return () => {
      socket.off("jobUpdated", handleSocketUpdate)
      socket.off("orderUpdated", handleSocketUpdate)
    }
  }, [id, invalidId])

  /* ================= PDF DOWNLOAD ================= */
  const handleDownloadInvoice = async () => {
    if (!order) return

    try {
      const input = document.getElementById("invoice")
      if (!input) return

      const canvas = await html2canvas(input)
      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF("p", "mm", "a4")

      const width = pdf.internal.pageSize.getWidth()
      const height = (canvas.height * width) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, width, height)
      pdf.save(`invoice-${order._id}.pdf`)
    } catch (err) {
      console.error("❌ PDF ERROR:", err)
    }
  }

  /* ================= STATES ================= */
  if (invalidId) {
    return (
      <div style={page}>
        <div style={errorBox}>
          ⚠️ Order not found or invalid ID
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={page}>
        <p>Loading order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={page}>
        <div style={errorBox}>
          ⚠️ Order not found or invalid ID
        </div>
      </div>
    )
  }

  return (
    <div style={page}>
      <h1>📦 Order Detail</h1>

      <div id="invoice" style={invoice}>
        <div style={header}>
          <div>
            <h1 style={{ margin: 0 }}>SignaVi Studio</h1>
            <p style={{ margin: 0 }}>www.signavistudio.store</p>
            <p style={{ margin: 0 }}>support@signavistudio.store</p>
          </div>

          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0 }}>INVOICE</h2>

            <p style={{ margin: 0 }}>
              #{order._id?.slice(-6) || "N/A"}
            </p>

            <p style={{ margin: 0 }}>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        <p>
          <strong>Customer:</strong>{" "}
          {order.customerName || "Customer"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {order.email || "N/A"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {order.status || "N/A"}
        </p>

        {order.trackingNumber && (
          <div style={{ marginTop: 10 }}>
            <p>
              <strong>Carrier:</strong>{" "}
              {order.carrier || "N/A"}
            </p>

            <p>
              <strong>Tracking:</strong>{" "}
              {order.trackingNumber}
            </p>

            {order.trackingLink && (
              <a
                href={order.trackingLink}
                target="_blank"
                rel="noreferrer"
              >
                Track Package
              </a>
            )}
          </div>
        )}

        <hr />

        {order.items?.length > 0 ? (
          order.items.map((item, i) => {
            const quantity = Number(item.quantity || 1)
            const price = Number(item.price || 0)
            const lineTotal = quantity * price

            return (
              <div key={`${item.name}-${i}`} style={itemRow}>
                <p>
                  <strong>{item.name || "Item"}</strong>
                </p>

                <p>
                  {item.variant?.color || item.selectedVariant?.color || "N/A"} /{" "}
                  {item.variant?.size || item.selectedVariant?.size || "N/A"}
                </p>

                <p>
                  Qty: {quantity} × ${price.toFixed(2)}
                </p>

                <p>
                  Line Total: ${lineTotal.toFixed(2)}
                </p>
              </div>
            )
          })
        ) : (
          <p>No order items found.</p>
        )}

        <hr />

        <p>
          Subtotal: ${Number(order.subtotal || 0).toFixed(2)}
        </p>

        <p>
          Tax: ${Number(order.tax || 0).toFixed(2)}
        </p>

        <p>
          Shipping: ${Number(order.shippingCost || 0).toFixed(2)}
        </p>

        <h3>
          Total: ${Number(order.finalPrice || 0).toFixed(2)}
        </h3>
      </div>

      <button
        type="button"
        onClick={handleDownloadInvoice}
        style={downloadBtn}
      >
        📄 Download Invoice
      </button>
    </div>
  )
}

/* ================= STYLES ================= */

const page = {
  padding: 20,
  color: "white"
}

const errorBox = {
  padding: 20,
  color: "red",
  background: "#0f172a",
  borderRadius: 10
}

const invoice = {
  background: "white",
  color: "black",
  padding: 30,
  borderRadius: 10,
  marginTop: 20
}

const header = {
  marginBottom: 25,
  borderBottom: "2px solid #000",
  paddingBottom: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 20
}

const itemRow = {
  marginBottom: 10
}

const downloadBtn = {
  marginTop: 20,
  background: "#22c55e",
  padding: 12,
  borderRadius: 6,
  color: "black",
  border: "none",
  cursor: "pointer",
  fontWeight: 700
}