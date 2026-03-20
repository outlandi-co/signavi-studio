import { useRef, useState } from "react"

function ProductMockup({ image, artwork, design, setDesign }) {

  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleMove = (e) => {
    if (!dragging || !ref.current) return

    const rect = ref.current.getBoundingClientRect()

    const newX = e.clientX - rect.left
    const newY = e.clientY - rect.top

    setDesign(prev => ({
      ...prev,
      x: newX,
      y: newY
    }))
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      className="relative w-[320px] border rounded-xl overflow-hidden bg-white"
    >

      {/* BASE PRODUCT IMAGE */}
      {image && (
        <img
          src={image}
          alt="Product"
          className="w-full"
        />
      )}

      {/* ARTWORK */}
      {artwork && (
        <img
          src={artwork}
          alt="Artwork"
          onMouseDown={() => setDragging(true)}
          style={{
            position: "absolute",
            top: design?.y || 150,
            left: design?.x || 150,
            width: design?.size || 120,
            transform: "translate(-50%, -50%)",
            cursor: dragging ? "grabbing" : "grab"
          }}
        />
      )}

    </div>
  )
}

export default ProductMockup