import { useMemo } from "react"

export default function AnimatedPage({
  children,
  duration = 450,
  distance = 16,
  scale = 0.98
}) {
  const animationStyle = useMemo(
    () => ({
      "--page-duration": `${duration}ms`,
      "--page-distance": `${distance}px`,
      "--page-scale": scale
    }),
    [duration, distance, scale]
  )

  return (
    <div
      className="signavi-page-enter"
      style={animationStyle}
    >
      {children}

      <style>{`
        .signavi-page-enter {
          opacity: 0;
          transform:
            translateY(var(--page-distance))
            scale(var(--page-scale));

          animation:
            signaviPageFadeIn
            var(--page-duration)
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;

          will-change:
            opacity,
            transform;
        }

        @keyframes signaviPageFadeIn {
          from {
            opacity: 0;

            transform:
              translateY(var(--page-distance))
              scale(var(--page-scale));
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .signavi-page-enter {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}