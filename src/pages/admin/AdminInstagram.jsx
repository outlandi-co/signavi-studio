import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import api from "../../services/api"

export default function AdminInstagram() {
  /* =========================================================
     INSTAGRAM ACCOUNT
  ========================================================= */

  const [profile, setProfile] =
    useState(null)

  const [media, setMedia] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState("")

  /* =========================================================
     SOCIAL PLATFORM STATUS
  ========================================================= */

  const [platforms, setPlatforms] =
    useState({
      instagram: {
        configured: false
      },

      facebook: {
        configured: false
      },

      tiktok: {
        configured: false
      }
    })

  /* =========================================================
     SOCIAL POST COMPOSER
  ========================================================= */

  const [
    composerOpen,
    setComposerOpen
  ] =
    useState(false)

  const [
    selectedImage,
    setSelectedImage
  ] =
    useState(null)

  const [
    previewUrl,
    setPreviewUrl
  ] =
    useState("")

  const [
    caption,
    setCaption
  ] =
    useState("")

  const [
    publishing,
    setPublishing
  ] =
    useState(false)

  const [
    publishMessage,
    setPublishMessage
  ] =
    useState("")

  const [
    publishSuccess,
    setPublishSuccess
  ] =
    useState(false)

  const [
    publishResults,
    setPublishResults
  ] =
    useState(null)

  /* =========================================================
     PLATFORM SELECTION
  ========================================================= */

  const [
    selectedPlatforms,
    setSelectedPlatforms
  ] =
    useState({
      instagram: true,
      facebook: false,
      tiktok: false
    })

  const fileInputRef =
    useRef(null)

  /* =========================================================
     LOAD INSTAGRAM
  ========================================================= */

  const loadInstagram =
    useCallback(
      async ({
        silent = false
      } = {}) => {
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
          ] =
            await Promise.all([
              api.get(
                "/instagram/profile"
              ),

              api.get(
                "/instagram/media"
              )
            ])

          setProfile(
            profileResponse
              ?.data
              ?.profile ||
            null
          )

          setMedia(
            Array.isArray(
              mediaResponse
                ?.data
                ?.media
            )
              ? mediaResponse
                  .data
                  .media
              : []
          )
        } catch (err) {
          console.error(
            "❌ INSTAGRAM LOAD ERROR:",
            err
          )

          setError(
            err?.response
              ?.data
              ?.message ||
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

  /* =========================================================
     LOAD SOCIAL STATUS
  ========================================================= */

  const loadSocialStatus =
  useCallback(
    async () => {
      try {
        const [
          socialResponse,
          tiktokResponse
        ] = await Promise.all([
          api.get("/social/status"),
          api.get("/tiktok/status")
        ])

        const socialPlatforms =
          socialResponse?.data?.platforms || {}

        const tiktokStatus =
          tiktokResponse?.data || {}

        const nextPlatforms = {
          instagram: {
            ...socialPlatforms.instagram,
            configured: Boolean(
              socialPlatforms
                ?.instagram
                ?.configured
            )
          },

          facebook: {
            ...socialPlatforms.facebook,
            configured: Boolean(
              socialPlatforms
                ?.facebook
                ?.configured
            )
          },

          tiktok: {
            ...socialPlatforms.tiktok,

            configured: Boolean(
              tiktokStatus.configured
            ),

            connected: Boolean(
              tiktokStatus.connected
            ),

            openId:
              tiktokStatus.openId ||
              null,

            scopes:
              tiktokStatus.scopes ||
              []
          }
        }

        console.log(
          "🌐 SOCIAL PLATFORM STATUS:",
          nextPlatforms
        )

        setPlatforms(nextPlatforms)

        setSelectedPlatforms(
          (current) => ({
            instagram:
              nextPlatforms
                .instagram
                .configured &&
              current.instagram,

            facebook:
              nextPlatforms
                .facebook
                .configured &&
              current.facebook,

            tiktok:
              nextPlatforms
                .tiktok
                .configured &&
              nextPlatforms
                .tiktok
                .connected
                ? current.tiktok
                : false
          })
        )
      } catch (err) {
        console.error(
          "❌ SOCIAL STATUS ERROR:",
          err
        )
      }
    },
    []
  )

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadInstagram()
    loadSocialStatus()
  }, [
    loadInstagram,
    loadSocialStatus
  ])

  /* =========================================================
     CLEAN IMAGE PREVIEW
  ========================================================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        )
      }
    }
  }, [previewUrl])

  /* =========================================================
     ACCOUNT STATS
  ========================================================= */

  const stats =
    useMemo(
      () => [
        {
          label:
            "Followers",

          value:
            profile
              ?.followers_count ??
            "—"
        },

        {
          label:
            "Following",

          value:
            profile
              ?.follows_count ??
            "—"
        },

        {
          label:
            "Posts",

          value:
            profile
              ?.media_count ??
            media.length
        },

        {
          label:
            "Account",

          value:
            profile
              ?.account_type ||
            "—"
        }
      ],
      [
        profile,
        media.length
      ]
    )

  const connected =
    Boolean(
      profile?.id &&
      profile?.username
    )

  /* =========================================================
     SELECT PLATFORM
  ========================================================= */

  const togglePlatform = (
  platform
) => {
  const platformStatus =
    platforms?.[platform]

  const unavailable =
    platform === "tiktok"
      ? !platformStatus?.connected
      : platform === "instagram"
        ? !(connected || platformStatus?.configured)
        : !platformStatus?.configured

  if (unavailable) {
    return
  }

  setSelectedPlatforms(
    (current) => ({
      ...current,
      [platform]:
        !current[platform]
    })
  )
}

  /* =========================================================
     IMAGE PICKER
  ========================================================= */

  const handleImageChange = (
    event
  ) => {
    const file =
      event
        .target
        .files?.[0]

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
      setPublishSuccess(
        false
      )

      setPublishMessage(
        "Please choose a JPG, PNG, or WEBP image."
      )

      return
    }

    const maxSize =
      15 *
      1024 *
      1024

    if (
      file.size >
      maxSize
    ) {
      setPublishSuccess(
        false
      )

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

    setSelectedImage(
      file
    )

    setPreviewUrl(
      URL.createObjectURL(
        file
      )
    )

    setPublishMessage("")
    setPublishResults(null)
    setPublishSuccess(false)
  }

  /* =========================================================
     RESET COMPOSER
  ========================================================= */

  const resetComposer =
    () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        )
      }

      setSelectedImage(null)

      setPreviewUrl("")

      setCaption("")

      setPublishMessage("")

      setPublishResults(null)

      setPublishSuccess(false)

      if (
        fileInputRef.current
      ) {
        fileInputRef
          .current
          .value = ""
      }
    }

  /* =========================================================
     PUBLISH SOCIAL POST
  ========================================================= */

  const publishPost =
    async (event) => {
      event.preventDefault()

      if (!selectedImage) {
        setPublishSuccess(
          false
        )

        setPublishMessage(
          "Choose an image before publishing."
        )

        return
      }

      const selectedCount =
        Object
          .values(
            selectedPlatforms
          )
          .filter(Boolean)
          .length

      if (
        selectedCount === 0
      ) {
        setPublishSuccess(
          false
        )

        setPublishMessage(
          "Select at least one social platform."
        )

        return
      }

      try {
        setPublishing(true)

        setPublishMessage(
          ""
        )

        setPublishResults(
          null
        )

        setPublishSuccess(
          false
        )

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

        formData.append(
          "instagram",
          String(
            selectedPlatforms
              .instagram
          )
        )

        formData.append(
          "facebook",
          String(
            selectedPlatforms
              .facebook
          )
        )

        formData.append(
          "tiktok",
          String(
            selectedPlatforms
              .tiktok
          )
        )

        console.log(
          "🌐 Publishing social post..."
        )

        console.log(
          "📸 Instagram:",
          selectedPlatforms
            .instagram
        )

        console.log(
          "📘 Facebook:",
          selectedPlatforms
            .facebook
        )

        console.log(
          "🎵 TikTok:",
          selectedPlatforms
            .tiktok
        )

        const response =
          await api.post(
            "/social/publish",
            formData
          )

        console.log(
          "✅ SOCIAL PUBLISH RESPONSE:",
          response.data
        )

        const results =
          response
            ?.data
            ?.results ||
          {}

        setPublishResults(
          results
        )

        const successful =
          Object
            .values(
              results
            )
            .filter(
              (result) =>
                result?.success
            )
            .length

        const total =
          Object.keys(
            results
          ).length

        if (
          successful ===
          total &&
          total > 0
        ) {
          setPublishSuccess(
            true
          )

          setPublishMessage(
            "Post published successfully."
          )
        } else if (
          successful > 0
        ) {
          setPublishSuccess(
            true
          )

          setPublishMessage(
            "Post published to some platforms. Check the results below."
          )
        } else {
          setPublishSuccess(
            false
          )

          setPublishMessage(
            "The post could not be published."
          )
        }

        /*
         * Instagram may take a moment before
         * the new post appears in /media.
         */

        window.setTimeout(
          () => {
            loadInstagram({
              silent:
                true
            })
          },
          2000
        )
      } catch (err) {
        console.error(
          "❌ SOCIAL PUBLISH ERROR:",
          err
        )

        setPublishSuccess(
          false
        )

        setPublishMessage(
          err?.response
            ?.data
            ?.message ||
          err?.message ||
          "Social publishing failed."
        )
      } finally {
        setPublishing(
          false
        )
      }
    }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <style>
        {`

          .social-admin-page {
            width: 100%;
            min-width: 0;
            color: #e2e8f0;
          }

          /* ================= HEADER ================= */

          .social-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 28px;
          }

          .social-header h1 {
            margin: 4px 0 8px;
            color: #ffffff;
            font-size: clamp(
              34px,
              5vw,
              52px
            );
            line-height: 1;
            letter-spacing:
              -0.04em;
          }

          .social-header p {
            margin: 0;
            max-width: 760px;
            color: #94a3b8;
            line-height: 1.65;
          }

          .social-kicker {
            color: #22d3ee;
            font-size: 11px;
            font-weight: 900;
            letter-spacing:
              0.18em;
            text-transform:
              uppercase;
          }

          .social-header-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .social-button {
            border: 1px solid
              #334155;
            border-radius: 14px;
            padding: 12px 16px;
            background: #0f172a;
            color: #e2e8f0;
            font-weight: 900;
            cursor: pointer;
          }

          .social-button.primary {
            border-color:
              #22d3ee;
            background:
              #22d3ee;
            color:
              #020617;
          }

          .social-button.primary:hover {
            background:
              #67e8f9;
          }

          .social-button:hover {
            border-color:
              #22d3ee;
          }

          .social-button:disabled {
            opacity: 0.5;
            cursor: wait;
          }

          /* ================= ERRORS ================= */

          .social-error {
            margin-bottom: 20px;
            padding: 14px 16px;
            border:
              1px solid
              rgba(
                248,
                113,
                113,
                0.4
              );
            border-radius: 15px;
            background:
              rgba(
                127,
                29,
                29,
                0.22
              );
            color: #fecaca;
          }

          /* ================= COMPOSER ================= */

          .social-composer {
            margin-bottom: 26px;
            padding: 24px;
            border:
              1px solid
              rgba(
                34,
                211,
                238,
                0.4
              );
            border-radius: 22px;
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

          .social-composer-header {
            display: flex;
            justify-content:
              space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
          }

          .social-composer-header h2 {
            margin: 4px 0 0;
            color: white;
            font-size: 26px;
          }

          .social-close {
            width: 40px;
            height: 40px;
            border:
              1px solid #334155;
            border-radius: 12px;
            background: #020617;
            color: white;
            cursor: pointer;
            font-size: 20px;
          }

          .social-composer-grid {
            display: grid;
            grid-template-columns:
              minmax(
                260px,
                0.85fr
              )
              minmax(
                0,
                1.15fr
              );
            gap: 22px;
          }

          /* ================= IMAGE ================= */

          .social-upload {
            width: 100%;
            min-height: 360px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border:
              2px dashed
              #334155;
            border-radius: 18px;
            background: #020617;
            cursor: pointer;
          }

          .social-upload:hover {
            border-color:
              #22d3ee;
          }

          .social-upload-placeholder {
            padding: 30px;
            text-align: center;
            color: #94a3b8;
            line-height: 1.7;
          }

          .social-upload-placeholder strong {
            display: block;
            margin-bottom: 8px;
            color: white;
            font-size: 18px;
          }

          .social-upload-icon {
            margin-bottom: 12px;
            font-size: 46px;
          }

          .social-preview {
            width: 100%;
            height: 100%;
            max-height: 520px;
            object-fit: contain;
            background: #000;
          }

          /* ================= CAPTION ================= */

          .social-fields {
            display: flex;
            flex-direction:
              column;
          }

          .social-label {
            margin-bottom: 8px;
            color: #94a3b8;
            font-size: 11px;
            font-weight: 900;
            letter-spacing:
              0.14em;
            text-transform:
              uppercase;
          }

          .social-caption {
            width: 100%;
            min-height: 190px;
            box-sizing:
              border-box;
            resize: vertical;
            padding: 15px;
            border:
              1px solid #334155;
            border-radius: 15px;
            outline: none;
            background: #020617;
            color: white;
            font: inherit;
            line-height: 1.6;
          }

          .social-caption:focus {
            border-color:
              #22d3ee;
          }

          .social-caption-count {
            margin:
              7px 0 18px;
            color: #64748b;
            font-size: 11px;
            text-align: right;
          }

          /* ================= PLATFORMS ================= */

          .social-platforms {
            display: grid;
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );
            gap: 10px;
            margin-bottom: 18px;
          }

          .social-platform {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 72px;
            padding: 14px;
            border:
              1px solid #334155;
            border-radius: 15px;
            background: #020617;
            cursor: pointer;
            user-select: none;
          }

          .social-platform.selected {
            border-color:
              #22d3ee;
            background:
              rgba(
                34,
                211,
                238,
                0.08
              );
          }

          .social-platform.disabled {
            opacity: 0.45;
            cursor:
              not-allowed;
          }

          .social-platform-icon {
            font-size: 25px;
          }

          .social-platform-text strong {
            display: block;
            color: white;
            font-size: 13px;
          }

          .social-platform-text span {
            display: block;
            margin-top: 3px;
            color: #64748b;
            font-size: 10px;
          }

          .social-check {
            margin-left: auto;
            width: 22px;
            height: 22px;
            display: grid;
            place-items: center;
            border:
              1px solid #475569;
            border-radius: 7px;
            color: #020617;
            font-size: 13px;
            font-weight: 900;
          }

          .social-platform.selected
          .social-check {
            border-color:
              #22d3ee;
            background:
              #22d3ee;
          }

          /* ================= PUBLISH ================= */

          .social-publish-button {
            width: 100%;
            margin-top: auto;
            border: none;
            border-radius: 14px;
            padding: 15px 18px;
            background:
              #22d3ee;
            color: #020617;
            font-weight: 900;
            cursor: pointer;
          }

          .social-publish-button:hover {
            background:
              #67e8f9;
          }

          .social-publish-button:disabled {
            opacity: 0.5;
            cursor: wait;
          }

          .social-message {
            margin-bottom: 14px;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.5;
          }

          .social-message.success {
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
            color: #86efac;
          }

          .social-message.error {
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
                0.22
              );
            color: #fecaca;
          }

          /* ================= RESULTS ================= */

          .social-results {
            display: grid;
            gap: 8px;
            margin-bottom: 15px;
          }

          .social-result {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            gap: 12px;
            padding: 10px 12px;
            border:
              1px solid #1e293b;
            border-radius: 11px;
            background: #020617;
          }

          .social-result-name {
            color: #cbd5e1;
            font-size: 12px;
            font-weight: 900;
          }

          .social-result.success {
            border-color:
              rgba(
                34,
                197,
                94,
                0.35
              );
          }

          .social-result.failed {
            border-color:
              rgba(
                248,
                113,
                113,
                0.35
              );
          }

          .social-result-status {
            font-size: 11px;
            font-weight: 900;
          }

          .social-result.success
          .social-result-status {
            color: #86efac;
          }

          .social-result.failed
          .social-result-status {
            color: #fecaca;
          }

          /* ================= PROFILE ================= */

          .instagram-profile-card {
            display: grid;
            grid-template-columns:
              auto
              minmax(
                0,
                1fr
              )
              auto;
            gap: 20px;
            align-items: center;
            margin-bottom: 24px;
            padding: 22px;
            border:
              1px solid #1e293b;
            border-radius: 22px;
            background:
              #0f172a;
          }

          .instagram-avatar {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            object-fit: cover;
            border:
              3px solid
              rgba(
                34,
                211,
                238,
                0.65
              );
          }

          .instagram-avatar-fallback {
            width: 88px;
            height: 88px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background:
              #020617;
            color: white;
            font-weight: 900;
          }

          .instagram-profile-main h2 {
            margin: 0;
            color: white;
            font-size: 28px;
          }

          .instagram-profile-main p {
            margin: 4px 0 0;
            color: #94a3b8;
          }

          .instagram-connected {
            display:
              inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            padding: 7px 11px;
            border-radius: 999px;
            background:
              rgba(
                34,
                197,
                94,
                0.1
              );
            color: #86efac;
            font-size: 12px;
            font-weight: 900;
          }

          .instagram-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background:
              #22c55e;
          }

          .instagram-open-link {
            padding: 11px 14px;
            border:
              1px solid #334155;
            border-radius: 14px;
            color: #cbd5e1;
            text-decoration: none;
            font-weight: 800;
          }

          /* ================= STATS ================= */

          .instagram-stats {
            display: grid;
            grid-template-columns:
              repeat(
                4,
                minmax(
                  0,
                  1fr
                )
              );
            gap: 14px;
            margin-bottom: 24px;
          }

          .instagram-stat {
            padding: 18px;
            border:
              1px solid #1e293b;
            border-radius: 18px;
            background: #0f172a;
          }

          .instagram-stat span {
            display: block;
            margin-bottom: 8px;
            color: #64748b;
            font-size: 10px;
            font-weight: 900;
            letter-spacing:
              0.14em;
            text-transform:
              uppercase;
          }

          .instagram-stat strong {
            color: white;
            font-size: 26px;
          }

          /* ================= POSTS ================= */

          .instagram-section {
            margin-bottom: 24px;
            overflow: hidden;
            border:
              1px solid #1e293b;
            border-radius: 22px;
            background: #0f172a;
          }

          .instagram-section-header {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            gap: 16px;
            padding: 20px 22px;
            border-bottom:
              1px solid #1e293b;
          }

          .instagram-section-header h2 {
            margin: 0;
            color: white;
            font-size: 24px;
          }

          .instagram-section-header span {
            color: #64748b;
            font-size: 12px;
            font-weight: 800;
          }

          .instagram-media-grid {
            display: grid;
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );
            gap: 1px;
            background: #1e293b;
          }

          .instagram-media-card {
            min-width: 0;
            background: #020617;
          }

          .instagram-media-preview,
          .instagram-media-video {
            width: 100%;
            aspect-ratio: 1 / 1;
            display: block;
            object-fit: cover;
            background: #111827;
          }

          .instagram-media-body {
            padding: 14px;
          }

          .instagram-media-type {
            color: #22d3ee;
            font-size: 10px;
            font-weight: 900;
            text-transform:
              uppercase;
          }

          .instagram-media-caption {
            margin: 8px 0 12px;
            color: #cbd5e1;
            font-size: 13px;
            line-height: 1.5;
          }

          .instagram-media-meta {
            color: #64748b;
            font-size: 11px;
          }

          .instagram-media-link {
            display: inline-flex;
            margin-top: 12px;
            color: #22d3ee;
            font-size: 12px;
            font-weight: 900;
            text-decoration: none;
          }

          .instagram-empty {
            grid-column:
              1 / -1;
            padding: 52px 24px;
            text-align: center;
            background: #0f172a;
          }

          .instagram-empty-icon {
            margin-bottom: 12px;
            font-size: 42px;
          }

          .instagram-empty h3 {
            margin: 0 0 8px;
            color: white;
            font-size: 22px;
          }

          .instagram-empty p {
            margin: 0 auto;
            max-width: 560px;
            color: #64748b;
            line-height: 1.6;
          }

          .instagram-loading {
            min-height: 360px;
            display: grid;
            place-items: center;
            border:
              1px solid #1e293b;
            border-radius: 20px;
            background: #0f172a;
            color: #94a3b8;
          }

          @media (
            max-width: 1000px
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

            .social-platforms {
              grid-template-columns:
                1fr;
            }
          }

          @media (
            max-width: 800px
          ) {
            .social-composer-grid {
              grid-template-columns:
                1fr;
            }
          }

          @media (
            max-width: 700px
          ) {
            .social-header {
              flex-direction:
                column;
            }

            .social-header-actions {
              width: 100%;
            }

            .social-button {
              flex: 1;
            }

            .instagram-profile-card {
              grid-template-columns:
                auto 1fr;
            }

            .instagram-open-link {
              grid-column:
                1 / -1;
              text-align: center;
            }

            .instagram-media-grid {
              grid-template-columns:
                1fr;
            }
          }

          @media (
            max-width: 480px
          ) {
            .instagram-stats {
              grid-template-columns:
                1fr;
            }

            .instagram-profile-card {
              grid-template-columns:
                1fr;
              text-align: center;
            }

            .instagram-avatar,
            .instagram-avatar-fallback {
              margin: 0 auto;
            }
          }

        `}
      </style>

      <section className="social-admin-page">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="social-header">

          <div>

            <div className="social-kicker">
              Social Media
            </div>

            <h1>
              Social Publisher
            </h1>

            <p>
              Create one post and publish it
              to Instagram, Facebook, and TikTok
              from your SignaVi Studio admin panel.
            </p>

          </div>

          <div className="social-header-actions">

            <button
              type="button"
              className="social-button primary"
              onClick={() =>
                setComposerOpen(
                  (current) =>
                    !current
                )
              }
            >
              ＋ Create Social Post
            </button>

            <button
              type="button"
              className="social-button"
              disabled={
                refreshing
              }
              onClick={() => {
                loadInstagram({
                  silent: true
                })

                loadSocialStatus()
              }}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

        </div>

        {error && (
          <div className="social-error">
            {error}
          </div>
        )}

        {/* ==========================================
            COMPOSER
        ========================================== */}

        {composerOpen && (

          <form
            className="social-composer"
            onSubmit={
              publishPost
            }
          >

            <div className="social-composer-header">

              <div>

                <div className="social-kicker">
                  New Post
                </div>

                <h2>
                  Create Social Post
                </h2>

              </div>

              <button
                type="button"
                className="social-close"
                onClick={() => {
                  resetComposer()

                  setComposerOpen(
                    false
                  )
                }}
              >
                ×
              </button>

            </div>

            <div className="social-composer-grid">

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
                  className="social-upload"
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
                      className="social-preview"
                      src={
                        previewUrl
                      }
                      alt="Social post preview"
                    />

                  ) : (

                    <div className="social-upload-placeholder">

                      <div className="social-upload-icon">
                        📸
                      </div>

                      <strong>
                        Choose an Image
                      </strong>

                      JPG, PNG, or WEBP

                      <br />

                      Maximum 15 MB

                    </div>

                  )}

                </div>

              </div>

              {/* RIGHT SIDE */}

              <div className="social-fields">

                <label
                  className="social-label"
                  htmlFor="social-caption"
                >
                  Caption
                </label>

                <textarea
                  id="social-caption"
                  className="social-caption"
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
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Write your social media caption..."
                />

                <div className="social-caption-count">
                  {caption.length}
                  {" / "}
                  2200
                </div>

                {/* ================= PLATFORMS ================= */}

                <div className="social-label">
                  Publish To
                </div>

                <div className="social-platforms">

                  {/* INSTAGRAM */}

                  <div
                    className={[
                      "social-platform",

                      selectedPlatforms
                        .instagram
                        ? "selected"
                        : "",

                      !(
                        connected ||
                        platforms
                          ?.instagram
                          ?.configured
                      )
                        ? "disabled"
                        : ""
                    ].join(" ")}
                    onClick={() =>
                      togglePlatform(
                        "instagram"
                      )
                    }
                  >

                    <div className="social-platform-icon">
                      📸
                    </div>

                    <div className="social-platform-text">

                      <strong>
                        Instagram
                      </strong>

                      <span>
                        {connected ||
platforms
  ?.instagram
  ?.configured
  ? "SignaVi Studio • Connected"
  : "Authorization required"}
                      </span>

                    </div>

                    <div className="social-check">
                      {selectedPlatforms
                        .instagram
                        ? "✓"
                        : ""}
                    </div>

                  </div>

                  {/* FACEBOOK */}

                  <div
                    className={[
                      "social-platform",

                      selectedPlatforms
                        .facebook
                        ? "selected"
                        : "",

                      !platforms
                        ?.facebook
                        ?.configured
                        ? "disabled"
                        : ""
                    ].join(" ")}
                    onClick={() =>
                      togglePlatform(
                        "facebook"
                      )
                    }
                  >

                    <div className="social-platform-icon">
                      📘
                    </div>

                    <div className="social-platform-text">

                      <strong>
                        Facebook
                      </strong>

                      <span>
                        {platforms
                          ?.facebook
                          ?.configured
                          ? "SignaVi Studio • Connected"
                          : "Setup required"}
                      </span>

                    </div>

                    <div className="social-check">
                      {selectedPlatforms
                        .facebook
                        ? "✓"
                        : ""}
                    </div>

                  </div>

                  {/* TIKTOK */}

                  <div
                    className={[
                      "social-platform",

                      selectedPlatforms
                        .tiktok
                        ? "selected"
                        : "",

                      !platforms
  ?.tiktok
  ?.connected
  ? "disabled"
  : ""
                    ].join(" ")}
                    onClick={() =>
                      togglePlatform(
                        "tiktok"
                      )
                    }
                  >

                    <div className="social-platform-icon">
                      🎵
                    </div>

                    <div className="social-platform-text">

                      <strong>
                        TikTok
                      </strong>

                      <span>
                        {platforms
                          ?.tiktok
                          ?.connected
                          ? "Connected"
                          : platforms
                              ?.tiktok
                              ?.configured
                            ? "Authorization required"
                            : "Setup required"}
                      </span>

                    </div>

                    <div className="social-check">
                      {selectedPlatforms
                        .tiktok
                        ? "✓"
                        : ""}
                    </div>

                  </div>

                </div>

                {/* ================= RESULT ================= */}

                {publishMessage && (

                  <div
                    className={
                      publishSuccess
                        ? "social-message success"
                        : "social-message error"
                    }
                  >
                    {publishMessage}
                  </div>

                )}

                {publishResults && (

                  <div className="social-results">

                    {Object.entries(
                      publishResults
                    ).map(
                      ([
                        platform,
                        result
                      ]) => (

                        <div
                          key={
                            platform
                          }
                          className={
                            result
                              ?.success
                              ? "social-result success"
                              : "social-result failed"
                          }
                        >

                          <div className="social-result-name">

                            {platform ===
                              "instagram" &&
                              "📸 Instagram"}

                            {platform ===
                              "facebook" &&
                              "📘 Facebook"}

                            {platform ===
                              "tiktok" &&
                              "🎵 TikTok"}

                          </div>

                          <div className="social-result-status">

                            {result
                              ?.success
                              ? "✓ Published"
                              : `✕ ${
                                  result
                                    ?.message ||
                                  "Failed"
                                }`}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

                <button
                  type="submit"
                  className="social-publish-button"
                  disabled={
                    publishing ||
                    !selectedImage
                  }
                >

                  {publishing
                    ? "Publishing..."
                    : "Publish Selected Platforms"}

                </button>

              </div>

            </div>

          </form>

        )}

        {/* ==========================================
            INSTAGRAM ACCOUNT
        ========================================== */}

        {loading ? (

          <div className="instagram-loading">
            Loading social account...
          </div>

        ) : (

          <>

            <div className="instagram-profile-card">

              {profile
                ?.profile_picture_url
                ? (

                  <img
                    className="instagram-avatar"
                    src={
                      profile
                        .profile_picture_url
                    }
                    alt={
                      profile
                        ?.username
                        ? `@${profile.username}`
                        : "Instagram"
                    }
                  />

                ) : (

                  <div className="instagram-avatar-fallback">
                    IG
                  </div>

                )}

              <div className="instagram-profile-main">

                <h2>
                  {profile
                    ?.username
                    ? `@${profile.username}`
                    : "Instagram"}
                </h2>

                <p>
                  {profile
                    ?.account_type
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

              {profile
                ?.username &&
                (

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

            {/* ==========================================
                STATS
            ========================================== */}

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

            {/* ==========================================
                RECENT POSTS
            ========================================== */}

            <section className="instagram-section">

              <div className="instagram-section-header">

                <h2>
                  Instagram Recent Posts
                </h2>

                <span>
                  {media.length}
                  {" loaded"}
                </span>

              </div>

              <div className="instagram-media-grid">

                {media.length ===
                0 ? (

                  <div className="instagram-empty">

                    <div className="instagram-empty-icon">
                      📸
                    </div>

                    <h3>
                      No Instagram posts yet
                    </h3>

                    <p>
                      Published Instagram posts
                      will appear here automatically.
                    </p>

                  </div>

                ) : (

                  media.map(
                    (item) => {

                      const preview =
                        item
                          .thumbnail_url ||
                        item
                          .media_url

                      const isVideo =
                        item
                          .media_type ===
                          "VIDEO" ||
                        item
                          .media_type ===
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
                                  item
                                    .caption ||
                                  "Instagram post"
                                }
                              />

                            )

                          )}

                          <div className="instagram-media-body">

                            <div className="instagram-media-type">
                              {item
                                .media_type ||
                                "POST"}
                            </div>

                            <div className="instagram-media-caption">
                              {item
                                .caption ||
                                "No caption"}
                            </div>

                            <div className="instagram-media-meta">
                              {formatDate(
                                item
                                  .timestamp
                              )}
                            </div>

                            {item
                              .permalink &&
                              (

                                <a
                                  className="instagram-media-link"
                                  href={
                                    item
                                      .permalink
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

          </>

        )}

      </section>
    </>
  )
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "No date"
  }

  const date =
    new Date(
      value
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return date
    .toLocaleString(
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