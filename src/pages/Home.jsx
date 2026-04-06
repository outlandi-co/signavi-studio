import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Home() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState("")

  const handleQuickQuote = () => {
    if (!idea.trim()) {
      alert("Enter a project idea first")
      return
    }

    // 🔥 Pass idea into submit page
    navigate("/submit", {
      state: { idea }
    })
  }

  return (
    <div>
      <section
        style={{
          padding: "100px 20px",
          textAlign: "center",
          background: "linear-gradient(180deg, #020617, #0f172a)",
          color: "#fff"
        }}
      >
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "600",
            letterSpacing: "-1px"
          }}
        >
          Signavi Studio
        </h1>

        <p
          style={{
            fontSize: "20px",
            marginTop: "10px",
            color: "#94a3b8"
          }}
        >
          Custom Apparel • DTF Transfers • Laser Engraving
        </p>

        {/* 🔥 QUICK QUOTE INPUT */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          <input
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your project (e.g. 50 black shirts with logo)..."
            style={{
              padding: "14px",
              width: "300px",
              borderRadius: "10px",
              background: "#020617",
              border: "1px solid #334155",
              color: "#fff",
              outline: "none"
            }}
          />

          <button
            onClick={handleQuickQuote}
            style={{
              padding: "14px 24px",
              background: "linear-gradient(90deg, #06b6d4, #2563eb)",
              border: "none",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow:
                "0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(37,99,235,0.3)"
            }}
          >
            Get Quote
          </button>
        </div>

        {/* ORIGINAL BUTTONS */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => navigate("/store")}
            style={{
              padding: "12px 24px",
              background: "#020617",
              border: "1px solid #334155",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Shop Products
          </button>

          <button
            onClick={() => navigate("/submit")}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(90deg, #06b6d4, #2563eb)",
              border: "none",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Full Quote Form
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home