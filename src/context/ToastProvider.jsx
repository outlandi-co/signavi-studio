import { useCallback, useMemo, useState } from "react"
import { ToastContext } from "./ToastContext"

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    )
  }, [])

  const addToast = useCallback(
    (
      message,
      type = "info",
      duration = 3000
    ) => {
      const id = crypto.randomUUID()

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ])

      setTimeout(() => {
        removeToast(id)
      }, duration)
    },
    [removeToast]
  )

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
      toasts,
    }),
    [addToast, removeToast, toasts]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div style={container}>
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            style={toastStyle(toastItem.type)}
          >
            <span>{toastItem.message}</span>

            <button
              type="button"
              onClick={() =>
                removeToast(toastItem.id)
              }
              style={closeButton}
            >
              ×
            </button>
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
  zIndex: 9999,
  maxWidth: "400px",
}

const toastStyle = (type) => ({
  minWidth: "260px",
  padding: "12px 16px",
  borderRadius: "12px",
  color: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.08)",

  background:
    type === "error"
      ? "#ef4444"
      : type === "success"
      ? "#22c55e"
      : type === "warning"
      ? "#f59e0b"
      : "#06b6d4",
})

const closeButton = {
  background: "transparent",
  border: "none",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "bold",
  lineHeight: 1,
  padding: 0,
}