import { Outlet } from "react-router-dom"

export default function CustomerLayout() {

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h2>Dashboard</h2>
      </div>

      {/* CONTENT */}
      <div>
        <Outlet />
      </div>

    </div>
  )
}

/* STYLES */
const container = {
  padding: 30,
  background: "#020617",
  minHeight: "100vh",
  color: "white"
}

const header = {
  display: "flex",
  marginBottom: 20,
  alignItems: "center"
}