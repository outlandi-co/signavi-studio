import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import useCart from "../hooks/useCart"

function CartDrawer({ isOpen, onClose, onCheckout }) {

  const { cart, setCart, removeFromCart } = useCart()

  const increaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
          : item
      )
    )
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1),
    0
  )

  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  return (
    <>
      <div onClick={onClose} style={overlay(isOpen)} />

      <div style={drawer(isOpen)}>

        <div style={header}>
          <h2>🛒 Cart</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div style={items}>
          {cart.length === 0 && <p>Your cart is empty</p>}

          {cart.map(item => (
            <div key={item._id} style={itemRow}>

              <SafeImage
                src={item.image || "/placeholder.png"}
                alt={item.name}
                style={img}
              />

              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <p>${Number(item.price || 0).toFixed(2)}</p>

                <div style={qtyRow}>
                  <button onClick={() => decreaseQty(item._id)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item._id)}>+</button>
                </div>
              </div>

              <button onClick={() => removeFromCart(item._id)}>✖</button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={footer}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <p>Shipping: ${shipping === 0 ? "Free" : `$${shipping}`}</p>
            <h3>Total: ${total.toFixed(2)}</h3>

            <Button onClick={onCheckout} fullWidth>
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

/* styles */
const overlay = (isOpen) => ({
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  opacity: isOpen ? 1 : 0,
  pointerEvents: isOpen ? "auto" : "none"
})

const drawer = (isOpen) => ({
  position: "fixed",
  right: 0,
  top: 0,
  width: 360,
  height: "100%",
  background: "#020617",
  transform: isOpen ? "translateX(0)" : "translateX(100%)",
  transition: "0.3s"
})

const header = { padding: 20, display: "flex", justifyContent: "space-between" }
const items = { padding: 20, overflowY: "auto", height: "70%" }
const itemRow = { display: "flex", gap: 10, marginBottom: 10 }
const img = { width: 60, height: 60, objectFit: "cover" }
const qtyRow = { display: "flex", gap: 8 }
const footer = { padding: 20 }

export default CartDrawer