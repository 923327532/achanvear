"use client";

import { useState, useEffect } from "react";
import { ApiError } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { onboardingService } from "@/features/onboarding/api/onboardingApi";           // ← antes: features/company/api/companyApi
import type { CompanyOnboardingData, AIAgent } from "@/features/onboarding/types/onboarding.types"; // ← antes: features/company/types/company

interface AIAgentStepProps {
  data: CompanyOnboardingData;
  onUpdate: (updates: Partial<CompanyOnboardingData>) => void;
  onNext: (fromStep?: number) => void;
  onBack: () => void;
}

const DEFAULT_AGENTS: AIAgent[] = [
  {
    id: "carlos",
    name: "Carlos Mendoza",
    role: "Screening Generalista",
    description: "Especialista en evaluacion inicial de candidatos. Analiza CVs, verifica coherencia de experiencia y realiza preguntas de filtro basicas.",
    idealFor: ["Evaluacion rapida", "Filtro inicial", "Todas las industrias"],
    specialization: "multidisciplinary",
  },
  {
    id: "ana",
    name: "Ana Garcia",
    role: "Entrevista Teorica",
    description: "Experta en evaluacion de conocimientos teoricos. Realiza preguntas conceptuales profundas y evalua comprension de fundamentos.",
    idealFor: ["Conocimiento teorico", "Conceptos avanzados", "Pensamiento critico"],
    specialization: "theoretical",
  },
  {
    id: "diego",
    name: "Diego Ramirez",
    role: "Entrevista Tecnica",
    description: "Especializado en evaluacion tecnica practica. Asigna casos tecnicos, revisa codigo en vivo y evalua resolucion de problemas.",
    idealFor: ["Coding challenges", "Casos tecnicos", "Tecnologia"],
    specialization: "technical",
  },
  {
    id: "sofia",
    name: "Sofia Torres",
    role: "Evaluacion Legal/Contable",
    description: "Experta en evaluacion de profesionales de derecho y contabilidad. Presenta casos reales segun normativa peruana.",
    idealFor: ["Derecho", "Contabilidad", "Finanzas", "Normativa peruana"],
    specialization: "legal_accounting",
  },
];

export function AIAgentStep({ data, onUpdate, onNext, onBack }: AIAgentStepProps) {
  const [agents, setAgents] = useState<AIAgent[]>(DEFAULT_AGENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const loadedAgents = await onboardingService.getAIAgents(); // ← antes: companyService
      if (loadedAgents && loadedAgents.length > 0) {
        const mappedAgents: AIAgent[] = loadedAgents.map((a: any) => ({
          id: a.id || a.name?.toLowerCase().replace(/\s+/g, "_"),
          name: a.name || "",
          role: a.personality || a.role || "",
          description: a.description || "",
          idealFor: a.capabilities || a.idealFor || [],
          specialization: a.specialization || "multidisciplinary",
        }));
        setAgents(mappedAgents);
      }
    } catch (err) {
      console.error("Error loading agents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
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

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Configura tu Agente de IA</h1>
        <p className="text-slate-600">Selecciona quien entrevistara a tus candidatos</p>
      </div>

      {error && <Alert message={error} />}

      <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">¿Como funciona el proceso automatizado?</h3>
        <ul className="space-y-2 text-blue-800">
          {[
            "El agente realiza el screening inicial de todos los CVs",
            "Conduce entrevistas personalizadas segun el puesto",
            "Evalua conocimientos teoricos y/o tecnicos en tiempo real",
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
              onClick={() => onUpdate({ selectedAgent: agent.id })}
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
          <strong>Recomendacion:</strong> Carlos es perfecto para filtros iniciales rapidos en cualquier industria.
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          Podras cambiar de agente en cualquier momento desde tu panel de configuracion
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-900 to-teal-600 text-white font-semibold py-3 rounded-2xl hover:from-blue-800 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Finalizando..." : "Finalizar configuracion"}
        </button>
      </div>
    </div>
  );
}