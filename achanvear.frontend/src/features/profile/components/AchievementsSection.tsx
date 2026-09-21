// features/profile/components/AchievementsSection.tsx
"use client";

import { useState } from "react";
import { Trophy, Star, Award, Plus, X, Check, Loader2, Pencil } from "lucide-react";
import { useUpdateProfile } from "../hooks/useProfile";
import type { Profile } from "../types/profile.types";

interface Props {
  profile: Profile;
}

const ACHIEVEMENT_ICONS = [Trophy, Star, Award];

function getIcon(index: number) {
  return ACHIEVEMENT_ICONS[index % ACHIEVEMENT_ICONS.length];
}

const ICON_COLORS = [
  "bg-amber-50 text-amber-500",
  "bg-blue-50 text-blue-500",
  "bg-teal-50 text-[#0EA5A0]",
];

function getIconColor(index: number) {
  return ICON_COLORS[index % ICON_COLORS.length];
}

export function AchievementsSection({ profile }: Props) {
  const profileId   = profile.id;
  const rawAchievements = profile.achievements ?? "";

  // Convertir string "Logro 1, Logro 2" → array
  const toArray = (raw: string) =>
    raw.split(" || ").map((s) => s.trim()).filter(Boolean)

  const [isEditing, setIsEditing]     = useState(false);
  const [items, setItems]             = useState<string[]>(toArray(rawAchievements));
  const [newItem, setNewItem]         = useState("");
  const { updateAsync, isLoading }    = useUpdateProfile();

  const handleSave = async () => {
    if (!profileId) return;
    await updateAsync({
      profileId,
      payload: { achievements: items.join(" || ") }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(toArray(rawAchievements));
    setNewItem("");
    setIsEditing(false);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[#1B3A6B]">Logros Destacados</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={!profileId}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <Pencil className="w-3.5 h-3.5" />
            {items.length === 0 ? "Agregar Logro" : "Editar"}
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

      {/* Vista lectura */}
      {!isEditing ? (
        items.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-3">Aún no has agregado logros destacados</p>
            <button
              onClick={() => setIsEditing(true)}
              disabled={!profileId}
              className="flex items-center gap-1.5 text-sm text-[#0EA5A0] hover:text-teal-700 transition-colors mx-auto disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Agregar logro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {items.map((item, i) => {
              const Icon = getIcon(i);
              return (
                <div key={i} className={`rounded-xl border border-gray-100 p-4 ${i === 0 ? "bg-amber-50 border-amber-100" : i === 1 ? "bg-blue-50 border-blue-100" : "bg-teal-50 border-teal-100"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${getIconColor(i)}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{item}</p>
                </div>
              );
            })}
            {profileId && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-xl border border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-2 text-sm text-gray-400 hover:border-[#0EA5A0]/40 hover:text-[#0EA5A0] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Logro
              </button>
            )}
          </div>
        )
      ) : (
        /* Vista edición */
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <Trophy className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
              <span className="flex-1 text-sm text-slate-700">{item}</span>
              <button onClick={() => removeItem(i)}
                className="flex-shrink-0 text-slate-300 hover:text-red-400 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <Award className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                placeholder="Ej: Lideré proyecto que aumentó eficiencia en 40%"
              />
            </div>
            <button onClick={addItem} disabled={!newItem.trim()}
              className="rounded-xl bg-[#1B3A6B] px-4 text-xs font-semibold text-white hover:bg-[#162f58] disabled:opacity-40 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}