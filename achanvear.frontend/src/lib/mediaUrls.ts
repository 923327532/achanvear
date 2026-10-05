import { API_BASE_URL } from "@/lib/constants";

const API_ROOT = API_BASE_URL.replace(/\/$/, "");

export function toProfileImageUrl(url?: string | null): string | null {
  return toBackendProxyUrl(url, "/profiles/photo-proxy");
}

export function toServiceMediaUrl(url?: string | null): string | null {
  return toBackendProxyUrl(url, "/services/storage/file-proxy");
}

function toBackendProxyUrl(url: string | null | undefined, proxyPath: string): string | null {
  const value = url?.trim();
  if (!value) return null;

  if (value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.includes("/profiles/photo-proxy") || value.includes("/services/storage/file-proxy")) {
    return value;
  }

  const fileKey = extractS3FileKey(value);
  if (!fileKey) {
    return value;
  }

  return `${API_ROOT}${proxyPath}?fileKey=${encodeURIComponent(fileKey)}`;
}

function extractS3FileKey(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes(".s3.") || parsed.pathname.length <= 1) {
      return null;
    }
    return decodeURIComponent(parsed.pathname.slice(1));
  } catch {
    return null;
  }
}
