import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com/api"
const SOCKET_URL = API_URL.replace("/api", "")

export default function OrderDetail() {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const socketRef = useRef(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data)
      } catch (err) {
        console.error("❌ ORDER LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* ================= SOCKET ================= */
  useEffect(() => {

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"]
      })
    }

    const socket = socketRef.current

    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder)
      }
    }

    socket.on("jobUpdated", handleUpdate)

    return () => {
      socket.off("jobUpdated", handleUpdate)
    }

  }, [id])

  /* ================= PDF DOWNLOAD ================= */
  const handleDownloadInvoice = async () => {
    const input = document.getElementById("invoice")

    const canvas = await html2canvas(input)
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")

    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, width, height)

    pdf.save(`invoice-${order._id}.pdf`)
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>
  if (!order) return <p style={{ padding: 20 }}>Order not found</p>

  return (
    <div style={{ padding: 20, color: "white" }}>

      <h1>📦 Order Detail</h1>

      {/* 🔥 INVOICE SECTION */}
      <div
        id="invoice"
        style={{
          background: "white",
          color: "black",
          padding: 20,
          borderRadius: 10,
          marginTop: 20
        }}
      >

        <h2>Invoice</h2>

        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Status:</strong> {order.status}</p>

        <hr />

        {/* 🔥 ITEMS */}
        {order.items?.map((item, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p><strong>{item.name}</strong></p>

            <p>
              {item.variant?.color} / {item.variant?.size}
            </p>

            <p>
              Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
            </p>

            <p>
              Line Total: ${(item.quantity * item.price).toFixed(2)}
            </p>
          </div>
        ))}

        <hr />

        {/* 🔥 TOTALS */}
        <p>Subtotal: ${Number(order.subtotal || 0).toFixed(2)}</p>
        <p>Tax: ${Number(order.tax || 0).toFixed(2)}</p>

        {/* optional shipping */}
        <p>Shipping: ${Number(order.shipping || 0).toFixed(2)}</p>

        <h3>Total: ${Number(order.finalPrice || 0).toFixed(2)}</h3>

      </div>

      {/* 🔥 DOWNLOAD BUTTON */}
      <button
        onClick={handleDownloadInvoice}
        style={{
          marginTop: 20,
          background: "#22c55e",
          padding: 12,
          borderRadius: 6,
          color: "black",
          border: "none",
          cursor: "pointer"
        }}
      >
        📄 Download Invoice
      </button>

    </div>
  )
}