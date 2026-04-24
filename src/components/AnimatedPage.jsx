import { useEffect, useState } from "react"

export default function AnimatedPage({ children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(10px)",
        transition: "all 0.4s ease"
      }}
    >
      {children}
    </div>
  )
}