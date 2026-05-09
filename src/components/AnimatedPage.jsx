export default function AnimatedPage({ children }) {
  return (
    <div className="page-enter">
      {children}

      <style>{`
        .page-enter {
          opacity: 0;
          transform: translateY(10px);
          animation: pageFadeIn 0.4s ease forwards;
        }

        @keyframes pageFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}