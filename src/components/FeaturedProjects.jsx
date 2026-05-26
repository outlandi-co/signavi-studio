import { Link } from "react-router-dom"

const projects = [
  {
    title: "Laser Engraved Tumblers",
    image: "/images/projects/tumbler.jpg",
    category: "Laser Engraving"
  },
  {
    title: "Custom Event Apparel",
    image: "/images/projects/apparel.jpg",
    category: "Apparel Printing"
  },
  {
    title: "Business Sign Package",
    image: "/images/projects/sign.jpg",
    category: "Signs & Graphics"
  }
]

export default function FeaturedProjects() {
  return (
    <section className="bg-[#020617] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Featured Projects
          </p>

          <h2 className="text-4xl font-bold">
            Recent Work
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Examples of custom products, apparel, engraving, signage, and
            branding projects created by SignaVi Studio.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.title}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/20 transition-all hover:-translate-y-1 hover:border-cyan-500"
            >
              <img
                src={project.image}
                alt={project.title}
                className="h-64 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "/image_placeholder/placeholder.png"
                }}
              />

              <div className="p-6">
                <p className="text-sm text-cyan-300">
                  {project.category}
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {project.title}
                </h3>

                <Link
                  to="/gallery"
                  className="mt-4 inline-flex font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  View Gallery →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}