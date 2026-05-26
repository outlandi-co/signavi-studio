import { createPortal } from "react-dom"
import { useMemo, useState } from "react"
import { useCartContext } from "../context/useCartContext"

const money = (value) =>
  Number(value || 0).toFixed(2)

const formatLicense = (licenseType = "") => {
  return String(licenseType)
    .split("-")
    .map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
}

const getInitialCustomerInfo = () => {
  const storedUser =
    localStorage.getItem("customerUser")

  const storedEmail =
    localStorage.getItem("customerEmail")

  let parsedUser = null

  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser)
    } catch (err) {
      console.warn(
        "⚠️ Failed to parse customerUser:",
        err
      )
    }
  }

  return {
    customerName:
      parsedUser?.name ||
      parsedUser?.customerName ||
      "",

    email:
      parsedUser?.email ||
      storedEmail ||
      "",

    phone: parsedUser?.phone || "",
    street: parsedUser?.address?.street || "",
    city: parsedUser?.address?.city || "",
    state: parsedUser?.address?.state || "",
    zip: parsedUser?.address?.zip || "",
    country: parsedUser?.address?.country || "US"
  }
}

const getItemKey = (item, index) => {
  const productType =
    item.productType ||
    "physical"

  return [
    item.productId,
    item?._id,
    item?.selectedVariant?._id,
    item?.selectedVariant?.color,
    item?.selectedVariant?.size,
    productType,
    index
  ]
    .filter(Boolean)
    .join("-")
}

