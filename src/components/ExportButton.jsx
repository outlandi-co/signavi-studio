import Button from "./UI/Button"

function ExportButton() {

  const handleExport = () => {
    window.open("http://localhost:5050/api/export-orders", "_blank")
  }

  return (
    <div style={wrapper}>
      <Button
        onClick={handleExport}
        variant="primary"
        style={btn}
      >
        📤 Export Orders CSV
      </Button>
    </div>
  )
}

const wrapper = {
  marginBottom: "15px",
  display: "flex",
  justifyContent: "flex-end"
}

const btn = {
  background: "linear-gradient(90deg, #06b6d4, #2563eb)"
}

export default ExportButton