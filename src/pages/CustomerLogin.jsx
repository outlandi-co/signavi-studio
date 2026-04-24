import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function CustomerLogin() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("customerToken")
    if (token) navigate("/store")
  }, [navigate])

  const handleLogin = async () => {
    if (loading) return
    setError("")

    if (!email || !password) {
      return setError("Please enter email and password")
    }

    try {
      setLoading(true)

      const res = await api.post("/auth/login", { email, password })
      const { token, user } = res.data

      localStorage.setItem("customerToken", token)
      localStorage.setItem("customerUser", JSON.stringify(user))

      navigate("/store")

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">

      <div className="w-full max-w-md p-8 rounded-xl bg-[#0f172a] border border-white/10 shadow-xl">

        <h1 className="text-2xl font-semibold text-center mb-2">
          Customer Login
        </h1>

        <p className="text-sm text-gray-400 text-center mb-6">
          Access your orders
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full p-3 mb-3 rounded-md bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />

        {/* PASSWORD */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full p-3 rounded-md bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-400"
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* FORGOT */}
        <p
          onClick={() => navigate("/forgot-password")}
          className="text-right text-sm text-cyan-400 cursor-pointer mb-4"
        >
          Forgot Password?
        </p>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-3">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </div>

    </div>
  )
}