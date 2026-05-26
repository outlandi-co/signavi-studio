import { useMemo, useState } from "react"
import { LoadingContext } from "./loadingContext"

export default function LoadingProvider({ children }) {
  const [count, setCount] = useState(0)

  const start = () => {
    setCount((currentCount) => currentCount + 1)
  }

  const stop = () => {
    setCount((currentCount) => Math.max(0, currentCount - 1))
  }

  const value = useMemo(
    () => ({
      start,
      stop,
      loading: count > 0,
    }),
    [count]
  )

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {count > 0 && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}

function LoadingOverlay() {
  return (
    <>
      <style>
        {`
          @keyframes signavi-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div style={overlay}>
        <div style={spinner} />
        <p style={text}>Loading...</p>
      </div>
    </>
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
  zIndex: 9998,
}

const spinner = {
  width: 60,
  height: 60,
  border: "4px solid rgba(6,182,212,0.2)",
  borderTop: "4px solid #06b6d4",
  borderRadius: "50%",
  animation: "signavi-spin 1s linear infinite",
}

const text = {
  marginTop: 10,
  color: "#06b6d4",
  fontWeight: "bold",
}