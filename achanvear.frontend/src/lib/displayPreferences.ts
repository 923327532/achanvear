const KEY = "achanvear_display_preferences";
export function saveDisplayPreferences(language?: string | null, timezone?: string | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify({ language: language || "es-PE", timezone: timezone || "UTC-5" }));
}
export function clearDisplayPreferences() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
function preferences(): { language?: string; timezone?: string } {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function displayLocale() {
  const language = preferences().language;
  return language && ["es-PE", "es-ES", "en-US"].includes(language) ? language : "es-PE";
}
export function displayTimeZone() {
  const zone = preferences().timezone || "UTC-5";
  const offset = /^UTC([+-])(\d{1,2})$/.exec(zone);
  if (offset && Number(offset[2]) <= 12) return `Etc/GMT${offset[1] === "+" ? "-" : "+"}${Number(offset[2])}`;
  return "America/Lima";
}
