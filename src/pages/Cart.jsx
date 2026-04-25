import { useNavigate } from "react-router-dom"

export default function Cart() {

  const navigate = useNavigate()

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    console.warn("⚠️ CartDrawer handles checkout")
    alert("Please use the cart drawer (top right) to checkout.")
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

      <h1 className="text-2xl mb-4">🛒 Cart</h1>

      <button
        onClick={handleCheckout}
        className="bg-cyan-500 px-6 py-2 rounded text-black"
      >
        💳 Checkout
      </button>

      <button
        onClick={() => navigate("/store")}
        className="mt-4 bg-gray-700 px-6 py-2 rounded text-white"
      >
        Continue Shopping
      </button>

    </div>
  )
}