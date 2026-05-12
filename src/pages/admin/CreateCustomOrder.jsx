import { useState } from "react"
import api from "../../services/api"

export default function CreateCustomOrder() {

  const [form, setForm] = useState({

    customerName: "",
    email: "",
    phone: "",

    itemName: "",
    quantity: 1,
    price: 0,

    shipping: 0,

    paymentMethod: "cash",

    notes: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = e => {

    setForm(prev => ({

      ...prev,

      [e.target.name]: e.target.value
    }))
  }

  const subtotal =
    Number(form.quantity || 0) *
    Number(form.price || 0)

  const tax = subtotal * 0.0825

  const total =
    subtotal +
    tax +
    Number(form.shipping || 0)

  const handleSubmit = async e => {

    e.preventDefault()

    try {

      setLoading(true)

      const payload = {

        customerName: form.customerName,

        email: form.email,

        phone: form.phone,

        items: [

          {
            name: form.itemName,
            quantity: Number(form.quantity),
            price: Number(form.price)
          }
        ],

        subtotal,
        tax,

        shipping: Number(form.shipping),

        finalPrice: total,

        paymentMethod: form.paymentMethod,

        notes: form.notes,

        orderType: "custom",

        source: "admin",

        status: "payment_required"
      }

      console.log(
        "🧾 CUSTOM ORDER:",
        payload
      )

      const res = await api.post(
        "/orders/custom",
        payload
      )

      console.log(
        "✅ CUSTOM ORDER CREATED:",
        res.data
      )

      alert(
        "Custom order created successfully"
      )

      setForm({

        customerName: "",
        email: "",
        phone: "",

        itemName: "",
        quantity: 1,
        price: 0,

        shipping: 0,

        paymentMethod: "cash",

        notes: ""
      })

    } catch (err) {

      console.error(
        "❌ CUSTOM ORDER ERROR:",
        err
      )

      alert(
        err?.response?.data?.message ||
        "Failed to create order"
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <div style={container}>

      <h1 style={title}>
        🧾 Create Custom Order
      </h1>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
      >

        <input
          name="customerName"
          placeholder="Customer Name"
          value={form.customerName}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          style={input}
        />

        <input
          name="itemName"
          placeholder="Service / Product"
          value={form.itemName}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          style={input}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          style={input}
        />

        <input
          type="number"
          name="shipping"
          placeholder="Shipping"
          value={form.shipping}
          onChange={handleChange}
          style={input}
        />

        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          style={input}
        >
          <option value="cash">
            Cash
          </option>

          <option value="square">
            Square
          </option>

          <option value="venmo">
            Venmo
          </option>

          <option value="paypal">
            PayPal
          </option>
        </select>

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          style={textarea}
        />

        <div style={summary}>

          <p>
            Subtotal:
            ${subtotal.toFixed(2)}
          </p>

          <p>
            Tax:
            ${tax.toFixed(2)}
          </p>

          <p>
            Total:
            ${total.toFixed(2)}
          </p>

        </div>

        <button
          type="submit"
          disabled={loading}
          style={button}
        >

          {loading
            ? "Creating..."
            : "Create Custom Order"}

        </button>

      </form>

    </div>
  )
}

/* ================= STYLES ================= */

const container = {

  background: "#020617",

  minHeight: "100vh",

  padding: 30,

  color: "white"
}

const title = {

  marginBottom: 20
}

const formStyle = {

  display: "flex",

  flexDirection: "column",

  gap: 14,

  maxWidth: 600
}

const input = {

  padding: 12,

  borderRadius: 10,

  border: "1px solid #334155",

  background: "#0f172a",

  color: "white"
}

const textarea = {

  padding: 12,

  borderRadius: 10,

  border: "1px solid #334155",

  background: "#0f172a",

  color: "white"
}

const summary = {

  background: "#0f172a",

  padding: 16,

  borderRadius: 10
}

const button = {

  background: "#22c55e",

  color: "#020617",

  border: "none",

  padding: 14,

  borderRadius: 10,

  fontWeight: "bold",

  cursor: "pointer"
}