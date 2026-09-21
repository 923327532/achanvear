// features/interview/components/ChooseSlotPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Calendar, Key } from "lucide-react";
import { getAuthToken } from "@/lib/storage";

export function ChooseSlotPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scheduleId = searchParams.get("id");
  const slotIndex = searchParams.get("slot");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [token, setToken] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Verificar si el usuario está logueado
    const authToken = getAuthToken();
    if (!authToken) {
      // Redirigir a login y luego volver aquí
      const returnUrl = encodeURIComponent(`/freelancer/interviews/choose-slot?id=${scheduleId}&slot=${slotIndex}`);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    if (!scheduleId || slotIndex === null) {
      setStatus("error");
      setMessage("Enlace invalido: faltan parametros");
      return;
    }

    const chooseSlot = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1"}/interviews/schedule/${scheduleId}/choose`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ slotIndex: parseInt(slotIndex) }),
          }
        );

        const json = await response.json();
        const data = json?.data;

        if (response.ok && data?.interviewToken) {
          setToken(data.interviewToken);
          setInterviewId(data.interviewId || "");
          setMessage(data.message || "Horario elegido correctamente");
          setStatus("success");
        } else {
          setMessage(data?.message || json?.message || "Error al elegir horario");
          setStatus("error");
        }
      } catch (err: any) {
        setMessage(err?.message || "Error de conexion");
        setStatus("error");
      }
    };

    chooseSlot();
  }, [scheduleId, slotIndex, router]);

  const handleGoToInterviews = () => {
    router.push("/freelancer/interviews");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        {status === "loading" && (
          <div className="py-12">
            <Loader2 className="w-12 h-12 text-[#1B3A6B] animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-600">Confirmando tu horario...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Horario Confirmado</h2>
            <p className="text-sm text-slate-500 mb-6">{message}</p>

            {/* Token de acceso */}
            {token && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700">Token de acceso unico</p>
                </div>
                <p className="text-lg font-bold text-[#1B3A6B] font-mono tracking-wider select-all">
                  {token}
                </p>
              </div>
            )}

            {/* ID de entrevista */}
            {interviewId && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 mb-6">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">ID Entrevista</p>
                <p className="text-xs font-mono text-slate-600 select-all">{interviewId}</p>
              </div>
            )}

            <button
              onClick={handleGoToInterviews}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
            >
              <Calendar className="w-4 h-4" />
              Ir a mis entrevistas
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <button
              onClick={handleGoToInterviews}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A6B] text-white text-sm font-bold hover:bg-[#162f58] transition"
            >
              Volver a mis entrevistas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}