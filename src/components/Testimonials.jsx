const testimonials = [
  {
    name: "Custom Order Customer",
    service: "Laser Engraving",
    quote:
      "The process was easy, professional, and the finished product came out clean.",
    stars: 5
  },
  {
    name: "Small Business Client",
    service: "Branding & Apparel",
    quote:
      "Great communication from design to production. The mockup helped us visualize everything before ordering.",
    stars: 5
  },
  {
    name: "Event Customer",
    service: "Promotional Products",
    quote:
      "The custom items added a professional touch to our event and arrived on schedule.",
    stars: 5
  }
]

export default function Testimonials() {
  return (
    <section className="bg-[#020617] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Client Feedback
          </p>

          <h2 className="mb-5 text-4xl font-bold md:text-5xl">
            Built For Real Projects
          </h2>

          <p className="mx-auto max-w-2xl text-slate-400">
            From custom engraving and apparel printing to branding and event
            products, we focus on quality craftsmanship and customer service
            from concept to completion.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="group rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
            >
              <div className="mb-4 flex text-yellow-400">
                {Array.from({ length: item.stars }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>

              <p className="mb-6 leading-relaxed text-slate-300">
                "{item.quote}"
              </p>

              <div className="border-t border-slate-800 pt-5">
                <p className="font-bold text-white">
                  {item.name}
                </p>

                <p className="mt-1 text-sm text-cyan-300">
                  {item.service}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-slate-500">
            Every project begins with an idea and ends with a finished product
            crafted with precision and purpose.
          </p>
        </div>
      </div>
    </section>
  )
}