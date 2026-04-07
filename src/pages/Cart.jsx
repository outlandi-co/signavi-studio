import { useState, useEffect } from "react"
import useCart from "../hooks/useCart"

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart()

  const [loading, setLoading] = useState(false)
  const [discount, setDiscount] = useState(0)

  const user = JSON.parse(localStorage.getItem("user") || "null")

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  )

  const discountedTotal = total * (1 - discount / 100)

  /* ================= TRACK + GET DISCOUNT ================= */
  useEffect(() => {
    if (!user?.email || cart.length === 0) return

    const controller = new AbortController()

    const run = async () => {
      try {
        // 🔥 TRACK CART
        await fetch("http://localhost:5050/api/cart/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            cart
          }),
          signal: controller.signal
        })

        // 🔥 GET DISCOUNT
        const res = await fetch("http://localhost:5050/api/cart/discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
          signal: controller.signal
        })

        const data = await res.json()

        if (data?.discountPercent) {
          setDiscount(data.discountPercent)
        }

      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("CART TRACK ERROR:", err)
        }
      }
    }

    run()

    return () => controller.abort()

  }, [cart, user?.email])

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (loading) return

    setLoading(true)

    try {
      const res = await fetch("http://localhost:5050/api/stripe/create-cart-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cart,
          email: user?.email || ""
        })
      })

      const data = await res.json()

      if (data?.url) {

        // 🔥 mark recovered BEFORE redirect
        if (user?.email) {
          await fetch("http://localhost:5050/api/cart/recovered", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email })
          })
        }

        window.location.href = data.url

      } else {
        alert("Checkout failed")
      }

    } catch (err) {
      console.error("CHECKOUT ERROR:", err)
      alert("Checkout failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= EMPTY ================= */
  if (cart.length === 0) {
    return (
      <div style={emptyWrap}>
        <h2>Your cart is empty 🛒</h2>
      </div>
    )
  }

  return (
    <div style={container}>

      <h1 style={title}>🛒 Your Cart</h1>

      <div style={list}>
        {cart.map(item => (
          <div key={item._id} style={card}>

            <img
              src={
                item.image
                  ? `http://localhost:5050/${item.image}`
                  : "/placeholder.png"
              }
              style={image}
            />

            <div style={info}>
              <h3>{item.name}</h3>

              <p style={price}>
                ${Number(item.price || 0).toFixed(2)}
              </p>

              <div style={qtyWrap}>
                <button
                  onClick={() =>
                    updateQuantity(item._id, item.quantity - 1)
                  }
                  style={qtyBtn}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    updateQuantity(item._id, item.quantity + 1)
                  }
                  style={qtyBtn}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                style={removeBtn}
              >
                🗑 Remove
              </button>
            </div>

          </div>
        ))}
      </div>

      <div style={summary}>
        <h2>Subtotal: ${total.toFixed(2)}</h2>

        {discount > 0 && (
          <>
            <p style={{ color: "#22c55e", fontWeight: "bold" }}>
              🎉 {discount}% OFF Applied
            </p>

            <h2 style={{ color: "#22c55e" }}>
              Total: ${discountedTotal.toFixed(2)}
            </h2>
          </>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={clearCart} style={clearBtn}>
            Clear Cart
          </button>

          <button
            onClick={handleCheckout}
            style={{
              ...checkoutBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing..." : "💳 Checkout"}
          </button>
        </div>
      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const container = {
  padding: 20,
  color: "white"
}

const title = {
  marginBottom: 20
}

const list = {
  display: "flex",
  flexDirection: "column",
  gap: 15
}

const card = {
  display: "flex",
  gap: 15,
  background: "#020617",
  padding: 15,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)"
}

const image = {
  width: 100,
  height: 100,
  objectFit: "cover",
  borderRadius: 8
}

const info = {
  flex: 1
}

const price = {
  color: "#22d3ee",
  fontWeight: "bold"
}

const qtyWrap = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 8
}

const qtyBtn = {
  padding: "4px 10px",
  background: "#06b6d4",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer"
}

const removeBtn = {
  marginTop: 10,
  background: "#ef4444",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer"
}

const summary = {
  marginTop: 30,
  padding: 20,
  background: "#020617",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)"
}

const checkoutBtn = {
  background: "#22c55e",
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  fontWeight: "bold"
}

const clearBtn = {
  background: "#64748b",
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  color: "#fff"
}

const emptyWrap = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: "white"
}