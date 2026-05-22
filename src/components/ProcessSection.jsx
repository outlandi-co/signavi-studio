const steps = [
  "Request Quote",
  "Review Details",
  "Approve Mockup",
  "Production",
  "Pickup or Shipping",
]

export default function ProcessSection() {
  return (
    <section className="bg-[#020617] text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-400 uppercase tracking-[0.25em] text-sm font-semibold">
            Process
          </p>

          <h2 className="text-4xl font-bold mt-3">
            From idea to finished product
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-black font-bold">
                {index + 1}
              </div>

              <h3 className="font-semibold">
                {step}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}