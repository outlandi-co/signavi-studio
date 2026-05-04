import { createPortal } from "react-dom"
import { useCartContext } from "../context/useCartContext"

const money = (v) => Number(v || 0).toFixed(2)

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

        {cart.length === 0 && (
          <p style={{ opacity: 0.7 }}>Your cart is empty</p>
        )}

        {cart.map((item) => {
          const price = Number(item.selectedVariant?.price || 0)
          const qty = Number(item.quantity || 1)
          const itemTotal = price * qty

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
                {item.selectedVariant.color} / {item.selectedVariant.size}
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.selectedVariant, -1)
                  }
                >
                  ➖
                </button>

                <span>{qty}</span>

                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.selectedVariant, 1)
                  }
                >
                  ➕
                </button>
              </div>

              <p style={{ marginTop: 5 }}>
                ${money(itemTotal)}
              </p>

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
          <p>Subtotal: ${money(subtotal)}</p>
          <p>Tax: ${money(tax)}</p>
          <p>Shipping: ${money(shipping)}</p>

          <h3 style={{ marginTop: 10 }}>
            Total: ${money(total)}
          </h3>
        </div>

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