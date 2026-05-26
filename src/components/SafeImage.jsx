import { useMemo } from "react"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://signavi-backend.onrender.com/api"

const BACKEND_URL =
  API_URL.replace(/\/api\/?$/, "")

function SafeImage({
  src = "",
  alt = "",
  style = {},
  className = "",
  fallback = "/fallback.png",
  loading = "lazy"
}) {
  const imageUrl = useMemo(() => {
    if (!src) return fallback

    // Full URL
    if (
      src.startsWith("http://") ||
      src.startsWith("https://")
    ) {
      return src
    }

    // Starts with /uploads
    if (src.startsWith("/uploads")) {
      return `${BACKEND_URL}${src}`
    }

    // Starts with uploads
    if (src.startsWith("uploads")) {
      return `${BACKEND_URL}/${src}`
    }

    // Filename only
    return `${BACKEND_URL}/uploads/${src}`
  }, [src, fallback])

  const handleError = (event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = fallback
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading={loading}
      className={className}
      style={{
        display: "block",
        maxWidth: "100%",
        ...style
      }}
      onError={handleError}
    />
  )
}

export default SafeImage