export default function CartDrawer({
  isOpen,
  onClose,
  onCheckout
}) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    shipping,
    total
  } = useCartContext()

  const [customerInfo, setCustomerInfo] = useState(
    getInitialCustomerInfo
  )

  const [formError, setFormError] = useState("")

  const hasPhysicalItems = useMemo(() => {
    return cart.some(
      (item) =>
        (item.productType || "physical") === "physical"
    )
  }, [cart])

  const handleChange = (field, value) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const validateCheckout = () => {
    if (cart.length === 0) {
      return "Your cart is empty."
    }

    if (!customerInfo.customerName.trim()) {
      return "Customer name is required."
    }

    if (!customerInfo.email.trim()) {
      return "Email is required."
    }

    if (
      hasPhysicalItems &&
      (
        !customerInfo.street.trim() ||
        !customerInfo.city.trim() ||
        !customerInfo.state.trim() ||
        !customerInfo.zip.trim()
      )
    ) {
      return "Shipping address is required for physical products."
    }

    return ""
  }

  const handleCheckoutClick = () => {
    const error = validateCheckout()

    if (error) {
      setFormError(error)
      return
    }

    setFormError("")

    localStorage.setItem(
      "customerEmail",
      customerInfo.email.trim()
    )

    onCheckout?.(cart, {
      customerName:
        customerInfo.customerName.trim(),

      email:
        customerInfo.email.trim(),

      phone:
        customerInfo.phone.trim(),

      address: {
        street: customerInfo.street.trim(),
        city: customerInfo.city.trim(),
        state: customerInfo.state.trim(),
        zip: customerInfo.zip.trim(),
        country:
          customerInfo.country.trim() ||
          "US"
      }
    })
  }

  if (!isOpen) return null

  return createPortal(
    <div style={portal}>
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        style={overlay}
      />

      <aside
        onClick={(event) =>
          event.stopPropagation()
        }
        style={drawer}
      >
        <div style={header}>
          <div>
            <p style={eyebrow}>
              SignaVi Studio
            </p>

            <h2 style={title}>
              Cart
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={closeBtn}
          >
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={emptyBox}>
            <h3>Your cart is empty</h3>

            <p style={muted}>
              Add a product or service to begin checkout.
            </p>
          </div>
        ) : (
          <>
            <div style={cartList}>
              {cart.map((item, index) => {
                const productType =
                  item.productType ||
                  "physical"

                const isDigital =
                  productType === "digital"

                const isService =
                  productType === "service"

                const isPhysical =
                  productType === "physical"

                const price = Number(
                  item.price ||
                    item.selectedVariant?.price ||
                    0
                )

                const qty =
                  Number(item?.quantity || 1)

                const itemTotal =
                  price * qty

                const key =
                  getItemKey(item, index)

                return (
                  <article
                    key={key}
                    style={cartItem}
                  >
                    <div style={itemRow}>
                      <div style={thumbBox}>
                        <img
                          src={
                            item.image ||
                            "/image_placeholder/placeholder.png"
                          }
                          alt={
                            item.name ||
                            "Cart item"
                          }
                          style={thumbImg}
                          onError={(event) => {
                            event.currentTarget.src =
                              "/image_placeholder/placeholder.png"
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={itemName}>
                          {item.name}
                        </p>

                        {isPhysical && (
                          <p style={subText}>
                            {item?.selectedVariant?.color ||
                              "-"}{" "}
                            /{" "}
                            {item?.selectedVariant?.size ||
                              "-"}
                          </p>
                        )}

                        {isDigital && (
                          <>
                            <p style={digitalText}>
                              Digital Download
                            </p>

                            {item.digitalProduct?.licenseType && (
                              <p style={subText}>
                                License:{" "}
                                {formatLicense(
                                  item.digitalProduct.licenseType
                                )}
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

                    <div style={quantityRow}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()

                          updateQuantity(
                            item.productId,
                            isPhysical
                              ? item.selectedVariant
                              : productType,
                            -1
                          )
                        }}
                        style={qtyBtn}
                      >
                        −
                      </button>

                      <span style={qtyText}>
                        {qty}
                      </span>

                      <button
                        type="button"
                        disabled={isDigital}
                        onClick={(event) => {
                          event.stopPropagation()

                          updateQuantity(
                            item.productId,
                            isPhysical
                              ? item.selectedVariant
                              : productType,
                            1
                          )
                        }}
                        style={{
                          ...qtyBtn,
                          opacity: isDigital ? 0.4 : 1,
                          cursor: isDigital
                            ? "not-allowed"
                            : "pointer"
                        }}
                      >
                        +
                      </button>

                      {isDigital && (
                        <span style={digitalLimit}>
                          Digital items are limited to 1
                        </span>
                      )}
                    </div>

                    <div style={itemFooter}>
                      <p style={itemTotalText}>
                        ${money(itemTotal)}
                      </p>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()

                          removeFromCart(
                            item.productId,
                            isPhysical
                              ? item.selectedVariant
                              : productType
                          )
                        }}
                        style={removeBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            <section style={summaryBox}>
              <Row
                label="Subtotal"
                value={`$${money(subtotal)}`}
              />

              <Row
                label="Tax"
                value={`$${money(tax)}`}
              />

              <Row
                label="Shipping"
                value={`$${money(shipping || 0)}`}
              />

              <div style={totalRow}>
                <span>Total</span>
                <strong>${money(total)}</strong>
              </div>
            </section>

            <section style={formBox}>
              <h3 style={{ marginTop: 0 }}>
                Customer Info
              </h3>

              <input
                style={input}
                value={customerInfo.customerName}
                onChange={(event) =>
                  handleChange(
                    "customerName",
                    event.target.value
                  )
                }
                placeholder="Full Name *"
              />

              <input
                style={input}
                value={customerInfo.email}
                onChange={(event) =>
                  handleChange(
                    "email",
                    event.target.value
                  )
                }
                placeholder="Email *"
                type="email"
              />

              <input
                style={input}
                value={customerInfo.phone}
                onChange={(event) =>
                  handleChange(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="Phone Number"
                type="tel"
              />

              {hasPhysicalItems && (
                <>
                  <h4 style={{ marginBottom: 8 }}>
                    Shipping Address
                  </h4>

                  <input
                    style={input}
                    value={customerInfo.street}
                    onChange={(event) =>
                      handleChange(
                        "street",
                        event.target.value
                      )
                    }
                    placeholder="Street Address *"
                  />

                  <input
                    style={input}
                    value={customerInfo.city}
                    onChange={(event) =>
                      handleChange(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="City *"
                  />

                  <div style={twoCol}>
                    <input
                      style={input}
                      value={customerInfo.state}
                      onChange={(event) =>
                        handleChange(
                          "state",
                          event.target.value
                        )
                      }
                      placeholder="State *"
                    />

                    <input
                      style={input}
                      value={customerInfo.zip}
                      onChange={(event) =>
                        handleChange(
                          "zip",
                          event.target.value
                        )
                      }
                      placeholder="ZIP *"
                    />
                  </div>
                </>
              )}

              {formError && (
                <p style={errorText}>
                  {formError}
                </p>
              )}
            </section>

            <button
              type="button"
              onClick={handleCheckoutClick}
              disabled={cart.length === 0}
              style={{
                ...checkoutBtn,
                background:
                  cart.length === 0
                    ? "#475569"
                    : "#22c55e",
                cursor:
                  cart.length === 0
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              Checkout
            </button>
          </>
        )}
      </aside>
    </div>,
    document.body
  )
}

function Row({
  label,
  value
}) {
  return (
    <div style={row}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const portal = {
  position: "fixed",
  inset: 0,
  zIndex: 9999
}

const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(4px)",
  border: "none"
}

const drawer = {
  position: "absolute",
  right: 0,
  top: 0,
  width: 400,
  maxWidth: "94vw",
  height: "100%",
  background: "#0f172a",
  padding: 20,
  color: "#fff",
  overflowY: "auto",
  boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
  boxSizing: "border-box",
  borderLeft: "1px solid #1e293b"
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 20
}

const eyebrow = {
  margin: "0 0 6px",
  color: "#22d3ee",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: 12,
  fontWeight: 900
}

const title = {
  margin: 0,
  fontSize: 32
}

const closeBtn = {
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
  borderRadius: 999,
  width: 36,
  height: 36,
  cursor: "pointer",
  fontWeight: 900
}

const emptyBox = {
  border: "1px solid #1e293b",
  background: "#020617",
  borderRadius: 16,
  padding: 20
}

const muted = {
  color: "#94a3b8",
  marginBottom: 0
}

const cartList = {
  display: "grid",
  gap: 14
}

const cartItem = {
  border: "1px solid #1e293b",
  background: "#020617",
  borderRadius: 16,
  padding: 14
}

const itemRow = {
  display: "flex",
  gap: 12,
  alignItems: "center"
}

const itemName = {
  fontWeight: 900,
  margin: 0
}

const quantityRow = {
  display: "flex",
  gap: 10,
  marginTop: 12,
  alignItems: "center",
  flexWrap: "wrap"
}

const qtyBtn = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900
}

const qtyText = {
  fontWeight: 900
}

const digitalLimit = {
  fontSize: 12,
  color: "#94a3b8"
}

const thumbBox = {
  width: 66,
  height: 66,
  background: "#ffffff",
  borderRadius: 12,
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
  fontWeight: 800,
  margin: "4px 0 0"
}

const serviceText = {
  fontSize: 12,
  color: "#facc15",
  fontWeight: 800,
  margin: "4px 0 0"
}

const itemFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10
}

const itemTotalText = {
  color: "#22c55e",
  fontWeight: 900,
  margin: 0
}

const removeBtn = {
  fontSize: 12,
  color: "#ef4444",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontWeight: 800
}

const summaryBox = {
  marginTop: 20,
  padding: 14,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #1e293b"
}

const row = {
  display: "flex",
  justifyContent: "space-between",
  color: "#cbd5e1",
  marginBottom: 8
}

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  borderTop: "1px solid #334155",
  marginTop: 10,
  paddingTop: 10,
  fontSize: 20,
  color: "#fff"
}

const formBox = {
  marginTop: 20,
  padding: 14,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #1e293b"
}

const input = {
  width: "100%",
  marginBottom: 10,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  boxSizing: "border-box"
}

const twoCol = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8
}

const errorText = {
  color: "#f87171",
  fontSize: 13,
  marginBottom: 0
}

const checkoutBtn = {
  marginTop: 20,
  width: "100%",
  padding: 14,
  color: "#020617",
  border: "none",
  fontWeight: 900,
  borderRadius: 14
}