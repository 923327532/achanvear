// features/settings/components/CompanyAgentSection.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, AlertCircle } from "lucide-react";
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";

// FIX: antes AGENTES_IA era un array fijo en el frontend, con especialidades
// que ni siquiera coincidían con los agentes reales del backend (Ana y Diego
// tenían sus roles invertidos: el hardcode decía que Ana era "Teórica" y
// Diego "Técnica", cuando en realidad es al revés; Sofía decía "Legal /
// Contable" cuando en verdad genera reportes ejecutivos). Ahora se trae el
// catálogo real desde GET /catalog/ai-agents.

interface AiAgentCatalogItem {
  id: string;
  name: string;
  description: string;
  personality: string;
  capabilities: string[];
}

const PERSONALITY_ICON: Record<string, string> = {
  professional: "👔",
  analytical: "⚙️",
  academic: "📘",
  creative: "📊",
};

export function CompanyAgentSection() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(70);

  const agentsQuery = useQuery({
    queryKey: ["catalog-ai-agents"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<AiAgentCatalogItem[]>>("/catalog/ai-agents");
      return parseResponse(response);
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const agents = agentsQuery.data ?? [];

  // Selecciona el primer agente por defecto en cuanto llega el catálogo
  if (agents.length > 0 && selectedAgent === null) {
    setSelectedAgent(agents[0].id);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1B3A6B]">Configuración del Agente IA</h2>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza cómo el agente IA entrevista a tus candidatos
        </p>
      </div>

      {/* Selección de agente */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Personalidad Predeterminada del Agente
        </label>
        <p className="text-xs text-gray-400 mb-4">
          Selecciona el agente que iniciará automáticamente tus procesos de selección
        </p>

        {agentsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando agentes disponibles...
          </div>
        ) : agentsQuery.isError ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">No se pudo cargar el catálogo de agentes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selectedAgent === agent.id
                    ? "border-[#0EA5A0] bg-[#EBF0F7]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  selectedAgent === agent.id ? "bg-[#0EA5A0]/10" : "bg-gray-100"
                }`}>
                  {PERSONALITY_ICON[agent.personality] ?? "🤖"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold truncate ${
                      selectedAgent === agent.id ? "text-[#0EA5A0]" : "text-gray-700"
                    }`}>
                      {agent.name}
                    </p>
                    {selectedAgent === agent.id && (
                      <Check className="w-4 h-4 text-[#0EA5A0] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
                  {agent.capabilities.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {agent.capabilities.slice(0, 2).map((cap) => (
                        <li key={cap} className="text-[11px] text-gray-400">• {cap}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Match Score Threshold — sigue sin persistirse: no existe un endpoint
          de backend para guardar ni esta preferencia ni el agente elegido
          (pendiente #1: PATCH /companies/{id}/agent-settings o similar). */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Match Score Mínimo para Notificaciones
        </label>
        <p className="text-xs text-gray-400 mb-4">
          Solo recibirás notificaciones de candidatos que superen este umbral
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="95"
            value={matchScoreThreshold}
            onChange={(e) => setMatchScoreThreshold(Number(e.target.value))}
            className="flex-1 accent-[#0EA5A0]"
          />
          <div className="text-center min-w-[80px]">
            <p className="text-3xl font-bold text-[#1B3A6B]">{matchScoreThreshold}</p>
            <p className="text-xs text-gray-400">puntos</p>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Más candidatos</span>
          <span>Más selectivo</span>
        </div>
      </div>
    </div>
  );
}