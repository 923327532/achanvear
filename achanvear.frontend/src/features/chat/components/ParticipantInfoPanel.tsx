// features/chat/components/ParticipantInfoPanel.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Building2, User, Clock, Eye, Briefcase, FileText, Loader2 } from "lucide-react";
import { chatApi } from "../api/chatApi";
import { useMessages } from "../hooks/useChat";
import type { Conversation, FreelancerProfileResponse } from "../types/chat.types";

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function ratingText(profile: FreelancerProfileResponse) {
  const rep = profile.reputationScore;
  if (!rep || rep.totalRatings === 0) return "Sin calificaciones";
  return `${rep.averageStars.toFixed(1)} (${rep.totalRatings})`;
}

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

function FieldBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="bg-[#F8FAFC] rounded-lg p-3">
      <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

function SkillChips({ profile }: { profile: FreelancerProfileResponse }) {
  if (!profile.skills || profile.skills.length === 0) return null;
  return (
    <div className="bg-[#F8FAFC] rounded-lg p-3">
      <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Habilidades</p>
      <div className="flex flex-wrap gap-1.5">
        {profile.skills.map((s, i) => (
          <span key={`${s.name}-${i}`} className="text-[11px] text-[#0F172A] bg-white border border-[#E2E8F0] rounded-full px-2 py-0.5">
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function FreelancerProfileModal({
  conversation,
  profile,
  onClose,
}: {
  conversation: Conversation;
  profile: FreelancerProfileResponse;
  onClose: () => void;
}) {
  return (
    <Modal title={`Perfil de ${conversation.participantName}`} onClose={onClose}>
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 bg-[#0EA5A0]">
          {getInitials(conversation.participantName)}
        </div>
        <h4 className="text-base font-semibold text-[#0F172A]">{conversation.participantName}</h4>
        <p className="text-xs text-[#64748B] mt-0.5">Freelancer</p>
      </div>

      <div className="space-y-3">
        <FieldBlock label="Rubro" value={profile.industry} />
        <FieldBlock label="Especialidad" value={profile.specialty} />
        <FieldBlock label="Biografía" value={profile.biography} />
        <FieldBlock label="Logros" value={profile.achievements} />
        <SkillChips profile={profile} />
        <FieldBlock label="Calificación" value={ratingText(profile)} />
        {profile.portfolioItems && profile.portfolioItems.length > 0 && (
          <div className="bg-[#F8FAFC] rounded-lg p-3">
            <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Portafolio</p>
            <div className="space-y-2">
              {profile.portfolioItems.map((item: any, i: number) => (
                <div key={`${item.title}-${i}`}>
                  <p className="text-xs font-medium text-[#0F172A]">{item.title}</p>
                  {item.description && <p className="text-[11px] text-[#64748B]">{item.description}</p>}
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#2563EB] break-all hover:underline"
                    >
                      {item.projectUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ViewProfileModal({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const isCompany = conversation.participantRole === "COMPANY";

  return (
    <Modal title={`Perfil de ${conversation.participantName}`} onClose={onClose}>
      <div className="flex flex-col items-center text-center mb-5">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 ${
          isCompany ? "bg-[#2563EB]" : "bg-[#0EA5A0]"
        }`}>
          {getInitials(conversation.participantName)}
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

export function ParticipantInfoPanel({ conversation, onClose }: Props) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const { messages } = useMessages(conversation?.id ?? null);

  const isFreelancerParticipant = !!conversation && conversation.participantRole !== "COMPANY";

  const profileQuery = useQuery({
    queryKey: ["chat", "participant-profile", conversation?.participantId],
    queryFn: () => chatApi.getFreelancerProfile(conversation!.participantId),
    enabled: isFreelancerParticipant && !!conversation?.participantId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const sharedFiles = useMemo(
    () =>
      messages
        .flatMap((m) => m.attachments ?? [])
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    [messages]
  );

  if (!conversation) return null;

  const isCompany = conversation.participantRole === "COMPANY";
  const profile = profileQuery.data;

  return (
    <>
      <div className="w-[320px] flex-shrink-0 border-l border-[#E5E7EB] bg-white overflow-y-auto animate-in slide-in-from-right duration-250">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#0F172A]">Información</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 ${
              isCompany ? "bg-[#2563EB]" : "bg-[#0EA5A0]"
            }`}>
              {getInitials(conversation.participantName)}
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

          {isCompany ? (
            <>
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

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  Información de la empresa
                </h4>
                <div className="bg-[#F8FAFC] rounded-lg p-3">
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Esta información aún no está disponible desde el chat. Puedes ver el perfil completo
                    desde la sección correspondiente una vez que el backend incluya el identificador del
                    participante en la conversación.
                  </p>
                </div>
              </div>
            </>
          ) : profileQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
            </div>
          ) : profile ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-[#0F172A] leading-6">{ratingText(profile)}</p>
                  <p className="text-[10px] text-[#64748B]">Calificación</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-[#0F172A]">{profile.skills?.length ?? 0}</p>
                  <p className="text-[10px] text-[#64748B]">Habilidades</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-[#0F172A]">{profile.portfolioItems?.length ?? 0}</p>
                  <p className="text-[10px] text-[#64748B]">Portafolio</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  Información del freelancer
                </h4>
                <FieldBlock label="Rubro" value={profile.industry} />
                <FieldBlock label="Especialidad" value={profile.specialty} />
                <FieldBlock label="Biografía" value={profile.biography} />
                <FieldBlock label="Logros" value={profile.achievements} />
                <SkillChips profile={profile} />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Información del freelancer
              </h4>
              <div className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#EF4444] leading-relaxed">
                  No se pudo cargar la información del perfil.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
              Archivos compartidos{sharedFiles.length > 0 ? ` (${sharedFiles.length})` : ""}
            </h4>
            {sharedFiles.length === 0 ? (
              <div className="flex flex-col items-center text-center py-4 bg-[#F8FAFC] rounded-lg">
                <FileText className="w-6 h-6 text-[#CBD5E1] mb-1.5" />
                <p className="text-[11px] text-[#94A3B8]">
                  Los archivos que se compartan en la conversación aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {sharedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2.5 bg-[#F8FAFC] rounded-lg p-2.5">
                    <FileText className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0F172A] truncate">{file.originalName}</p>
                      <p className="text-[10px] text-[#64748B]">
                        {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
      </div>

      {showProfileModal && (
        profile && !isCompany ? (
          <FreelancerProfileModal conversation={conversation} profile={profile} onClose={() => setShowProfileModal(false)} />
        ) : (
          <ViewProfileModal conversation={conversation} onClose={() => setShowProfileModal(false)} />
        )
      )}
      {showProjectModal && (
        <ViewProjectModal conversation={conversation} onClose={() => setShowProjectModal(false)} />
      )}
    </>
  );
}