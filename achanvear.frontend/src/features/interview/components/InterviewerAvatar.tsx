// features/interview/components/InterviewerAvatar.tsx
// Avatar del entrevistador IA basado en el perfil seleccionado
"use client";

interface InterviewerAvatarProps {
  name: string;
  style: string;
  voice: string;
  size?: "sm" | "md" | "lg";
}

const AVATAR_CONFIG: Record<string, { initials: string; bg: string; emoji: string }> = {
  "Carlos Mendoza": { initials: "CM", bg: "from-blue-600 to-blue-800", emoji: "👔" },
  "Ana Quispe": { initials: "AQ", bg: "from-pink-500 to-rose-600", emoji: "👩‍💼" },
  "Diego Torres": { initials: "DT", bg: "from-indigo-600 to-purple-700", emoji: "👨‍💻" },
  "Sofia Vargas": { initials: "SV", bg: "from-teal-500 to-emerald-600", emoji: "👩‍🎓" },
};

const DEFAULT_AVATAR = { initials: "IA", bg: "from-slate-600 to-slate-800", emoji: "🤖" };

export function InterviewerAvatar({ name, style, voice, size = "md" }: InterviewerAvatarProps) {
  const config = AVATAR_CONFIG[name] || DEFAULT_AVATAR;

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
  };

  const statusSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const getVoiceLabel = (v: string) => {
    switch (v) {
      case "MALE1": return "Voz masculina 1";
      case "MALE2": return "Voz masculina 2";
      case "FEMALE1": return "Voz femenina 1";
      case "FEMALE2": return "Voz femenina 2";
      default: return v;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar circular con gradiente */}
      <div
        className={`relative rounded-full bg-gradient-to-br ${config.bg} ${sizeClasses[size]}
          flex items-center justify-center text-white font-bold shadow-lg
          ring-2 ring-white ring-offset-2 ring-offset-slate-50`}
      >
        <span>{config.initials}</span>

        {/* Indicador de "hablando" animado */}
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizeClasses[size]} rounded-full bg-emerald-400 border-2 border-white`}>
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>
      </div>

      {/* Nombre */}
      <div className="text-center">
        <p className="font-bold text-slate-900 text-sm">{name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{style}</p>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
          {getVoiceLabel(voice)}
        </span>
      </div>
    </div>
  );
}