import Button from "../components/UI/Button"
import SafeImage from "../components/SafeImage"

function CartDrawer({ isOpen, onClose, cart, setCart, removeFromCart, onCheckout }) {

  /* ================= UPDATE QTY ================= */
  const increaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    )
  }

  /* ================= CALCULATIONS ================= */
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
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
          width: "360px",
          height: "100%",
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(12px)",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          color: "white"
        }}
      >

        {/* HEADER */}
        <div style={header}>
          <h2 style={{ margin: 0 }}>🛒 Cart</h2>

          <button onClick={onClose} style={closeBtn}>✖</button>
        </div>

        {/* ITEMS */}
        <div style={items}>
          {cart.length === 0 && <p>No items</p>}

          {cart.map(item => (
            <div key={item._id} style={itemRow}>

              <SafeImage
                src={item.image}
                alt={item.name}
                style={img}
              />

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: "bold" }}>{item.name}</p>

                <p style={{ color: "#94a3b8" }}>
                  ${item.price}
                </p>

                {/* 🔥 QUANTITY CONTROLS */}
                <div style={qtyRow}>
                  <button onClick={() => decreaseQty(item._id)} style={qtyBtn}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item._id)} style={qtyBtn}>+</button>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                style={removeBtn}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div style={footer}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <p>Shipping: ${shipping.toFixed(2)}</p>

            <h3>Total: ${total.toFixed(2)}</h3>

            <Button
              onClick={onCheckout}
              fullWidth
              variant="success"
              style={{ marginTop: "10px" }}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

/* ================= STYLES ================= */

const header = {
  padding: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  justifyContent: "space-between"
}

const closeBtn = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer"
}

const items = {
  flex: 1,
  overflowY: "auto",
  padding: "20px"
}

const itemRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  paddingBottom: "10px"
}

const img = {
  width: "60px",
  height: "60px",
  objectFit: "cover",
  borderRadius: "8px"
}

const qtyRow = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "5px"
}

const qtyBtn = {
  background: "#1e293b",
  border: "none",
  color: "white",
  padding: "4px 8px",
  borderRadius: "6px",
  cursor: "pointer"
}

const removeBtn = {
  background: "none",
  border: "none",
  color: "#ef4444",
  cursor: "pointer"
}

const footer = {
  borderTop: "1px solid rgba(255,255,255,0.1)",
  padding: "20px"
}

export default CartDrawer