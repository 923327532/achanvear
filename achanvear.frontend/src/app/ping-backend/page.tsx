"use client";

import { useState } from "react";
import api from "@/lib/axiosClient";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function PingBackendPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ping = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.get("/actuator/health");
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setError(err.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-2xl font-semibold">Ping Backend</h1>
      <p className="mt-2 text-sm text-slate-600">Prueba la conectividad con el backend y muestra la respuesta.</p>
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={ping} disabled={loading}>
          {loading ? "Probando..." : "Probar conexion"}
        </Button>
      </div>

      <div className="mt-6">
        {error ? (
          <Alert title="Error" message={error} variant="error" />
        ) : null}
        {result ? (
          <pre className="mt-4 max-h-96 overflow-auto rounded-md bg-slate-50 p-4 text-sm">{result}</pre>
        ) : null}
      </div>
    </div>
  );
}
