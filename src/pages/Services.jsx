import { Link } from "react-router-dom"

import ProcessSection from "../components/ProcessSection"
import FAQSection from "../components/FAQSection"


const services = [
  {
    title: "Screen Printing",
    icon: "🖨️",
    startingAt: "$12",
    disabled: true,
    status: "Coming Soon",
    description:
      "Professional screen printing for shirts, hoodies, uniforms, schools, events, teams, and businesses.",
    features: [
      "1–6 color prints",
      "Bulk discounts",
      "Business apparel"
    ]
  },
  {
  title: "DTF Transfers",
  icon: "🎽",
  startingAt: "$5",
  disabled: true,
  status: "Coming Soon",
  description:
    "High-quality full-color DTF transfers ready to press onto apparel, merch, uniforms, and custom orders.",
  features: [
    "Gang sheets",
    "Full color graphics",
    "Fast turnaround"
  ]
},
  {
    title: "Laser Engraving",
    icon: "🔥",
    startingAt: "$15",
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
    startingAt: "$12",
    description:
      "Shirts, hoodies, hats, uniforms, team apparel, and branded merchandise for businesses and events.",
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
      "Logos, brand identity, marketing graphics, mockups, layouts, and promotional materials.",
    features: [
      "Logo design",
      "Brand layouts",
      "Product mockups"
    ]
  },
  {
    title: "Signs & Banners",
    icon: "🪧",
    startingAt: "$35",
    description:
      "Business signage, event banners, decals, stickers, promotional displays, and graphics.",
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
      "Portraits, products, events, branding, real estate, and commercial photography.",
    features: [
      "Product photos",
      "Brand portraits",
      "Event coverage"
    ]
  },
  {
    title: "Real Estate Media",
    icon: "🏡",
    startingAt: "$199",
    description:
      "Photography, video walkthroughs, and marketing media for real estate listings and property promotion.",
    features: [
      "MLS photos",
      "Video walkthroughs",
      "Social media content"
    ]
  },
  {
    title: "Web Design & Development",
    icon: "💻",
    startingAt: "$500",
    description:
      "Custom websites, e-commerce stores, UX/UI design, frontend builds, and web applications.",
    features: [
      "Business websites",
      "E-commerce stores",
      "UX/UI design"
    ]
  },
  {
    title: "Promotional Products",
    icon: "🎁",
    startingAt: "$15",
    description:
      "Branded giveaways, event products, engraved merchandise, and custom gifts for businesses and teams.",
    features: [
      "Event giveaways",
      "Custom gifts",
      "Branded merch"
    ]
  }
]


const stats = [
  "Veteran Owned",
  "Fast Turnaround",
  "Custom Projects",
  "Local & Nationwide"
]


export default function Services() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">

        {/* HERO */}
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
            From screen printing, DTF transfers, and laser engraving to
            branding, photography, signs, and web design, SignaVi Studio helps
            transform ideas into professional products and experiences.
          </p>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-4 text-center shadow-xl shadow-black/20"
              >
                <p className="font-bold text-cyan-300">
                  {stat}
                </p>
              </div>
            ))}
          </div>
        </div>


        {/* CATEGORIES */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {[
            "Printing",
            "Engraving",
            "Design",
            "Photography",
            "Web",
            "Promotional"
          ].map((category) => (
            <span
              key={category}
              className="rounded-full border border-slate-700 bg-[#020617] px-4 py-2 text-sm font-semibold text-slate-300"
            >
              {category}
            </span>
          ))}
        </div>


        {/* SERVICES */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              aria-disabled={service.disabled || undefined}
              className={`relative rounded-3xl border p-8 shadow-xl shadow-black/20 transition-all duration-300 ${
                service.disabled
                  ? "cursor-not-allowed border-slate-800 bg-slate-950/60 opacity-50 grayscale"
                  : "group border-slate-800 bg-slate-950/80 hover:-translate-y-1 hover:border-cyan-500"
              }`}
            >

              {/* COMING SOON BADGE */}
              {service.disabled && (
                <div className="absolute right-5 top-5 rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-300">
                  {service.status || "Unavailable"}
                </div>
              )}


              {/* ICON + PRICE */}
              <div className="mb-5 flex items-center justify-between gap-4">

                <div className="text-5xl">
                  {service.icon}
                </div>

                <div
                  className={`rounded-2xl border px-4 py-3 text-right ${
                    service.disabled
                      ? "border-slate-700 bg-slate-800/40"
                      : "border-cyan-400/30 bg-cyan-400/10"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {service.disabled ? "Status" : "Starting At"}
                  </p>

                  <p
                    className={`font-bold ${
                      service.disabled
                        ? "text-lg text-slate-400"
                        : "text-2xl text-cyan-300"
                    }`}
                  >
                    {service.disabled
                      ? service.status || "Unavailable"
                      : service.startingAt}
                  </p>
                </div>

              </div>


              {/* TITLE */}
              <h2 className="mb-4 text-2xl font-bold">
                {service.title}
              </h2>


              {/* DESCRIPTION */}
              <p className="mb-6 leading-relaxed text-slate-400">
                {service.description}
              </p>


              {/* FEATURES */}
              <div className="mb-7 space-y-3">
                {service.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        service.disabled
                          ? "bg-slate-800 text-slate-500"
                          : "bg-cyan-400/10 text-cyan-300"
                      }`}
                    >
                      ✓
                    </span>

                    <span>{feature}</span>
                  </div>
                ))}
              </div>


              {/* BUTTONS */}
              <div className="grid gap-3 sm:grid-cols-2">

                {service.disabled ? (
                  <>
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-full bg-slate-800 px-5 py-3 font-bold text-slate-500"
                    >
                      Coming Soon
                    </button>

                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-full border border-slate-800 px-5 py-3 font-bold text-slate-600"
                    >
                      View Work
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/quote?service=${encodeURIComponent(
                        service.title
                      )}`}
                      className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105"
                    >
                      Request Quote
                    </Link>

                    <Link
                      to="/gallery"
                      className="inline-flex justify-center rounded-full border border-slate-700 px-5 py-3 font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                    >
                      View Work
                    </Link>
                  </>
                )}

              </div>
            </article>
          ))}
        </div>


        {/* CUSTOM PROJECT CTA */}
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