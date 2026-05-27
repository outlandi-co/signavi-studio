import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

import ProcessSection from "../components/ProcessSection"
import FeaturedProjects from "../components/FeaturedProjects"
import Testimonials from "../components/Testimonials"
import FAQSection from "../components/FAQSection"

const services = [
  {
    title: "Laser Engraving",
    image: "/images/services/engraving.jpg",
    description:
      "Tumblers, leather patches, wood, acrylic, keychains, awards, and custom gifts."
  },
  {
    title: "Custom Apparel",
    image: "/images/services/apparel.jpg",
    description:
      "DTF transfers, shirts, hoodies, hats, team gear, uniforms, and branded merch."
  },
  {
    title: "Signs & Graphics",
    image: "/images/services/signs.jpg",
    description:
      "Business signage, banners, decals, pop-up event graphics, and promotional displays."
  },
  {
    title: "Graphic Design",
    image: "/images/services/design.jpg",
    description:
      "Logos, brand identity, layout design, product mockups, and marketing graphics."
  }
]

const stats = [
  ["Custom", "Apparel & Merch"],
  ["Laser", "Engraving"],
  ["Signs", "Graphics"],
  ["Veteran", "Owned"]
]

export default function Home() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState("")

  const handleQuickQuote = () => {
    if (!idea.trim()) {
      toast.error("Enter a project idea first")
      return
    }

    navigate("/quote", {
      state: {
        idea: idea.trim()
      }
    })
  }

  return (
    <main className="bg-[#020617] text-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.18),transparent_35%),linear-gradient(180deg,#020617,#0f172a)] px-6 py-28 text-center md:py-32">
        <div className="absolute -right-24 -top-36 h-[500px] w-[500px] rounded-full bg-cyan-400 opacity-15 blur-[180px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-5 inline-block rounded-full border border-slate-500/25 bg-slate-900/70 px-4 py-2 text-sm uppercase tracking-[0.18em] text-cyan-300">
            Veteran Owned Creative Studio
          </p>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] md:text-7xl lg:text-8xl">
            From Iteration
            <br />
            To Creation
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
            Custom apparel, DTF transfers, laser engraving, signs,
            photography, graphic design, and branded merchandise crafted with
            creativity, precision, and purpose.
          </p>

          <div className="mx-auto mt-10 flex max-w-2xl flex-col justify-center gap-3 sm:flex-row">
            <input
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleQuickQuote()
                }
              }}
              placeholder="Tell us what you'd like to create..."
              className="w-full rounded-2xl border border-slate-500/30 bg-[#020617]/90 px-5 py-4 text-white shadow-xl shadow-black/25 outline-none transition focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={handleQuickQuote}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/30 transition hover:scale-[1.02]"
            >
              Start Your Project
            </button>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/store")}
              className="rounded-2xl border border-slate-500/30 bg-slate-900/75 px-6 py-3 text-white transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Shop Products
            </button>

            <button
              type="button"
              onClick={() => navigate("/services")}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 font-bold text-white transition hover:scale-[1.02]"
            >
              View Services
            </button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {stats.map(([stat, label]) => (
              <div
                key={`${stat}-${label}`}
                className="min-w-[170px] rounded-3xl border border-slate-500/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                <h2 className="text-3xl font-black text-cyan-300">
                  {stat}
                </h2>

                <p className="mt-2 text-slate-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020617] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.18em] text-cyan-300">
              What We Create
            </p>

            <h2 className="text-4xl font-extrabold md:text-5xl">
              Featured Services
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Choose a service, send the idea, and SignaVi Studio can turn it
              into a quote-ready project.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.title}
                className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-2 hover:border-cyan-500"
              >
                <div className="h-56 overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.src =
                        "/image_placeholder/placeholder.png"
                    }}
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold">
                    {service.title}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
                    {service.description}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/quote?service=${encodeURIComponent(service.title)}`
                      )
                    }
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02]"
                  >
                    Request Quote
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProjects />

      <section className="bg-gradient-to-b from-[#020617] to-[#0f172a] px-6 py-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-500/20 bg-slate-900/70 px-6 py-14 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-cyan-300">
            Why SignaVi
          </p>

          <h2 className="text-4xl font-extrabold md:text-5xl">
            Signature Work With A Clear Vision
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            SignaVi Studio brings design, production, and customer experience
            together so every project feels intentional from concept to
            finished product.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/gallery")}
              className="rounded-2xl border border-slate-600 px-6 py-3 font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              View Gallery
            </button>

            <button
              type="button"
              onClick={() => navigate("/quote")}
              className="rounded-2xl bg-cyan-500 px-6 py-3 font-black text-black transition hover:bg-cyan-400"
            >
              Start a Quote
            </button>
          </div>
        </div>
      </section>

      <ProcessSection />

      <Testimonials />

      <FAQSection />
    </main>
  )
}