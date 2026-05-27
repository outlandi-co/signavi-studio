import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function CustomerLogoutButton({
  className = ""
}) {
  const navigate = useNavigate()

  const handleLogout = () => {
    try {
      /* ================= CUSTOMER STORAGE ================= */

      localStorage.removeItem("customerToken")
      localStorage.removeItem("customerUser")
      localStorage.removeItem("customerEmail")

      /* OPTIONAL CUSTOMER DATA */

      localStorage.removeItem("cart")
      localStorage.removeItem("wishlist")

      console.log("👋 CUSTOMER LOGGED OUT")

      toast.success("Logged out successfully")

      navigate("/", {
        replace: true
      })

    } catch (err) {
      console.error(
        "❌ CUSTOMER LOGOUT ERROR:",
        err
      )

      toast.error("Logout failed")
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        `
        rounded-xl
        bg-red-500
        px-4
        py-2
        font-bold
        text-white
        transition
        duration-200
        hover:bg-red-400
        active:scale-95
        `
      }
    >
      Logout
    </button>
  )
}