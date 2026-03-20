import api from "../services/api"
import { useNavigate } from "react-router-dom"

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post("/logout")

      // 🔥 CLEAR LOCAL STORAGE (IMPORTANT)
      localStorage.removeItem("token")
      localStorage.removeItem("role")

      navigate("/login")

    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return <button onClick={handleLogout}>Logout</button>
}

export default LogoutButton