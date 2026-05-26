export default function Spinner() {
  return (
    <>
      <style>
        {`
          @keyframes signavi-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div style={wrapper}>
        <div style={spinner} />
      </div>
    </>
  )
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  padding: "20px",
}

const spinner = {
  width: "40px",
  height: "40px",
  border: "4px solid #334155",
  borderTop: "4px solid #06b6d4",
  borderRadius: "50%",
  animation: "signavi-spin 1s linear infinite",
}