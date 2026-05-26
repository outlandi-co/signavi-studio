import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"

import "./index.css"
import "./styles/signaviTheme.css"

import { Toaster } from "react-hot-toast"

import { CartProvider } from "./context/CartContext"
import { NotificationProvider } from "./context/NotificationContext"

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <CartProvider>
      <NotificationProvider>
        <App />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #1e293b",
              borderRadius: "12px"
            }
          }}
        />
      </NotificationProvider>
    </CartProvider>
  </React.StrictMode>
)