import { useNavigate } from "react-router-dom"

export default function Cart() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center"
    >
      <h1 className="text-3xl font-bold mb-4">🛒 Cart</h1>

      <p className="text-gray-400 mb-6 max-w-md">
        Your cart has been upgraded to a drawer-based checkout experience.
        Use the cart icon in the navigation bar to review your items and proceed to payment.
      </p>

      <button
        onClick={() => navigate("/store")}
        className="bg-cyan-500 px-6 py-2 rounded text-black font-semibold"
      >
        Continue Shopping
      </button>

      <p className="text-gray-500 mt-6 text-sm">
        💳 Checkout is now handled securely via Square
      </p>
    </div>
  )
}