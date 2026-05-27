import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function Logout({
  className = ""
}) {
  const navigate = useNavigate()

  const handleLogout = () => {
    try {
      console.log("🚪 Logging out...")

      const keys = [
        "adminToken",
        "adminUser",
        "customerToken",
        "customerUser",
        "customerEmail",
        "lastOrderId",
        "shippingRate"
      ]

      keys.forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      toast.success("Logged out")

      navigate("/login", {
        replace: true
      })
    } catch (err) {
      console.error("❌ LOGOUT ERROR:", err)

      window.location.href = "/login"
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "rounded-xl bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-400 active:scale-95"
      }
    >
      Logout
    </button>
  )
}