import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { Toaster } from "react-hot-toast"

// 🔥 ONLY ONE GLOBAL PROVIDER HERE
import { CartProvider } from "./context/CartContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <CartProvider>
      <App />
      <Toaster position="top-right" />
    </CartProvider>

  </React.StrictMode>
)