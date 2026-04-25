import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/* 🔥 TRY TO IMPORT — SAFE FALLBACK BELOW */
let ShippingEditor
try {
  // normal path
  ShippingEditor = (await import("../../components/admin/ShippingEditor")).default
} catch {
  // fallback inline component (so UI ALWAYS shows)
  ShippingEditor = function FallbackShippingEditor({ order, onUpdate }) {
    const [shippingCost, setShippingCost] = useState(order?.shippingCost || 0)
    const [carrier, setCarrier] = useState(order?.carrier || "USPS")
    const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "")
    const [serviceLevel, setServiceLevel] = useState(order?.serviceLevel || "")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (!order) return
      setShippingCost(order.shippingCost || 0)
      setCarrier(order.carrier || "USPS")
      setTrackingNumber(order.trackingNumber || "")
      setServiceLevel(order.serviceLevel || "")
    }, [order])

    const handleSave = async () => {
      try {
        setLoading(true)
        const res = await api.patch(`/orders/${order._id}/shipping`, {
          shippingCost,
          carrier,
          trackingNumber,
          serviceLevel
        })

        alert("✅ Shipping updated")
        if (onUpdate) onUpdate(res.data.data)

      } catch (err) {
        console.error(err)
        alert("❌ Failed to update shipping")
      } finally {
        setLoading(false)
      }
    }

    return (
      <div style={{ marginTop: 30, padding: 20, background: "#0f172a", borderRadius: 10 }}>
        <h3>🚚 Shipping Editor (Fallback)</h3>

        <input
          type="number"
          value={shippingCost}
          onChange={(e) => setShippingCost(Number(e.target.value))}
          placeholder="Shipping Cost"
          style={input}
        />

        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} style={input}>
          <option>USPS</option>
          <option>UPS</option>
          <option>FedEx</option>
        </select>

        <input
          value={serviceLevel}
          onChange={(e) => setServiceLevel(e.target.value)}
          placeholder="Service Level"
          style={input}
        />

        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Tracking Number"
          style={input}
        />

        <button onClick={handleSave} style={btn}>
          {loading ? "Saving..." : "Save Shipping"}
        </button>
      </div>
    )
  }
}

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
    const load = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        const data = res.data?.data || res.data
        setOrder(data)
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

    const handleSocketUpdate = (updatedOrder) => {
      if (updatedOrder._id === id) {
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
    const input = document.getElementById("invoice")

    const canvas = await html2canvas(input)
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")

    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, width, height)
    pdf.save(`invoice-${order._id}.pdf`)
  }

  /* ================= UPDATE FROM SHIPPING ================= */
  const handleUpdate = (updatedOrder) => {
    setOrder(updatedOrder)
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>
  if (!order) return <p style={{ padding: 20 }}>Order not found</p>

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
            <p style={{ margin: 0 }}>#{order._id.slice(-6)}</p>
            <p style={{ margin: 0 }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Status:</strong> {order.status}</p>

        {order.trackingNumber && (
          <div style={{ marginTop: 10 }}>
            <p><strong>Carrier:</strong> {order.carrier}</p>
            <p><strong>Tracking:</strong> {order.trackingNumber}</p>
          </div>
        )}

        <hr />

        {order.items?.map((item, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p><strong>{item.name}</strong></p>
            <p>{item.variant?.color || "N/A"} / {item.variant?.size || "N/A"}</p>
            <p>Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
            <p>Line Total: ${(item.quantity * item.price).toFixed(2)}</p>
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

      {/* 🔥 GUARANTEED SHIPPING UI */}
      <ShippingEditor order={order} onUpdate={handleUpdate} />
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

const input = {
  display: "block",
  marginBottom: 10,
  padding: 10,
  width: "100%",
  borderRadius: 6
}

const btn = {
  padding: 10,
  background: "#22c55e",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
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