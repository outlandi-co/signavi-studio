import { useNavigate } from "react-router-dom"

export default function CustomerLogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerUser")

    console.log("👋 CUSTOMER LOGGED OUT")

    navigate("/")
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}