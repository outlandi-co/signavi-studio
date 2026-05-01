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

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!id || id === "null") {
      console.warn("⚠️ Invalid order ID:", id)
      setLoading(false)
      return
    }

    let isMounted = true

    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        const data = res.data?.data || res.data

        if (isMounted) {
          setOrder(data)
        }
      } catch (err) {
        console.error("❌ ORDER LOAD ERROR:", err)
        if (isMounted) setOrder(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [id])

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!id || id === "null") return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleSocketUpdate = (updatedOrder) => {
      if (updatedOrder?._id === id) {
        console.log("🔄 Live update received")
        setOrder(updatedOrder)
      }
    }

    socket.on("jobUpdated", handleSocketUpdate)

    return () => {
      socket.off("jobUpdated", handleSocketUpdate)
    }
  }, [id])

  /* ================= PDF ================= */
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
  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>
  }

  if (!order) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        ⚠️ Order not found or invalid ID
      </p>
    )
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>📦 Order Detail</h1>

      {/* ================= INVOICE ================= */}
      <div
        id="invoice"
        style={{
          background: "white",
          color: "black",
          padding: 30,
          borderRadius: 10,
          marginTop: 20
        }}
      >
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

        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Status:</strong> {order.status}</p>

        {/* SHIPPING */}
        {order.trackingNumber && (
          <div style={{ marginTop: 10 }}>
            <p><strong>Carrier:</strong> {order.carrier}</p>
            <p><strong>Tracking:</strong> {order.trackingNumber}</p>

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

        {order.items?.map((item, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p><strong>{item.name}</strong></p>
            <p>
              {item.variant?.color || "N/A"} /{" "}
              {item.variant?.size || "N/A"}
            </p>
            <p>
              Qty: {item.quantity} × $
              {Number(item.price || 0).toFixed(2)}
            </p>
            <p>
              Line Total: $
              {(item.quantity * item.price).toFixed(2)}
            </p>
          </div>
        ))}

        <hr />

        <p>Subtotal: ${Number(order.subtotal || 0).toFixed(2)}</p>
        <p>Tax: ${Number(order.tax || 0).toFixed(2)}</p>
        <p>Shipping: ${Number(order.shippingCost || 0).toFixed(2)}</p>

        <h3>Total: ${Number(order.finalPrice || 0).toFixed(2)}</h3>
      </div>

      <button onClick={handleDownloadInvoice} style={downloadBtn}>
        📄 Download Invoice
      </button>
    </div>
  )
}

/* ================= STYLES ================= */
const header = {
  marginBottom: 25,
  borderBottom: "2px solid #000",
  paddingBottom: 12,
  display: "flex",
  justifyContent: "space-between"
}

const downloadBtn = {
  marginTop: 20,
  background: "#22c55e",
  padding: 12,
  borderRadius: 6,
  color: "black",
  border: "none",
  cursor: "pointer"
}