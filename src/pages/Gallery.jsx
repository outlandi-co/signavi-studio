export default function Gallery() {
  const galleryItems = [
    {
      title: "Laser Engraved Keychains",
      category: "Laser Engraving",
      image: "/images/gallery/keychains.jpg",
    },
    {
      title: "Custom Apparel",
      category: "Shirts & Printing",
      image: "/images/gallery/apparel.jpg",
    },
    {
      title: "Wood Engraving",
      category: "Custom Gifts",
      image: "/images/gallery/wood-engraving.jpg",
    },
  ]

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Gallery</h1>
        <p className="text-gray-300 mb-10">
          View examples of custom engraving, apparel, design, and production work.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover"
              />

              <div className="p-5">
                <p className="text-sm text-gray-400">{item.category}</p>
                <h2 className="text-xl font-semibold mt-1">{item.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}