import { createPortal } from "react-dom"
import { useCartContext } from "../context/useCartContext"

export default function CartDrawer({ isOpen, onClose, onCheckout }) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    shipping,
    total
  } = useCartContext()

  if (!isOpen) return null

  // 🔥 SAFE VALUES
  const safeSubtotal = Number(subtotal || 0)
  const safeTax = Number(tax || 0)
  const safeShipping = Number(shipping || 0)
  const safeTotal = Number(total || 0)

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>

      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)"
        }}
      />

      {/* drawer */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 340,
          height: "100%",
          background: "#0f172a",
          padding: 20,
          color: "#fff",
          overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Cart</h2>

        {/* EMPTY STATE */}
        {cart.length === 0 && (
          <p style={{ opacity: 0.7 }}>Your cart is empty</p>
        )}

        {/* ITEMS */}
        {cart.map((item) => {
          const itemTotal =
            Number(item.selectedVariant?.price || 0) *
            Number(item.quantity || 1)

          return (
            <div
              key={`${item.productId}-${item.selectedVariant.color}-${item.selectedVariant.size}`}
              style={{
                marginBottom: 20,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: 15
              }}
            >
              <p style={{ fontWeight: "bold" }}>{item.name}</p>

              <p style={{ fontSize: 12, opacity: 0.7 }}>
                {item.selectedVariant?.color} / {item.selectedVariant?.size}
              </p>

              {/* QUANTITY */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.selectedVariant, -1)
                  }
                >
                  ➖
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.selectedVariant, 1)
                  }
                >
                  ➕
                </button>
              </div>

              {/* PRICE */}
              <p style={{ marginTop: 5 }}>
                ${Number(itemTotal || 0).toFixed(2)}
              </p>

              {/* REMOVE */}
              <button
                onClick={() =>
                  removeFromCart(item.productId, item.selectedVariant)
                }
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  color: "#ef4444",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Remove
              </button>
            </div>
          )
        })}

        {/* TOTALS */}
        <div style={{ marginTop: 20 }}>
          <p>Subtotal: ${safeSubtotal.toFixed(2)}</p>
          <p>Tax: ${safeTax.toFixed(2)}</p>
          <p>Shipping: ${safeShipping.toFixed(2)}</p>

          <h3 style={{ marginTop: 10 }}>
            Total: ${safeTotal.toFixed(2)}
          </h3>
        </div>

        {/* CHECKOUT */}
        <button
          onClick={() => {
            if (cart.length === 0) return
            onCheckout(cart)
          }}
          disabled={cart.length === 0}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 12,
            background: cart.length === 0 ? "#555" : "#22c55e",
            color: "#fff",
            border: "none",
            cursor: cart.length === 0 ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}
        >
          Checkout
        </button>

      </div>
    </div>,
    document.body
  )
}