import { useParams } from "react-router-dom"

export default function Checkout() {
  const { id } = useParams()

  return (
    <div style={{ padding:40, textAlign:"center" }}>
      <h1>Checkout</h1>
      <p>Order: {id}</p>

      <button>
        💳 Pay Now
      </button>
    </div>
  )
}