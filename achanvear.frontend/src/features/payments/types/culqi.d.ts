// features/payments/types/culqi.d.ts
// Declaracion unica del SDK de Culqi Checkout v4 expuesto en window.
// Cualquier componente del feature de pagos que use `window.Culqi` o
// `window.culqi` debe apoyarse en esta declaracion global para evitar
// conflictos de tipos duplicados.

export interface CulqiToken {
  id: string;
  email?: string;
}

export interface CulqiError {
  user_message?: string;
  merchant_message?: string;
}

export interface CulqiCheckoutSdk {
  publicKey: string;
  settings: (settings: Record<string, unknown>) => void;
  options: (options: Record<string, unknown>) => void;
  open: () => void;
  close: () => void;
  token?: CulqiToken;
  order?: unknown;
  error?: CulqiError;
}

declare global {
  interface Window {
    Culqi?: CulqiCheckoutSdk;
    culqi?: () => void;
  }
}
