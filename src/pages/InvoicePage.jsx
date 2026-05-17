import { Link, useParams } from "react-router-dom"

export default function InvoicePage() {
  const { id } = useParams()

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: "2rem"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "#fff",
          borderRadius: "18px",
          padding: "3rem",
          textAlign: "center",
          boxShadow: "0 12px 35px rgba(0,0,0,0.08)"
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            color: "#111"
          }}
        >
          Payment Received
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "#444",
            marginBottom: "1rem"
          }}
        >
          Thank you. Your invoice payment has been received or is being processed.
        </p>

        <p
          style={{
            color: "#666",
            marginBottom: "2rem",
            wordBreak: "break-word"
          }}
        >
          Invoice ID:
          <br />
          <strong>{id}</strong>
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            background: "#111",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "700"
          }}
        >
          Return Home
        </Link>
      </section>
    </main>
  )
}