import {
  useEffect,
  useState
} from "react"

import {
  Outlet,
  NavLink,
  useLocation
} from "react-router-dom"

import useNotifications from "../../hooks/useNotifications"

export default function AdminLayout() {
  const {
    supportUnread,
    emailUnread,
    clearSupportUnread,
    clearEmailUnread
  } = useNotifications()

const [sidebarOpen, setSidebarOpen] = useState(false)

const [isMobile, setIsMobile] = useState(
  () => window.innerWidth <= 900
)

const location = useLocation()

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth <= 900

    setIsMobile(mobile)

    if (!mobile) {
      setSidebarOpen(false)
    }
  }

  handleResize()

  window.addEventListener("resize", handleResize)

  return () => {
    window.removeEventListener("resize", handleResize)
  }
}, [])

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth <= 900

    setIsMobile(mobile)

    if (!mobile) {
      setSidebarOpen(false)
    }
  }

  window.addEventListener("resize", handleResize)

  handleResize()

  return () => {
    window.removeEventListener("resize", handleResize)
  }
}, [])

  /* Close mobile sidebar whenever route changes */
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  /* Stop page behind sidebar from scrolling */
  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = ""
      return
    }

    if (window.innerWidth <= 900) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  const downloadOrdersCSV = () => {
    window.open(
      "https://signavi-backend.onrender.com/api/orders/export",
      "_blank"
    )
  }

  const downloadTaxCSV = () => {
    window.open(
      "https://signavi-backend.onrender.com/api/export-taxes",
      "_blank"
    )
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")

    sessionStorage.removeItem("adminToken")
    sessionStorage.removeItem("adminUser")

    window.location.href = "/login"
  }

  return (
    <>
      <style>
        {`
          /* ==========================================
             ADMIN LAYOUT
             ========================================== */

          .admin-layout {
            width: 100%;
            min-height: 100vh;

            display: flex;

            background: #020617;

            overflow-x: hidden;
          }


          /* ==========================================
             ADMIN SIDEBAR - DESKTOP
             ========================================== */

          .admin-sidebar {
            width: 320px;
            min-width: 320px;
            height: 100vh;

            padding: 24px;

            background: #020617;
            color: #ffffff;

            border-right: 1px solid #1e293b;

            display: flex;
            flex-direction: column;

            gap: 10px;

            position: sticky;
            top: 0;

            overflow-y: auto;
            overflow-x: hidden;

            box-sizing: border-box;

            z-index: 100;
          }


          /* ==========================================
             PAGE CONTENT
             ========================================== */

          .admin-content {
            flex: 1;

            width: 100%;
            min-width: 0;

            padding: 42px 48px;

            background:
              radial-gradient(
                circle at top left,
                rgba(34, 211, 238, 0.08),
                transparent 30%
              ),
              #020617;

            box-sizing: border-box;

            overflow-x: hidden;
          }


          /* ==========================================
             MOBILE ADMIN MENU BUTTON
             ========================================== */

          .admin-mobile-menu-button {
            display: none;

            position: fixed;

            right: 18px;
            bottom: 22px;

            width: 58px;
            height: 58px;

            border-radius: 50%;
            border: 1px solid rgba(34, 211, 238, 0.55);

            background: #0f172a;
            color: #22d3ee;

            align-items: center;
            justify-content: center;

            font-size: 25px;

            cursor: pointer;

            z-index: 220;

            box-shadow:
              0 12px 30px rgba(0, 0, 0, 0.35),
              0 0 25px rgba(34, 211, 238, 0.12);
          }

          .admin-mobile-menu-button:hover {
            background: #162032;
            border-color: #22d3ee;
          }


          /* ==========================================
             MOBILE CLOSE BUTTON
             ========================================== */

          .admin-sidebar-close {
            display: none;

            width: 44px;
            height: 44px;

            border-radius: 12px;
            border: 1px solid #334155;

            background: #0f172a;
            color: #ffffff;

            align-items: center;
            justify-content: center;

            font-size: 22px;

            cursor: pointer;

            flex-shrink: 0;
          }


          /* ==========================================
             DARK BACKDROP
             ========================================== */

          .admin-sidebar-overlay {
            display: none;
          }


          /* ==========================================
             TABLET / MOBILE
             ========================================== */

          @media (max-width: 900px) {

            .admin-layout {
              display: block;

              width: 100%;

              overflow-x: hidden;
            }


            /* Sidebar now floats OVER the content */

            .admin-sidebar {
              position: fixed;

              top: 0;
              left: 0;

              width: min(86vw, 340px);
              min-width: 0;

              height: 100dvh;

              padding: 20px;

              z-index: 210;

              transform: translateX(-105%);

              transition:
                transform 0.28s ease,
                box-shadow 0.28s ease;

              box-shadow: none;
            }

            .admin-sidebar.admin-sidebar-open {
              transform: translateX(0);

              box-shadow:
                20px 0 60px rgba(0, 0, 0, 0.6);
            }


            /* Main content stays full phone width */

            .admin-content {
              width: 100%;
              max-width: 100%;

              min-width: 0;

              margin: 0;

              padding:
                24px
                18px
                100px;

              overflow-x: hidden;
            }


            /* Floating menu button */

            .admin-mobile-menu-button {
              display: flex;
            }


            /* Sidebar close X */

            .admin-sidebar-close {
              display: flex;
            }


            /* Overlay behind sidebar */

            .admin-sidebar-overlay {
              display: block;

              position: fixed;

              inset: 0;

              background: rgba(0, 0, 0, 0.68);

              backdrop-filter: blur(3px);

              opacity: 0;
              visibility: hidden;

              transition:
                opacity 0.25s ease,
                visibility 0.25s ease;

              z-index: 200;
            }

            .admin-sidebar-overlay.admin-sidebar-overlay-open {
              opacity: 1;
              visibility: visible;
            }
          }


          /* ==========================================
             SMALL PHONES
             ========================================== */

          @media (max-width: 480px) {

            .admin-sidebar {
              width: 88vw;

              padding: 18px 16px;
            }

            .admin-content {
              padding:
                20px
                14px
                100px;
            }

            .admin-mobile-menu-button {
              width: 54px;
              height: 54px;

              right: 14px;
              bottom: 18px;

              font-size: 22px;
            }
          }
        `}
      </style>

      <div className="admin-layout">

        {/* ================= MOBILE OVERLAY ================= */}

        <div
          className={
            sidebarOpen
              ? "admin-sidebar-overlay admin-sidebar-overlay-open"
              : "admin-sidebar-overlay"
          }
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />

        {/* ================= SIDEBAR ================= */}

        <aside
  className="admin-sidebar"
  style={{
    ...(isMobile
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          width: "88vw",
          maxWidth: "340px",
          minWidth: 0,
          height: "100dvh",
          zIndex: 210,
          transform: sidebarOpen
            ? "translateX(0)"
            : "translateX(-105%)",
          transition: "transform 0.28s ease",
          boxShadow: sidebarOpen
            ? "20px 0 60px rgba(0,0,0,.6)"
            : "none"
        }
      : {
          position: "sticky",
          top: 0,
          width: 320,
          minWidth: 320,
          height: "100vh",
          transform: "none"
        })
  }}
