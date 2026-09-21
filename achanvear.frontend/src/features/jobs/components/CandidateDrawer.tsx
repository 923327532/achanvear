// features/jobs/components/CandidateDrawer.tsx
"use client";

import {
  X,
  MessageSquare,
  Download,
  FileText,
  Play,
  Video,
  CheckCircle2,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  CalendarDays,
  Star,
  FileCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  Bot,
  BookOpen,
  Code2,
  Users,
  Award,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useCandidateDrawerDetail, useAdvanceCandidate } from "../hooks/useCandidateDrawerDetail";
import type { CandidateDrawerDetail, ProcessContextType } from "../types/candidate-drawer.types";

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

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatScore(value: number | null) {
  return value === null ? "Pendiente" : `${value}/100`;
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .toLowerCase();
}

async function downloadCandidateReportPdf(detail: CandidateDrawerDetail) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-9999";
  container.style.width = "210mm";
  container.style.background = "white";
  document.body.appendChild(container);

  const root = document.createElement("div");
  root.style.fontFamily = "Arial, sans-serif";
  root.style.color = "#0f172a";
  root.style.padding = "22mm";
  root.style.lineHeight = "1.45";
  root.style.fontSize = "12px";
  container.appendChild(root);

  const title = document.createElement("h1");
  title.textContent = "Informe ejecutivo IA";
  title.style.margin = "0 0 6px";
  title.style.fontSize = "24px";
  title.style.color = "#0f172a";
  root.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.textContent = `${detail.name} - ${detail.jobTitle || detail.projectTitle || "Proceso de seleccion"}`;
  subtitle.style.margin = "0 0 18px";
  subtitle.style.color = "#475569";
  root.appendChild(subtitle);

  const section = (heading: string, body?: string | null) => {
    const wrapper = document.createElement("section");
    wrapper.style.marginTop = "16px";
    const h2 = document.createElement("h2");
    h2.textContent = heading;
    h2.style.margin = "0 0 6px";
    h2.style.fontSize = "14px";
    h2.style.color = "#1e3a8a";
    wrapper.appendChild(h2);
    const p = document.createElement("p");
    p.textContent = body || "Sin informacion registrada.";
    p.style.margin = "0";
    p.style.whiteSpace = "pre-wrap";
    wrapper.appendChild(p);
    root.appendChild(wrapper);
  };

  const meta = document.createElement("div");
  meta.style.border = "1px solid #cbd5e1";
  meta.style.borderRadius = "8px";
  meta.style.padding = "12px";
  meta.style.marginBottom = "14px";
  meta.textContent = [
    `Correo: ${detail.email}`,
    `Postulacion: ${formatDate(detail.generalInfo.appliedAt) || "Sin fecha"}`,
    `Estado: ${detail.generalInfo.stageLabel}`,
    `ID postulacion: ${detail.id}`,
  ].join(" | ");
  root.appendChild(meta);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.margin = "14px 0";
  [
    ["Screening", formatScore(detail.scores.screening)],
    ["Entrevista teorica", formatScore(detail.scores.theory)],
    ["Entrevista practica", formatScore(detail.scores.technical)],
    ["Comunicacion / soft skills", formatScore(detail.scores.softSkills)],
    ["Score general", formatScore(detail.scores.overall)],
  ].forEach(([label, value]) => {
    const row = table.insertRow();
    [label, value].forEach((cellText, index) => {
      const cell = row.insertCell();
      cell.textContent = cellText;
      cell.style.border = "1px solid #cbd5e1";
      cell.style.padding = "8px";
      cell.style.fontWeight = index === 0 ? "700" : "400";
    });
  });
  root.appendChild(table);

  section("Resumen IA", detail.report.summary);
  section("Recomendacion", detail.report.recommendation);
  section("Fortalezas", detail.report.strengths);
  section("Areas de oportunidad", detail.report.areasOfOpportunity);
  section("Carta / contexto del postulante", detail.coverLetter);

  const footer = document.createElement("p");
  footer.textContent = `Generado desde Achanvear para la empresa propietaria de la vacante. Fecha: ${new Date().toLocaleString("es-PE")}`;
  footer.style.marginTop = "20px";
  footer.style.fontSize = "10px";
  footer.style.color = "#64748b";
  root.appendChild(footer);

  const fileName = `informe-ia-${safeFileName(detail.name)}-${safeFileName(detail.jobTitle || "postulacion")}.pdf`;

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(root)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

function getStageColor(index: number, currentIndex: number) {
  if (index < currentIndex) return "bg-emerald-500 text-white";
  if (index === currentIndex) return "bg-[#1e3a8a] text-white ring-2 ring-[#1e3a8a]/30";
  return "bg-slate-200 text-slate-400";
}

