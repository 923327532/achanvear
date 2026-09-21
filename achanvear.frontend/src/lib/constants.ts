//lib/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1";

const rawGoogle = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL;
export const GOOGLE_AUTH_URL = (() => {
  if (!rawGoogle) return `${API_BASE_URL.replace(/\/$/, "")}/auth/google`;
  // if env provided a relative path like '/auth/google', prefix API_BASE_URL
  if (rawGoogle.startsWith("/")) return `${API_BASE_URL.replace(/\/$/, "")}${rawGoogle}`;
  return rawGoogle;
})();
export const STORAGE_KEYS = {
  authToken: "achanvear_auth_token",
};

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
};

/**
 * Ruta de inicio según el rol del usuario, usada tras iniciar sesión.
 * Los roles administrativos van al panel /admin; COMPANY al panel de empresa;
 * el resto (FREELANCER, CANDIDATE) a /freelancer.
 */
export function homeRouteForRole(role?: string): string {
  const normalized = (role ?? "").toUpperCase();
  const adminRoles = ["SUPERADMIN", "SUBADMIN", "ADMIN", "SUPPORT"];
  if (adminRoles.includes(normalized)) return "/admin";
  if (normalized === "COMPANY" || normalized === "COMPANY_COLLABORATOR") return "/company";
  return "/freelancer";
}

// Mercado Pago
export const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";
export const MP_IS_SANDBOX = process.env.NEXT_PUBLIC_MP_IS_SANDBOX === "true";
