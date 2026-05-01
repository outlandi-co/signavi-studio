import { useState } from "react"
import { LoadingContext } from "./LoadingContext"

export default function LoadingProvider({ children }) {
  const [count, setCount] = useState(0)

  const start = () => setCount(c => c + 1)
  const stop = () => setCount(c => Math.max(0, c - 1))

  return (
    <LoadingContext.Provider value={{ start, stop }}>
      {children}
      {count > 0 && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}

/* 🔥 CINEMATIC OVERLAY */
function LoadingOverlay() {
  return (
    <div style={overlay}>
      <div style={spinner} />
      <p style={text}>Loading...</p>
    </div>
  )
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.75)",
  backdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9998
}

const spinner = {
  width: 60,
  height: 60,
  border: "4px solid rgba(6,182,212,0.2)",
  borderTop: "4px solid #06b6d4",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
}

const text = {
  marginTop: 10,
  color: "#06b6d4",
  fontWeight: "bold"
}