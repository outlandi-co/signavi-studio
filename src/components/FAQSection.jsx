const faqs = [
  {
    question: "Do you provide design mockups?",
    answer:
      "Yes. Mockups and proofs are provided when applicable before production begins."
  },
  {
    question: "Do you ship orders?",
    answer:
      "Yes. Orders can be shipped throughout the United States or arranged for local pickup."
  },
  {
    question: "Do you accept bulk orders?",
    answer:
      "Yes. We handle both small and large production runs."
  },
  {
    question: "What file formats do you accept?",
    answer:
      "AI, SVG, PDF, PNG, JPG, PSD and most common design formats."
  },
  {
    question: "How long does production take?",
    answer:
      "Production times vary by project size and materials. Most projects receive an estimated completion date during quoting."
  }
]

export default function FAQSection() {
  return (
    <section className="max-w-5xl mx-auto py-20 px-6">
      <h2 className="text-4xl font-bold mb-10 text-center">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <summary className="cursor-pointer font-semibold text-white">
              {faq.question}
            </summary>

            <p className="text-slate-400 mt-3">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}