export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "#020617",
        color: "white",
        outline: "none"
      }}
    />
  )
}