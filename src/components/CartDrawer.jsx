import { createPortal } from "react-dom"
import { useState } from "react"
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

  const getInitialCustomerInfo = () => {
  const storedUser = localStorage.getItem("customerUser")
  const storedEmail = localStorage.getItem("customerEmail")

  let parsedUser = null

  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser)
    } catch (err) {
      console.warn("⚠️ Failed to parse customerUser:", err)
    }
  }

  return {
    customerName: parsedUser?.name || "",
    email: parsedUser?.email || storedEmail || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  }
}

const [customerInfo, setCustomerInfo] = useState(getInitialCustomerInfo)
const [formError, setFormError] = useState("")

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckoutClick = () => {
    if (cart.length === 0) return

    if (!customerInfo.customerName.trim()) {
      setFormError("Customer name is required.")
      return
    }

    if (!customerInfo.email.trim()) {
      setFormError("Email is required.")
      return
    }

    setFormError("")

    localStorage.setItem("customerEmail", customerInfo.email.trim())

    onCheckout(cart, {
      customerName: customerInfo.customerName.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
      address: {
        street: customerInfo.street.trim(),
        city: customerInfo.city.trim(),
        state: customerInfo.state.trim(),
        zip: customerInfo.zip.trim(),
        country: customerInfo.country.trim() || "US"
      }
    })
  }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)"
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 380,
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
            <div key={key} style={cartItem}>
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
                      <p style={digitalText}>Digital Download</p>

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
                    <p style={serviceText}>Service</p>
                  )}
                </div>
              </div>

              <div style={quantityRow}>
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

              <p style={{ marginTop: 8 }}>
                ${money(itemTotal)}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromCart(
                    item.productId,
                    isPhysical ? item.selectedVariant : productType
                  )
                }}
                style={removeBtn}
              >
                Remove
              </button>
            </div>
          )
        })}

        {cart.length > 0 && (
          <>
            <div style={{ marginTop: 20 }}>
              <p>Subtotal: ${money(subtotal)}</p>
              <p>Tax: ${money(tax)}</p>
              <p>Shipping: ${money(shipping || 0)}</p>

              <h3 style={{ marginTop: 10 }}>
                Total: ${money(total)}
              </h3>
            </div>

            <div style={formBox}>
              <h3 style={{ marginTop: 0 }}>Customer Info</h3>

              <input
                style={input}
                value={customerInfo.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="Full Name *"
              />

              <input
                style={input}
                value={customerInfo.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email *"
                type="email"
              />

              <input
                style={input}
                value={customerInfo.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone Number"
                type="tel"
              />

              <h4 style={{ marginBottom: 8 }}>Shipping Address</h4>

              <input
                style={input}
                value={customerInfo.street}
                onChange={(e) => handleChange("street", e.target.value)}
                placeholder="Street Address"
              />

              <input
                style={input}
                value={customerInfo.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
              />

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...input, flex: 1 }}
                  value={customerInfo.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="State"
                />

                <input
                  style={{ ...input, flex: 1 }}
                  value={customerInfo.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                  placeholder="ZIP"
                />
              </div>

              {formError && (
                <p style={{ color: "#f87171", fontSize: 13 }}>
                  {formError}
                </p>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleCheckoutClick}
          disabled={cart.length === 0}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 12,
            background: cart.length === 0 ? "#555" : "#22c55e",
            color: "#fff",
            border: "none",
            cursor: cart.length === 0 ? "not-allowed" : "pointer",
            fontWeight: "bold",
            borderRadius: 8
          }}
        >
          Checkout
        </button>
      </div>
    </div>,
    document.body
  )
}

const cartItem = {
  marginBottom: 20,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  paddingBottom: 15
}

const itemRow = {
  display: "flex",
  gap: 12,
  alignItems: "center"
}

const quantityRow = {
  display: "flex",
  gap: 10,
  marginTop: 12,
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

const removeBtn = {
  marginTop: 5,
  fontSize: 12,
  color: "#ef4444",
  background: "transparent",
  border: "none",
  cursor: "pointer"
}

const formBox = {
  marginTop: 20,
  padding: 14,
  borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)"
}

const input = {
  width: "100%",
  marginBottom: 10,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#020617",
  color: "#fff",
  boxSizing: "border-box"
}