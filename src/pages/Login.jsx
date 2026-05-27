import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken")

    const userRaw =
      localStorage.getItem("adminUser") ||
      sessionStorage.getItem("adminUser")

    if (!token || !userRaw) return

    try {
      const user = JSON.parse(userRaw)

      if (user?.role === "admin") {
        navigate("/admin/production", {
          replace: true
        })
      }
    } catch {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      sessionStorage.removeItem("adminToken")
      sessionStorage.removeItem("adminUser")
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()

    if (loading) return

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password
      })

      const token =
        res.data?.token ||
        res.data?.data?.token

      const user =
        res.data?.user ||
        res.data?.data?.user ||
        res.data?.admin

      if (!token || !user) {
        throw new Error("Invalid login response")
      }

      const normalizedUser = {
        ...user,
        role:
          user.role ||
          user.userRole ||
          user.accountType
      }

      if (normalizedUser.role !== "admin") {
        throw new Error(
          "This portal is restricted to administrators."
        )
      }

      ;[
        "adminToken",
        "adminUser",
        "customerToken",
        "customerUser",
        "customerEmail"
      ].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      if (remember) {
        localStorage.setItem(
          "adminToken",
          token
        )

        localStorage.setItem(
          "adminUser",
          JSON.stringify(normalizedUser)
        )
      } else {
        sessionStorage.setItem(
          "adminToken",
          token
        )

        sessionStorage.setItem(
          "adminUser",
          JSON.stringify(normalizedUser)
        )
      }

      navigate("/admin/production", {
        replace: true
      })

    } catch (err) {
      console.error(
        "❌ LOGIN ERROR:",
        err.response?.data || err
      )

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Login failed"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={container}>
      <div style={glow} />

      <form
        onSubmit={handleLogin}
        style={card}
      >
        <p style={badge}>
          SignaVi Studio
        </p>

        <h1 style={title}>
          Admin Login
        </h1>

        <p style={subtitle}>
          Access production, orders,
          customers, support, revenue,
          and administration tools.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={input}
          autoComplete="email"
        />

        <div style={passwordWrap}>
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={input}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            style={eyeButton}
          >
            {showPassword
              ? "🙈"
              : "👁️"}
          </button>
        </div>

        <label style={rememberRow}>
          <input
            type="checkbox"
            checked={remember}
            onChange={() =>
              setRemember(
                (prev) => !prev
              )
            }
          />

          Remember Me
        </label>

        <div style={forgotWrap}>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/forgot-password"
              )
            }
            style={forgotButton}
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...button,
            opacity: loading
              ? 0.7
              : 1
          }}
        >
          {loading
            ? "🔐 Connecting..."
            : "Login"}
        </button>

        <div style={footer}>
          <Link
            to="/customer-login"
            style={footerLink}
          >
            Customer Portal →
          </Link>
        </div>
      </form>
    </main>
  )
}

/* ---------- STYLES ---------- */

const container = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg,#020617,#0f172a)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  position: "relative",
  overflow: "hidden"
}

const glow = {
  position: "absolute",
  width: 500,
  height: 500,
  background: "#06b6d4",
  filter: "blur(180px)",
  opacity: 0.15
}

const card = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 420,
  background: "rgba(15,23,42,.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(148,163,184,.18)",
  borderRadius: 24,
  padding: 32,
  color: "white",
  boxShadow:
    "0 20px 50px rgba(0,0,0,.35)"
}

const badge = {
  color: "#67e8f9",
  fontSize: 13,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  marginBottom: 12
}

const title = {
  margin: 0,
  fontSize: 40,
  fontWeight: 800
}

const subtitle = {
  color: "#94a3b8",
  lineHeight: 1.7,
  marginTop: 12,
  marginBottom: 24
}

const passwordWrap = {
  position: "relative"
}

const input = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #1e293b",
  background: "#020617",
  color: "white",
  marginBottom: 12,
  boxSizing: "border-box"
}

const eyeButton = {
  position: "absolute",
  right: 14,
  top: 14,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#94a3b8"
}

const rememberRow = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  fontSize: 14,
  marginTop: 4
}

const forgotWrap = {
  textAlign: "right",
  marginTop: 10
}

const forgotButton = {
  background: "transparent",
  border: "none",
  color: "#60a5fa",
  cursor: "pointer"
}

const button = {
  width: "100%",
  marginTop: 18,
  padding: 14,
  borderRadius: 12,
  border: "none",
  background:
    "linear-gradient(90deg,#06b6d4,#2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
}

const errorBox = {
  background:
    "rgba(239,68,68,.12)",
  border:
    "1px solid rgba(239,68,68,.25)",
  color: "#fca5a5",
  padding: 12,
  borderRadius: 10,
  marginTop: 10
}

const footer = {
  marginTop: 20,
  textAlign: "center"
}

const footerLink = {
  color: "#67e8f9",
  textDecoration: "none",
  fontWeight: 600
}