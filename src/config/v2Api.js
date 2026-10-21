const isProduction = import.meta.env.VERCEL_ENV === "production" ||
  import.meta.env.VITE_VERCEL_ENV === "production";

export const SIGNAVI_V2_API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  (isProduction
    ? "https://signavi-backend.onrender.com"
    : "https://signavi-backend-v2.onrender.com");
