const testimonials = [
  {
    name: "Custom Order Customer",
    quote:
      "The process was easy, professional, and the finished product came out clean.",
  },
  {
    name: "Small Business Client",
    quote:
      "Great communication from design to production. The mockup helped a lot.",
  },
  {
    name: "Event Customer",
    quote:
      "The custom items added a professional touch to our event.",
  },
]

export default function Testimonials() {
  return (
    <section className="bg-[#020617] text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-cyan-400 uppercase tracking-[0.25em] text-sm font-semibold">
            Trust
          </p>

          <h2 className="text-4xl font-bold mt-3">
            Built for real projects
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-slate-800 bg-slate-950 p-7"
            >
              <p className="text-slate-300 leading-relaxed">
                “{item.quote}”
              </p>

              <p className="mt-5 font-semibold text-cyan-300">
                {item.name}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}