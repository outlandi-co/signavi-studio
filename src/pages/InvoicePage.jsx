import { Link, useParams } from "react-router-dom"

export default function InvoicePage() {
  const { id } = useParams()

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div
          className="
            w-full
            max-w-2xl
            rounded-3xl
            border
            border-slate-800
            bg-slate-950/80
            p-10
            text-center
            shadow-2xl
            shadow-black/30
          "
        >
          <div
            className="
              mx-auto
              mb-6
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-emerald-500/20
              text-5xl
            "
          >
            ✅
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Payment Received
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Thank you for your payment. Your invoice has been received and
            is being processed. You will receive confirmation and project
            updates by email.
          </p>

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-slate-800
              bg-[#020617]
              p-6
            "
          >
            <p className="mb-2 text-sm uppercase tracking-[0.15em] text-slate-500">
              Invoice ID
            </p>

            <p className="break-all text-xl font-bold text-cyan-300">
              {id}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link
              to={`/invoice/${id}/download`}
              className="
                rounded-2xl
                bg-cyan-500
                px-5
                py-4
                font-bold
                text-black
                transition
                hover:bg-cyan-400
              "
            >
              📄 Download Invoice
            </Link>

            <Link
              to="/dashboard"
              className="
                rounded-2xl
                border
                border-slate-700
                px-5
                py-4
                font-bold
                text-slate-200
                transition
                hover:border-cyan-400
                hover:text-cyan-300
              "
            >
              📦 My Orders
            </Link>

            <Link
              to="/"
              className="
                rounded-2xl
                border
                border-slate-700
                px-5
                py-4
                font-bold
                text-slate-200
                transition
                hover:border-cyan-400
                hover:text-cyan-300
              "
            >
              🏠 Return Home
            </Link>
          </div>

          <div
            className="
              mt-10
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              p-5
              text-left
            "
          >
            <h3 className="mb-3 text-lg font-bold text-emerald-300">
              What Happens Next?
            </h3>

            <ul className="space-y-2 text-slate-300">
              <li>✓ Payment confirmation is recorded.</li>
              <li>✓ Your project moves into production.</li>
              <li>✓ Status updates will appear in your customer dashboard.</li>
              <li>✓ Tracking information will be sent once shipped.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}