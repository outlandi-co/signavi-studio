import { useNavigate } from "react-router-dom"
import { useState } from "react"

import ProcessSection from "../components/ProcessSection"
import FeaturedProjects from "../components/FeaturedProjects"
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
    <main style={{ background: "#020617" }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "110px 20px 90px",
          textAlign: "center",
          background:
            "radial-gradient(circle at top right, rgba(6,182,212,.18), transparent 35%), linear-gradient(180deg, #020617, #0f172a)",
          color: "#fff"
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            background: "#06b6d4",
            filter: "blur(180px)",
            opacity: 0.15,
            top: "-150px",
            right: "-100px"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1100px",
            margin: "0 auto"
          }}
        >
          <p
            style={{
              display: "inline-block",
              marginBottom: "18px",
              padding: "8px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,.25)",
              background: "rgba(15,23,42,.7)",
              color: "#67e8f9",
              fontSize: "14px",
              letterSpacing: ".08em",
              textTransform: "uppercase"
            }}
          >
            Veteran Owned Creative Studio
          </p>

          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 82px)",
              fontWeight: "700",
              letterSpacing: "-2px",
              lineHeight: "1.05",
              margin: "0 0 20px"
            }}
          >
            From Iteration
            <br />
            To Creation
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "0 auto",
              fontSize: "20px",
              color: "#94a3b8",
              lineHeight: "1.8"
            }}
          >
            Custom apparel, DTF transfers, laser engraving, signs,
            photography, graphic design, and branded merchandise crafted
            with creativity, precision, and purpose.
          </p>

          <div
            style={{
              marginTop: "40px",
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Tell us what you'd like to create..."
              style={{
                padding: "15px 16px",
                width: "min(420px, 100%)",
                borderRadius: "14px",
                background: "rgba(2,6,23,.85)",
                border: "1px solid rgba(148,163,184,.28)",
                color: "#fff",
                outline: "none",
                boxShadow: "0 12px 30px rgba(0,0,0,.25)"
              }}
            />

            <button
              onClick={handleQuickQuote}
              style={{
                padding: "15px 26px",
                background:
                  "linear-gradient(90deg, #06b6d4, #2563eb)",
                border: "none",
                color: "#fff",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: "700",
                boxShadow: "0 14px 30px rgba(37,99,235,.35)"
              }}
            >
              Start Your Project
            </button>
          </div>

          <div
            style={{
              marginTop: "26px",
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={() => navigate("/store")}
              style={{
                padding: "13px 24px",
                background: "rgba(15,23,42,.75)",
                border: "1px solid rgba(148,163,184,.28)",
                color: "#fff",
                borderRadius: "14px",
                cursor: "pointer"
              }}
            >
              Shop Products
            </button>

            <button
              onClick={() => navigate("/services")}
              style={{
                padding: "13px 24px",
                background:
                  "linear-gradient(90deg, #06b6d4, #2563eb)",
                border: "none",
                color: "#fff",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              View Services
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "26px",
              marginTop: "60px",
              flexWrap: "wrap"
            }}
          >
            {[
              ["Custom", "Apparel & Merch"],
              ["Laser", "Engraving"],
              ["Signs", "Graphics"],
              ["Veteran", "Owned"]
            ].map(([stat, label]) => (
              <div
                key={label}
                style={{
                  minWidth: "170px",
                  padding: "22px",
                  borderRadius: "20px",
                  background: "rgba(15,23,42,.72)",
                  border: "1px solid rgba(148,163,184,.18)",
                  boxShadow: "0 18px 40px rgba(0,0,0,.28)",
                  backdropFilter: "blur(18px)"
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#67e8f9",
                    fontSize: "28px"
                  }}
                >
                  {stat}
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#cbd5e1"
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          background: "#020617",
          padding: "85px 20px",
          color: "#fff"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "50px"
            }}
          >
            <p
              style={{
                color: "#67e8f9",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                fontSize: "14px",
                marginBottom: "12px"
              }}
            >
              What We Create
            </p>

            <h2
              style={{
                fontSize: "clamp(34px, 5vw, 48px)",
                margin: 0
              }}
            >
              Featured Services
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px"
            }}
          >
            {services.map((service) => (
              <div
                key={service.title}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-6px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                }}
                style={{
                  background: "rgba(15,23,42,0.82)",
                  border: "1px solid rgba(148,163,184,.16)",
                  borderRadius: "22px",
                  overflow: "hidden",
                  backdropFilter: "blur(18px)",
                  boxShadow: "0 16px 38px rgba(0,0,0,.28)",
                  transition: "all .3s ease"
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

                <div style={{ padding: "22px" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "22px"
                    }}
                  >
                    {service.title}
                  </h3>

                  <button
                    onClick={() =>
                      navigate(
                        `/quote?service=${encodeURIComponent(
                          service.title
                        )}`
                      )
                    }
                    style={{
                      marginTop: "18px",
                      width: "100%",
                      padding: "13px",
                      borderRadius: "12px",
                      border: "none",
                      background:
                        "linear-gradient(90deg,#06b6d4,#2563eb)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "700"
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

      <FeaturedProjects />

      <section
        style={{
          background:
            "linear-gradient(180deg, #020617, #0f172a)",
          padding: "85px 20px",
          color: "#fff"
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            textAlign: "center",
            padding: "46px 26px",
            borderRadius: "28px",
            background: "rgba(15,23,42,.72)",
            border: "1px solid rgba(148,163,184,.18)",
            boxShadow: "0 22px 50px rgba(0,0,0,.32)",
            backdropFilter: "blur(18px)"
          }}
        >
          <p
            style={{
              color: "#67e8f9",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              fontSize: "14px",
              marginBottom: "12px"
            }}
          >
            Why SignaVi
          </p>

          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 46px)",
              margin: "0 0 20px"
            }}
          >
            Signature Work With A Clear Vision
          </h2>

          <p
            style={{
              maxWidth: "780px",
              margin: "0 auto",
              color: "#94a3b8",
              lineHeight: "1.8",
              fontSize: "18px"
            }}
          >
            SignaVi Studio brings design, production, and customer
            experience together so every project feels intentional from
            concept to finished product.
          </p>
        </div>
      </section>

      <ProcessSection />

      <Testimonials />

      <FAQSection />
    </main>
  )
}

export default Home