// features/profile/api/cvApi.ts
import api, { parseResponse } from "@/lib/axiosClient";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { CvInfo, CvGeneratedResponse, CvEditSectionRequest } from "../types/cv.types";

export const cvApi = {
  /**
   * Genera un CV con IA usando los datos del perfil del freelancer.
   * POST /freelance/cv/generate
   * El backend devuelve directamente el objeto CvResponse, sin wrapper ApiResponse.
   */
  generateCvWithAi: async (): Promise<CvGeneratedResponse> => {
    const response = await api.post<CvGeneratedResponse>("/freelance/cv/generate");
    return response.data;
  },

  /**
   * Edita una sección específica del CV con IA.
   * POST /freelance/cv/edit-section
   * El backend devuelve directamente el objeto CvResponse, sin wrapper ApiResponse.
   */
  editCvSection: async (request: CvEditSectionRequest): Promise<CvGeneratedResponse> => {
    const response = await api.post<CvGeneratedResponse>("/freelance/cv/edit-section", request);
    return response.data;
  },

  /**
   * Obtiene la información del CV del usuario autenticado.
   * GET /freelance/profiles/me → extrae curriculumUrl, cvData y status del perfil.
   */
  getCvInfo: async (): Promise<CvInfo> => {
    const response = await api.get<ApiResponse<any>>("/freelance/profiles/me");
    const profile = parseResponse(response);

    // Si hay cvData en el perfil, significa que se generó/guardó un CV con IA
    // Puede venir como objeto o como string JSON desde la BD
    let parsedCvData = profile.cvData;
    if (typeof parsedCvData === "string" && parsedCvData.trim()) {
      try {
        parsedCvData = JSON.parse(parsedCvData);
      } catch {
        parsedCvData = null;
      }
    }
    const hasCvData = parsedCvData && typeof parsedCvData === "object" && Object.keys(parsedCvData).length > 0;

    return {
      status: profile.curriculumUrl ? "uploaded" : (hasCvData ? "generated" : "none"),
      source: hasCvData ? "ai" : (profile.curriculumSource ?? "manual"),
      lastUpdated: profile.curriculumUpdatedAt ?? (hasCvData ? new Date().toISOString() : null),
      url: profile.curriculumUrl ?? null,
      fileName: profile.curriculumUrl
        ? profile.curriculumUrl.split("/").pop() ?? "curriculum.pdf"
        : (hasCvData ? "CV_Generado.pdf" : null),
      cvData: hasCvData ? parsedCvData : null,
    };

  },


  /**
   * Sube un archivo CV al servidor.
   * POST /freelance/storage/upload con folder=CURRICULUM
   * Luego actualiza el perfil con la URL pública.
   */
  uploadCv: async (file: File): Promise<CvInfo> => {
    // 1. Subir archivo
    const formData = new FormData();
    formData.append("folder", "CURRICULUM");
    formData.append("file", file);
    const uploadResponse = await api.post<ApiResponse<{ fileKey: string; publicFileUrl: string }>>(
      "/freelance/storage/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const { publicFileUrl } = parseResponse(uploadResponse);

    // 2. Obtener perfil actual para hacer merge
    const profileResponse = await api.get<ApiResponse<any>>("/freelance/profiles/me");
    const currentProfile = parseResponse(profileResponse);

    // 3. Actualizar perfil con la nueva URL del CV
    const updatePayload = {
      name: currentProfile.name ?? "",
      industry: currentProfile.industry ?? "",
      specialty: currentProfile.specialty ?? "",
      biography: currentProfile.biography ?? "",
      achievements: currentProfile.achievements ?? "",
      address: currentProfile.address ?? "",
      paymentMethodType: currentProfile.paymentMethodType ?? "BANK_TRANSFER",
      dni: currentProfile.dni ?? "",
      profilePhotoUrl: currentProfile.profilePhotoUrl ?? null,
      curriculumUrl: publicFileUrl,
      cvData: currentProfile.cvData ? JSON.stringify(currentProfile.cvData) : null,
      certifications: currentProfile.certifications ?? [],
    };


    await api.put<ApiResponse<any>>(`/freelance/profiles/${currentProfile.id}`, updatePayload);


    return {
      status: "uploaded",
      source: "manual",
      lastUpdated: new Date().toISOString(),
      url: publicFileUrl,
      fileName: file.name,
      cvData: null,
    };

  },

  /**
   * Elimina el CV del perfil.
   * PUT /freelance/profiles/{id} con curriculumUrl = null
   */
  removeCv: async (): Promise<void> => {
    const profileResponse = await api.get<ApiResponse<any>>("/freelance/profiles/me");
    const currentProfile = parseResponse(profileResponse);

    const updatePayload = {
      name: currentProfile.name ?? "",
      industry: currentProfile.industry ?? "",
      specialty: currentProfile.specialty ?? "",
      biography: currentProfile.biography ?? "",
      achievements: currentProfile.achievements ?? "",
      address: currentProfile.address ?? "",
      paymentMethodType: currentProfile.paymentMethodType ?? "BANK_TRANSFER",
      dni: currentProfile.dni ?? "",
      profilePhotoUrl: currentProfile.profilePhotoUrl ?? null,
      curriculumUrl: null,
      cvData: null,
      certifications: currentProfile.certifications ?? [],
    };

    await api.put<ApiResponse<any>>(`/freelance/profiles/${currentProfile.id}`, updatePayload);

  },

  /**
   * Guarda/actualiza el CV editado manualmente.
   * PUT /freelance/profiles/{id} con curriculumUrl y datos actualizados.
   * Devuelve el CvInfo actualizado para que el frontend sepa que ya hay CV.
   */
  saveCv: async (data: any): Promise<CvInfo> => {
    const profileResponse = await api.get<ApiResponse<any>>("/freelance/profiles/me");
    const currentProfile = parseResponse(profileResponse);

    const updatePayload = {
      name: currentProfile.name ?? "",
      industry: currentProfile.industry ?? "",
      specialty: currentProfile.specialty ?? "",
      biography: currentProfile.biography ?? "",
      achievements: currentProfile.achievements ?? "",
      address: currentProfile.address ?? "",
      paymentMethodType: currentProfile.paymentMethodType ?? "BANK_TRANSFER",
      dni: currentProfile.dni ?? "",
      profilePhotoUrl: currentProfile.profilePhotoUrl ?? null,
      curriculumUrl: currentProfile.curriculumUrl ?? null,
      certifications: currentProfile.certifications ?? [],
      cvData: data ? JSON.stringify(data) : null,
    };

    await api.put<ApiResponse<any>>(`/freelance/profiles/${currentProfile.id}`, updatePayload);


    // Devolver CvInfo actualizado para que el frontend sepa que ya hay CV
    return {
      status: "generated",
      source: "ai",
      lastUpdated: new Date().toISOString(),
      url: null,
      fileName: "CV_Generado.pdf",
      cvData: data,
    };

  },


};
