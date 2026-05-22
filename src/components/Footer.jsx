import {
  FaFacebook,
  FaInstagram,
  FaTiktok
} from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#020617] py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">
          <h3 className="text-xl font-bold text-white">
            SignaVi Studio
          </h3>

          <p className="text-slate-400 mt-2">
            From iteration to creation.
          </p>

          <div className="flex justify-center gap-6 mt-6 text-3xl">
            <a
              href="https://www.facebook.com/signavi"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition"
            >
              <FaFacebook />
            </a>

            <a
              href="https://www.instagram.com/signavistudio/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.tiktok.com/@signavi.studio"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}