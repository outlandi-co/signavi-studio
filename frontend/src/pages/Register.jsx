import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Register() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const handleChange = (e) => {

    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))

  }

  const register = async () => {

    try {

      await api.post("/auth/register", form)

      alert("Account created")

      navigate("/login")

    } catch (error) {

      console.error(error)

    }

  }

  return (

    <div style={{ maxWidth: "400px", margin: "80px auto" }}>

      <h1>Create Account</h1>

      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />

      <button onClick={register}>
        Register
      </button>

    </div>

  )

}

export default Register