>

          {/* ================= BRAND ================= */}

          <div style={brandBox}>

            <div style={brandIcon}>
              <img
                src="/logo.png"
                alt="SignaVi"
                style={brandImage}
                onError={(event) => {
                  event.currentTarget.style.display = "none"

                  event.currentTarget.parentElement.textContent = "S"
                }}
              />
            </div>

            <div style={brandText}>
              <h2 style={title}>
                SignaVi
              </h2>

              <p style={subtitle}>
                Admin Panel
              </p>
            </div>

            <button
              type="button"
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close admin menu"
            >
              ✕
            </button>

          </div>


          {/* ================= WORKFLOW ================= */}

          <div style={sectionLabel}>
            Workflow
          </div>

          <SideLink to="/admin">
            📊 Dashboard
          </SideLink>

          <SideLink to="/admin/production">
            🏭 Production
          </SideLink>

          <SideLink to="/admin/orders">
            📦 Orders
          </SideLink>

          <SideLink to="/admin/invoices">
            🧾 Invoices
          </SideLink>

          <SideLink to="/admin/custom-order/new">
            🧾 New Custom Order
          </SideLink>


          {/* ================= STORE ================= */}

          <div style={sectionLabel}>
            Store
          </div>

          <SideLink to="/admin/products/new">
            ➕ Create Product
          </SideLink>

          <SideLink to="/admin/signavi-store/products">
            🛍️ Store Products
          </SideLink>

          <SideLink to="/admin/signavi-store/discounts">
            💸 Store Discounts
          </SideLink>

          <SideLink to="/admin/materials">
            🧵 Materials Catalog
          </SideLink>


          {/* ================= CUSTOMERS ================= */}

          <div style={sectionLabel}>
            Customers
          </div>

          <SideLink to="/admin/customers">
            👥 Customers
          </SideLink>


          {/* ================= COMMUNICATIONS ================= */}

          <div onClick={clearEmailUnread}>
            <SideLink to="/admin/emails">

              <div style={linkRow}>

                <span>
                  💬 Communications
                </span>

                {emailUnread > 0 && (
                  <span style={badge}>
                    {emailUnread}
                  </span>
                )}

              </div>

            </SideLink>
          </div>


          {/* ================= SUPPORT ================= */}

          <div onClick={clearSupportUnread}>
            <SideLink to="/admin/support">

              <div style={linkRow}>

                <span>
                  🛟 Support
                </span>

                {supportUnread > 0 && (
                  <span style={badge}>
                    {supportUnread}
                  </span>
                )}

              </div>

            </SideLink>
          </div>


          {/* ================= BUSINESS ================= */}

          <div style={sectionLabel}>
            Business
          </div>

          <SideLink to="/admin/revenue">
            💰 Revenue
          </SideLink>

          <SideLink to="/admin/marketing">
            📣 Marketing Hub
          </SideLink>


          {/* ================= QUICK TOOLS ================= */}

          <div style={quickStats}>

            <div style={quickStatCard}>
              <span>
                💰 Revenue Tools
              </span>
            </div>

            <div style={quickStatCard}>
              <span>
                📦 Order Exports
              </span>
            </div>

          </div>


          {/* ================= EXPORT / LOGOUT ================= */}

          <div style={csvGroup}>

            <button
              type="button"
              onClick={downloadOrdersCSV}
              style={csvButton}
            >
              📄 Orders CSV
            </button>

            <button
              type="button"
              onClick={downloadTaxCSV}
              style={taxButton}
            >
              🧾 Tax CSV
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={logoutButton}
            >
              🚪 Logout
            </button>

          </div>

        </aside>


        {/* ================= PAGE CONTENT ================= */}

        <main
  className="admin-content"
  style={
    isMobile
      ? {
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          margin: 0,
          padding: "20px 14px 100px",
          overflowX: "hidden"
        }
      : undefined
  }
