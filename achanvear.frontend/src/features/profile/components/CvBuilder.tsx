// features/profile/components/CvBuilder.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Plus, Trash2, Download, Loader2, Sparkles, Save, Eye, FileText, ChevronDown, ChevronUp,
} from "lucide-react";
import type { CvGeneratedResponse } from "../types/cv.types";
import html2pdf from "html2pdf.js";
import { API_BASE_URL } from "@/lib/constants";



// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormHeader { fullName: string; role: string; location: string; email: string; phone: string; linkedIn: string; github: string; portfolio: string; profilePhotoUrl: string; }

interface FormExperience { id: string; position: string; company: string; location: string; startDate: string; endDate: string; bullets: string[]; }
interface FormEducation { id: string; institution: string; program: string; location: string; startDate: string; endDate: string; }
interface FormProject { id: string; name: string; description: string; technologies: string; link: string; }
interface FormCertification { id: string; name: string; issuer: string; year: string; }
interface FormLanguage { id: string; language: string; level: string; }

export interface FormData {

  header: FormHeader;
  professionalSummary: string;
  skills: { programmingLanguages: string; frameworks: string; tools: string; softSkills: string; };
  experiences: FormExperience[];
  education: FormEducation[];
  projects: FormProject[];
  certifications: FormCertification[];
  languages: FormLanguage[];
}

interface CvBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialCv: CvGeneratedResponse | null;
  isLoading: boolean;
  onRegenerateSection: (sectionName: string, instruction: string) => Promise<void>;
  isRegenerating: boolean;
  onSave: (data: FormData) => Promise<void>;
  profilePhotoUrl?: string;
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() { return Math.random().toString(36).substring(2, 9); }

export function cvToFormData(cv: CvGeneratedResponse | null): FormData {

  if (!cv) return {
    header: { fullName: "", role: "", location: "", email: "", phone: "", linkedIn: "", github: "", portfolio: "", profilePhotoUrl: "" },
    professionalSummary: "",
    skills: { programmingLanguages: "", frameworks: "", tools: "", softSkills: "" },
    experiences: [], education: [], projects: [], certifications: [], languages: [],
  };
  return {
    header: {
      fullName: cv.header.fullName ?? "", role: cv.header.role ?? "", location: cv.header.location ?? "",
      email: cv.header.email ?? "", phone: cv.header.phone ?? "", linkedIn: cv.header.linkedIn ?? "",
      github: cv.header.github ?? "", portfolio: cv.header.portfolio ?? "", profilePhotoUrl: "",
    },

    professionalSummary: cv.professionalSummary ?? "",
    skills: {
      programmingLanguages: (cv.skills.programmingLanguages ?? []).join(", "),
      frameworks: (cv.skills.frameworks ?? []).join(", "),
      tools: (cv.skills.tools ?? []).join(", "),
      softSkills: (cv.skills.softSkills ?? []).join(", "),
    },
    experiences: (cv.workExperience ?? []).map((e) => ({ id: genId(), position: e.position ?? "", company: e.company ?? "", location: e.location ?? "", startDate: e.startDate ?? "", endDate: e.endDate ?? "", bullets: e.bullets ?? [] })),
    education: (cv.education ?? []).map((e) => ({ id: genId(), institution: e.institution ?? "", program: e.program ?? "", location: e.location ?? "", startDate: e.startDate ?? "", endDate: e.endDate ?? "" })),
    projects: (cv.projects ?? []).map((p) => ({ id: genId(), name: p.name ?? "", description: p.description ?? "", technologies: (p.technologies ?? []).join(", "), link: p.link ?? "" })),
    certifications: (cv.certifications ?? []).map((c) => ({ id: genId(), name: c.name ?? "", issuer: c.issuer ?? "", year: c.year ?? "" })),
    languages: (cv.languages ?? []).map((l) => ({ id: genId(), language: l.language ?? "", level: l.level ?? "" })),
  };
}

// ─── Vista previa del CV (formato APA 7) ──────────────────────────────────────

