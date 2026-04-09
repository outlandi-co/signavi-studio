import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { Toaster } from "react-hot-toast"

/* 🔥 IMPORT CART PROVIDER */
import { CartProvider } from "./context/CartContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    {/* 🔥 WRAP APP */}
    <CartProvider>
      <App />
    </CartProvider>

    <Toaster position="top-right" />

  </React.StrictMode>
)