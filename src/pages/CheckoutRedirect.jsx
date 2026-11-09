import { Link, Navigate, useParams } from "react-router-dom"

export default function CheckoutRedirect() {
  const { id } = useParams()

  const validId =
    typeof id === "string" &&
    id.trim().length > 0 &&
    id !== "null" &&
    id !== "undefined"

  if (!validId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-16 text-white">
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
          <h1 className="text-3xl font-extrabold">
            Checkout unavailable
          </h1>
          <p role="alert" className="mt-4 text-slate-300">
            This checkout link does not contain a valid order ID.
          </p>
          <Link
            to="/my-orders"
            className="mt-6 inline-block rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black"
          >
            Back to Orders
          </Link>
        </section>
      </main>
    )
  }

  // This legacy route must never create or initiate a payment.
  // ClientCheckout performs token and signed shipping validation.
  return (
    <Navigate
      to={`/client-checkout/${encodeURIComponent(id)}`}
      replace
    />
  )
}
