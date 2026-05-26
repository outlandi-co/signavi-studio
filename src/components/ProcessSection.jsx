const steps = [
  {
    title: "Request Quote",
    description:
      "Tell us about your project, upload artwork, and share your ideas."
  },
  {
    title: "Review & Mockup",
    description:
      "We review details, answer questions, and prepare mockups when needed."
  },
  {
    title: "Approval & Payment",
    description:
      "Approve the design and project details before production begins."
  },
  {
    title: "Production",
    description:
      "Your order is professionally produced with quality control throughout."
  },
  {
    title: "Pickup or Shipping",
    description:
      "Receive your completed order through local pickup or shipment."
  }
]

export default function ProcessSection() {
  return (
    <section className="bg-[#020617] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Our Process
          </p>

          <h2 className="mb-5 text-4xl font-bold md:text-5xl">
            From Idea To Finished Product
          </h2>

          <p className="mx-auto max-w-2xl text-slate-400">
            Every project follows a clear workflow to ensure accuracy,
            communication, and quality from the initial concept to final
            delivery.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-5">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group relative rounded-3xl border border-slate-800 bg-slate-950/80 p-7 text-center shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
                {index + 1}
              </div>

              <h3 className="mb-3 text-lg font-bold">
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="absolute right-[-18px] top-1/2 hidden h-[2px] w-9 -translate-y-1/2 bg-cyan-500/40 lg:block" />
              )}
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8 text-center">
          <h3 className="mb-3 text-2xl font-bold">
            Ready To Start Your Project?
          </h3>

          <p className="mx-auto mb-6 max-w-2xl text-slate-300">
            Whether you need custom apparel, laser engraving, signs,
            photography, branding, or promotional products, SignaVi Studio
            is ready to help bring your vision to life.
          </p>

          <a
            href="/quote"
            className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105"
          >
            Request A Quote
          </a>
        </div>
      </div>
    </section>
  )
}