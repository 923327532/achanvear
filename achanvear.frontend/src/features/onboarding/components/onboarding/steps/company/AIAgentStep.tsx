"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";           // ← antes: features/company/api/companyApi
import type { CompanyOnboardingData, AIAgent } from "@/features/onboarding/types/onboarding.types"; // ← antes: features/company/types/company

interface AIAgentStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

const PERSONALITY_LABELS: Record<string, string> = {
  professional: "Profesional",
  analytical: "Analítico",
  academic: "Académico",
  creative: "Creativo",
};

export function AIAgentStep({ data, onUpdate, onNext, onBack }: AIAgentStepProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const loadedAgents = await onboardingService.getAIAgents(); // ← antes: companyService
      if (loadedAgents && loadedAgents.length > 0) {
        const mappedAgents: AIAgent[] = loadedAgents.map((a: any) => ({
          id: a.id || a.name?.toLowerCase().replace(/\s+/g, "_"),
          name: a.name || "",
          role: PERSONALITY_LABELS[String(a.personality || "").toLowerCase()] ?? (a.personality || a.role || ""),
          description: a.description || "",
          idealFor: a.capabilities || a.idealFor || [],
          specialization: a.specialization || "multidisciplinary",
        }));
        setAgents(mappedAgents);
      } else {
        setLoadError("No hay agentes de IA disponibles");
      }
    } catch (err) {
      console.error("Error loading agents:", err);
      setLoadError("No se pudieron cargar los agentes de IA");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setError(null);
    if (!data.selectedAgent) {
      setError("Debes seleccionar un agente de IA");
      return;
    }
    onNext();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Cargando agentes...</p>
      </div>
    );
  }

  if (loadError && agents.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Configura tu Agente de IA</h1>
        </div>
        <Alert message={loadError} />
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition"
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={loadAgents}
            className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Configura tu Agente de IA</h1>
        <p className="text-slate-600">Selecciona quién entrevistará a tus candidatos</p>
      </div>

      {error && <Alert message={error} />}

      <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">¿Cómo funciona el proceso automatizado?</h3>
        <ul className="space-y-2 text-blue-800">
          {[
            "El agente realiza el screening inicial de todos los CVs",
            "Conduce entrevistas personalizadas según el puesto",
            "Evalúa conocimientos teóricos y/o técnicos en tiempo real",
            "Genera un reporte completo con video grabado",
            "Te entrega un ranking de los mejores candidatos",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-semibold">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => { onUpdate({ selectedAgent: agent.id }); setError(null); }}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                data.selectedAgent === agent.id
                  ? "border-teal-600 bg-teal-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-slate-900 text-lg mb-1">{agent.name}</div>
              <div className="text-teal-600 font-semibold mb-2">{agent.role}</div>
              <p className="text-sm text-slate-600 mb-3">{agent.description}</p>
              <div className="text-xs text-slate-500">
                <strong>Ideal para:</strong> {agent.idealFor.join(", ")}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Recomendación:</strong> Carlos es perfecto para filtros iniciales rápidos en cualquier industria.
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          Podrás cambiar de agente en cualquier momento desde tu panel de configuración
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all"
        >
          Finalizar configuración
        </button>
      </div>
    </div>
  );
}