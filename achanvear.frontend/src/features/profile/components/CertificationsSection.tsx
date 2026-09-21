// features/profile/components/CertificationsSection.tsx
"use client";

import { useState } from "react";
import { GraduationCap, Plus, X, Check, Loader2, Pencil, ExternalLink } from "lucide-react";
import { useUpdateProfile } from "../hooks/useProfile";
import type { Profile, Certification } from "../types/profile.types";

interface Props {
  profile: Profile;
}

const EMPTY_CERT: Certification = { name: "", issuingOrganization: "", credentialUrl: "" };

export function CertificationsSection({ profile }: Props) {
  const profileId = profile.id;
  const initial   = profile.certifications ?? [];

  const [isEditing, setIsEditing]  = useState(false);
  const [items, setItems]          = useState<Certification[]>(initial);
  const [adding, setAdding]        = useState(false);
  const [newCert, setNewCert]      = useState<Certification>({ ...EMPTY_CERT });
  const { updateAsync, isLoading } = useUpdateProfile();

  const handleSave = async () => {
    if (!profileId) return;
    await updateAsync({ profileId, payload: { certifications: items } });
    setIsEditing(false);
    setAdding(false);
  };

  const handleCancel = () => {
    setItems(initial);
    setAdding(false);
    setNewCert({ ...EMPTY_CERT });
    setIsEditing(false);
  };

  const confirmAddCert = () => {
    if (!newCert.name.trim()) return;
    setItems([...items, { ...newCert }]);
    setNewCert({ ...EMPTY_CERT });
    setAdding(false);
  };

  const removeCert = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[#1B3A6B]">Certificaciones</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={!profileId}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button onClick={handleSave} disabled={isLoading}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-[#1B3A6B] px-3 py-1.5 rounded-lg hover:bg-[#0EA5A0] disabled:opacity-50">
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Lista de certificaciones */}
      {items.length === 0 && !isEditing ? (
        <div className="text-center py-8">
          <GraduationCap className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-3">Aún no has agregado certificaciones</p>
          <button
            onClick={() => { setIsEditing(true); setAdding(true); }}
            disabled={!profileId}
            className="flex items-center gap-1.5 text-sm text-[#0EA5A0] hover:text-teal-700 transition-colors mx-auto disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Agregar certificación
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((cert, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3.5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-[#1B3A6B]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{cert.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cert.issuingOrganization}</p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#0EA5A0] hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver credencial
                    </a>
                  )}
                </div>
              </div>
              {isEditing && (
                <button onClick={() => removeCert(i)}
                  className="flex-shrink-0 text-slate-300 hover:text-red-400 transition mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Formulario inline para agregar nueva certificación */}
          {isEditing && (
            adding ? (
              <div className="rounded-xl border border-[#1B3A6B]/20 bg-blue-50/30 p-4 space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-4 w-4 text-[#1B3A6B]" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-[#1B3A6B]">Nueva certificación</span>
                </div>
                <input type="text" value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B3A6B] bg-white"
                  placeholder="Nombre del certificado" />
                <input type="text" value={newCert.issuingOrganization}
                  onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#1B3A6B] bg-white"
                  placeholder="Organización emisora" />
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
                  <input type="url" value={newCert.credentialUrl}
                    onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                    placeholder="https://... (URL de verificación)" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { setAdding(false); setNewCert({ ...EMPTY_CERT }); }}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition">
                    Cancelar
                  </button>
                  <button onClick={confirmAddCert} disabled={!newCert.name.trim()}
                    className="flex-1 rounded-lg bg-[#1B3A6B] py-2 text-xs font-semibold text-white hover:bg-[#162f58] disabled:opacity-40 transition">
                    Agregar
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-[#0EA5A0]/40 hover:text-[#0EA5A0] transition-colors">
                <Plus className="w-4 h-4" /> Agregar certificación
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}