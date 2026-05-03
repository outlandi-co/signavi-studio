import { createPortal } from "react-dom"
import { useCartContext } from "../context/useCartContext"

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity } = useCartContext()

  if (!isOpen) return null

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)"
        }}
      />

      {/* drawer */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 300,
          height: "100%",
          background: "#111",
          padding: 20
        }}
      >
        <h2>Cart</h2>

        {cart.map((item) => (
          <div key={item.productId}>
            <p>{item.name}</p>

            <button
              onClick={() => {
                console.log("➖ CLICK")
                updateQuantity(item.productId, item.selectedVariant, -1)
              }}
            >-</button>

            <span>{item.quantity}</span>

            <button
              onClick={() => {
                console.log("➕ CLICK")
                updateQuantity(item.productId, item.selectedVariant, 1)
              }}
            >+</button>
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}