// features/profile/components/PortfolioSection.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Check, X, Loader2, Link as LinkIcon, ExternalLink, Globe } from "lucide-react";
import { useUpdateProfile } from "../hooks/useProfile";
import type { Profile, PortfolioItem } from "../types/profile.types";

interface Props {
  profile: Profile;
}

const EMPTY_ITEM: PortfolioItem = {
  title: "", description: "", assetUrl: "", projectUrl: "",
};

function getLinkLabel(url: string): string {
  if (url.includes("github"))   return "GitHub";
  if (url.includes("linkedin")) return "LinkedIn";
  if (url.includes("figma"))    return "Figma";
  return "Link";
}

function getLinkIcon(url: string) {
  if (url.includes("github"))   return ExternalLink;
  if (url.includes("linkedin")) return ExternalLink;
  return Globe;
}

export function PortfolioSection({ profile }: Props) {
  const initialItems = profile.portfolioItems ?? [];
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems]         = useState<PortfolioItem[]>(initialItems);
  const { updateAsync, isLoading } = useUpdateProfile();

  const profileId = profile.id; // puede ser null

  const handleSave = async () => {
    if (!profileId) return; // guard
    await updateAsync({ profileId, payload: { portfolioItems: items } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(initialItems);
    setIsEditing(false);
  };

  const addItem    = () => setItems([...items, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof PortfolioItem, value: string) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[#1B3A6B]">Portafolio y Enlaces</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={!profileId}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-[#1B3A6B] px-3 py-1.5 rounded-lg hover:bg-[#0EA5A0] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item, i) => {
            const Icon  = getLinkIcon(item.projectUrl);
            const label = getLinkLabel(item.projectUrl);
            return (
              <a key={i} href={item.projectUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-[#0EA5A0]/30 hover:bg-teal-50/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 truncate">{item.projectUrl}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  <Icon className="w-3 h-3" /> {label}
                </span>
              </a>
            );
          })}

          <button
            onClick={() => setIsEditing(true)}
            disabled={!profileId}
            className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-200 rounded-xl hover:border-[#0EA5A0]/40 hover:bg-teal-50/20 transition-all text-sm text-gray-400 hover:text-[#0EA5A0] disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Agregar proyecto
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Proyecto {i + 1}</span>
                <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)}
                placeholder="Nombre del proyecto"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              />
              <input value={item.projectUrl} onChange={(e) => updateItem(i, "projectUrl", e.target.value)}
                placeholder="https://github.com/usuario/proyecto"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              />
              <textarea value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="Descripción breve del proyecto" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0] resize-none"
              />
            </div>
          ))}
          <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#0EA5A0] hover:text-teal-700 transition-colors">
            <Plus className="w-4 h-4" /> Agregar proyecto
          </button>
        </div>
      )}
    </div>
  );
}