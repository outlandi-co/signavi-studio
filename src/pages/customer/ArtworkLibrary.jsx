import { useNavigate } from "react-router-dom"

export default function ArtworkLibrary() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-8 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Customer Artwork
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Artwork Library
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Save and manage artwork files for future SignaVi Studio projects.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-black">
              Upload Artwork
            </h2>

            <div className="mt-6 rounded-3xl border border-dashed border-cyan-500/40 bg-cyan-500/5 p-10 text-center">
              <div className="mb-4 text-5xl">
                🎨
              </div>

              <p className="font-bold">
                Artwork uploads coming next
              </p>

              <p className="mt-2 text-sm text-slate-500">
                AI, PSD, SVG, PDF, PNG, JPG support planned.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-black">
              Saved Artwork
            </h2>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-[#020617] p-8 text-center">
              <p className="text-slate-500">
                No artwork uploaded yet.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}