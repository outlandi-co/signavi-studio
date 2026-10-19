
import { Link, useParams } from "react-router-dom"

export default function InvoicePage() {
  const { id } = useParams()

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-2xl shadow-black/30">

          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10">
            <span className="text-5xl text-cyan-400">
              ⏳
            </span>
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Payment Status
          </h1>

          <p className="mt-5 text-xl font-semibold text-cyan-300">
            Payment Not Yet Verified
          </p>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">
            You have returned from the payment process.
            If you submitted a payment, please allow time
            for SignaVi Studio to verify the transaction.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
            Returning to this page does not by itself
            confirm that payment was successful.
            Your order will not enter production until
            the required payment and final artwork
            approval have been verified.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-[#020617] p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.15em] text-slate-500">
              Invoice Reference
            </p>

            <p className="break-all text-xl font-bold text-cyan-300">
              {id}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              to="/dashboard"
              className="rounded-2xl border border-slate-700 px-5 py-4 font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              My Account
            </Link>

            <Link
              to="/"
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-black transition hover:bg-cyan-400"
            >
              Return Home
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-[#020617] p-5 text-left">
            <h2 className="mb-3 text-lg font-bold text-white">
              What Happens Next?
            </h2>

            <p className="leading-7 text-slate-300">
              SignaVi Studio must confirm the payment
              and verify the approved final proof before
              production can begin. If you need assistance,
              please contact our team.
            </p>
          </div>

        </div>
      </section>
    </main>
  )
}
