// features/chat/components/ParticipantInfoPanel.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Clock, FileText, Loader2, BadgeCheck } from "lucide-react";
import { chatApi } from "../api/chatApi";
import { useMessages } from "../hooks/useChat";
import type { Conversation, FreelancerProfileResponse } from "../types/chat.types";

interface Props {
  conversation: Conversation | null;
  onClose: () => void;
}

interface PortfolioItem {
  title?: string;
  description?: string;
  projectUrl?: string;
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  MICRO_ENTERPRISE: "Microempresa",
  SMALL_ENTERPRISE: "Pequeña empresa",
  MEDIUM_ENTERPRISE: "Mediana empresa",
  LARGE_ENTERPRISE: "Gran empresa",
};

function formatCompanySize(size?: string | null) {
  if (!size) return null;
  return COMPANY_SIZE_LABELS[size] ?? size.replace(/_/g, " ").toLowerCase();
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

function isSafeUrl(url?: string) {
  return !!url && /^https?:\/\//i.test(url);
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

function PortfolioList({ profile }: { profile: FreelancerProfileResponse }) {
  const items = (profile.portfolioItems ?? []) as PortfolioItem[];
  if (items.length === 0) return null;
  return (
    <div className="bg-[#F8FAFC] rounded-lg p-3">
      <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Portafolio</p>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={`${item.title ?? "item"}-${i}`}>
            {item.title && <p className="text-xs font-medium text-[#0F172A] break-words">{item.title}</p>}
            {item.description && <p className="text-[11px] text-[#64748B] break-words">{item.description}</p>}
            {isSafeUrl(item.projectUrl) && (
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
  );
}

export function ParticipantInfoPanel({ conversation, onClose }: Props) {
  const { messages } = useMessages(conversation?.id ?? null);

  const isFreelancerParticipant = !!conversation && conversation.participantRole !== "COMPANY";

  const profileQuery = useQuery({
    queryKey: ["chat", "participant-profile", conversation?.participantId],
    queryFn: () => chatApi.getFreelancerProfile(conversation!.participantId),
    enabled: isFreelancerParticipant && !!conversation?.participantId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const companyProfileQuery = useQuery({
    queryKey: ["chat", "company-profile", conversation?.participantCompanyId ?? conversation?.participantId],
    queryFn: () => chatApi.getCompanyProfile(conversation!.participantCompanyId ?? conversation!.participantId),
    enabled: !isFreelancerParticipant && !!conversation?.participantId,
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
  const company = companyProfileQuery.data;

  const companyName = company?.tradeName?.trim() || company?.businessName?.trim() || "";
  const displayName = isCompany && companyName ? companyName : conversation.participantName;
  const legalName =
    company?.businessName?.trim() && company.businessName.trim() !== companyName
      ? company.businessName.trim()
      : null;

  return (
    <div className="w-[320px] flex-shrink-0 border-l border-[#E5E7EB] bg-white overflow-y-auto animate-in slide-in-from-right duration-250">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-[#0F172A]">Información</h3>
        <button
          onClick={onClose}
          aria-label="Cerrar"
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
            {getInitials(displayName)}
          </div>
          <h4 className="text-sm font-semibold text-[#0F172A] break-words">{displayName}</h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            {isCompany ? "Empresa" : "Freelancer"}
          </p>
          {isCompany && companyName && (
            <p className="text-[11px] text-[#64748B] mt-0.5 break-words">
              Contacto: {conversation.participantName}
            </p>
          )}
          {isCompany && company?.status === "VALIDATED" && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-[#0EA5A0]">
              <BadgeCheck className="w-3.5 h-3.5" />
              Empresa verificada
            </span>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <Clock className="w-3 h-3" />
              Último mensaje: {formatDate(conversation.lastMessageAt)}
            </span>
          </div>
        </div>

        {isCompany ? (
          companyProfileQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
            </div>
          ) : company ? (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Información de la empresa
              </h4>
              <FieldBlock label="Razón social" value={legalName} />
              <FieldBlock label="Rubro" value={company.industry} />
              <FieldBlock label="Especialidad" value={company.specialty} />
              <FieldBlock label="Tamaño" value={formatCompanySize(company.companySize)} />
              <FieldBlock label="Descripción" value={company.biography} />
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Información de la empresa
              </h4>
              <div className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#EF4444] leading-relaxed">
                  No se pudo cargar el perfil de la empresa.
                </p>
              </div>
            </div>
          )
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
              <PortfolioList profile={profile} />
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
      </div>
    </div>
  );
}