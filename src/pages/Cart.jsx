import { useNavigate } from "react-router-dom"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function Cart() {

  const navigate = useNavigate()
  const { cart } = useCart()

  /* ================= PRICE HELPER ================= */
  const getPrice = (item) => {
    return Number(
      item?.selectedVariant?.price ??
      item?.variant?.price ??
      item?.price ??
      0
    )
  }

  /* ================= CALCULATIONS ================= */
  const subtotal = cart.reduce((sum, item) => {
    return sum + (getPrice(item) * Number(item.quantity || 1))
  }, 0)

  const taxRate = 0.0825
  const tax = subtotal * taxRate
  const total = subtotal + tax

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    try {
      const email = localStorage.getItem("customerEmail")

      if (!email) {
        alert("Please login first")
        return
      }

      if (!cart.length) {
        alert("Cart is empty")
        return
      }

      const items = cart.map(item => {
        const price = getPrice(item)

        if (!price || price <= 0) {
          throw new Error(`Invalid price for ${item.name}`)
        }

        return {
          productId: item.productId || item._id || item.id,
          name: item.name,
          quantity: Number(item.quantity || 1),
          price,
          variant: {
            color: item?.selectedVariant?.color || "",
            size: item?.selectedVariant?.size || ""
          }
        }
      })

      const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      const tax = subtotal * 0.0825

      const res = await api.post("/orders", {
        email,
        items,
        subtotal,
        tax,
        price: subtotal,
        finalPrice: subtotal + tax
      })

      const orderId = res.data?.data?._id

      if (!orderId) throw new Error("Order ID missing")

      navigate(`/client-checkout/${orderId}`)

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert(err.message || "Checkout failed")
    }
  }

  /* ================= EMPTY ================= */
  if (!cart.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1>🛒 Cart is empty</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl mb-6">🛒 Cart</h1>

      {cart.map((item, i) => {
        const price = getPrice(item)

        return (
          <div key={i} className="mb-2">
            {item.name} × {item.quantity} — $
            {(price * item.quantity).toFixed(2)}
          </div>
        )
      })}

      <div className="mt-6">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <h2>Total: ${total.toFixed(2)}</h2>

        <button
          onClick={handleCheckout}
          className="mt-4 bg-cyan-500 px-6 py-2 rounded text-black"
        >
          Checkout
        </button>
      </div>

    </div>
  )
}