import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const SOCKET_URL = API_URL.replace("/api", "")

export default function CustomerDashboard() {

  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  })

  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState("")

  const navigate = useNavigate()
  const socketRef = useRef(null)

  /* ================= USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("customerUser")
    if (!stored) {
      navigate("/customer-login")
      return
    }
    setUser(JSON.parse(stored))
  }, [navigate])

  /* ================= ORDERS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders/my-orders")
        const safeOrders = Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
        setOrders(safeOrders)
      } catch (err) {
        console.error(err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL)
    }

    const socket = socketRef.current

    socket.on("jobUpdated", (updated) => {
      setOrders(prev =>
        prev.map(o => (o._id === updated._id ? updated : o))
      )
    })

    socket.on("jobCreated", (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    })

    return () => {
      socket.off("jobUpdated")
      socket.off("jobCreated")
    }
  }, [])

  /* ================= PASSWORD ================= */
  const handlePasswordChange = async () => {
    try {
      setPwMessage("")

      if (!passwords.current || !passwords.newPass) {
        setPwMessage("❌ Fill all fields")
        return
      }

      if (passwords.newPass !== passwords.confirm) {
        setPwMessage("❌ Passwords do not match")
        return
      }

      setPwLoading(true)

      await api.post("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      })

      setPwMessage("✅ Password updated")
      setPasswords({ current: "", newPass: "", confirm: "" })

    } catch (err) {
      setPwMessage(err?.response?.data?.error || "❌ Failed")
    } finally {
      setPwLoading(false)
    }
  }

  /* ================= REORDER ================= */
  const handleReorder = async (order) => {
    try {
      await api.post("/orders", {
        items: order.items,
        customerName: user?.name,
        email: user?.email
      })
      alert("✅ Reorder created!")
    } catch {
      alert("❌ Failed")
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/customer-login")
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={{ padding: 20, color: "white" }}>

      {/* NAVBAR */}
      <div style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        marginBottom: 20
      }}>
        <h2>SignaVi</h2>

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "#020617",
              border: "1px solid #1e293b",
              color: "white",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Account
          </button>
        </div>
      </div>

      {/* ================= CENTER CONTENT ================= */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <div style={{ width: "100%", maxWidth: 700 }}>

          {activeTab === "orders" && (
            <>
              <h3>My Orders</h3>

              {orders.length === 0 && <p>No orders yet</p>}

              {orders.map(order => (
                <div key={order._id} style={{
                  padding: 12,
                  borderBottom: "1px solid #1e293b"
                }}>
                  {order.status}
                </div>
              ))}
            </>
          )}

          {activeTab === "history" && (
            <>
              <h3>Reorder Items</h3>

              {orders.length === 0 && <p>No previous orders</p>}

              {orders.map(order => (
                <div key={order._id} style={{ marginBottom: 10 }}>
                  {order.status}

                  <button
                    onClick={() => handleReorder(order)}
                    style={{
                      marginLeft: 10,
                      padding: "4px 10px",
                      background: "#22c55e",
                      border: "none",
                      color: "black",
                      cursor: "pointer"
                    }}
                  >
                    Reorder
                  </button>
                </div>
              ))}
            </>
          )}

          {activeTab === "security" && (
            <>
              <h3>Security Settings</h3>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}>
                <input
                  placeholder="Current Password"
                  value={passwords.current}
                  onChange={(e)=>setPasswords({...passwords, current:e.target.value})}
                />

                <input
                  placeholder="New Password"
                  value={passwords.newPass}
                  onChange={(e)=>setPasswords({...passwords, newPass:e.target.value})}
                />

                <input
                  placeholder="Confirm Password"
                  value={passwords.confirm}
                  onChange={(e)=>setPasswords({...passwords, confirm:e.target.value})}
                />

                <button onClick={handlePasswordChange}>
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>

                {pwMessage && <p>{pwMessage}</p>}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ================= DRAWER ================= */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 1000
            }}
          />

          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100%",
            width: 340,
            background: "#020617",
            padding: 20,
            zIndex: 1001
          }}>

            <button onClick={() => setDrawerOpen(false)}>✕</button>

            <h2>Account</h2>
            <p>{user?.name}</p>
            <p>{user?.email}</p>

            <div style={{
              marginTop: 20,
              display: "flex",
              gap: 10
            }}>
              <button onClick={() => setActiveTab("orders")}>Orders</button>
              <button onClick={() => setActiveTab("history")}>Reorders</button>
              <button onClick={() => setActiveTab("security")}>Security</button>
            </div>

            <button
              onClick={handleLogout}
              style={{
                marginTop: 30,
                background: "#ef4444",
                color: "white",
                padding: 10,
                width: "100%"
              }}
            >
              Logout
            </button>

          </div>
        </>
      )}

    </div>
  )
}