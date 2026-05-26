import { useState } from "react"
import { Link } from "react-router-dom"

import FAQSection from "../components/FAQSection"

const galleryItems = [
  {
    title: "Laser Engraved Keychains",
    category: "Laser Engraving",
    image: "/images/gallery/keychains.jpg",
    description: "Custom engraved leather, acrylic, and wood keychains."
  },
  {
    title: "Custom Apparel",
    category: "Apparel",
    image: "/images/gallery/apparel.jpg",
    description: "Shirts, hoodies, hats, team gear, and business apparel."
  },
  {
    title: "Wood Engraving",
    category: "Laser Engraving",
    image: "/images/gallery/wood-engraving.jpg",
    description: "Personalized wood pieces, keepsakes, signs, and decor."
  },
  {
    title: "Business Branding",
    category: "Design",
    image: "/images/gallery/branding.jpg",
    description: "Logos, mockups, branded products, and visual identity pieces."
  },
  {
    title: "Signs & Graphics",
    category: "Signs",
    image: "/images/gallery/signs.jpg",
    description: "Banners, decals, signage, and promotional graphics."
  },
  {
    title: "Event Products",
    category: "Events",
    image: "/images/gallery/events.jpg",
    description: "Custom products for pop-ups, vendors, teams, and events."
  }
]

const filters = [
  "All",
  "Apparel",
  "Laser Engraving",
  "Signs",
  "Design",
  "Events"
]

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredItems =
    activeFilter === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter)

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            SignaVi Studio Gallery
          </p>

          <h1 className="mb-5 text-5xl font-bold leading-tight md:text-7xl">
            Custom Work Built
            <br />
            With Signature Vision
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-400">
            Explore engraving, apparel, signs, branding, and custom production
            work created for gifts, businesses, events, and personal projects.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/quote"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105"
            >
              Request Similar Project
            </Link>

            <Link
              to="/services"
              className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
            >
              View Services
            </Link>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter
                  ? "rounded-full border border-cyan-400 bg-cyan-400 px-5 py-2 font-bold text-black"
                  : "rounded-full border border-slate-700 px-5 py-2 font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
              }
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500"
            >
              <div className="relative h-72 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/image_placeholder/placeholder.png"
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/70 px-4 py-1 text-xs font-semibold text-cyan-300">
                  {item.category}
                </span>
              </div>

              <div className="p-6">
                <h2 className="mb-2 text-2xl font-bold">
                  {item.title}
                </h2>

                <p className="leading-relaxed text-slate-400">
                  {item.description}
                </p>

                <Link
                  to={`/quote?service=${encodeURIComponent(item.category)}`}
                  className="mt-5 inline-flex font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  Start this type of project →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FAQSection />
    </main>
  )
}