const faqs = [
  {
    question: "Do you provide design mockups or proofs?",
    answer:
      "Yes. Mockups or proofs are provided when needed before production begins.",
  },
  {
    question: "Do you accept bulk orders?",
    answer:
      "Yes. SignaVi Studio can handle small custom orders and larger bulk production orders.",
  },
  {
    question: "What file formats do you accept?",
    answer:
      "Common file types include AI, SVG, PDF, PNG, JPG, PSD, and other design formats.",
  },
  {
    question: "Do you offer local pickup or shipping?",
    answer:
      "Yes. Orders can be arranged for local pickup or shipped when available.",
  },
  {
    question: "How long does production take?",
    answer:
      "Production time depends on the service, quantity, material availability, and approval process.",
  },
]

export default function FAQSection() {
  return (
    <section className="bg-[#020617] text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-cyan-400 uppercase tracking-[0.25em] text-sm font-semibold">
            Questions
          </p>

          <h2 className="text-4xl font-bold mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <summary className="cursor-pointer font-semibold text-white">
                {faq.question}
              </summary>

              <p className="text-slate-400 mt-3 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}