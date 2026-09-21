// features/profile/components/SkillsSection.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { useUpdateProfile } from "../hooks/useProfile";
import {
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
  type Profile,
  type Skill,
} from "../types/profile.types";

interface Props {
  profile: Profile;
}

const LEVELS: Skill["level"][] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const LEVEL_BAR: Record<Skill["level"], string> = {
  BEGINNER:     "w-1/4",
  INTERMEDIATE: "w-2/4",
  ADVANCED:     "w-3/4",
  EXPERT:       "w-full",
};

const EMPTY_SKILL: Skill = { name: "", level: "INTERMEDIATE", yearsOfExperience: 1 };

export function SkillsSection({ profile }: Props) {
  // Fallback seguro — skills puede venir undefined del backend
  const initialSkills = profile.skills ?? [];
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills]       = useState<Skill[]>(initialSkills);
  const { updateAsync, isLoading } = useUpdateProfile();

  const profileId = profile.id;

  const handleSave = async () => {
    if (!profileId) return;
    await updateAsync({ profileId, payload: { skills } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSkills(initialSkills);
    setIsEditing(false);
  };

  const addSkill    = () => setSkills([...skills, { ...EMPTY_SKILL }]);
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: keyof Skill, value: string | number) =>
    setSkills(skills.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[#1B3A6B]">Habilidades</h2>
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
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
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

      {skills.length === 0 && !isEditing ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-3">Aún no has agregado habilidades</p>
          <button
            onClick={() => setIsEditing(true)}
            disabled={!profileId}
            className="flex items-center gap-1.5 text-sm text-[#0EA5A0] hover:text-teal-700 transition-colors mx-auto disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Agregar habilidad
          </button>
        </div>
      ) : !isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div key={skill.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                <span className="text-xs text-gray-400">
                  {SKILL_LEVEL_LABELS[skill.level]} · {skill.yearsOfExperience} años
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${SKILL_LEVEL_COLORS[skill.level]} ${LEVEL_BAR[skill.level]}`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={skill.name}
                onChange={(e) => updateSkill(i, "name", e.target.value)}
                placeholder="Nombre de la habilidad"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              />
              <select
                value={skill.level}
                onChange={(e) => updateSkill(i, "level", e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</option>
                ))}
              </select>
              <input
                type="number"
                value={skill.yearsOfExperience}
                onChange={(e) => updateSkill(i, "yearsOfExperience", Number(e.target.value))}
                min={0}
                max={30}
                className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5A0]/30 focus:border-[#0EA5A0]"
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">años</span>
              <button
                onClick={() => removeSkill(i)}
                className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addSkill}
            className="flex items-center gap-1.5 text-sm text-[#0EA5A0] hover:text-teal-700 transition-colors mt-1"
          >
            <Plus className="w-4 h-4" /> Agregar habilidad
          </button>
        </div>
      )}
    </div>
  );
}
