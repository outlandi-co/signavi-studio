import { Link } from "react-router-dom"

import FAQSection from "../components/FAQSection"

const galleryItems = [
  {
    title: "Laser Engraved Keychains",
    category: "Laser Engraving",
    image: "/images/gallery/keychains.jpg",
    description: "Custom engraved leather, acrylic, and wood keychains.",
  },
  {
    title: "Custom Apparel",
    category: "Apparel Printing",
    image: "/images/gallery/apparel.jpg",
    description: "Shirts, hoodies, hats, team gear, and business apparel.",
  },
  {
    title: "Wood Engraving",
    category: "Custom Gifts",
    image: "/images/gallery/wood-engraving.jpg",
    description: "Personalized wood pieces, keepsakes, signs, and decor.",
  },
  {
    title: "Business Branding",
    category: "Design & Branding",
    image: "/images/gallery/branding.jpg",
    description: "Logos, mockups, branded products, and visual identity pieces.",
  },
  {
    title: "Signs & Graphics",
    category: "Signs",
    image: "/images/gallery/signs.jpg",
    description: "Banners, decals, signage, and promotional graphics.",
  },
  {
    title: "Event Products",
    category: "Events",
    image: "/images/gallery/events.jpg",
    description: "Custom products for pop-ups, vendors, teams, and events.",
  },
]

export default function Gallery() {
  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-14">
      <section className="max-w-7xl mx-auto">
        <div className="mb-12 max-w-3xl">
          <p className="text-cyan-400 uppercase tracking-[0.25em] text-sm font-semibold mb-3">
            SignaVi Studio Gallery
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-5">
            Custom work built with signature vision.
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Explore examples of engraving, apparel printing, signs, branding,
            and custom production work created for gifts, businesses, events,
            and personal projects.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/quote"
              className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 transition"
            >
              Request a Similar Project
            </Link>

            <Link
              to="/services"
              className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-white hover:border-cyan-400 hover:text-cyan-300 transition"
            >
              View Services
            </Link>
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-xl shadow-black/20"
            >
              <div className="relative h-64 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/image_placeholder/placeholder.png"
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-4 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
                  {item.category}
                </span>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {item.title}
                </h2>

                <p className="text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <Link
                  to={`/quote?service=${encodeURIComponent(item.category)}`}
                  className="mt-5 inline-flex text-cyan-300 font-semibold hover:text-cyan-200 transition"
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