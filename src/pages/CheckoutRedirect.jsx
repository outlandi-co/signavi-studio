import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function CheckoutRedirect() {
  const { id } = useParams()

  const hasRun = useRef(false) // 🔥 prevent double calls
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || hasRun.current) return
    hasRun.current = true

    const goToSquare = async () => {
      try {
        console.log("💳 Creating Square checkout for:", id)

        let attempts = 0
        let success = false
        let res

        /* 🔥 HANDLE RENDER COLD START */
        while (attempts < 3 && !success) {
          try {
            res = await api.post(`/square/create-payment/${id}`)
            success = true
          } catch (err) {
            attempts++

            if (attempts < 3) {
              console.log("⏳ Server waking up... retrying")
              await new Promise(r => setTimeout(r, 2500))
            } else {
              throw err
            }
          }
        }

        if (!res?.data?.url) {
          throw new Error("No payment URL returned")
        }

        console.log("🚀 Redirecting to Square:", res.data.url)

        /* 🔥 USE ASSIGN (safer than href) */
        window.location.assign(res.data.url)

      } catch (err) {
        console.error("❌ Checkout error:", err)
        setLoading(false)
      }
    }

    goToSquare()

  }, [id])

  /* ================= UI ================= */

  if (!loading) {
    return (
      <div style={{
        textAlign: "center",
        marginTop: "50px",
        color: "white"
      }}>
        <h2>⚠️ Checkout failed</h2>
        <p>Please try again or refresh the page.</p>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            background: "#22c55e",
            border: "none",
            borderRadius: 6,
            color: "white"
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{
      textAlign: "center",
      marginTop: "50px",
      color: "white"
    }}>
      <h2>🔐 Redirecting to secure payment...</h2>
      <p>Please wait a moment.</p>
    </div>
  )
}

export default CheckoutRedirect