function getStageLineColor(index: number, currentIndex: number) {
  if (index < currentIndex) return "bg-emerald-400";
  return "bg-slate-200";
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  icon: Icon,
  value,
  color,
  bgColor,
}: {
  label: string;
  icon: React.ElementType;
  value: number | null;
  color: string;
  bgColor: string;
}) {
  const displayValue = value ?? null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{label}</span>
        </div>
        <span className={`text-sm font-bold ${displayValue !== null ? color : "text-slate-300"}`}>
          {displayValue !== null ? `${displayValue}/100` : "—"}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${displayValue !== null ? bgColor : "bg-slate-100"}`}
          style={{ width: displayValue !== null ? `${displayValue}%` : "0%" }}
        />
      </div>
    </div>
  );
}

// ─── Stage Timeline ────────────────────────────────────────────────────────────

function StageTimeline({
  stages,
  currentIndex,
}: {
  stages: string[];
  currentIndex: number;
}) {
  return (
    <div className="space-y-0">
      {stages.map((stage, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* Indicador vertical */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${getStageColor(index, currentIndex)}`}
            />
            {index < stages.length - 1 && (
              <div
                className={`w-0.5 h-8 ${getStageLineColor(index, currentIndex)}`}
              />
            )}
          </div>
          {/* Label */}
          <div className="pb-4">
            <p
              className={`text-sm font-medium ${
                index <= currentIndex ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {stage}
            </p>
            {index === currentIndex && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-medium bg-[#1e3a8a]/10 text-[#1e3a8a]">
                <Clock className="w-2.5 h-2.5" />
                Actual
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function DrawerLoading() {
  return (
    <div className="flex items-center justify-center h-full py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Cargando detalle del candidato...</p>
      </div>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────

function DrawerError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mb-3" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-slate-700 mb-1">Error al cargar detalle</p>
      <p className="text-xs text-slate-500 mb-4">No se pudo obtener la información del candidato</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition"
      >
        <Loader2 className="w-3.5 h-3.5" />
        Reintentar
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: CandidateDrawer
// ═══════════════════════════════════════════════════════════════════════════════

interface CandidateDrawerProps {
  jobId: string;
  applicationId: string;
  onClose: () => void;
}

export function CandidateDrawer({ jobId, applicationId, onClose }: CandidateDrawerProps) {
  const { detail, isLoading, isError, refetch } = useCandidateDrawerDetail(jobId, applicationId);
  const advanceMutation = useAdvanceCandidate(jobId);

  const isJob = detail?.contextType === "JOB";

  // ─── Render condicional según datos existentes ──────────────────────────────

  const hasScores = detail && (
    detail.scores.screening !== null ||
    detail.scores.theory !== null ||
    detail.scores.technical !== null ||
    detail.scores.softSkills !== null
  );

  const hasReport = detail?.report.available === true;
  const hasInterview = detail?.interview.exists === true;
  const hasRecording = detail?.interview.recordingUrl !== null;

  const handleAdvance = () => {
    if (!detail) return;
    advanceMutation.advance({
      applicationId: detail.id,
      payload: { processId: detail.processId, action: "ADVANCE" },
    });
  };

  const handleDiscard = () => {
    if (!detail) return;
    advanceMutation.advance({
      applicationId: detail.id,
      payload: { processId: detail.processId, action: "DISCARD" },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* ═══ HEADER ═══ */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 ${getAvatarColor(detail?.name || "")}`}
              >
                {detail ? getInitials(detail.name) : "—"}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 truncate">
                  {detail?.name || "Cargando..."}
                </h2>
                <p className="text-sm text-slate-500 truncate">{detail?.title || ""}</p>
                {/* Badge de contexto: Empleo o Proyecto */}
                {detail && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium ${
                      isJob
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {isJob ? (detail.jobTitle || "Empleo") : (detail.projectTitle || "Proyecto")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex gap-2">
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-semibold hover:bg-[#1e3a8a]/90 transition">
              <MessageSquare className="w-4 h-4" />
              Contactar
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
              onClick={() => {
                if (detail?.cvUrl) window.open(detail.cvUrl, "_blank");
              }}
              disabled={!detail?.cvUrl}
            >
              <Download className="w-4 h-4" />
              Descargar CV
            </button>
          </div>
        </div>

        {/* ═══ CONTENIDO ═══ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <DrawerLoading />
          ) : isError ? (
            <DrawerError onRetry={refetch} />
          ) : !detail ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">No se encontró información del candidato</p>
            </div>
          ) : (
            <>
              {/* ─── 1. SCORE DE AFINIDAD IA ──────────────────────────────────── */}
              {hasScores && (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#1e3a8a]" strokeWidth={1.5} />
                    <h3 className="text-base font-bold text-slate-900">Score de Afinidad IA</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ScoreBar
                      label="Screening"
                      icon={FileText}
                      value={detail.scores.screening}
                      color="text-[#1e3a8a]"
                      bgColor="bg-[#1e3a8a]"
                    />
                    <ScoreBar
                      label="Teórica"
                      icon={BookOpen}
                      value={detail.scores.theory}
                      color="text-teal-600"
                      bgColor="bg-teal-500"
                    />
                    <ScoreBar
                      label="Técnica"
                      icon={Code2}
                      value={detail.scores.technical}
                      color="text-amber-600"
                      bgColor="bg-amber-500"
                    />
                    <ScoreBar
                      label="Soft Skills"
                      icon={Users}
                      value={detail.scores.softSkills}
                      color="text-emerald-600"
                      bgColor="bg-emerald-500"
                    />
                  </div>

                  {/* Score General */}
                  {detail.scores.overall !== null && (
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-semibold text-slate-700">Score General</span>
                        </div>
                        <span className="text-2xl font-bold text-[#1e3a8a]">
                          {detail.scores.overall}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── 2. INFORMACIÓN GENERAL ───────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Información General</h3>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    icon={MapPin}
                    label="Ubicación"
                    value={detail.generalInfo.location || "No especificada"}
                  />
                  <InfoItem
                    icon={Briefcase}
                    label="Experiencia"
                    value={detail.generalInfo.experience || "No especificada"}
                  />
                  <InfoItem
                    icon={GraduationCap}
                    label="Educación"
                    value={detail.generalInfo.education || "No especificada"}
                  />
                  <InfoItem
                    icon={CalendarDays}
                    label="Postulación"
                    value={formatDate(detail.generalInfo.appliedAt) || "—"}
                  />
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-600">Estado actual</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20">
                      {detail.generalInfo.stageLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── 3. TIMELINE DE FASES ─────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4">Fases del Proceso</h3>
                <StageTimeline
                  stages={detail.stages}
                  currentIndex={detail.currentStageIndex}
                />
              </div>

              {/* ─── 4. REPORTE EJECUTIVO IA ──────────────────────────────────── */}
              {hasReport && (
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                      <FileCheck className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Reporte Ejecutivo IA</h3>
                      <p className="text-xs text-slate-500">
                        Generado el {formatDate(detail.report.generatedAt)}
                      </p>
                    </div>
                  </div>
                  {detail.report.summary && (
                    <p className="text-sm text-slate-600 leading-relaxed">{detail.report.summary}</p>
                  )}
                  {detail.report.recommendation && (
                    <div className="rounded-xl bg-white/70 border border-emerald-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Recomendacion IA
                      </p>
                      <p className="text-sm text-slate-700 mt-1">{detail.report.recommendation}</p>
                    </div>
                  )}
                  <button
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
                    onClick={() => downloadCandidateReportPdf(detail)}
                  >
                    <Download className="w-4 h-4" />
                    Descargar informe PDF
                  </button>
                </div>
              )}

              {/* ─── 5. GRABACIÓN DE ENTREVISTA ───────────────────────────────── */}
              {hasInterview && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <Video className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Grabación de Entrevista</h3>
                      <p className="text-xs text-slate-500">
                        {hasRecording
                          ? `Grabada el ${formatDate(detail.interview.recordedAt)}`
                          : "Entrevista aún no realizada"}
                      </p>
                    </div>
                  </div>

                  {hasRecording ? (
                    <>
                      {/* Reproductor de video (mock - en producción usar <video>) */}
                      <div className="aspect-video bg-black rounded-xl flex items-center justify-center relative group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition">
                            <Play className="w-8 h-8 text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                        {/* Overlay con info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-xs text-white/80">Entrevista técnica</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-sm font-semibold hover:bg-[#1e3a8a]/90 transition"
                          onClick={() => {
                            if (detail.interview.recordingUrl)
                              window.open(detail.interview.recordingUrl, "_blank");
                          }}
                        >
                          <Play className="w-4 h-4" />
                          Reproducir Video
                        </button>
                        <button
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                          onClick={() => {
                            if (detail.interview.recordingUrl)
                              window.open(detail.interview.recordingUrl, "_blank");
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-xl">
                      <Video className="w-10 h-10 text-slate-300 mb-2" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-slate-500">Grabación no disponible</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        La entrevista aún no se ha realizado o el video no está listo
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── 6. ACCIONES FINALES ──────────────────────────────────────── */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white pb-2">
                <button
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                  onClick={handleAdvance}
                  disabled={advanceMutation.isLoading}
                >
                  {advanceMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Avanzar a Siguiente Etapa
                </button>
                <button
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition disabled:opacity-50"
                  onClick={handleDiscard}
                  disabled={advanceMutation.isLoading}
                >
                  <X className="w-4 h-4" />
                  Descartar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Animación CSS */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// ─── Info Item ─────────────────────────────────────────────────────────────────

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
        {label}
      </div>
      <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
    </div>
  );
}
