import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import api from "../../services/api"

export default function AdminInstagram() {
  const [profile, setProfile] = useState(null)
  const [media, setMedia] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  /* ================= CREATE POST ================= */

  const [composerOpen, setComposerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [publishMessage, setPublishMessage] = useState("")
  const [publishSuccess, setPublishSuccess] = useState(false)

  const fileInputRef = useRef(null)

  /* ================= LOAD INSTAGRAM ================= */

  const loadInstagram = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError("")

        const [
          profileResponse,
          mediaResponse
        ] = await Promise.all([
          api.get("/instagram/profile"),
          api.get("/instagram/media")
        ])

        setProfile(
          profileResponse?.data?.profile ||
          null
        )

        setMedia(
          Array.isArray(
            mediaResponse?.data?.media
          )
            ? mediaResponse.data.media
            : []
        )
      } catch (err) {
        console.error(
          "❌ INSTAGRAM ADMIN LOAD ERROR:",
          err
        )

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load Instagram data."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    loadInstagram()
  }, [loadInstagram])

  /* ================= CLEAN PREVIEW ================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        )
      }
    }
  }, [previewUrl])

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    return [
      {
        label: "Followers",
        value:
          profile?.followers_count ??
          "—"
      },
      {
        label: "Following",
        value:
          profile?.follows_count ??
          "—"
      },
      {
        label: "Posts",
        value:
          profile?.media_count ??
          media.length
      },
      {
        label: "Account",
        value:
          profile?.account_type ||
          "—"
      }
    ]
  }, [
    profile,
    media.length
  ])

  const connected = Boolean(
    profile?.id &&
    profile?.username
  )

  /* ================= IMAGE PICKER ================= */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ]

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setPublishSuccess(false)

      setPublishMessage(
        "Please choose a JPG, PNG, or WEBP image."
      )

      return
    }

    const maxSize =
      15 * 1024 * 1024

    if (
      file.size >
      maxSize
    ) {
      setPublishSuccess(false)

      setPublishMessage(
        "Image must be smaller than 15 MB."
      )

      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      )
    }

    const nextPreview =
      URL.createObjectURL(
        file
      )

    setSelectedImage(file)
    setPreviewUrl(nextPreview)
    setPublishMessage("")
    setPublishSuccess(false)
  }

  /* ================= RESET COMPOSER ================= */

  const resetComposer = () => {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      )
    }

    setSelectedImage(null)
    setPreviewUrl("")
    setCaption("")
    setPublishMessage("")
    setPublishSuccess(false)

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        ""
    }
  }

  /* ================= PUBLISH ================= */

  const publishPost = async (
    event
  ) => {
    event.preventDefault()

    if (!selectedImage) {
      setPublishSuccess(false)

      setPublishMessage(
        "Choose an image before publishing."
      )

      return
    }

    try {
      setPublishing(true)
      setPublishMessage("")
      setPublishSuccess(false)

      const formData =
        new FormData()

      formData.append(
        "image",
        selectedImage
      )

      formData.append(
        "caption",
        caption
      )

      console.log(
        "📤 Publishing Instagram post..."
      )

      const response =
        await api.post(
          "/instagram/publish",
          formData
        )

      console.log(
        "✅ INSTAGRAM PUBLISH RESPONSE:",
        response.data
      )

      setPublishSuccess(true)

      setPublishMessage(
        response?.data?.message ||
        "Instagram post published successfully."
      )

      /* ================= RESET FORM ================= */

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        )
      }

      setSelectedImage(null)
      setPreviewUrl("")
      setCaption("")

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ""
      }

      /* ================= REFRESH POSTS ================= */

      window.setTimeout(
        () => {
          loadInstagram({
            silent: true
          })
        },
        2000
      )
    } catch (err) {
      console.error(
        "❌ INSTAGRAM PUBLISH ERROR:",
        err
      )

      const instagramError =
        err?.response?.data
          ?.instagram?.error
          ?.message

      setPublishSuccess(false)

      setPublishMessage(
        instagramError ||
        err?.response?.data?.message ||
        err?.message ||
        "Instagram post failed."
      )
    } finally {
      setPublishing(false)
    }
  }

  return (
    <>
      <style>
        {`

          /* ==========================================
             PAGE
          ========================================== */

          .instagram-admin-page {
            width: 100%;
            min-width: 0;

            color: #e2e8f0;
          }

          /* ==========================================
             HEADER
          ========================================== */

          .instagram-page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;

            margin-bottom: 28px;
          }

          .instagram-page-header h1 {
            margin: 4px 0 8px;

            color: #ffffff;

            font-size:
              clamp(
                32px,
                5vw,
                52px
              );

            line-height: 1;

            letter-spacing:
              -0.04em;
          }

          .instagram-page-header p {
            margin: 0;

            max-width: 720px;

            color: #94a3b8;

            line-height: 1.65;
          }

          .instagram-kicker {
            color: #22d3ee;

            font-size: 11px;
            font-weight: 900;

            letter-spacing:
              0.18em;

            text-transform:
              uppercase;
          }

          .instagram-header-actions {
            display: flex;

            gap: 10px;

            flex-wrap: wrap;
          }

          /* ==========================================
             BUTTONS
          ========================================== */

          .instagram-create-button,
          .instagram-refresh {
            border-radius: 14px;

            padding:
              12px 16px;

            font-weight: 900;

            cursor: pointer;

            transition:
              0.2s ease;
          }

          .instagram-create-button {
            border:
              1px solid #22d3ee;

            background:
              #22d3ee;

            color:
              #020617;
          }

          .instagram-create-button:hover {
            background:
              #67e8f9;
          }

          .instagram-refresh {
            border:
              1px solid #334155;

            background:
              #0f172a;

            color:
              #e2e8f0;
          }

          .instagram-refresh:hover {
            border-color:
              #22d3ee;

            color:
              #22d3ee;
          }

          .instagram-refresh:disabled,
          .instagram-create-button:disabled {
            opacity:
              0.55;

            cursor:
              wait;
          }

          /* ==========================================
             ERROR
          ========================================== */

          .instagram-error {
            margin-bottom:
              20px;

            border:
              1px solid
              rgba(
                248,
                113,
                113,
                0.45
              );

            border-radius:
              16px;

            padding:
              14px 16px;

            background:
              rgba(
                127,
                29,
                29,
                0.22
              );

            color:
              #fecaca;
          }

          /* ==========================================
             COMPOSER
          ========================================== */

          .instagram-composer {
            margin-bottom:
              26px;

            padding:
              24px;

            border:
              1px solid
              rgba(
                34,
                211,
                238,
                0.45
              );

            border-radius:
              22px;

            background:
              linear-gradient(
                135deg,
                rgba(
                  34,
                  211,
                  238,
                  0.07
                ),
                rgba(
                  37,
                  99,
                  235,
                  0.04
                )
              ),
              #0f172a;
          }

          .instagram-composer-header {
            display: flex;

            justify-content:
              space-between;

            align-items:
              center;

            gap:
              14px;

            margin-bottom:
              20px;
          }

          .instagram-composer-header h2 {
            margin:
              4px 0 0;

            color:
              white;

            font-size:
              26px;
          }

          .instagram-composer-close {
            width:
              40px;

            height:
              40px;

            border:
              1px solid #334155;

            border-radius:
              12px;

            background:
              #020617;

            color:
              white;

            cursor:
              pointer;

            font-size:
              20px;
          }

          .instagram-composer-grid {
            display:
              grid;

            grid-template-columns:
              minmax(
                260px,
                0.85fr
              )
              minmax(
                0,
                1.15fr
              );

            gap:
              22px;
          }

          /* ==========================================
             IMAGE UPLOAD
          ========================================== */

          .instagram-upload-box {
            width:
              100%;

            min-height:
              360px;

            display:
              grid;

            place-items:
              center;

            overflow:
              hidden;

            border:
              2px dashed
              #334155;

            border-radius:
              18px;

            background:
              #020617;

            cursor:
              pointer;

            transition:
              0.2s ease;
          }

          .instagram-upload-box:hover {
            border-color:
              #22d3ee;
          }

          .instagram-upload-placeholder {
            padding:
              30px;

            text-align:
              center;

            color:
              #94a3b8;

            line-height:
              1.7;
          }

          .instagram-upload-icon {
            margin-bottom:
              12px;

            font-size:
              46px;
          }

          .instagram-upload-placeholder strong {
            display:
              block;

            margin-bottom:
              8px;

            color:
              white;

            font-size:
              18px;
          }

          .instagram-post-preview {
            width:
              100%;

            height:
              100%;

            max-height:
              520px;

            object-fit:
              contain;

            background:
              #000000;
          }

          /* ==========================================
             CAPTION
          ========================================== */

          .instagram-composer-fields {
            display:
              flex;

            flex-direction:
              column;
          }

          .instagram-composer-fields label {
            margin-bottom:
              8px;

            color:
              #94a3b8;

            font-size:
              11px;

            font-weight:
              900;

            letter-spacing:
              0.14em;

            text-transform:
              uppercase;
          }

          .instagram-caption {
            width:
              100%;

            min-height:
              250px;

            padding:
              15px;

            resize:
              vertical;

            box-sizing:
              border-box;

            border:
              1px solid
              #334155;

            border-radius:
              15px;

            outline:
              none;

            background:
              #020617;

            color:
              #ffffff;

            font:
              inherit;

            line-height:
              1.6;
          }

          .instagram-caption:focus {
            border-color:
              #22d3ee;

            box-shadow:
              0 0 0 2px
              rgba(
                34,
                211,
                238,
                0.1
              );
          }

          .instagram-caption-count {
            margin:
              8px 0 18px;

            color:
              #64748b;

            text-align:
              right;

            font-size:
              11px;
          }

          /* ==========================================
             PUBLISH MESSAGE
          ========================================== */

          .instagram-publish-message {
            margin-bottom:
              14px;

            padding:
              12px 14px;

            border-radius:
              12px;

            font-size:
              13px;

            line-height:
              1.5;
          }

          .instagram-publish-message.success {
            border:
              1px solid
              rgba(
                34,
                197,
                94,
                0.4
              );

            background:
              rgba(
                34,
                197,
                94,
                0.1
              );

            color:
              #86efac;
          }

          .instagram-publish-message.error {
            border:
              1px solid
              rgba(
                248,
                113,
                113,
                0.4
              );

            background:
              rgba(
                127,
                29,
                29,
                0.25
              );

            color:
              #fecaca;
          }

          .instagram-publish-button {
            margin-top:
              auto;

            width:
              100%;

            border:
              none;

            border-radius:
              14px;

            padding:
              15px 18px;

            background:
              #22d3ee;

            color:
              #020617;

            font-size:
              14px;

            font-weight:
              900;

            cursor:
              pointer;
          }

          .instagram-publish-button:hover {
            background:
              #67e8f9;
          }

          .instagram-publish-button:disabled {
            opacity:
              0.5;

            cursor:
              wait;
          }

          /* ==========================================
             PROFILE
          ========================================== */

          .instagram-profile-card {
            display:
              grid;

            grid-template-columns:
              auto
              minmax(
                0,
                1fr
              )
              auto;

            gap:
              20px;

            align-items:
              center;

            margin-bottom:
              24px;

            border:
              1px solid
              #1e293b;

            border-radius:
              22px;

            padding:
              22px;

            background:
              linear-gradient(
                135deg,
                rgba(
                  34,
                  211,
                  238,
                  0.06
                ),
                rgba(
                  37,
                  99,
                  235,
                  0.04
                )
              ),
              #0f172a;
          }

          .instagram-avatar {
            width:
              88px;

            height:
              88px;

            border-radius:
              50%;

            object-fit:
              cover;

            border:
              3px solid
              rgba(
                34,
                211,
                238,
                0.65
              );

            background:
              #020617;
          }

          .instagram-avatar-fallback {
            width:
              88px;

            height:
              88px;

            display:
              grid;

            place-items:
              center;

            border-radius:
              50%;

            border:
              3px solid
              #22d3ee;

            background:
              linear-gradient(
                135deg,
                #7c3aed,
                #db2777,
                #f97316
              );

            color:
              white;

            font-size:
              30px;

            font-weight:
              900;
          }

          .instagram-profile-main h2 {
            margin:
              0;

            color:
              white;

            font-size:
              28px;
          }

          .instagram-profile-main p {
            margin:
              4px 0 0;

            color:
              #94a3b8;
          }

          .instagram-connected {
            display:
              inline-flex;

            align-items:
              center;

            gap:
              8px;

            margin-top:
              12px;

            padding:
              7px 11px;

            border:
              1px solid
              rgba(
                34,
                197,
                94,
                0.35
              );

            border-radius:
              999px;

            background:
              rgba(
                34,
                197,
                94,
                0.09
              );

            color:
              #86efac;

            font-size:
              12px;

            font-weight:
              900;
          }

          .instagram-dot {
            width:
              8px;

            height:
              8px;

            border-radius:
              50%;

            background:
              #22c55e;
          }

          .instagram-open-link {
            padding:
              11px 14px;

            border:
              1px solid
              #334155;

            border-radius:
              14px;

            color:
              #cbd5e1;

            text-decoration:
              none;

            font-weight:
              800;
          }

          /* ==========================================
             STATS
          ========================================== */

          .instagram-stats {
            display:
              grid;

            grid-template-columns:
              repeat(
                4,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              14px;

            margin-bottom:
              24px;
          }

          .instagram-stat {
            padding:
              18px;

            border:
              1px solid
              #1e293b;

            border-radius:
              18px;

            background:
              #0f172a;
          }

          .instagram-stat span {
            display:
              block;

            margin-bottom:
              8px;

            color:
              #64748b;

            font-size:
              10px;

            font-weight:
              900;

            letter-spacing:
              0.14em;

            text-transform:
              uppercase;
          }

          .instagram-stat strong {
            color:
              white;

            font-size:
              26px;
          }

          /* ==========================================
             POSTS
          ========================================== */

          .instagram-section {
            margin-bottom:
              24px;

            overflow:
              hidden;

            border:
              1px solid
              #1e293b;

            border-radius:
              22px;

            background:
              #0f172a;
          }

          .instagram-section-header {
            display:
              flex;

            align-items:
              center;

            justify-content:
              space-between;

            gap:
              16px;

            padding:
              20px 22px;

            border-bottom:
              1px solid
              #1e293b;
          }

          .instagram-section-header h2 {
            margin:
              0;

            color:
              white;

            font-size:
              24px;
          }

          .instagram-section-header span {
            color:
              #64748b;

            font-size:
              12px;

            font-weight:
              800;
          }

          .instagram-media-grid {
            display:
              grid;

            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              1px;

            background:
              #1e293b;
          }

          .instagram-media-card {
            background:
              #020617;
          }

          .instagram-media-preview,
          .instagram-media-video {
            width:
              100%;

            aspect-ratio:
              1 / 1;

            display:
              block;

            object-fit:
              cover;

            background:
              #111827;
          }

          .instagram-media-body {
            padding:
              14px;
          }

          .instagram-media-type {
            color:
              #22d3ee;

            font-size:
              10px;

            font-weight:
              900;

            text-transform:
              uppercase;
          }

          .instagram-media-caption {
            margin:
              8px 0 12px;

            color:
              #cbd5e1;

            font-size:
              13px;

            line-height:
              1.5;
          }

          .instagram-media-meta {
            color:
              #64748b;

            font-size:
              11px;
          }

          .instagram-media-link {
            display:
              inline-flex;

            margin-top:
              12px;

            color:
              #22d3ee;

            font-size:
              12px;

            font-weight:
              900;

            text-decoration:
              none;
          }

          .instagram-empty {
            grid-column:
              1 / -1;

            padding:
              52px 24px;

            text-align:
              center;

            background:
              #0f172a;
          }

          .instagram-empty-icon {
            margin-bottom:
              12px;

            font-size:
              42px;
          }

          .instagram-empty h3 {
            margin:
              0 0 8px;

            color:
              white;

            font-size:
              22px;
          }

          .instagram-empty p {
            margin:
              0 auto;

            max-width:
              560px;

            color:
              #64748b;

            line-height:
              1.6;
          }

          /* ==========================================
             TOOLS
          ========================================== */

          .instagram-tools {
            display:
              grid;

            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              14px;
          }

          .instagram-tool-card {
            padding:
              20px;

            border:
              1px solid
              #1e293b;

            border-radius:
              18px;

            background:
              #0f172a;
          }

          .instagram-tool-card h3 {
            margin:
              8px 0;

            color:
              white;

            font-size:
              18px;
          }

          .instagram-tool-card p {
            margin:
              0 0 14px;

            color:
              #64748b;

            font-size:
              13px;

            line-height:
              1.55;
          }

          .instagram-tool-status {
            display:
              inline-flex;

            padding:
              6px 9px;

            border-radius:
              999px;

            background:
              rgba(
                148,
                163,
                184,
                0.12
              );

            color:
              #94a3b8;

            font-size:
              10px;

            font-weight:
              900;
          }

          .instagram-tool-status.available {
            background:
              rgba(
                34,
                197,
                94,
                0.12
              );

            color:
              #86efac;
          }

          /* ==========================================
             LOADING
          ========================================== */

          .instagram-loading {
            display:
              grid;

            min-height:
              360px;

            place-items:
              center;

            border:
              1px solid
              #1e293b;

            border-radius:
              20px;

            background:
              #0f172a;

            color:
              #94a3b8;

            font-weight:
              800;
          }

          /* ==========================================
             RESPONSIVE
          ========================================== */

          @media (
            max-width:
            1000px
          ) {
            .instagram-stats {
              grid-template-columns:
                repeat(
                  2,
                  1fr
                );
            }

            .instagram-media-grid {
              grid-template-columns:
                repeat(
                  2,
                  1fr
                );
            }

            .instagram-tools {
              grid-template-columns:
                1fr;
            }
          }

          @media (
            max-width:
            800px
          ) {
            .instagram-composer-grid {
              grid-template-columns:
                1fr;
            }
          }

          @media (
            max-width:
            700px
          ) {
            .instagram-page-header {
              flex-direction:
                column;
            }

            .instagram-header-actions {
              width:
                100%;
            }

            .instagram-create-button,
            .instagram-refresh {
              flex:
                1;
            }

            .instagram-profile-card {
              grid-template-columns:
                auto 1fr;
            }

            .instagram-open-link {
              grid-column:
                1 / -1;

              text-align:
                center;
            }

            .instagram-media-grid {
              grid-template-columns:
                1fr;
            }
          }

          @media (
            max-width:
            480px
          ) {
            .instagram-stats {
              grid-template-columns:
                1fr;
            }

            .instagram-profile-card {
              grid-template-columns:
                1fr;

              text-align:
                center;
            }

            .instagram-avatar,
            .instagram-avatar-fallback {
              margin:
                0 auto;
            }
          }

        `}
      </style>

      <section className="instagram-admin-page">

        {/* ================= HEADER ================= */}

        <div className="instagram-page-header">

          <div>
            <div className="instagram-kicker">
              Social Media
            </div>

            <h1>
              Instagram
            </h1>

            <p>
              Manage your connected SignaVi Studio
              Instagram Business account directly
              from your admin panel.
            </p>
          </div>

          <div className="instagram-header-actions">

            <button
              type="button"
              className="instagram-create-button"
              onClick={() => {
                setComposerOpen(
                  (current) =>
                    !current
                )
              }}
            >
              ＋ Create Post
            </button>

            <button
              type="button"
              className="instagram-refresh"
              onClick={() =>
                loadInstagram({
                  silent: true
                })
              }
              disabled={
                refreshing
              }
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh Instagram"}
            </button>

          </div>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="instagram-error">
            {error}
          </div>
        )}

        {/* ================= CREATE POST ================= */}

        {composerOpen && (
          <form
            className="instagram-composer"
            onSubmit={
              publishPost
            }
          >

            <div className="instagram-composer-header">

              <div>
                <div className="instagram-kicker">
                  New Instagram Post
                </div>

                <h2>
                  Create Post
                </h2>
              </div>

              <button
                type="button"
                className="instagram-composer-close"
                onClick={() => {
                  resetComposer()
                  setComposerOpen(false)
                }}
              >
                ×
              </button>

            </div>

            <div className="instagram-composer-grid">

              {/* IMAGE */}

              <div>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="
                    image/jpeg,
                    image/png,
                    image/webp
                  "
                  hidden
                  onChange={
                    handleImageChange
                  }
                />

                <div
                  className="instagram-upload-box"
                  role="button"
                  tabIndex={0}

                  onClick={() =>
                    fileInputRef
                      .current
                      ?.click()
                  }

                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      fileInputRef
                        .current
                        ?.click()
                    }
                  }}
                >

                  {previewUrl ? (
                    <img
                      src={
                        previewUrl
                      }
                      alt="Instagram post preview"
                      className="instagram-post-preview"
                    />
                  ) : (
                    <div className="instagram-upload-placeholder">

                      <div className="instagram-upload-icon">
                        📸
                      </div>

                      <strong>
                        Choose an Image
                      </strong>

                      Click here to select
                      an Instagram image.

                      <br />
                      <br />

                      JPG, PNG, or WEBP

                      <br />

                      Maximum 15 MB

                    </div>
                  )}

                </div>

              </div>

              {/* CAPTION */}

              <div className="instagram-composer-fields">

                <label htmlFor="instagram-caption">
                  Caption
                </label>

                <textarea
                  id="instagram-caption"
                  className="instagram-caption"

                  value={
                    caption
                  }

                  maxLength={
                    2200
                  }

                  onChange={(
                    event
                  ) =>
                    setCaption(
                      event.target.value
                    )
                  }

                  placeholder="Write your Instagram caption here..."
                />

                <div className="instagram-caption-count">
                  {caption.length}
                  {" / "}
                  2200
                </div>

                {publishMessage && (
                  <div
                    className={
                      publishSuccess
                        ? "instagram-publish-message success"
                        : "instagram-publish-message error"
                    }
                  >
                    {publishMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="instagram-publish-button"

                  disabled={
                    publishing ||
                    !selectedImage
                  }
                >
                  {publishing
                    ? "Publishing to Instagram..."
                    : "Publish to Instagram"}
                </button>

              </div>

            </div>

          </form>
        )}

        {/* ================= ACCOUNT ================= */}

        {loading ? (
          <div className="instagram-loading">
            Loading Instagram account...
          </div>
        ) : (
          <>

            <div className="instagram-profile-card">

              {profile?.profile_picture_url ? (
                <img
                  src={
                    profile.profile_picture_url
                  }
                  alt={
                    profile?.username
                      ? `@${profile.username}`
                      : "Instagram profile"
                  }
                  className="instagram-avatar"
                />
              ) : (
                <div className="instagram-avatar-fallback">
                  IG
                </div>
              )}

              <div className="instagram-profile-main">

                <h2>
                  {profile?.username
                    ? `@${profile.username}`
                    : "Instagram"}
                </h2>

                <p>
                  {profile?.account_type
                    ? `${profile.account_type} Account`
                    : "Professional Account"}
                </p>

                {connected && (
                  <div className="instagram-connected">

                    <span className="instagram-dot" />

                    Connected

                  </div>
                )}

              </div>

              {profile?.username && (
                <a
                  className="instagram-open-link"

                  href={
                    `https://www.instagram.com/${profile.username}/`
                  }

                  target="_blank"

                  rel="noreferrer"
                >
                  Open Instagram ↗
                </a>
              )}

            </div>

            {/* ================= STATS ================= */}

            <div className="instagram-stats">

              {stats.map(
                (item) => (
                  <article
                    className="instagram-stat"
                    key={
                      item.label
                    }
                  >

                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value}
                    </strong>

                  </article>
                )
              )}

            </div>

            {/* ================= POSTS ================= */}

            <section className="instagram-section">

              <div className="instagram-section-header">

                <h2>
                  Recent Posts
                </h2>

                <span>
                  {media.length}
                  {" loaded"}
                </span>

              </div>

              <div className="instagram-media-grid">

                {media.length === 0 ? (

                  <div className="instagram-empty">

                    <div className="instagram-empty-icon">
                      📸
                    </div>

                    <h3>
                      No Instagram posts yet
                    </h3>

                    <p>
                      Your Instagram connection
                      is working. Click Create Post
                      above to publish your first
                      Instagram post directly from
                      SignaVi Admin.
                    </p>

                  </div>

                ) : (

                  media.map(
                    (item) => {

                      const preview =
                        item.thumbnail_url ||
                        item.media_url

                      const isVideo =
                        item.media_type ===
                          "VIDEO" ||
                        item.media_type ===
                          "REELS"

                      return (
                        <article
                          className="instagram-media-card"

                          key={
                            item.id
                          }
                        >

                          {preview && (
                            isVideo ? (
                              <video
                                className="instagram-media-video"

                                src={
                                  preview
                                }

                                controls

                                preload="metadata"
                              />
                            ) : (
                              <img
                                className="instagram-media-preview"

                                src={
                                  preview
                                }

                                alt={
                                  item.caption ||
                                  "Instagram media"
                                }
                              />
                            )
                          )}

                          <div className="instagram-media-body">

                            <div className="instagram-media-type">
                              {item.media_type ||
                                "POST"}
                            </div>

                            <div className="instagram-media-caption">
                              {item.caption ||
                                "No caption"}
                            </div>

                            <div className="instagram-media-meta">
                              {formatDate(
                                item.timestamp
                              )}
                            </div>

                            {item.permalink && (
                              <a
                                className="instagram-media-link"

                                href={
                                  item.permalink
                                }

                                target="_blank"

                                rel="noreferrer"
                              >
                                View on Instagram ↗
                              </a>
                            )}

                          </div>

                        </article>
                      )
                    }
                  )

                )}

              </div>

            </section>

            {/* ================= TOOLS ================= */}

            <div className="instagram-tools">

              <article className="instagram-tool-card">

                <div>
                  ✍️
                </div>

                <h3>
                  Create Post
                </h3>

                <p>
                  Upload an image, write your
                  caption, and publish directly
                  to Instagram.
                </p>

                <span className="instagram-tool-status available">
                  Available
                </span>

              </article>

              <article className="instagram-tool-card">

                <div>
                  💬
                </div>

                <h3>
                  Messages
                </h3>

                <p>
                  Bring Instagram customer
                  conversations into your
                  Communications workspace.
                </p>

                <span className="instagram-tool-status">
                  Webhook setup needed
                </span>

              </article>

              <article className="instagram-tool-card">

                <div>
                  ❤️
                </div>

                <h3>
                  Comments
                </h3>

                <p>
                  Review and manage comments
                  from your Instagram Business
                  account.
                </p>

                <span className="instagram-tool-status">
                  Webhook setup needed
                </span>

              </article>

            </div>

          </>
        )}

      </section>
    </>
  )
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "No date"
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return date.toLocaleString(
    undefined,
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit"
    }
  )
}