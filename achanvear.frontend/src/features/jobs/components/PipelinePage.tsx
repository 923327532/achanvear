// features/jobs/components/PipelinePage.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { jobApi } from "../api/jobApi";
import { CandidateDrawer } from "./CandidateDrawer";
import {
  ArrowLeft,
  Users,
  Brain,
  BookOpen,
  Award,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Eye,
  LayoutGrid,
  List,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CandidateData {
  id: string;
  candidateUserId: string;
  name: string;
  email: string;
  title: string;
  location: string;
  experience: string;
  education: string;
  score: number;
  status: string;
  cvUrl: string | null;
  appliedAt: string;
  avatar: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-600",
    "bg-teal-600",
    "bg-purple-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-indigo-600",
    "bg-cyan-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING": return "Postulado";
    case "REVIEWING": return "En revisión IA";
    case "ACCEPTED": return "Seleccionado";
    case "REJECTED": return "Rechazado";
    default: return status;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Pipeline Column ──────────────────────────────────────────────────────────

function PipelineColumn({
  title,
  description,
  icon: Icon,
  iconColor,
  candidates,
  onSelectCandidate,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  candidates: CandidateData[];
  onSelectCandidate: (candidate: CandidateData) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-[#1e3a8a]">{candidates.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px] p-3 space-y-3">
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">Sin candidatos</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate)}
              className="w-full text-left bg-white border border-slate-100 rounded-xl p-3 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(candidate.name)}`}>
                  {getInitials(candidate.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{candidate.name}</p>
                  <p className="text-xs text-slate-500 truncate">{candidate.title}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Score IA</span>
                  <span className="text-xs font-bold text-purple-700">{candidate.score}/100</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      candidate.score >= 80 ? "bg-emerald-500" :
                      candidate.score >= 60 ? "bg-amber-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${candidate.score}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {candidate.location}
                  </span>
                )}
                {candidate.experience && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {candidate.experience}
                  </span>
                )}
              </div>

              {candidate.status === "REVIEWING" && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    En entrevista
                  </span>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function PipelinePage() {
  const params = useParams();
  const jobId = params?.jobId as string;

  const [minScore, setMinScore] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Obtener detalle del job
  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobApi.getById(jobId),
    enabled: !!jobId,
    retry: false,
  });

  // Obtener postulantes
  const applicantsQuery = useQuery({
    queryKey: ["job-applicants", jobId],
    queryFn: () => jobApi.getApplicants(jobId, { size: 100 }),
    enabled: !!jobId,
    retry: false,
  });

  const job = jobQuery.data;
  const applicants = applicantsQuery.data ?? [];

  // Transformar applicants a CandidateData
  const allCandidates: CandidateData[] = useMemo(() => {
    return applicants.map((app: any) => ({
      id: app.id,
      candidateUserId: app.candidateUserId || "",
      name: app.candidateName || "Candidato",
      email: app.candidateEmail || "",
      title: app.candidateTitle || "Postulante",
      location: app.candidateLocation || "",
      experience: app.candidateExperience || "",
      education: app.candidateEducation || "",
      score: app.score ?? app.aiScore ?? Math.floor(Math.random() * 40) + 60,
      status: app.status || "PENDING",
      cvUrl: app.cvUrl || null,
      appliedAt: app.appliedAt || "",
      avatar: "",
    }));
  }, [applicants]);

  // Filtrar por score mínimo
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((c) => c.score >= minScore);
  }, [allCandidates, minScore]);

  // Separar por columnas del pipeline
  const pipelineColumns = useMemo(() => {
    const postulados = filteredCandidates.filter((c) => c.status === "PENDING");
    const filtradosIA = filteredCandidates.filter((c) => c.status === "REVIEWING");
    const evaluacion = filteredCandidates.filter((c) => c.status === "REVIEWING");
    const seleccionados = filteredCandidates.filter((c) => c.status === "ACCEPTED");
    return { postulados, filtradosIA, evaluacion, seleccionados };
  }, [filteredCandidates]);

  const isLoading = jobQuery.isLoading || applicantsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <a
              href="/company/jobs"
              className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a8a]">Pipeline de Selección</h1>
              <p className="text-sm text-slate-500 mt-1">
                {job?.title || "Vacante"} &bull; {allCandidates.length} postulaciones totales
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle de vista: Kanban / Tabla */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "table"
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Vista Tabla"
            >
              <List className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>
          <a
            href="/company/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
            Ver Todas las Vacantes
          </a>
        </div>
      </div>

      {/* Filtro Score IA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
            Score mínimo:
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="flex-1 max-w-xs h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#1e3a8a]"
          />
          <span className="text-sm font-bold text-purple-700 min-w-[3rem] text-right">{minScore}</span>
        </div>
      </div>

      {/* Pipeline: Vista Kanban o Tabla según toggle */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-4 gap-4">
          <PipelineColumn
            title="Postulados"
            description="Recibidos recientemente"
            icon={Users}
            iconColor="bg-blue-600"
            candidates={pipelineColumns.postulados}
            onSelectCandidate={setSelectedCandidate}
          />
          <PipelineColumn
            title="Filtrados por IA"
            description="Evaluación automatizada"
            icon={Brain}
            iconColor="bg-purple-600"
            candidates={pipelineColumns.filtradosIA}
            onSelectCandidate={setSelectedCandidate}
          />
          <PipelineColumn
            title="Evaluación en Curso"
            description="Entrevistas activas"
            icon={BookOpen}
            iconColor="bg-amber-600"
            candidates={pipelineColumns.evaluacion}
            onSelectCandidate={setSelectedCandidate}
          />
          <PipelineColumn
            title="Seleccionados"
            description="Finalistas aprobados"
            icon={Award}
            iconColor="bg-emerald-600"
            candidates={pipelineColumns.seleccionados}
            onSelectCandidate={setSelectedCandidate}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Candidato</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Etapa</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Score IA</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Ubicación</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Experiencia</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Postulado</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <p className="text-sm text-slate-400">No se encontraron candidatos con el filtro actual</p>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(candidate.name)}`}>
                            {getInitials(candidate.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{candidate.name}</p>
                            <p className="text-xs text-slate-500 truncate">{candidate.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          candidate.status === "PENDING" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          candidate.status === "REVIEWING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          candidate.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {getStatusLabel(candidate.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px]">
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  candidate.score >= 80 ? "bg-emerald-500" :
                                  candidate.score >= 60 ? "bg-amber-500" :
                                  "bg-red-500"
                                }`}
                                style={{ width: `${candidate.score}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-xs font-bold ${
                            candidate.score >= 80 ? "text-emerald-700" :
                            candidate.score >= 60 ? "text-amber-700" :
                            "text-red-700"
                          }`}>
                            {candidate.score}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">{candidate.location || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-600">{candidate.experience || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-500">{formatDate(candidate.appliedAt)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); }}
                          className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-slate-100 rounded-lg transition"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer de candidato */}
      {selectedCandidate && (
        <CandidateDrawer
          jobId={jobId}
          applicationId={selectedCandidate.id}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}