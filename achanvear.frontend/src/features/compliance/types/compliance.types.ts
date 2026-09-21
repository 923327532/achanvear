// features/compliance/types/compliance.types.ts
export interface LegalDocumentVersion {
  id: string;
  documentType: string;
  version: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
}
