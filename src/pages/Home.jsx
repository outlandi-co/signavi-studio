import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()

  return (
    <div>
      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
          background: "#111",
          color: "#fff"
        }}
      >
        <h1 style={{ fontSize: "48px" }}>
          Signavi Studio
        </h1>

        <p style={{ fontSize: "20px", marginTop: "10px" }}>
          Custom Apparel • DTF Transfers • Laser Engraving
        </p>

        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => navigate("/store")}
            style={{
              padding: "12px 24px",
              marginRight: "10px",
              background: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Shop Products
          </button>

          <button
            onClick={() => navigate("/submit")}
            style={{
              padding: "12px 24px",
              background: "#0077ff",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Request Quote
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home