// features/settings/components/CompanyAgentSection.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const AGENTES_IA = [
  { id: "carlos_mendoza", name: "Carlos Mendoza", specialty: "Screening General", description: "Entrevista inicial para filtrar candidatos básicos", icon: "👔" },
  { id: "ana_quispe", name: "Ana Quispe", specialty: "Teórica / Empática", description: "Evaluación conceptual y soft skills", icon: "💬" },
  { id: "diego_torres", name: "Diego Torres", specialty: "Técnica", description: "Pruebas lógica y código", icon: "⚙️" },
  { id: "sofia_vargas", name: "Sofía Vargas", specialty: "Legal / Contable", description: "Perfiles administrativos y legales", icon: "📋" },
];

export function CompanyAgentSection() {
  const [selectedAgent, setSelectedAgent] = useState("carlos_mendoza");
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(70);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AGENTES_IA.map((agent) => (
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
                {agent.icon}
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
                <p className="text-xs text-gray-500 mt-0.5">{agent.specialty}</p>
                <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Match Score Threshold */}
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