>
  <Outlet />
</main>


        {/* ================= MOBILE OPEN BUTTON ================= */}

        {isMobile && (
  <button
    type="button"
    className="admin-mobile-menu-button"
    style={{
      display: "flex"
    }}
    onClick={() =>
      setSidebarOpen((current) => !current)
    }
    aria-label={
      sidebarOpen
        ? "Close admin menu"
        : "Open admin menu"
    }
    aria-expanded={sidebarOpen}
  >
    {sidebarOpen ? "✕" : "☰"}
  </button>
)}

      </div>
    </>
  )
}


/* ================= SIDE LINK ================= */

function SideLink({
  to,
  children
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...link,

        background: isActive
          ? "rgba(34, 211, 238, 0.12)"
          : "transparent",

        border: isActive
          ? "1px solid #22d3ee"
          : "1px solid transparent",

        color: isActive
          ? "#22d3ee"
          : "#cbd5e1",

        boxShadow: isActive
          ? "0 10px 30px rgba(34,211,238,.12)"
          : "none"
      })}
      end={to === "/admin"}
    >
      {children}
    </NavLink>
  )
}


/* ================= INLINE STYLES ================= */

const brandBox = {
  display: "flex",
  alignItems: "center",

  width: "100%",

  gap: 14,

  marginBottom: 22,
  paddingBottom: 18,

  borderBottom:
    "1px solid #1e293b"
}

const brandText = {
  flex: 1,
  minWidth: 0
}

const brandIcon = {
  width: 52,
  height: 52,

  minWidth: 52,

  borderRadius: 16,

  background:
    "linear-gradient(135deg, #22d3ee, #2563eb)",

  color: "#ffffff",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 28,
  fontWeight: 900,

  overflow: "hidden",

  boxShadow:
    "0 14px 30px rgba(34,211,238,.22)"
}

const brandImage = {
  width: "100%",
  height: "100%",

  objectFit: "contain",

  borderRadius: 16
}

const title = {
  margin: 0,

  fontSize: 28,
  fontWeight: 900,

  letterSpacing: "-0.04em"
}

const subtitle = {
  margin: 0,

  color: "#94a3b8",

  fontSize: 13,
  fontWeight: 700
}

const sectionLabel = {
  marginTop: 10,
  marginBottom: 2,

  color: "#64748b",

  fontSize: 11,
  fontWeight: 900,

  letterSpacing: "0.18em",

  textTransform: "uppercase"
}

const link = {
  width: "100%",

  padding: "14px 16px",

  borderRadius: 16,

  textDecoration: "none",

  fontWeight: 800,

  transition: "0.2s ease",

  display: "block",

  boxSizing: "border-box"
}

const quickStats = {
  display: "grid",

  gap: 10,

  marginTop: 14,
  marginBottom: 14
}

const quickStatCard = {
  background: "#0f172a",

  border:
    "1px solid #1e293b",

  borderRadius: 16,

  padding: 12,

  color: "#cbd5e1",

  fontWeight: 800
}

const csvGroup = {
  marginTop: "auto",

  display: "grid",

  gap: 12,

  paddingTop: 16,

  borderTop:
    "1px solid #1e293b"
}

const csvButton = {
  width: "100%",

  background: "#22d3ee",

  color: "#020617",

  border: "none",

  padding: "14px 16px",

  borderRadius: 16,

  fontWeight: 900,

  cursor: "pointer",

  textAlign: "left"
}

const taxButton = {
  width: "100%",

  background: "#38bdf8",

  color: "#020617",

  border: "none",

  padding: "14px 16px",

  borderRadius: 16,

  fontWeight: 900,

  cursor: "pointer",

  textAlign: "left"
}

const logoutButton = {
  width: "100%",

  background: "#dc2626",

  color: "#ffffff",

  border: "none",

  padding: "14px 16px",

  borderRadius: 16,

  fontWeight: 900,

  cursor: "pointer",

  textAlign: "left"
}

const linkRow = {
  width: "100%",

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  gap: 10
}

const badge = {
  minWidth: 22,
  height: 22,

  borderRadius: "999px",

  background: "#ef4444",

  color: "#ffffff",

  fontSize: 12,
  fontWeight: "bold",

  display: "flex",

  alignItems: "center",
  justifyContent: "center",

  padding: "0 6px"
}