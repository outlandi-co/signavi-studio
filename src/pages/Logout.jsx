export default function Logout() {

  const handleLogout = () => {
    console.log("🚪 Logging out...")

    /* 🔐 CLEAR ALL AUTH */
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerUser")

    /* 🔥 HARD REDIRECT */
    window.location.href = "/login"
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 14px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      Logout
    </button>
  )
}