function inferApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const { hostname, origin } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalhost) {
      return "http://localhost:3001/api";
    }

    return `${origin.replace(/\/$/, "")}/api`;
  }

  return "http://localhost:3001/api";
}

export const API_URL = inferApiUrl();
