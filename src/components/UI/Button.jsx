import { useState } from "react"

function Button({
  children,
  onClick,
  type = "button",
  loading = false,
  variant = "primary",
  fullWidth = false,
  style = {},
  ...props
}) {
  const [pressed, setPressed] = useState(false)

  const variants = {
    primary: "linear-gradient(90deg, #06b6d4, #2563eb)",
    success: "#22c55e",
    danger: "#ef4444",
    dark: "#020617"
  }

  return (
    <button
      type={type}
      disabled={loading}
      {...props}

      /* 🔥 SAFE CLICK HANDLER */
      onClick={(event) => {
        if (loading) return

        if (typeof onClick === "function") {
          onClick(event)
        } else if (onClick !== undefined) {
          console.error("❌ Button onClick is NOT a function:", onClick)
        }
      }}

      style={{
        padding: "12px 18px",
        background: variants[variant],
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        width: fullWidth ? "100%" : "auto",
        boxShadow: loading
          ? "none"
          : "0 10px 25px rgba(0,0,0,0.3)",
        transition: "all 0.25s ease",
        transform: pressed ? "scale(0.96)" : "translateY(0)",
        ...style
      }}

      onMouseEnter={(event) => {
        if (loading) return
        event.currentTarget.style.transform = "translateY(-2px)"
        event.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.45)"
      }}

      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)"
        event.currentTarget.style.boxShadow =
          "0 10px 25px rgba(0,0,0,0.3)"
      }}

      onMouseDown={() => !loading && setPressed(true)}
      onMouseUp={() => !loading && setPressed(false)}
    >
      {loading ? "⏳ Loading..." : children}
    </button>
  )
}

export default Button
