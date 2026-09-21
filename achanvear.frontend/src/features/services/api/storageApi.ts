// features/services/api/storageApi.ts
import api from "@/lib/axiosClient";

interface PresignedUrlResponse {
  fileKey: string;
  uploadUrl: string;
  publicFileUrl: string;
}

async function getPresignedUrl(
  type: "IMAGES" | "VIDEOS" | "PDFS" | "CERTIFICATES",
  fileName: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  const res = await api.post<PresignedUrlResponse>("/services/storage/presigned-url", {
    type,
    fileName,
    contentType,
  });

  return res.data;
}

async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al subir archivo a S3: ${response.statusText}`);
  }
}

/**
 * Valida que un video no dure más de 90 segundos (1:30)
 */
function validateVideoDuration(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      // Duración en segundos
      resolve(video.duration <= 90);
    };

    video.onerror = () => {
      // Si no se puede leer la metadata, permitimos la subida
      resolve(true);
    };

    video.src = URL.createObjectURL(file);
  });
}

export const storageApi = {
  /**
   * Sube un archivo a S3 usando presigned URL
   * @param type Tipo de archivo: IMAGES, VIDEOS, PDFS, CERTIFICATES
   * @param file Archivo a subir
   * @returns La URL pública del archivo en S3
   */
  async uploadFile(
    type: "IMAGES" | "VIDEOS" | "PDFS" | "CERTIFICATES",
    file: File
  ): Promise<string> {
    // Validar duración de video (máx 1:30)
    if (type === "VIDEOS") {
      const isValidDuration = await validateVideoDuration(file);
      if (!isValidDuration) {
        throw new Error(
          "El video no puede durar más de 1:30 minutos. Por favor, selecciona un video más corto."
        );
      }
    }

    const { uploadUrl, publicFileUrl } = await getPresignedUrl(
      type,
      file.name,
      file.type
    );

    await uploadToS3(uploadUrl, file);

    return publicFileUrl;
  },

  /**
   * Sube múltiples archivos a S3
   */
  async uploadFiles(
    type: "IMAGES" | "VIDEOS" | "PDFS" | "CERTIFICATES",
    files: File[]
  ): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadFile(type, file);
      urls.push(url);
    }
    return urls;
  },
};
