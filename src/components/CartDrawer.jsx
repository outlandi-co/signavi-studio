function CartDrawer({ isOpen, onClose, cart, removeFromCart, onCheckout }) {

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
      {/* ================= OVERLAY ================= */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "0.3s",
          zIndex: 500   // ✅ LOWER than drawer
        }}
      />

      {/* ================= DRAWER ================= */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "360px",
          height: "100%",
          background: "#fff",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000, // ✅ ABOVE overlay
          display: "flex",
          flexDirection: "column"
        }}
      >

        {/* ================= HEADER ================= */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h2 style={{ margin: 0 }}>Cart</h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            ✖
          </button>
        </div>

        {/* ================= ITEMS ================= */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px"
          }}
        >
          {cart.length === 0 && <p>No items</p>}

          {cart.map(item => (
            <div
              key={item._id}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "15px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px"
              }}
            >
              {/* IMAGE */}
              <img
                src={item.image || "https://via.placeholder.com/60"}
                alt={item.name}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />

              {/* INFO */}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {item.name}
                </p>
                <p style={{ margin: "5px 0" }}>
                  ${item.price} x {item.quantity}
                </p>
              </div>

              {/* REMOVE */}
              <button
                onClick={() => removeFromCart(item._id)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        {/* ================= FOOTER ================= */}
        {cart.length > 0 && (
          <div
            style={{
              borderTop: "1px solid #ddd",
              padding: "20px",
              background: "#fafafa",
              position: "sticky",
              bottom: 0
            }}
          >
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax (8%): ${tax.toFixed(2)}</p>
            <p>Shipping: ${shipping.toFixed(2)}</p>

            <h3>Total: ${total.toFixed(2)}</h3>

            <button
              onClick={() => {
                console.log("🟢 CHECKOUT CLICKED")
                onCheckout && onCheckout()
              }}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "14px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                position: "relative",
                zIndex: 2000 // ✅ ensures click works
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer