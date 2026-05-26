const faqs = [
  {
    question: "Do you provide design mockups or proofs?",
    answer:
      "Yes. Digital mockups or proofs are provided when needed so you can review and approve your design before production begins."
  },
  {
    question: "Do you accept bulk orders?",
    answer:
      "Yes. We handle everything from single custom pieces to larger production runs for businesses, teams, events, and organizations."
  },
  {
    question: "What file formats do you accept?",
    answer:
      "We commonly accept AI, SVG, PDF, EPS, PSD, PNG, JPG, and other standard design formats. If you're unsure, send your file and we'll review it."
  },
  {
    question: "Can I order just one item?",
    answer:
      "Yes. Some services can be produced as single custom items, while others may require minimum quantities depending on the product and production method."
  },
  {
    question: "Do you offer local pickup or shipping?",
    answer:
      "Yes. Orders can be arranged for local pickup in the Merced area or shipped when available."
  },
  {
    question: "How long does production take?",
    answer:
      "Production timelines vary depending on the service, quantity, artwork approval, and material availability. Rush services may be available for some projects."
  },
  {
    question: "Do I need artwork ready before requesting a quote?",
    answer:
      "No. If you already have artwork, great. If not, we can discuss design options and help create graphics that fit your project."
  },
  {
    question: "Do you offer shipping nationwide?",
    answer:
      "Many products can be shipped throughout the United States. Shipping costs and delivery times vary depending on size, weight, and destination."
  },
  {
    question: "Do you offer discounts for larger quantities?",
    answer:
      "Yes. Many products qualify for quantity discounts. Pricing is typically reduced as order volume increases."
  }
]

export default function FAQSection() {
  return (
    <section className="bg-[#020617] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Frequently Asked Questions
          </p>

          <h2 className="mb-5 text-4xl font-bold md:text-5xl">
            Answers Before You Start
          </h2>

          <p className="mx-auto max-w-2xl text-slate-400">
            Have questions about ordering, artwork, production, or shipping?
            Here are some of the most common questions customers ask before
            starting a project.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-lg shadow-black/20 transition-all hover:border-cyan-500"
            >
              <summary className="cursor-pointer list-none font-semibold text-white">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg">
                    {faq.question}
                  </span>

                  <span className="text-cyan-400 transition group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>

              <p className="mt-4 leading-relaxed text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8 text-center">
          <h3 className="mb-3 text-2xl font-bold">
            Still Have Questions?
          </h3>

          <p className="mx-auto mb-6 max-w-2xl text-slate-300">
            Every project is unique. Contact SignaVi Studio and we'll help
            determine the best solution for your apparel, engraving,
            photography, signage, branding, or promotional product needs.
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