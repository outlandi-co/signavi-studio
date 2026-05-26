import { Link } from "react-router-dom"

export default function ContactCTA() {
  return (
    <section className="bg-[#020617] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-10 text-center shadow-xl shadow-black/20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Ready To Start?
        </p>

        <h2 className="mb-5 text-4xl font-bold">
          Let's Build Something Great
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-slate-300">
          Whether you need custom apparel, laser engraving, signs,
          photography, graphic design, websites, or promotional products,
          SignaVi Studio is ready to help bring your vision to life.
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-4 text-sm">
          <span className="rounded-full border border-slate-700 px-4 py-2">
            Veteran Owned
          </span>

          <span className="rounded-full border border-slate-700 px-4 py-2">
            Local Pickup Available
          </span>

          <span className="rounded-full border border-slate-700 px-4 py-2">
            Shipping Available
          </span>

          <span className="rounded-full border border-slate-700 px-4 py-2">
            Custom Design Support
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/quote"
            className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105"
          >
            Request Quote
          </Link>

          <Link
            to="/gallery"
            className="rounded-full border border-slate-700 px-8 py-4 font-bold text-white transition hover:border-cyan-400"
          >
            View Gallery
          </Link>
        </div>
      </div>
    </section>
  )
}