const testimonials = [
  {
    name: "Local Business Owner",
    service: "Branding & Apparel Printing",
    quote:
      "SignaVi Studio helped bring our brand to life. From mockups to final production, everything was handled professionally and delivered exactly as expected.",
    stars: 5,
  },
  {
    name: "Custom Gift Customer",
    service: "Laser Engraving",
    quote:
      "The engraving quality exceeded my expectations. The attention to detail and communication throughout the process made everything easy.",
    stars: 5,
  },
  {
    name: "Event Organizer",
    service: "Promotional Products",
    quote:
      "Our event products looked amazing and arrived on time. The finished items gave our event a polished and professional appearance.",
    stars: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="bg-[#020617] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Client Feedback
          </p>

          <h2 className="mb-5 text-4xl font-bold md:text-5xl">
            Trusted By Businesses & Customers
          </h2>

          <p className="mx-auto max-w-3xl text-slate-400">
            We focus on craftsmanship, communication, and quality across every
            project—from laser engraving and apparel printing to branding,
            signage, photography, and promotional products.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={index}
              className="
                group
                rounded-3xl
                border
                border-slate-800
                bg-slate-950/80
                p-8
                shadow-xl
                shadow-black/20
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-cyan-500
                hover:shadow-cyan-500/10
              "
            >
              <div className="mb-5 flex gap-1 text-yellow-400 text-lg">
                {Array.from({ length: item.stars }).map((_, starIndex) => (
                  <span key={starIndex}>★</span>
                ))}
              </div>

              <p className="mb-8 leading-relaxed text-slate-300">
                "{item.quote}"
              </p>

              <div className="border-t border-slate-800 pt-5">
                <p className="font-bold text-white">{item.name}</p>

                <p className="mt-1 text-sm text-cyan-300">
                  {item.service}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-full border border-slate-800 bg-slate-950 px-6 py-3">
            <p className="text-sm text-slate-400">
              From iteration to creation, every project is crafted with
              precision, creativity, and purpose.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}