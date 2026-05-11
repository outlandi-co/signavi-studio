import { createPortal } from "react-dom"
import { useCartContext } from "../context/useCartContext"

const money = (v) => Number(v || 0).toFixed(2)

const formatLicense = (licenseType = "") => {
  return String(licenseType)
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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

      {/* OVERLAY */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)"
        }}
      />

      {/* DRAWER */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 360,
          height: "100%",
          background: "#0f172a",
          padding: 20,
          color: "#fff",
          overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Cart</h2>

        {/* EMPTY */}
        {cart.length === 0 && (
          <p style={{ opacity: 0.7 }}>Your cart is empty</p>
        )}

        {/* ITEMS */}
        {cart.map((item, index) => {
          const productType = item.productType || "physical"
          const isDigital = productType === "digital"
          const isService = productType === "service"
          const isPhysical = productType === "physical"

          const price = Number(
            item.price ||
            item.selectedVariant?.price ||
            0
          )

          const qty = Number(item?.quantity || 1)
          const itemTotal = price * qty

          const key = `${item.productId}-${item?.selectedVariant?.color || productType}-${item?.selectedVariant?.size || "single"}-${index}`

          return (
            <div
              key={key}
              style={{
                marginBottom: 20,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: 15
              }}
            >
              <div style={itemRow}>
                <div style={thumbBox}>
                  <img
                    src={item.image || "/image_placeholder/placeholder.png"}
                    alt={item.name || "Cart item"}
                    style={thumbImg}
                    onError={(e) => {
                      e.currentTarget.src = "/image_placeholder/placeholder.png"
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "bold", margin: 0 }}>
                    {item.name}
                  </p>

                  {isPhysical && (
                    <p style={subText}>
                      {item?.selectedVariant?.color || "-"} /{" "}
                      {item?.selectedVariant?.size || "-"}
                    </p>
                  )}

                  {isDigital && (
                    <>
                      <p style={digitalText}>
                        Digital Download
                      </p>

                      {item.digitalProduct?.licenseType && (
                        <p style={subText}>
                          License: {formatLicense(item.digitalProduct.licenseType)}
                        </p>
                      )}

                      {item.digitalProduct?.dpi && (
                        <p style={subText}>
                          {item.digitalProduct.dpi} DPI
                        </p>
                      )}
                    </>
                  )}

                  {isService && (
                    <p style={serviceText}>
                      Service
                    </p>
                  )}
                </div>
              </div>

              {/* QUANTITY */}
              <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(
                      item.productId,
                      isPhysical ? item.selectedVariant : productType,
                      -1
                    )
                  }}
                >
                  ➖
                </button>

                <span>{qty}</span>

                <button
                  disabled={isDigital}
                  onClick={(e) => {
                    e.stopPropagation()
                    updateQuantity(
                      item.productId,
                      isPhysical ? item.selectedVariant : productType,
                      1
                    )
                  }}
                  style={{
                    opacity: isDigital ? 0.4 : 1,
                    cursor: isDigital ? "not-allowed" : "pointer"
                  }}
                >
                  ➕
                </button>

                {isDigital && (
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    Digital items are limited to 1
                  </span>
                )}
              </div>

              {/* PRICE */}
              <p style={{ marginTop: 8 }}>
                ${money(itemTotal)}
              </p>

              {/* REMOVE */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromCart(
                    item.productId,
                    isPhysical ? item.selectedVariant : productType
                  )
                }}
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
          <p>Shipping: ${money(shipping || 0)}</p>

          <h3 style={{ marginTop: 10 }}>
            Total: ${money(total)}
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

const itemRow = {
  display: "flex",
  gap: 12,
  alignItems: "center"
}

const thumbBox = {
  width: 62,
  height: 62,
  background: "#ffffff",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0
}

const thumbImg = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  padding: 4,
  boxSizing: "border-box"
}

const subText = {
  fontSize: 12,
  opacity: 0.7,
  margin: "4px 0 0"
}

const digitalText = {
  fontSize: 12,
  color: "#38bdf8",
  fontWeight: 700,
  margin: "4px 0 0"
}

const serviceText = {
  fontSize: 12,
  color: "#facc15",
  fontWeight: 700,
  margin: "4px 0 0"
}