export default function Spinner() {
  return (
    <div style={wrapper}>
      <div style={spinner} />
    </div>
  )
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

const spinner = {
  width: 24,
  height: 24,
  border: "3px solid #334155",
  borderTop: "3px solid #22c55e",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
}