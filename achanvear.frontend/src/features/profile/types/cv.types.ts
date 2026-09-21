// features/profile/types/cv.types.ts

export type CvStatus = "none" | "uploaded" | "generated" | "error";

export type CvSource = "manual" | "ai" | "unknown";

export interface CvInfo {
  /** Estado actual del CV */
  status: CvStatus;
  /** Origen del CV: subido manualmente o generado con IA */
  source: CvSource;
  /** Fecha ISO de la última actualización */
  lastUpdated: string | null;
  /** URL pública del archivo CV */
  url: string | null;
  /** Nombre del archivo */
  fileName: string | null;
  /** Datos del CV generado/guardado (persistido en backend) */
  cvData: any | null;
}


export interface UploadCvResult {
  success: boolean;
  cvInfo: CvInfo | null;
  error?: string;
}

// ─── CV Generado con IA ─────────────────────────────────────────────────────

export interface CvHeaderSection {
  fullName: string | null;
  role: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  linkedIn: string | null;
  github: string | null;
  portfolio: string | null;
}

export interface CvExperienceSection {
  position: string | null;
  company: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  bullets: string[];
}

export interface CvEducationSection {
  institution: string | null;
  program: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CvSkillsSection {
  programmingLanguages: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
}

export interface CvProjectSection {
  name: string | null;
  description: string | null;
  technologies: string[];
  link: string | null;
}

export interface CvCertificationSection {
  name: string | null;
  issuer: string | null;
  year: string | null;
}

export interface CvLanguageSection {
  language: string | null;
  level: string | null;
}

export interface CvGeneratedResponse {
  /** CV completo en formato Markdown */
  markdown: string;
  /** Encabezado */
  header: CvHeaderSection;
  /** Resumen profesional */
  professionalSummary: string | null;
  /** Experiencia laboral */
  workExperience: CvExperienceSection[];
  /** Educación */
  education: CvEducationSection[];
  /** Habilidades */
  skills: CvSkillsSection;
  /** Proyectos */
  projects: CvProjectSection[];
  /** Certificaciones */
  certifications: CvCertificationSection[];
  /** Idiomas */
  languages: CvLanguageSection[];
  /** Datos faltantes */
  missingData: string[];
  /** Indica si el CV está completo */
  complete: boolean;
}

export interface CvEditSectionRequest {
  sectionName: string;
  instruction: string;
}


