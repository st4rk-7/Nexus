// Local development leaves this empty and uses Vite's /api proxy.
// Set VITE_API_URL only when serving the backend at a different address.
const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, "")
  : "";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
