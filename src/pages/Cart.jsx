import { useNavigate } from "react-router-dom"
import { useCartContext } from "../hooks/useCartContext"
import api from "../services/api"

export default function Cart() {

  const navigate = useNavigate()
  const { cart, total } = useCartContext()

  const getPrice = (item) => {
    return Number(item?.selectedVariant?.price ?? 0)
  }

  const handleCheckout = async () => {
    if (!cart.length) {
      alert("Cart is empty")
      return
    }

    const email = "guest@signavi.com"

    const items = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: getPrice(item),
      variant: item.selectedVariant
    }))

    const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
    const tax = subtotal * 0.0825

    const res = await api.post("/orders", {
      email,
      items,
      subtotal,
      tax,
      finalPrice: subtotal + tax
    })

    const orderId = res?.data?.data?._id
    navigate(`/client-checkout/${orderId}`)
  }

  if (!cart.length) return <h1>🛒 Cart is empty</h1>

  return (
    <div style={{ padding: 20 }}>
      <h1>Cart</h1>

      {cart.map((item, i) => (
        <div key={i}>
          {item.name} × {item.quantity}
        </div>
      ))}

      <h2>Total: ${total.toFixed(2)}</h2>

      <button onClick={handleCheckout}>
        Checkout
      </button>
    </div>
  )
}