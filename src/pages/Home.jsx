import { useNavigate } from "react-router-dom"
import { useState } from "react"

import ProcessSection from "../components/ProcessSection"
import Testimonials from "../components/Testimonials"
import FAQSection from "../components/FAQSection"

function Home() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState("")

  const handleQuickQuote = () => {
    if (!idea.trim()) {
      alert("Enter a project idea first")
      return
    }

    navigate("/quote", {
      state: { idea }
    })
  }

  const services = [
    {
      title: "Laser Engraving",
      image: "/images/services/engraving.jpg"
    },
    {
      title: "Custom Apparel",
      image: "/images/services/apparel.jpg"
    },
    {
      title: "Signs & Graphics",
      image: "/images/services/signs.jpg"
    },
    {
      title: "Graphic Design",
      image: "/images/services/design.jpg"
    }
  ]

  return (
    <main>
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
          SignaVi Studio
        </h1>

        <p
          style={{
            fontSize: "20px",
            marginTop: "10px",
            color: "#94a3b8"
          }}
        >
          From iteration to creation.
        </p>

        <p
          style={{
            maxWidth: "700px",
            margin: "20px auto",
            color: "#cbd5e1",
            lineHeight: "1.7"
          }}
        >
          Custom Apparel • DTF Transfers • Laser Engraving • Graphic Design •
          Signs • Photography • 
        </p>

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
            placeholder="Describe your project..."
            style={{
              padding: "14px",
              width: "320px",
              borderRadius: "10px",
              background: "#020617",
              border: "1px solid #334155",
              color: "#fff"
            }}
          />

          <button
            onClick={handleQuickQuote}
            style={{
              padding: "14px 24px",
              background:
                "linear-gradient(90deg, #06b6d4, #2563eb)",
              border: "none",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Get Quote
          </button>
        </div>

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
            onClick={() => navigate("/services")}
            style={{
              padding: "12px 24px",
              background:
                "linear-gradient(90deg, #06b6d4, #2563eb)",
              border: "none",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            View Services
          </button>
        </div>
      </section>

      {/* SERVICES PREVIEW */}

      <section
        style={{
          background: "#020617",
          padding: "80px 20px",
          color: "#fff"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "40px",
              marginBottom: "50px"
            }}
          >
            Featured Services
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "24px"
            }}
          >
            {services.map((service) => (
              <div
                key={service.title}
                style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "20px",
                  overflow: "hidden"
                }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "/image_placeholder/placeholder.png"
                  }}
                />

                <div style={{ padding: "20px" }}>
                  <h3>{service.title}</h3>

                  <button
                    onClick={() =>
                      navigate(
                        `/quote?service=${encodeURIComponent(
                          service.title
                        )}`
                      )
                    }
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background:
                        "linear-gradient(90deg,#06b6d4,#2563eb)",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />

      <Testimonials />

      <FAQSection />
    </main>
  )
}

export default Home