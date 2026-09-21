// src/lib/friendlyErrors.ts
// Centraliza la traducción de errores a mensajes claros y entendibles para el
// usuario final. Ningún mensaje técnico debería llegar a la interfaz.

import { ApiError } from "@/lib/errors";

const STATUS_MESSAGES: Record<number, string> = {
  400: "No pudimos procesar tu solicitud. Revisa la información e inténtalo de nuevo.",
  401: "Tu sesión no es válida o expiró. Inicia sesión de nuevo.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
  405: "Esta acción no está disponible en este momento.",
  409: "Ya existe un registro con esa información.",
  415: "El formato de la solicitud no es compatible.",
  422: "Revisa los datos ingresados e inténtalo de nuevo.",
  429: "Has hecho demasiados intentos. Espera un momento y vuelve a intentarlo.",
  500: "Ocurrió un error en el servidor. Intenta de nuevo en unos minutos.",
  502: "El servidor no está disponible en este momento. Intenta de nuevo.",
  503: "El servicio está en mantenimiento. Intenta de nuevo más tarde.",
  504: "El servidor tardó demasiado en responder. Intenta de nuevo.",
};

const DEFAULT_FALLBACK = "Ocurrió un error inesperado. Intenta de nuevo.";

// Patrones de mensajes técnicos o en inglés que nunca deben mostrarse al usuario.
const TECHNICAL_PATTERNS: RegExp[] = [
  /^Unexpected internal server error/i,
  /^Request failed with status code/i,
  /^Cannot read propert/i,
  /^Cannot resolve/i,
  /^undefined is not/i,
  /^null is not/i,
  /^TypeError/i,
  /^ReferenceError/i,
  /^SyntaxError/i,
  /^RangeError/i,
  /\bException\b/i,
  /\bat (java|org|com|achanvear)\./i,
  /^Invalid credentials/i,
  /^User not found/i,
  /^User is not active/i,
  /^Authentication required/i,
  /^Access Denied/i,
  /^Internal Server Error/i,
  /^Bad Gateway/i,
  /^Service Unavailable/i,
  /^Gateway Timeout/i,
];

export function isTechnicalMessage(message: string | null | undefined): boolean {
  if (!message) return true;
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

/** Devuelve el mensaje amigable según el código HTTP de estado. */
export function getStatusMessage(status: number | undefined): string {
  if (!status) return "No pudimos completar la acción. Intenta de nuevo.";
  return STATUS_MESSAGES[status] ?? "No pudimos completar la acción. Intenta de nuevo.";
}

/** Devuelve el mensaje más claro posible para el error recibido. */
export function getFriendlyErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    // Errores de servidor (5xx): siempre mensaje genérico, nunca detalles internos.
    if (err.status && err.status >= 500) {
      return STATUS_MESSAGES[err.status] ?? STATUS_MESSAGES[500] ?? DEFAULT_FALLBACK;
    }
    if (err.message && !isTechnicalMessage(err.message)) {
      return err.message;
    }
    if (err.status) {
      return STATUS_MESSAGES[err.status] ?? DEFAULT_FALLBACK;
    }
    return DEFAULT_FALLBACK;
  }

  if (err instanceof Error && err.message && !isTechnicalMessage(err.message)) {
    return err.message;
  }

  return DEFAULT_FALLBACK;
}
