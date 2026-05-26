import { useMemo, useState } from "react"
import "./MarketingHub.css"

const DEFAULT_SITE_URL = "https://signavistudio.store/quote"

const serviceTemplates = {
  engraving: {
    title: "Laser Engraving",
    caption:
      "Custom laser engraving available for gifts, business branding, keychains, tumblers, wood pieces, and more. Message me or request a quote today.",
    hashtags:
      "#laserengraving #customgifts #smallbusiness #veteranowned #signavi",
  },
  shirts: {
    title: "Custom Shirts",
    caption:
      "Need custom shirts for your business, event, team, or family project? I can help with design, printing, and production.",
    hashtags:
      "#customshirts #screenprinting #apparelprinting #smallbusiness #signavi",
  },
  signs: {
    title: "Signs & Graphics",
    caption:
      "Custom signs, graphics, decals, banners, and branding materials available for businesses, events, and personal projects.",
    hashtags:
      "#customsigns #graphicdesign #businessbranding #smallbusiness #signavi",
  },
  apparel: {
    title: "Custom Apparel",
    caption:
      "Custom apparel available for businesses, teams, events, and personal brands. Shirts, hoodies, hats, and more.",
    hashtags:
      "#customapparel #brandmerch #screenprinting #smallbusiness #signavi",
  },
}

export default function MarketingHub() {
  const [service, setService] = useState("engraving")
  const [customNote, setCustomNote] = useState("")
  const [siteUrl, setSiteUrl] = useState(DEFAULT_SITE_URL)
  const [copied, setCopied] = useState("")

  const selected = serviceTemplates[service]

  const postText = useMemo(() => {
    return `${selected.caption}

${customNote ? `${customNote}\n\n` : ""}Request a quote here:
${siteUrl}

${selected.hashtags}`
  }, [selected, customNote, siteUrl])

  const copyToClipboard = async (label, value) => {
  try {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(""), 1800)
  } catch (error) {
    console.error("Copy failed:", error)
    alert("Copy failed. You can manually highlight and copy the preview text.")
  }
}

  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <p className="marketing-eyebrow">SignaVi Marketing</p>
        <h1>Social Post Generator</h1>
        <p>
          Create ready-to-copy posts for Facebook, Instagram, and TikTok.
          Keep traffic moving back to your quote form.
        </p>
      </section>

<section className="marketing-grid">
  <div className="marketing-card">
    <h2>Create Post</h2>

    <label>
      Service
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
      >
        {Object.entries(serviceTemplates).map(([key, item]) => (
          <option key={key} value={key}>
            {item.title}
          </option>
        ))}
      </select>
    </label>

    <label>
      Quote Link
      <input
        value={siteUrl}
        onChange={(e) => setSiteUrl(e.target.value)}
        placeholder="https://signavistudio.store/quote"
      />
    </label>

    <label>
      Extra Note
      <textarea
        value={customNote}
        onChange={(e) => setCustomNote(e.target.value)}
        placeholder="Example: Father’s Day orders are open this week."
      />
    </label>

    <button
      className="marketing-main-btn"
      onClick={() => copyToClipboard("post", postText)}
    >
      {copied === "post" ? "Copied!" : "Copy Full Post"}
    </button>
  </div>

  <div className="marketing-card preview-card">
    <h2>Preview</h2>
    <pre>{postText}</pre>
  </div>
</section>

<section className="platform-grid">
  <div className="platform-card facebook">
    <h3>Facebook</h3>
    <p>
      Best for business page posts, local groups, customer engagement,
      and community sharing.
    </p>

    <div className="button-row">
      <a
        href="https://www.facebook.com/signavi"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit Facebook
      </a>

      <button onClick={() => copyToClipboard("facebook", postText)}>
        {copied === "facebook" ? "Copied!" : "Copy Caption"}
      </button>
    </div>
  </div>

  <div className="platform-card instagram">
    <h3>Instagram</h3>
    <p>
      Use this for reels, stories, carousels, product showcases,
      and behind-the-scenes content.
    </p>

    <div className="button-row">
      <a
        href="https://www.instagram.com/signavistudio/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit Instagram
      </a>

      <button onClick={() => copyToClipboard("instagram", postText)}>
        {copied === "instagram" ? "Copied!" : "Copy Caption"}
      </button>
    </div>
  </div>

  <div className="platform-card tiktok">
    <h3>TikTok</h3>
    <p>
      Great for laser engraving, shirt printing, design timelapses,
      packing orders, and process videos.
    </p>

    <div className="button-row">
     <a
  href="https://www.tiktok.com/@signavi.studio?is_from_webapp=1&sender_device=pc"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="TikTok"
  className="hover:text-cyan-400 transition"
>
  Visit TikTok
</a>

      <button onClick={() => copyToClipboard("tiktok", postText)}>
        {copied === "tiktok" ? "Copied!" : "Copy Caption"}
      </button>
    </div>
  </div>
</section>    </main>
  )
}