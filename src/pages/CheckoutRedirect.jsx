import { useEffect } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

function CheckoutRedirect() {
  const { id } = useParams()

  useEffect(() => {
    if (!id) return

    const goToSquare = async () => {
      try {
        console.log("💳 Creating Square checkout for:", id)

        const res = await api.post(`/square/create-payment/${id}`)

        if (!res?.data?.url) {
          throw new Error("No payment URL returned")
        }

        console.log("🚀 Redirecting to Square:", res.data.url)

        window.location.href = res.data.url

      } catch (err) {
        console.error("❌ Checkout error:", err)
        alert("Failed to start checkout. Please try again.")
      }
    }

    goToSquare()
  }, [id])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Redirecting to secure payment...</h2>
      <p>Please wait a moment.</p>
    </div>
  )
}

export default CheckoutRedirect