import useCart from "../hooks/useCart"

function Cart() {
  const { cart, removeFromCart } = useCart()

  return (
    <div className="p-6">
      <h1>Cart</h1>

      {cart.map(item => (
        <div key={item._id}>
          <p>{item.name}</p>
          <p>{item.quantity}</p>

          <button onClick={() => removeFromCart(item._id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

export default Cart