export function CvPreview({ data }: { data: FormData }) {

  const { header, professionalSummary, skills, experiences, education, projects, certifications, languages } = data;
  return (
    <div style={{
      fontFamily: "'Times New Roman', 'Georgia', 'Cambria', serif",
      fontSize: "12pt",
      lineHeight: "2.0",
      color: "#000",
      padding: "2.54cm 2.54cm",
      background: "white",
    }}>
      {/* Header con foto a la derecha */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "0pt" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          {header.fullName && <h1 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0 0 0pt 0", textTransform: "uppercase" }}>{header.fullName}</h1>}
          {header.role && <p style={{ fontSize: "12pt", fontStyle: "italic", margin: "0 0 0pt 0" }}>{header.role}</p>}
          <p style={{ fontSize: "12pt", margin: "0" }}>
            {[header.email, header.phone, header.location].filter(Boolean).join(" | ")}
          </p>
          <p style={{ fontSize: "12pt", margin: "0 0 0pt 0" }}>
            {[header.linkedIn, header.github, header.portfolio].filter(Boolean).join(" | ")}
          </p>
        </div>
        {header.profilePhotoUrl && (
          <div style={{ flexShrink: 0, marginLeft: "1cm", width: "2.5cm", height: "2.5cm" }}>
            <img
              src={header.profilePhotoUrl}
              alt="Foto"
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                border: "1px solid #ccc",
              }}
            />

          </div>
        )}
      </div>


      {/* Professional Summary */}
      {professionalSummary && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Perfil Profesional</h2>
          <p style={{ margin: "0 0 0pt 0", textAlign: "justify", textIndent: "1.27cm" }}>{professionalSummary}</p>
        </>
      )}

      {/* Work Experience */}
      {experiences.length > 0 && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Experiencia Laboral</h2>
          {experiences.map((e, i) => (
            <div key={i} style={{ marginBottom: "0pt" }}>
              <p style={{ margin: "0", fontWeight: "bold" }}>{e.position}{e.company ? `, ${e.company}` : ""}{e.location ? `, ${e.location}` : ""}</p>
              <p style={{ margin: "0", fontStyle: "italic" }}>{e.startDate && `${e.startDate} - ${e.endDate || "Actual"}`}</p>
              {e.bullets.length > 0 && (
                <ul style={{ margin: "0", paddingLeft: "1.27cm" }}>
                  {e.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: "0pt", textAlign: "justify" }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Educación</h2>
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: "0pt" }}>
              <p style={{ margin: "0", fontWeight: "bold" }}>{e.institution}{e.location ? `, ${e.location}` : ""}</p>
              <p style={{ margin: "0", fontStyle: "italic" }}>{e.program}{e.startDate ? ` — ${e.startDate} - ${e.endDate || "En curso"}` : ""}</p>
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {[skills.programmingLanguages, skills.frameworks, skills.tools, skills.softSkills].some(s => s.trim()) && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Habilidades</h2>
          {skills.programmingLanguages && <p style={{ margin: "0", textAlign: "justify" }}><strong>Habilidades técnicas:</strong> {skills.programmingLanguages}</p>}
          {skills.frameworks && <p style={{ margin: "0", textAlign: "justify" }}><strong>Metodologías:</strong> {skills.frameworks}</p>}
          {skills.tools && <p style={{ margin: "0", textAlign: "justify" }}><strong>Herramientas:</strong> {skills.tools}</p>}
          {skills.softSkills && <p style={{ margin: "0", textAlign: "justify" }}><strong>Habilidades blandas:</strong> {skills.softSkills}</p>}
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Proyectos</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: "0pt" }}>
              <p style={{ margin: "0", fontWeight: "bold" }}>{p.name}</p>
              {p.description && <p style={{ margin: "0", textAlign: "justify" }}>{p.description}</p>}
              {p.technologies && <p style={{ margin: "0", textAlign: "justify" }}><strong>Herramientas:</strong> {p.technologies}</p>}
              {p.link && <p style={{ margin: "0" }}><a href={p.link} style={{ color: "#000", textDecoration: "underline" }}>{p.link}</a></p>}
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Certificaciones</h2>
          {certifications.map((c, i) => (
            <p key={i} style={{ margin: "0", textAlign: "justify" }}>
              <strong>{c.name}</strong>{c.issuer ? `, ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}
            </p>
          ))}
        </>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <>
          <h2 style={{ fontSize: "12pt", fontWeight: "bold", margin: "0pt 0 0pt 0", textTransform: "uppercase" }}>Idiomas</h2>
          {languages.map((l, i) => (
            <p key={i} style={{ margin: "0" }}>
              <strong>{l.language}</strong>{l.level ? ` — ${l.level}` : ""}
            </p>
          ))}
        </>
      )}
    </div>
  );
}


// ─── Componentes UI pequeños ──────────────────────────────────────────────────

function SectionCard({ title, icon, defaultOpen = true, children }: { title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">{icon}<span className="text-sm font-semibold text-gray-800">{title}</span></div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder = "", rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
      )}
    </div>
  );
}

// ─── Componente DateField con input nativo date ──────────────────────────────

function DateField({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  // Convierte dd/mm/aaaa a aaaa-mm-dd para el input type="date"
  const toInputValue = (str: string): string => {
    if (!str) return "";
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    return "";
  };

  // Convierte aaaa-mm-dd a dd/mm/aaaa
  const fromInputValue = (str: string): string => {
    if (!str) return "";
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
    return "";
  };

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={toInputValue(value)}
          onChange={(e) => onChange(fromInputValue(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
      </div>
    </div>
  );
}



function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600">Logros / Responsabilidades</label>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-4">•</span>
          <input value={b} onChange={(e) => { const n = [...bullets]; n[i] = e.target.value; onChange(n); }} placeholder="Describe un logro o responsabilidad..." className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          <button onClick={() => onChange(bullets.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-1"><X className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...bullets, ""])} className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"><Plus className="w-3 h-3" /> Agregar logro</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CvBuilder({ isOpen, onClose, initialCv, isLoading, onRegenerateSection, isRegenerating, onSave, profilePhotoUrl }: CvBuilderProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    const data = cvToFormData(initialCv);
    if (profilePhotoUrl) data.header.profilePhotoUrl = profilePhotoUrl;
    return data;
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [regSection, setRegSection] = useState("");
  const [regInstruction, setRegInstruction] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);


  // Convertir foto de S3 a base64 usando el backend como proxy (evita CORS)
  const photoUrlRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const photoUrl = profilePhotoUrl;
    if (!photoUrl || photoUrl.startsWith("data:")) return;
    // Evitar ejecutar si ya se procesó esta URL
    if (photoUrlRef.current === photoUrl) return;
    photoUrlRef.current = photoUrl;

    // Extraer fileKey de la URL de S3
    // URL ejemplo: https://achanvear-recordings-dev.s3.us-east-1.amazonaws.com/freelancer/profile-photos/uuid-nombre.jpg
    // fileKey: freelancer/profile-photos/uuid-nombre.jpg
    const s3Match = photoUrl.match(/\.amazonaws\.com\/(.+)/);
    const fileKey = s3Match ? s3Match[1] : null;

    if (fileKey) {
      fetch(`${API_BASE_URL}/profiles/photo-proxy?fileKey=${encodeURIComponent(fileKey)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Proxy falló");
          return res.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({
              ...prev,
              header: { ...prev.header, profilePhotoUrl: base64 }
            }));
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          console.warn("No se pudo cargar la foto de perfil por el proxy");
        });

    } else {
      // Fallback: intentar fetch directo (puede fallar por CORS)
      fetch(photoUrl, { mode: "cors" })
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({
              ...prev,
              header: { ...prev.header, profilePhotoUrl: base64 }
            }));
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          console.warn("No se pudo cargar la foto de perfil directamente");
        });
    }
  }, [profilePhotoUrl]);




  useEffect(() => {
    if (initialCv) {
      const data = cvToFormData(initialCv);
      // Mantener la foto actual si ya existe (no sobrescribir con vacío)
      if (formData.header.profilePhotoUrl) data.header.profilePhotoUrl = formData.header.profilePhotoUrl;
      setFormData(data);
    }
  }, [initialCv]);



  if (!isOpen) return null;

  const updHeader = (f: keyof FormHeader, v: string) => setFormData(p => ({ ...p, header: { ...p.header, [f]: v } }));
  const updSkills = (f: keyof FormData["skills"], v: string) => setFormData(p => ({ ...p, skills: { ...p.skills, [f]: v } }));

  const addExp = () => setFormData(p => ({ ...p, experiences: [...p.experiences, { id: genId(), position: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] }] }));
  const updExp = (id: string, f: keyof FormExperience, v: any) => setFormData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const delExp = (id: string) => setFormData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) }));

  const addEdu = () => setFormData(p => ({ ...p, education: [...p.education, { id: genId(), institution: "", program: "", location: "", startDate: "", endDate: "" }] }));
  const updEdu = (id: string, f: keyof FormEducation, v: string) => setFormData(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const delEdu = (id: string) => setFormData(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));

  const addProj = () => setFormData(p => ({ ...p, projects: [...p.projects, { id: genId(), name: "", description: "", technologies: "", link: "" }] }));
  const updProj = (id: string, f: keyof FormProject, v: string) => setFormData(p => ({ ...p, projects: p.projects.map(pr => pr.id === id ? { ...pr, [f]: v } : pr) }));
  const delProj = (id: string) => setFormData(p => ({ ...p, projects: p.projects.filter(pr => pr.id !== id) }));

  const addCert = () => setFormData(p => ({ ...p, certifications: [...p.certifications, { id: genId(), name: "", issuer: "", year: "" }] }));
  const updCert = (id: string, f: keyof FormCertification, v: string) => setFormData(p => ({ ...p, certifications: p.certifications.map(c => c.id === id ? { ...c, [f]: v } : c) }));
  const delCert = (id: string) => setFormData(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== id) }));

  const addLang = () => setFormData(p => ({ ...p, languages: [...p.languages, { id: genId(), language: "", level: "" }] }));
  const updLang = (id: string, f: keyof FormLanguage, v: string) => setFormData(p => ({ ...p, languages: p.languages.map(l => l.id === id ? { ...l, [f]: v } : l) }));
  const delLang = (id: string) => setFormData(p => ({ ...p, languages: p.languages.filter(l => l.id !== id) }));

  const handleRegen = async () => { if (regSection && regInstruction.trim()) { await onRegenerateSection(regSection, regInstruction); setRegInstruction(""); } };
  const handleSave = async () => { setIsSaving(true); try { await onSave(formData); } finally { setIsSaving(false); } };

  const exportPdf = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const el = exportRef.current.cloneNode(true) as HTMLElement;
      // Convertir imágenes externas a base64 para evitar errores CORS
      const imgs = el.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map((img) => {
          const src = img.getAttribute("src");
          if (!src || src.startsWith("data:")) return Promise.resolve();
          return fetch(src, { mode: "cors" })
            .then((res) => res.blob())
            .then((blob) => {
              return new Promise<void>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  img.setAttribute("src", reader.result as string);
                  resolve();
                };
                reader.readAsDataURL(blob);
              });
            })
            .catch(() => {
              img.style.display = "none";
            });
        })
      );
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.top = "0";
      el.style.width = "21cm";
      document.body.appendChild(el);
      await html2pdf()
        .set({
          margin: 0,
          filename: "CV_Profesional.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
      document.body.removeChild(el);
    } catch (err) { console.error("Error PDF:", err); } finally { setIsExporting(false); }
  };

  const exportWord = () => {
    const content = exportRef.current?.innerHTML || "";
    const html = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset="utf-8"><title>CV Profesional</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>@page{margin:2.54cm}body{font-family:'Times New Roman','Georgia','Cambria',serif;font-size:12pt;line-height:2.0;color:#000}h1{font-size:12pt;font-weight:bold;margin:0;text-transform:uppercase}h2{font-size:12pt;font-weight:bold;margin:0;text-transform:uppercase}p{margin:0;text-align:justify}ul{margin:0;padding-left:1.27cm}li{margin:0}strong{font-weight:bold}a{color:#000;text-decoration:underline}</style></head><body>${content}</body></html>`;
    const blob = new Blob(['\ufeff' + html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "CV_Profesional.doc"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
            <div><h3 className="text-sm font-bold text-gray-900">Constructor de CV</h3><p className="text-xs text-gray-400">Edita y personaliza tu currículum vitae</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5 mr-2">
              <button onClick={() => setActiveTab("edit")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "edit" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>Editar</button>
              <button onClick={() => setActiveTab("preview")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "preview" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}><Eye className="w-3 h-3 inline mr-1" />Vista previa</button>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">


          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" /><p className="text-sm text-gray-500">Generando tu CV con IA...</p><p className="text-xs text-gray-400 mt-1">Esto puede tomar unos segundos</p></div>
          ) : activeTab === "edit" ? (
            <div className="p-6 space-y-4 max-w-3xl mx-auto">
              {/* Datos Personales */}
              <SectionCard title="Datos Personales" icon={<FileText className="w-4 h-4 text-blue-600" />}>
                <div className="grid grid-cols-2 gap-x-4">
                  <FormField label="Nombre completo" value={formData.header.fullName} onChange={(v) => updHeader("fullName", v)} placeholder="Ej: Juan Pérez García" />
                  <FormField label="Rol / Título" value={formData.header.role} onChange={(v) => updHeader("role", v)} placeholder="Ej: Analista de datos" />

                  <FormField label="Email" value={formData.header.email} onChange={(v) => updHeader("email", v)} placeholder="ejemplo@correo.com" />
                  <FormField label="Teléfono" value={formData.header.phone} onChange={(v) => updHeader("phone", v)} placeholder="+51 999 999 999" />
                  <FormField label="Ubicación" value={formData.header.location} onChange={(v) => updHeader("location", v)} placeholder="Ej: Lima, Perú" />
                  <FormField label="LinkedIn" value={formData.header.linkedIn} onChange={(v) => updHeader("linkedIn", v)} placeholder="linkedin.com/in/tu-perfil" />
                  <FormField label="GitHub" value={formData.header.github} onChange={(v) => updHeader("github", v)} placeholder="github.com/tu-usuario" />
                  <FormField label="Portafolio" value={formData.header.portfolio} onChange={(v) => updHeader("portfolio", v)} placeholder="tu-portafolio.com" />
                </div>
                {/* Foto para CV */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Foto para CV (opcional)</label>
                  {formData.header.profilePhotoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={formData.header.profilePhotoUrl} alt="Foto CV" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">Foto cargada</p>
                      </div>
                      <button onClick={() => updHeader("profilePhotoUrl", "")} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-50/30 transition-all block">
                      <p className="text-xs text-gray-500">Haz clic para seleccionar foto</p>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) updHeader("profilePhotoUrl", ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" />
                    </label>
                  )}
                </div>
              </SectionCard>


              {/* Perfil Profesional */}
              <SectionCard title="Perfil Profesional" icon={<FileText className="w-4 h-4 text-green-600" />}>
                <FormField label="Resumen profesional" value={formData.professionalSummary} onChange={(v) => setFormData(p => ({ ...p, professionalSummary: v }))} placeholder="Describe tu perfil profesional en 3-5 líneas..." rows={4} />
              </SectionCard>

              {/* Experiencia Laboral */}
              <SectionCard title="Experiencia Laboral" icon={<FileText className="w-4 h-4 text-orange-600" />}>
                {formData.experiences.map(exp => (
                  <div key={exp.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2"><span className="text-xs font-semibold text-gray-700">Experiencia</span><button onClick={() => delExp(exp.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div className="grid grid-cols-2 gap-x-3">
                      <FormField label="Cargo" value={exp.position} onChange={(v) => updExp(exp.id, "position", v)} placeholder="Ej: Jefe de Ventas" />
                      <FormField label="Empresa / Institución" value={exp.company} onChange={(v) => updExp(exp.id, "company", v)} placeholder="Ej: Mercado Libre" />
                      <FormField label="Ubicación" value={exp.location} onChange={(v) => updExp(exp.id, "location", v)} placeholder="Ej: Lima, Perú" />
                      <div className="grid grid-cols-2 gap-2"><DateField label="Fecha inicio" value={exp.startDate} onChange={(v) => updExp(exp.id, "startDate", v)} placeholder="Ene 2020" /><DateField label="Fecha fin" value={exp.endDate} onChange={(v) => updExp(exp.id, "endDate", v)} placeholder="Actual" /></div>
                    </div>
                    <BulletEditor bullets={exp.bullets} onChange={(b) => updExp(exp.id, "bullets", b)} />
                  </div>
                ))}
                <button onClick={addExp} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"><Plus className="w-4 h-4" /> Agregar experiencia</button>
              </SectionCard>

              {/* Educación */}
              <SectionCard title="Educación" icon={<FileText className="w-4 h-4 text-cyan-600" />}>
                {formData.education.map(edu => (
                  <div key={edu.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2"><span className="text-xs font-semibold text-gray-700">Educación</span><button onClick={() => delEdu(edu.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div className="grid grid-cols-2 gap-x-3">
                      <FormField label="Institución" value={edu.institution} onChange={(v) => updEdu(edu.id, "institution", v)} placeholder="Ej: Universidad Nacional Mayor de San Marcos" />
                      <FormField label="Programa / Carrera" value={edu.program} onChange={(v) => updEdu(edu.id, "program", v)} placeholder="Ej: Administración de Empresas" />
                      <FormField label="Ubicación" value={edu.location} onChange={(v) => updEdu(edu.id, "location", v)} placeholder="Ej: Lima, Perú" />
                      <div className="grid grid-cols-2 gap-2"><DateField label="Fecha inicio" value={edu.startDate} onChange={(v) => updEdu(edu.id, "startDate", v)} placeholder="Mar 2016" /><DateField label="Fecha fin" value={edu.endDate} onChange={(v) => updEdu(edu.id, "endDate", v)} placeholder="Dic 2020" /></div>
                    </div>
                  </div>
                ))}
                <button onClick={addEdu} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"><Plus className="w-4 h-4" /> Agregar educación</button>
              </SectionCard>

              {/* Proyectos */}
              <SectionCard title="Proyectos" icon={<FileText className="w-4 h-4 text-pink-600" />}>
                {formData.projects.map(proj => (
                  <div key={proj.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2"><span className="text-xs font-semibold text-gray-700">Proyecto</span><button onClick={() => delProj(proj.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <FormField label="Nombre del proyecto" value={proj.name} onChange={(v) => updProj(proj.id, "name", v)} placeholder="Ej: Campaña de Marketing Digital" />
                    <FormField label="Descripción" value={proj.description} onChange={(v) => updProj(proj.id, "description", v)} placeholder="Breve descripción..." rows={2} />
                    <FormField label="Herramientas / Tecnologías" value={proj.technologies} onChange={(v) => updProj(proj.id, "technologies", v)} placeholder="Excel, Power BI, Salesforce" />
                    <FormField label="Enlace" value={proj.link} onChange={(v) => updProj(proj.id, "link", v)} placeholder="linkedin.com/in/proyecto" />
                  </div>
                ))}
                <button onClick={addProj} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"><Plus className="w-4 h-4" /> Agregar proyecto</button>
              </SectionCard>

              {/* Certificaciones */}
              <SectionCard title="Certificaciones" icon={<FileText className="w-4 h-4 text-amber-600" />}>
                {formData.certifications.map(cert => (
                  <div key={cert.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2"><span className="text-xs font-semibold text-gray-700">Certificación</span><button onClick={() => delCert(cert.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div className="grid grid-cols-3 gap-x-3">
                      <FormField label="Nombre" value={cert.name} onChange={(v) => updCert(cert.id, "name", v)} placeholder="Ej: Certificación en Gestión de Proyectos" />
                      <FormField label="Emisor" value={cert.issuer} onChange={(v) => updCert(cert.id, "issuer", v)} placeholder="Ej: PMI" />
                      <FormField label="Año" value={cert.year} onChange={(v) => updCert(cert.id, "year", v)} placeholder="2023" />
                    </div>
                  </div>
                ))}
                <button onClick={addCert} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"><Plus className="w-4 h-4" /> Agregar certificación</button>
              </SectionCard>

              {/* Habilidades */}
              <SectionCard title="Habilidades" icon={<FileText className="w-4 h-4 text-indigo-600" />}>
                <div className="grid grid-cols-2 gap-x-4">
                  <FormField label="Habilidades técnicas" value={formData.skills.programmingLanguages} onChange={(v) => updSkills("programmingLanguages", v)} placeholder="Excel, Power BI, SAP" />
                  <FormField label="Metodologías" value={formData.skills.frameworks} onChange={(v) => updSkills("frameworks", v)} placeholder="PMP, Scrum, Six Sigma" />
                  <FormField label="Herramientas" value={formData.skills.tools} onChange={(v) => updSkills("tools", v)} placeholder="Office 365, Salesforce, Tableau" />
                  <FormField label="Habilidades blandas" value={formData.skills.softSkills} onChange={(v) => updSkills("softSkills", v)} placeholder="Liderazgo, Trabajo en equipo, Comunicación" />
                </div>
              </SectionCard>

              {/* Idiomas */}
              <SectionCard title="Idiomas" icon={<FileText className="w-4 h-4 text-teal-600" />}>
                {formData.languages.map(lang => (
                  <div key={lang.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2"><span className="text-xs font-semibold text-gray-700">Idioma</span><button onClick={() => delLang(lang.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div className="grid grid-cols-2 gap-x-3">
                      <FormField label="Idioma" value={lang.language} onChange={(v) => updLang(lang.id, "language", v)} placeholder="Inglés" />
                      <FormField label="Nivel" value={lang.level} onChange={(v) => updLang(lang.id, "level", v)} placeholder="Avanzado / B2" />
                    </div>
                  </div>
                ))}
                <button onClick={addLang} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"><Plus className="w-4 h-4" /> Agregar idioma</button>
              </SectionCard>

              {/* Regenerar sección con IA */}
              <SectionCard title="Regenerar sección con IA" icon={<Sparkles className="w-4 h-4 text-purple-600" />} defaultOpen={false}>
                <div className="space-y-3">
                  <select value={regSection} onChange={(e) => setRegSection(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                    <option value="">Selecciona una sección</option>
                    <option value="professionalSummary">Perfil Profesional</option>
                    <option value="workExperience">Experiencia Laboral</option>
                    <option value="education">Educación</option>
                    <option value="skills">Habilidades</option>
                    <option value="projects">Proyectos</option>
                    <option value="certifications">Certificaciones</option>
                    <option value="languages">Idiomas</option>
                  </select>
                  <textarea value={regInstruction} onChange={(e) => setRegInstruction(e.target.value)} placeholder="Ej: Hazlo más orientado a resultados con métricas..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none" rows={3} />
                  <button onClick={handleRegen} disabled={!regSection || !regInstruction.trim() || isRegenerating} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Regenerar sección
                  </button>
                </div>
              </SectionCard>
            </div>
          ) : null}
          {/* Vista Previa - siempre renderizada pero oculta cuando no está activa */}
          <div className={`p-6 flex justify-center ${activeTab === "preview" ? "" : "hidden"}`}>
            <div ref={previewRef} className="w-[21cm] shadow-lg">
              <CvPreview data={formData} />
            </div>
          </div>

        </div>

        {/* Preview invisible para exportación (siempre visible para html2canvas) */}
        <div ref={exportRef} style={{ position: "absolute", left: "-9999px", top: "0", width: "21cm" }}>
          <CvPreview data={formData} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">Cerrar</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Guardando..." : "Guardar CV"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


