const API_URL = import.meta.env.VITE_API_URL || "https://signavi-backend.onrender.com"

function SafeImage({ src, alt = "", style = {} }) {
  return (
    <img
      src={src ? `${API_URL}/uploads/${src}` : "/fallback.png"}
      alt={alt}
      style={style}
      onError={(e) => {
        e.target.src = "/fallback.png"
      }}
    />
  )
}

export default SafeImage