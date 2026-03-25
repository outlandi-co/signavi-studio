import { useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function CheckoutRedirect() {
  const { id } = useParams()

  useEffect(() => {
    if (!id) return

    const goToStripe = async () => {
      try {
        console.log("💳 Creating checkout for:", id)

        /* 🔥 FIX: USE PARAM ROUTE */
        const res = await api.post(`/stripe/create-checkout-session/${id}`)

        if (!res?.data?.url) {
          throw new Error("No checkout URL returned")
        }

        console.log("🚀 Redirecting to Stripe:", res.data.url)

        window.location.href = res.data.url

      } catch (err) {
        console.error("❌ Checkout error:", err)

        alert("Failed to start checkout. Please try again.")
      }
    }

    goToStripe()
  }, [id])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Redirecting to secure payment...</h2>
      <p>Please wait a moment.</p>
    </div>
  )
}

export default CheckoutRedirect