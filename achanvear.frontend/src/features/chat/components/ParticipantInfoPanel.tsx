// features/chat/components/ParticipantInfoPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Building2, User, Globe, MapPin, Star, Briefcase, FileText, ChevronRight, Download, Shield, Clock, CheckCircle2, Loader2, ExternalLink, Eye, Plus, FileSignature, Send, DollarSign } from "lucide-react";
import { chatApi } from "../api/chatApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Conversation, FreelancerProfileResponse, CompanyProfileResponse } from "../types/chat.types";

interface Props {
  conversation: Conversation | null;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Modal base ───────────────────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F8FAFC] transition-colors">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Modal: Ver Perfil ────────────────────────────────────────────────────────

function ViewProfileModal({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const isCompany = conversation.participantRole === "COMPANY";

  return (
    <Modal title={`Perfil de ${conversation.participantName}`} onClose={onClose}>
      <div className="flex flex-col items-center text-center mb-5">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 ${
          isCompany ? "bg-[#2563EB]" : "bg-[#0EA5A0]"
        }`}>
          {conversation.participantName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <h4 className="text-base font-semibold text-[#0F172A]">{conversation.participantName}</h4>
        <p className="text-xs text-[#64748B] mt-0.5">{isCompany ? "Empresa" : "Freelancer"}</p>
      </div>

      <div className="space-y-3">
        <div className="bg-[#F8FAFC] rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <User className="w-3.5 h-3.5" />
            <span>Tipo: {isCompany ? "Empresa" : "Freelancer"}</span>
          </div>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Rol: {conversation.participantRole}</span>
          </div>
        </div>
        <div className="bg-[#F8FAFC] rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Clock className="w-3.5 h-3.5" />
            <span>Último mensaje: {formatDate(conversation.lastMessageAt)}</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#94A3B8] text-center mt-4">
        {isCompany
          ? "Los datos completos de la empresa estarán disponibles cuando el backend proporcione el ID del participante."
          : "Los datos completos del freelancer estarán disponibles cuando el backend proporcione el ID del participante."}
      </p>
    </Modal>
  );
}

// ─── Modal: Ver Proyecto ──────────────────────────────────────────────────────

function ViewProjectModal({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const isCompany = conversation.participantRole === "COMPANY";

  return (
    <Modal title={`Proyectos de ${conversation.participantName}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="bg-[#F8FAFC] rounded-lg p-4 text-center">
          <Briefcase className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
          <p className="text-xs text-[#64748B]">
            {isCompany
              ? "Proyectos publicados por esta empresa"
              : "Servicios ofrecidos por este freelancer"}
          </p>
        </div>

        {/* Mock projects */}
        {[
          { title: isCompany ? "Desarrollo Web Full Stack" : "Desarrollo de Landing Page", status: "En progreso", budget: "S/ 3,500" },
          { title: isCompany ? "App Móvil React Native" : "App de Delivery", status: "Completado", budget: "S/ 8,000" },
        ].map((project, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0F172A] truncate">{project.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#64748B]">{project.status}</span>
                <span className="text-[10px] text-[#64748B]">•</span>
                <span className="text-[10px] font-medium text-[#10B981]">{project.budget}</span>
              </div>
            </div>
            <Eye className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Modal: Contratar / Solicitar Cotización ──────────────────────────────────

function HireModal({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const { user } = useAuth();
  const isCurrentUserFreelancer = user?.role === "FREELANCER";
  const [step, setStep] = useState<"confirm" | "done">("confirm");

  const handleConfirm = () => {
    setStep("done");
  };

  if (step === "done") {
    return (
      <Modal title={isCurrentUserFreelancer ? "Solicitar Cotización" : "Contratar"} onClose={onClose}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
          </div>
          <h4 className="text-sm font-semibold text-[#0F172A] mb-1">¡Solicitud enviada!</h4>
          <p className="text-xs text-[#64748B]">
            {isCurrentUserFreelancer
              ? `Tu solicitud de cotización ha sido enviada a ${conversation.participantName}.`
              : `Se ha notificado a ${conversation.participantName} sobre tu interés.`}
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 text-xs font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={isCurrentUserFreelancer ? "Solicitar Cotización" : "Contratar Freelancer"} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
            conversation.participantRole === "COMPANY" ? "bg-[#2563EB]" : "bg-[#0EA5A0]"
          }`}>
            {conversation.participantName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{conversation.participantName}</p>
            <p className="text-xs text-[#64748B]">{conversation.participantRole === "COMPANY" ? "Empresa" : "Freelancer"}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[11px] text-amber-800">
            {isCurrentUserFreelancer
              ? "Al solicitar una cotización, la empresa recibirá una notificación con tu solicitud."
              : "Al contratar, se creará una solicitud de proyecto que será notificada al freelancer."}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-xs font-medium text-white bg-[#10B981] rounded-lg hover:bg-[#059669] transition-colors"
          >
            {isCurrentUserFreelancer ? "Solicitar cotización" : "Solicitar contratación"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal: Crear Contrato ────────────────────────────────────────────────────

function CreateContractModal({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    setStep("done");
  };

  if (step === "done") {
    return (
      <Modal title="Crear Contrato" onClose={onClose}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
          </div>
          <h4 className="text-sm font-semibold text-[#0F172A] mb-1">Contrato creado</h4>
          <p className="text-xs text-[#64748B]">
            El contrato ha sido enviado a {conversation.participantName} para su revisión.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 text-xs font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Crear Contrato" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold">
            {conversation.participantName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{conversation.participantName}</p>
            <p className="text-xs text-[#64748B]">Nuevo contrato</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#0F172A] mb-1.5">Presupuesto (S/)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ej: 3500"
            className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#0F172A] mb-1.5">Descripción del trabajo</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el alcance del trabajo..."
            rows={3}
            className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
          />
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-[11px] text-purple-800">
            El contrato será enviado para revisión y firma de ambas partes.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!budget || !description}
            className="flex-1 px-4 py-2 text-xs font-medium text-white bg-[#8B5CF6] rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear contrato
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function ParticipantInfoPanel({ conversation, onClose }: Props) {
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfileResponse | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const isCompany = conversation?.participantRole === "COMPANY";

  useEffect(() => {
    if (!conversation) {
      setFreelancerProfile(null);
      setCompanyProfile(null);
      return;
    }

    setError(null);
    setIsLoading(false);

    // ── Future implementation when backend provides participantId ──
    // const fetchProfile = async () => {
    //   setIsLoading(true);
    //   setError(null);
    //   try {
    //     if (isCompany) {
    //       const info = await chatApi.getCompanyProfile(conversation.participantId);
    //       setCompanyProfile(info);
    //     } else {
    //       const info = await chatApi.getFreelancerProfile(conversation.participantId);
    //       setFreelancerProfile(info);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching participant info:", err);
    //     setError("No se pudo cargar la información del perfil");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchProfile();
  }, [conversation?.id, conversation?.participantRole]);

  if (!conversation) return null;

  return (
    <>
      <div className="w-[320px] flex-shrink-0 border-l border-[#E5E7EB] bg-white overflow-y-auto animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#0F172A]">Información</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-xs text-[#EF4444]">{error}</p>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* ── Participant Profile ── */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 ${
                isCompany ? "bg-[#2563EB]" : "bg-[#0EA5A0]"
              }`}>
                {conversation.participantName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <h4 className="text-sm font-semibold text-[#0F172A]">{conversation.participantName}</h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isCompany ? "Empresa" : "Freelancer"}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                  <Clock className="w-3 h-3" />
                  Último mensaje: {formatDate(conversation.lastMessageAt)}
                </span>
              </div>
            </div>

            {/* ── Stats (mock data - will come from API) ── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-[#0F172A]">—</p>
                <p className="text-[10px] text-[#64748B]">Contrataciones</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-[#0F172A]">—</p>
                <p className="text-[10px] text-[#64748B]">Proyectos</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-[#0F172A]">—</p>
                <p className="text-[10px] text-[#64748B]">Calificación</p>
              </div>
            </div>

            {/* ── Información del participante ── */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                {isCompany ? "Información de la empresa" : "Información del freelancer"}
              </h4>
              <div className="space-y-1.5">
                {isCompany ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Empresa verificada</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Rubro: Tecnología / Desarrollo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Ubicación: Lima, Perú</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>RUC: —</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Freelancer independiente</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Especialidad: Desarrollo Web</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Ubicación: Lima, Perú</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Star className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Experiencia: 3+ años</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Shared Files ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">Archivos compartidos</h4>
                <button className="text-[11px] text-[#2563EB] hover:underline flex items-center gap-0.5">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {[
                  { name: "contrato.pdf", type: "PDF", size: "2.4 MB", url: "/files/contrato-ejemplo.pdf" },
                  { name: "propuesta.pdf", type: "PDF", size: "1.8 MB", url: "/files/propuesta-ejemplo.pdf" },
                  { name: "reporte.docx", type: "DOCX", size: "856 KB", url: "/files/reporte-ejemplo.docx" },
                ].map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    download={file.name}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer no-underline"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0F172A] truncate">{file.name}</p>
                      <p className="text-[10px] text-[#64748B]">{file.type} • {file.size}</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">Acciones</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] rounded-lg hover:bg-[#DBEAFE] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver perfil
                </button>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0EA5A0] bg-[#F0FDFA] rounded-lg hover:bg-[#CCFBF1] transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Ver proyecto
                </button>
                <button
                  onClick={() => setShowHireModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#10B981] bg-[#F0FDF4] rounded-lg hover:bg-[#DCFCE7] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Contratar
                </button>
                <button
                  onClick={() => setShowContractModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#8B5CF6] bg-[#F5F3FF] rounded-lg hover:bg-[#EDE9FE] transition-colors"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  Crear contrato
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showProfileModal && (
        <ViewProfileModal conversation={conversation} onClose={() => setShowProfileModal(false)} />
      )}
      {showProjectModal && (
        <ViewProjectModal conversation={conversation} onClose={() => setShowProjectModal(false)} />
      )}
      {showHireModal && (
        <HireModal conversation={conversation} onClose={() => setShowHireModal(false)} />
      )}
      {showContractModal && (
        <CreateContractModal conversation={conversation} onClose={() => setShowContractModal(false)} />
      )}
    </>
  );
}
