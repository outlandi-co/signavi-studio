
import { Link } from "react-router-dom"

export default function AdminShipping() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-3xl font-bold">
          Shipping Management
        </h1>

        <p className="mb-8 text-slate-400">
          Manage shipping settings and calculate
          shipping rates for SignaVi Store.
        </p>

        <Link
          to="/admin/signavi-store/shipping/calculator"
          className="inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
        >
          Open Shipping Calculator
        </Link>
      </div>
    </main>
  )
}
