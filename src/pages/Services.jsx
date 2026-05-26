import { Link } from "react-router-dom"

import ProcessSection from "../components/ProcessSection"
import FAQSection from "../components/FAQSection"

const services = [
  {
    title: "Laser Engraving",
    icon: "🔥",
    startingAt: "$25",
    description:
      "Custom engraving for leather, wood, acrylic, tumblers, awards, gifts, and promotional products.",
    features: [
      "Tumblers & drinkware",
      "Leather patches",
      "Wood & acrylic gifts"
    ]
  },
  {
    title: "Custom Apparel Printing",
    icon: "👕",
    startingAt: "$18",
    description:
      "Shirts, hoodies, hats, uniforms, team apparel, and branded merchandise.",
    features: [
      "Business shirts",
      "Event apparel",
      "Team merchandise"
    ]
  },
  {
    title: "Graphic Design & Branding",
    icon: "🎨",
    startingAt: "$75",
    description:
      "Logos, brand identity, marketing graphics, mockups, and promotional materials.",
    features: [
      "Logo design",
      "Brand layouts",
      "Product mockups"
    ]
  },
  {
    title: "Signs & Banners",
    icon: "🪧",
    startingAt: "$45",
    description:
      "Business signage, event banners, decals, stickers, and promotional displays.",
    features: [
      "Banners",
      "Decals",
      "Event signs"
    ]
  },
  {
    title: "Photography",
    icon: "📸",
    startingAt: "$150",
    description:
      "Portraits, products, events, real estate, branding, and commercial photography.",
    features: [
      "Product photos",
      "Brand portraits",
      "Event coverage"
    ]
  },
  {
    title: "Web Design & Development",
    icon: "💻",
    startingAt: "$500",
    description:
      "Custom websites, e-commerce stores, UX/UI design, and web applications.",
    features: [
      "Business websites",
      "E-commerce stores",
      "UX/UI design"
    ]
  },
  {
    title: "Promotional Products",
    icon: "🎁",
    startingAt: "$35",
    description:
      "Branded giveaways, event products, engraved merchandise, and custom gifts.",
    features: [
      "Event giveaways",
      "Custom gifts",
      "Branded merch"
    ]
  }
]

export default function Services() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-semibold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio Services
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Creative Services
            <br />
            From Concept To Creation
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-400">
            From laser engraving and apparel printing to branding,
            photography, signs, and web design, SignaVi Studio helps transform
            ideas into professional products and experiences.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="text-5xl">
                  {service.icon}
                </div>

                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Starting At
                  </p>

                  <p className="text-2xl font-bold text-cyan-300">
                    {service.startingAt}
                  </p>
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold">
                {service.title}
              </h2>

              <p className="mb-6 leading-relaxed text-slate-400">
                {service.description}
              </p>

              <div className="mb-7 space-y-3">
                {service.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/10 text-xs text-cyan-300">
                      ✓
                    </span>

                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/quote?service=${encodeURIComponent(service.title)}`}
                className="inline-flex w-full justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105"
              >
                Request Quote
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-10 text-center shadow-xl shadow-black/20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Custom Projects Welcome
          </p>

          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Need Something Built Around Your Idea?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-slate-300">
            Every project is different. Share your vision, timeline, quantity,
            and artwork so we can review the details and prepare a quote that
            fits your needs.
          </p>

          <Link
            to="/quote"
            className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105"
          >
            Start Your Project
          </Link>
        </div>
      </section>

      <ProcessSection />
      <FAQSection />
    </main>
  )
}