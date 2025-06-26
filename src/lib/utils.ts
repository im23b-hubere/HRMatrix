export function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    // Immer die Haupt-URL für Produktion zurückgeben
    return "https://hr-matrix-new.vercel.app";
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  return "http://localhost:3000";
} 