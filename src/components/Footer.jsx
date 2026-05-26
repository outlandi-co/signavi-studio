import {
  FaFacebook,
  FaInstagram,
  FaTiktok
} from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <h3 className="text-xl font-bold text-white">
          SignaVi Studio
        </h3>

        <p className="text-slate-400 mt-2">
          From iteration to creation.
        </p>

        <div className="flex justify-center gap-8 mt-6 text-3xl">
          <a
            href="https://www.facebook.com/signavi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-cyan-400 transition"
          >
            <FaFacebook />
          </a>

          <a
            href="https://www.instagram.com/signavistudio/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-cyan-400 transition"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.tiktok.com/@signavi.studio?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:text-cyan-400 transition"
          >
            <FaTiktok />
          </a>
        </div>
      </div>
    </footer>
  )
}