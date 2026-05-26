import { useRef, useState } from "react"

function ProductMockup({
  image,
  artwork,
  design = {},
  setDesign
}) {
  const containerRef = useRef(null)

  const [dragging, setDragging] = useState(false)

  const updatePosition = (clientX, clientY) => {
    if (!containerRef.current) return

    const rect =
      containerRef.current.getBoundingClientRect()

    let x = clientX - rect.left
    let y = clientY - rect.top

    x = Math.max(0, Math.min(rect.width, x))
    y = Math.max(0, Math.min(rect.height, y))

    setDesign((prev) => ({
      ...prev,
      x,
      y
    }))
  }

  const handleMouseMove = (e) => {
    if (!dragging) return
    updatePosition(e.clientX, e.clientY)
  }

  const handleTouchMove = (e) => {
    if (!dragging) return

    const touch = e.touches[0]

    if (!touch) return

    updatePosition(
      touch.clientX,
      touch.clientY
    )
  }

  const stopDragging = () => {
    setDragging(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* PRODUCT PREVIEW */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDragging}
        className="relative w-[340px] overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-xl"
      >
        {image ? (
          <img
            src={image}
            alt="Product"
            className="w-full select-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-[420px] items-center justify-center bg-slate-100 text-slate-400">
            Product Preview
          </div>
        )}

        {artwork && (
          <img
            src={artwork}
            alt="Artwork"
            draggable={false}
            onMouseDown={() =>
              setDragging(true)
            }
            onTouchStart={() =>
              setDragging(true)
            }
            style={{
              position: "absolute",
              top: design.y || 150,
              left: design.x || 150,
              width: design.size || 120,
              transform: `
                translate(-50%, -50%)
                rotate(${design.rotation || 0}deg)
              `,
              cursor: dragging
                ? "grabbing"
                : "grab",
              userSelect: "none",
              touchAction: "none"
            }}
          />
        )}
      </div>

      {/* CONTROLS */}
      {artwork && (
        <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4 text-white">
          <h3 className="mb-4 font-bold">
            Artwork Controls
          </h3>

          {/* SIZE */}
          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-300">
              Size ({design.size || 120}px)
            </label>

            <input
              type="range"
              min="40"
              max="400"
              value={design.size || 120}
              onChange={(e) =>
                setDesign((prev) => ({
                  ...prev,
                  size: Number(e.target.value)
                }))
              }
              className="w-full"
            />
          </div>

          {/* ROTATION */}
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Rotation (
              {design.rotation || 0}
              °)
            </label>

            <input
              type="range"
              min="-180"
              max="180"
              value={design.rotation || 0}
              onChange={(e) =>
                setDesign((prev) => ({
                  ...prev,
                  rotation: Number(
                    e.target.value
                  )
                }))
              }
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductMockup