// features/profile/components/CvManagerSection.tsx
"use client";

import { useState, useEffect } from "react";

import {
  FileText, Upload, Download, Loader2, Sparkles, RefreshCw, Pencil, Trash2,
  CheckCircle2, AlertCircle, X, Eye,
} from "lucide-react";
import { useCvInfo, useUploadCv, useRemoveCv, useGenerateCvWithAi, useEditCvSection, useSaveCv } from "../hooks/useCv";
import { useMyProfile } from "../hooks/useProfile";
import type { CvInfo, CvGeneratedResponse } from "../types/cv.types";


import { CvBuilder, cvToFormData } from "./CvBuilder";
import type { FormData } from "./CvBuilder";
import { CvExportButtons } from "./CvExportButtons";
import { generatePdfBlob, generateWordBlob } from "./CvExportHelper";



// ─── Constantes ───────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ".pdf,.doc,.docx";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSourceLabel(source: string): string {
  switch (source) {
    case "manual": return "CV subido manualmente";
    case "ai": return "CV generado con IA";
    default: return "CV";
  }
}

function getSourceColor(source: string): string {
  switch (source) {
    case "manual": return "bg-blue-50 text-blue-700 border-blue-200";
    case "ai": return "bg-purple-50 text-purple-700 border-purple-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

function UploadModal({ isOpen, onClose, onUpload, isUploading }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type)) { setError("Solo se permiten archivos PDF y DOCX"); return; }
    if (file.size > MAX_FILE_SIZE) { setError(`El archivo excede el tamaño máximo de 5 MB (${formatFileSize(file.size)})`); return; }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    setError(null);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (err: any) { setError(err?.message ?? "Error al subir el archivo"); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* RESPONSIVE: max-h-[90vh] + overflow-y-auto; px-4 en celular en cabecera, cuerpo y pie */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center"><Upload className="w-5 h-5 text-[#1B3A6B]" /></div>
            <div className="min-w-0"><h3 className="text-sm font-bold text-gray-900">Subir CV</h3><p className="text-xs text-gray-400">PDF o DOCX · Máx. 5 MB</p></div>
          </div>
          <button onClick={onClose} disabled={isUploading} aria-label="Cerrar" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 sm:p-6">
          {!selectedFile ? (
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-5 sm:p-8 text-center cursor-pointer hover:border-[#1B3A6B]/40 hover:bg-blue-50/30 transition-all group block">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors"><Upload className="w-6 h-6 text-gray-300 group-hover:text-[#1B3A6B] transition-colors" /></div>
              <p className="text-sm font-medium text-gray-700 mb-1">Haz clic para seleccionar archivo</p>
              <p className="text-xs text-gray-400">o arrastra y suelta aquí</p>
              <input type="file" accept={ACCEPTED_TYPES} onChange={handleFileSelect} className="hidden" />
            </label>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-[#1B3A6B]" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p><p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p></div>
                <button onClick={() => setSelectedFile(null)} disabled={isUploading} aria-label="Quitar archivo" className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
          {error && <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200"><AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /><p className="text-xs text-red-600 break-words">{error}</p></div>}
        </div>
        {/* RESPONSIVE: botones apilados a ancho completo en celular (Subir CV arriba), en fila a la derecha desde sm */}
        <div className="flex flex-col-reverse gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 sm:flex-row sm:items-center sm:justify-end">
          <button onClick={onClose} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50">Cancelar</button>
          <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#1B3A6B]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir CV</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CvManagerSection() {
  const { cvInfo, isLoading: isLoadingInfo, refetch } = useCvInfo();
  const { uploadAsync, isLoading: isUploading } = useUploadCv();
  const { removeAsync, isLoading: isRemoving } = useRemoveCv();
  const { generateAsync, generatedCv, isLoading: isGenerating, reset: resetGenerated } = useGenerateCvWithAi();
  const { editAsync, editedCv, isLoading: isEditing } = useEditCvSection();
  const { saveAsync, isLoading: isSaving } = useSaveCv();
  const { profile } = useMyProfile();


  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // Estado LOCAL con localStorage para persistir aunque el backend no tenga el campo
  const [cvGenerated, setCvGenerated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cv_generated") === "true";
    }
    return false;
  });

  // También considerar el cvInfo del backend
  const hasCv = cvInfo?.status === "uploaded" || cvInfo?.status === "generated" || cvGenerated;

  // Estado local para el CV actual (se actualiza con generación y edición)
  const [currentCv, setCurrentCv] = useState<CvGeneratedResponse | null>(null);

  // Sincronizar cuando se genera o edita el CV
  useEffect(() => {
    if (generatedCv) {
      setCurrentCv(generatedCv);
      // Marcar que ya se generó un CV
      setCvGenerated(true);
      localStorage.setItem("cv_generated", "true");
    }
  }, [generatedCv]);

  useEffect(() => {
    if (editedCv) setCurrentCv(editedCv);
  }, [editedCv]);

  // Cargar CV desde backend si existe cvData guardado
  useEffect(() => {
    if (cvInfo?.cvData && !currentCv && !generatedCv && !editedCv) {
      // El cvData se guardó como FormData (los datos del formulario editado)
      // Lo convertimos a un objeto compatible con CvGeneratedResponse
      const savedData = cvInfo.cvData;
      if (savedData && typeof savedData === "object") {
        setCurrentCv({
          markdown: "",
          header: savedData.header ?? { fullName: "", role: "", location: "", email: "", phone: "", linkedIn: "", github: "", portfolio: "" },
          professionalSummary: savedData.professionalSummary ?? "",
          workExperience: savedData.experiences?.map((e: any) => ({
            position: e.position ?? "",
            company: e.company ?? "",
            location: e.location ?? "",
            startDate: e.startDate ?? "",
            endDate: e.endDate ?? "",
            bullets: e.bullets ?? [],
          })) ?? [],
          education: savedData.education?.map((e: any) => ({
            institution: e.institution ?? "",
            program: e.program ?? "",
            location: e.location ?? "",
            startDate: e.startDate ?? "",
            endDate: e.endDate ?? "",
          })) ?? [],
          skills: {
            programmingLanguages: savedData.skills?.programmingLanguages?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
            frameworks: savedData.skills?.frameworks?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
            tools: savedData.skills?.tools?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
            softSkills: savedData.skills?.softSkills?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
          },
          projects: savedData.projects?.map((p: any) => ({
            name: p.name ?? "",
            description: p.description ?? "",
            technologies: p.technologies?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
            link: p.link ?? "",
          })) ?? [],
          certifications: savedData.certifications?.map((c: any) => ({
            name: c.name ?? "",
            issuer: c.issuer ?? "",
            year: c.year ?? "",
          })) ?? [],
          languages: savedData.languages?.map((l: any) => ({
            language: l.language ?? "",
            level: l.level ?? "",
          })) ?? [],
          missingData: [],
          complete: true,
        });
        setCvGenerated(true);
        localStorage.setItem("cv_generated", "true");
      }
    }
  }, [cvInfo?.cvData]);


  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleUpload = async (file: File) => { await uploadAsync(file); refetch(); };

  const handleRemove = async () => {
    await removeAsync();
    setShowDeleteModal(false);
    refetch();
    // Limpiar estado local
    setCvGenerated(false);
    localStorage.removeItem("cv_generated");
    localStorage.removeItem("cv_data");
  };

  const handleGenerateWithAi = async () => {
    setShowBuilder(true);
    setCurrentCv(null);
    resetGenerated();
    try { await generateAsync(); } catch (err) { console.error("Error generating CV:", err); }
  };

  // Función auxiliar para convertir datos guardados a CvGeneratedResponse
  const buildCvFromSavedData = (savedData: any): CvGeneratedResponse => ({
    markdown: "",
    header: savedData.header ?? { fullName: "", role: "", location: "", email: "", phone: "", linkedIn: "", github: "", portfolio: "" },
    professionalSummary: savedData.professionalSummary ?? "",
    workExperience: savedData.experiences?.map((e: any) => ({
      position: e.position ?? "",
      company: e.company ?? "",
      location: e.location ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      bullets: e.bullets ?? [],
    })) ?? [],
    education: savedData.education?.map((e: any) => ({
      institution: e.institution ?? "",
      program: e.program ?? "",
      location: e.location ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
    })) ?? [],
    skills: {
      programmingLanguages: savedData.skills?.programmingLanguages?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
      frameworks: savedData.skills?.frameworks?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
      tools: savedData.skills?.tools?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
      softSkills: savedData.skills?.softSkills?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
    },
    projects: savedData.projects?.map((p: any) => ({
      name: p.name ?? "",
      description: p.description ?? "",
      technologies: p.technologies?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [],
      link: p.link ?? "",
    })) ?? [],
    certifications: savedData.certifications?.map((c: any) => ({
      name: c.name ?? "",
      issuer: c.issuer ?? "",
      year: c.year ?? "",
    })) ?? [],
    languages: savedData.languages?.map((l: any) => ({
      language: l.language ?? "",
      level: l.level ?? "",
    })) ?? [],
    missingData: [],
    complete: true,
  });

  // Abrir el builder con el CV ya guardado (sin llamar a la IA)
  const handleOpenBuilder = () => {
    setShowBuilder(true);
    // Si ya hay currentCv, usarlo directamente
    if (currentCv) return;

    // Intentar cargar desde cvInfo.cvData (backend)
    if (cvInfo?.cvData && typeof cvInfo.cvData === "object") {
      setCurrentCv(buildCvFromSavedData(cvInfo.cvData));
      return;
    }

    // Fallback: intentar cargar desde localStorage
    try {
      const saved = localStorage.getItem("cv_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          setCurrentCv(buildCvFromSavedData(parsed));
          return;
        }
      }
    } catch {}
  };




  const handleEditSection = async (sectionName: string, instruction: string) => {
    await editAsync({ sectionName, instruction });
  };

  const handleSave = async (data: any) => {
    try {
      await saveAsync(data);
    } catch (err) {
      console.error("Error al guardar en backend, pero guardando localmente:", err);
    }
    // Guardar datos localmente para persistir
    localStorage.setItem("cv_data", JSON.stringify(data));
    // Marcar que ya hay CV generado
    setCvGenerated(true);
    localStorage.setItem("cv_generated", "true");
    // Cerrar el modal después de guardar
    setShowBuilder(false);
    // Refrescar el perfil
    refetch();

    // Generar PDF automáticamente y subirlo a S3
    // para que quede guardado y se pueda descargar desde curriculumUrl
    try {
      const formData = data as FormData;
      const pdfBlob = await generatePdfBlob(formData);
      const pdfFile = new File([pdfBlob], "CV_Profesional.pdf", { type: "application/pdf" });
      await uploadAsync(pdfFile);
      // Refrescar para que aparezca la URL del PDF
      refetch();
    } catch (err) {
      console.error("Error al generar/subir PDF:", err);
    }

  };





  // ─── Skeleton ──────────────────────────────────────────────────────────────

  if (isLoadingInfo) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-32 mb-5" />
          <div className="h-16 bg-gray-50 rounded-xl mb-4" />
          <div className="flex gap-3"><div className="h-10 bg-gray-100 rounded-xl flex-1" /><div className="h-10 bg-gray-100 rounded-xl flex-1" /></div>
        </div>
      </div>
    );
  }

  // ─── Sin CV ────────────────────────────────────────────────────────────────

  if (!hasCv) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gray-50 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-400" /></div>
          <div className="min-w-0"><h2 className="text-base font-bold text-[#1B3A6B]">Gestión de CV</h2><p className="text-xs text-gray-400">Aún no has configurado tu CV</p></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-gray-300 flex-shrink-0" /><p className="min-w-0 text-sm text-gray-500">Sube tu CV en formato PDF o DOCX, o genera uno automáticamente con IA usando los datos de tu perfil.</p></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowUploadModal(true)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#1B3A6B]/90 transition-all shadow-sm"><Upload className="w-4 h-4 flex-shrink-0" /> Subir CV manualmente</button>
          <button onClick={handleGenerateWithAi} disabled={isGenerating} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-purple-200 text-purple-700 text-sm font-semibold hover:bg-purple-50 transition-all disabled:opacity-50">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Crear CV con IA
          </button>
        </div>
        <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={handleUpload} isUploading={isUploading} />
        <CvBuilder
          isOpen={showBuilder}
          onClose={() => setShowBuilder(false)}
          initialCv={currentCv}
          isLoading={isGenerating}
          onRegenerateSection={handleEditSection}
          isRegenerating={isEditing}
          onSave={handleSave}
          profilePhotoUrl={profile?.profilePhotoUrl ?? undefined}
        />
      </div>
    );
  }

  // Convertir currentCv a FormData para los botones de exportación
  // Si no hay currentCv, intentar cargar desde localStorage
  const getExportFormData = (): FormData => {
    if (currentCv) return cvToFormData(currentCv);
    // Intentar cargar desde localStorage
    try {
      const saved = localStorage.getItem("cv_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convertir el objeto guardado a FormData
        return {
          header: parsed.header ?? { fullName: "", role: "", location: "", email: "", phone: "", linkedIn: "", github: "", portfolio: "", profilePhotoUrl: "" },
          professionalSummary: parsed.professionalSummary ?? "",
          skills: {
            programmingLanguages: parsed.skills?.programmingLanguages ?? "",
            frameworks: parsed.skills?.frameworks ?? "",
            tools: parsed.skills?.tools ?? "",
            softSkills: parsed.skills?.softSkills ?? "",
          },
          experiences: parsed.experiences ?? [],
          education: parsed.education ?? [],
          projects: parsed.projects ?? [],
          certifications: parsed.certifications ?? [],
          languages: parsed.languages ?? [],
        };
      }
    } catch {}
    return cvToFormData(null);
  };
  const exportFormData = getExportFormData();


  // ─── Con CV ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-[#1B3A6B]" /></div>
        <div className="min-w-0"><h2 className="text-base font-bold text-[#1B3A6B]">Gestión de CV</h2><p className="text-xs text-gray-400">Tu currículum vitae</p></div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm"><FileText className="w-6 h-6 text-[#1B3A6B]" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSourceColor(cvInfo?.source ?? "unknown")}`}>
                {cvInfo?.source === "ai" ? <Sparkles className="w-3 h-3 flex-shrink-0" /> : <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                {getSourceLabel(cvInfo?.source ?? "unknown")}
              </span>
            </div>
            {cvInfo?.fileName && <p className="text-sm font-medium text-gray-800 truncate mt-1">{cvInfo.fileName}</p>}
            <p className="text-xs text-gray-400 mt-0.5 break-words">Última actualización: {formatDate(cvInfo?.lastUpdated ?? null)}</p>
          </div>
        </div>
      </div>
      {/* RESPONSIVE: "PDF" y "Word" (CvExportButtons) son UN solo elemento de la grilla y, al ser más ancho que
          su columna, se montaba sobre "Editar CV" (ver captura a 284px). Ahora ocupan 2 columnas en celular
          (se reparten el ancho con flex-1) y 2 de las 5 columnas desde sm; los otros 3 botones ocupan 1 cada uno. */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="col-span-2 flex gap-2 [&>*]:min-w-0 [&>*]:flex-1">
          <CvExportButtons formData={exportFormData} cvUrl={cvInfo?.url} />
        </div>

        <button onClick={handleOpenBuilder} className="inline-flex min-w-0 items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-all"><Pencil className="w-3.5 h-3.5 flex-shrink-0" /> Editar CV</button>
        <button onClick={handleGenerateWithAi} disabled={isGenerating} className="inline-flex min-w-0 items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-50 transition-all disabled:opacity-50">
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />}
          Regenerar con IA
        </button>
        <button onClick={() => setShowUploadModal(true)} className="col-span-2 sm:col-span-1 inline-flex min-w-0 items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-all"><RefreshCw className="w-3.5 h-3.5 flex-shrink-0" /> Reemplazar archivo</button>
      </div>


      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={handleUpload} isUploading={isUploading} />
      <CvBuilder
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        initialCv={currentCv}
        isLoading={isGenerating}
        onRegenerateSection={handleEditSection}
        isRegenerating={isEditing}
        onSave={handleSave}
        profilePhotoUrl={profile?.profilePhotoUrl ?? undefined}
      />


    </div>
  );
}