import { Link } from "react-router-dom"

import ProcessSection from "../components/ProcessSection"
import FAQSection from "../components/FAQSection"

const services = [
  {
    title: "Laser Engraving",
    icon: "🔥",
    description:
      "Custom engraving for leather, wood, acrylic, tumblers, awards, gifts, and promotional products.",
  },
  {
    title: "Custom Apparel Printing",
    icon: "👕",
    description:
      "Shirts, hoodies, hats, uniforms, team apparel, and branded merchandise.",
  },
  {
    title: "Graphic Design & Branding",
    icon: "🎨",
    description:
      "Logos, brand identity, marketing graphics, mockups, and promotional materials.",
  },
  {
    title: "Signs & Banners",
    icon: "🪧",
    description:
      "Business signage, event banners, decals, stickers, and promotional displays.",
  },
  {
    title: "Photography",
    icon: "📸",
    description:
      "Portraits, products, events, real estate, branding, and commercial photography.",
  },
  {
    title: "Videography",
    icon: "🎥",
    description:
      "Promotional videos, business content, social media videos, and event coverage.",
  },
  /*
{
  title: "Drone Services",
  icon: "🚁",
  description:
    "Aerial photography, aerial video, inspections, real estate, and promotional footage.",
},
*/
  {
    title: "Web Design & Development",
    icon: "💻",
    description:
      "Custom websites, e-commerce stores, UX/UI design, and web applications.",
  },
  {
    title: "Promotional Products",
    icon: "🎁",
    description:
      "Branded giveaways, event products, engraved merchandise, and custom gifts.",
  },
  /*
{
  title: "3D Printing",
  icon: "🖨️",
  description:
    "Prototype development, custom parts, cosplay items, and personalized creations.",
},
*/
]

export default function Services() {
  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-14">
      <section className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-cyan-400 uppercase tracking-[0.25em] font-semibold mb-3">
            SignaVi Studio Services
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Creative Services From Concept To Creation
          </h1>

          <p className="text-slate-300 max-w-3xl mx-auto">
            From laser engraving and apparel printing to branding, photography,
            drone services, and web development, SignaVi Studio helps transform
            ideas into professional products and experiences.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-slate-800 bg-slate-950 p-8 hover:border-cyan-500 transition-all"
            >
              <div className="text-5xl mb-5">
                {service.icon}
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {service.title}
              </h2>

              <p className="text-slate-400 mb-6">
                {service.description}
              </p>

              <Link
                to={`/quote?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center rounded-full bg-cyan-500 px-5 py-3 font-semibold text-black hover:bg-cyan-400 transition"
              >
                Request Quote
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-20 text-center rounded-3xl border border-slate-800 bg-slate-950 p-12">
          <h2 className="text-3xl font-bold mb-4">
            Need Something Custom?
          </h2>

          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Every project is unique. Tell us about your vision and we&apos;ll help
            create a solution tailored specifically to your needs.
          </p>

          <Link
            to="/quote"
            className="inline-flex rounded-full bg-cyan-500 px-8 py-4 text-black font-bold hover:bg-cyan-400 transition"
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