import { useState } from "react"
import { ToastContext } from "./ToastContext"

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "info") => {
    const id = Date.now()

    setToasts(prev => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      <div style={container}>
        {toasts.map(t => (
          <div key={t.id} style={toast(t.type)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const container = {
  position: "fixed",
  top: 20,
  right: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 9999
}

const toast = (type) => ({
  padding: "12px 18px",
  borderRadius: 8,
  color: "#fff",
  background:
    type === "error" ? "#ef4444" :
    type === "success" ? "#22c55e" :
    "#06b6d4"
})