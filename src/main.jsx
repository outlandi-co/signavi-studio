import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css" // 🔥 REQUIRED (THIS FIXES EVERYTHING)
import { Toaster } from "react-hot-toast"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
)