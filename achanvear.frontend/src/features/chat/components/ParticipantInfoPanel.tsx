// features/chat/components/ParticipantInfoPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Building2, User, Clock, Loader2, Eye, Briefcase, FileText } from "lucide-react";
import { chatApi } from "../api/chatApi";
import type { Conversation } from "../types/chat.types";

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
// Se mantiene porque ya es honesto sobre su propia limitación: avisa
// explícitamente que el detalle completo requiere un dato que el backend aún
// no envía (participantId). No inventa datos falsos, solo explica el estado.

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
// FIX: antes mostraba "Mock projects" (dos proyectos inventados con montos y
// estados falsos) como si fueran reales. Ahora, mientras no exista un
// endpoint real de proyectos/servicios compartidos entre ambos participantes,
// se muestra un estado vacío honesto en vez de datos de relleno.

function ViewProjectModal({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const isCompany = conversation.participantRole === "COMPANY";

  return (
    <Modal title={`Proyectos de ${conversation.participantName}`} onClose={onClose}>
      <div className="flex flex-col items-center text-center py-6">
        <Briefcase className="w-8 h-8 text-[#94A3B8] mb-2" />
        <p className="text-xs text-[#64748B]">
          {isCompany
            ? "Aún no podemos mostrar los proyectos publicados por esta empresa"
            : "Aún no podemos mostrar los servicios de este freelancer"}
        </p>
        <p className="text-[11px] text-[#94A3B8] mt-1">
          Esta sección estará disponible cuando el backend proporcione el ID del participante.
        </p>
      </div>
    </Modal>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function ParticipantInfoPanel({ conversation, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  // FIX: se quitaron "Contratar" y "Crear contrato" (y sus modales HireModal/
  // CreateContractModal) — ambos mostraban un mensaje de éxito ("¡Solicitud
  // enviada!", "Contrato creado") sin llamar a ningún endpoint real; el
  // usuario creía que algo había pasado de verdad cuando el botón solo
  // cambiaba de pantalla internamente (setStep("done")). Confirmado en
  // Swagger: chat-controller no tiene ningún endpoint para contratar ni crear
  // contratos. Se dejan "Ver perfil" y "Ver proyecto" porque esos sí son
  // honestos sobre su límite actual.
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const isCompany = conversation?.participantRole === "COMPANY";

  useEffect(() => {
    if (!conversation) return;
    setError(null);
    setIsLoading(false);

    // ── Pendiente de backend: GET /chat/conversations no incluye
    // participantId en su respuesta (confirmado en Swagger). Sin ese campo
    // es imposible llamar a chatApi.getFreelancerProfile()/getCompanyProfile()
    // para traer el perfil real — ambos métodos ya existen y funcionan, solo
    // falta el dato para poder usarlos. Reactivar este bloque en cuanto el
    // backend agregue el campo:
    //
    // const fetchProfile = async () => {
    //   setIsLoading(true);
    //   try {
    //     if (isCompany) {
    //       await chatApi.getCompanyProfile(conversation.participantId);
    //     } else {
    //       await chatApi.getFreelancerProfile(conversation.participantId);
    //     }
    //   } catch {
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

            {/* ── Stats ──
                Ya estaban honestamente marcados como "—" (sin datos), no se
                tocó — solo se mantiene a la espera del participantId. */}
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

            {/* ── Información del participante ──
                FIX: antes mostraba datos inventados con apariencia de reales
                ("Lima, Perú", "RUC: —" mezclado con datos falsos, "3+ años de
                experiencia", "Tecnología / Desarrollo") iguales para
                cualquier persona. Eso es peor que no mostrar nada, porque
                parece información verificada sin serlo. Se reemplaza por un
                aviso honesto hasta que el backend mande el participantId. */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                {isCompany ? "Información de la empresa" : "Información del freelancer"}
              </h4>
              <div className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Esta información aún no está disponible desde el chat. Puedes ver el perfil completo
                  desde la sección correspondiente una vez que el backend incluya el identificador del
                  participante en la conversación.
                </p>
              </div>
            </div>

            {/* ── Archivos compartidos ──
                FIX: antes listaba 3 archivos inventados (contrato.pdf,
                propuesta.pdf, reporte.docx) con links a rutas que no existen
                (/files/contrato-ejemplo.pdf). Se reemplaza por un estado
                vacío honesto; los adjuntos reales ya viven en cada Message
                (Message.attachments) y se muestran dentro de la conversación
                misma — faltaría un endpoint que agregue todos los adjuntos de
                una conversación para listarlos aquí de verdad. */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">Archivos compartidos</h4>
              <div className="flex flex-col items-center text-center py-4 bg-[#F8FAFC] rounded-lg">
                <FileText className="w-6 h-6 text-[#CBD5E1] mb-1.5" />
                <p className="text-[11px] text-[#94A3B8]">
                  Los archivos que se compartan en la conversación aparecerán aquí
                </p>
              </div>
            </div>

            {/* ── Quick Actions ──
                FIX: se quitaron "Contratar" y "Crear contrato" (mostraban
                éxito falso sin llamar al backend). Solo quedan las dos
                acciones que son honestas sobre su propia limitación. */}
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
    </>
  );
}