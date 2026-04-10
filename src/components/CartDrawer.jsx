import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"
import useCart from "../hooks/useCart"
import api from "../services/api"

export default function CartDrawer({ isOpen, onClose }) {

  const { cart, setCart, removeFromCart } = useCart()

  /* ================= SAFE CLOSE ================= */
  const safeClose = () => {
    if (typeof onClose === "function") {
      onClose()
    }
  }

  /* ================= QTY ================= */
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

  /* ================= CALCULATIONS ================= */
  const subtotal = cart.reduce(
    (acc, item) =>
      acc + (Number(item.price) || 0) * (item.quantity || 1),
    0
  )

  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  /* ================= STRIPE CHECKOUT ================= */
  const handleCheckout = async () => {
    try {
      console.log("🔥 Sending cart to Stripe:", cart)

      const res = await api.post("/stripe/create-cart-session", {
        items: cart
      })

      if (!res?.data?.url) {
        throw new Error("No Stripe URL returned")
      }

      console.log("🚀 Redirecting to Stripe:", res.data.url)

      window.location.href = res.data.url

    } catch (err) {
      console.error("❌ CHECKOUT ERROR:", err)
      alert("Checkout failed. Check console.")
    }
  }

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={safeClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "0.3s",
          zIndex: 500
        }}
      />

      {/* DRAWER */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 360,
          height: "100%",
          background: "#020617",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "0.3s",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          color: "white"
        }}
      >

        {/* HEADER */}
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
          <h2>🛒 Cart</h2>
          <button onClick={safeClose}>✖</button>
        </div>

        {/* ITEMS */}
        <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
          {cart.length === 0 && <p>Your cart is empty</p>}

          {cart.map(item => (
            <div key={item._id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>

              <SafeImage
                src={item.image || "/placeholder.png"}
                alt={item.name}
                style={{ width: 60, height: 60, objectFit: "cover" }}
              />

              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>

                <p>${Number(item.price || 0).toFixed(2)}</p>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => decreaseQty(item._id)}>−</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => increaseQty(item._id)}>+</button>
                </div>
              </div>

              <button onClick={() => removeFromCart(item._id)}>✖</button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div style={{ padding: 20, borderTop: "1px solid #1e293b" }}>

            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <p>Shipping: {shipping === 0 ? "Free" : `$${shipping}`}</p>

            <h3>Total: ${total.toFixed(2)}</h3>

            {/* 🔥 STRIPE BUTTON */}
            <Button
              onClick={handleCheckout}
              fullWidth
              style={{ marginTop: 10 }}
            >
              💳 Checkout
            </Button>

          </div>
        )}

      </div>
    </>
  )
}