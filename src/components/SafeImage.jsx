const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050"

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