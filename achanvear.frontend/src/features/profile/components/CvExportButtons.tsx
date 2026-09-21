// features/profile/components/CvExportButtons.tsx
"use client";

import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { CvPreview } from "./CvBuilder";
import type { FormData } from "./CvBuilder";
import html2pdf from "html2pdf.js";

interface Props {
  formData: FormData;
  cvUrl?: string | null;
}

export function CvExportButtons({ formData, cvUrl }: Props) {

  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  /** Convierte imágenes externas a base64 para evitar problemas CORS con html2canvas */
  const convertImagesToBase64 = async (container: HTMLElement) => {
    const imgs = container.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map(async (img) => {
        const src = img.getAttribute("src");
        if (!src || src.startsWith("data:")) return;
        try {
          const res = await fetch(src, { mode: "cors" });
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          img.setAttribute("src", dataUrl);
        } catch {
          // Si no se puede cargar, ocultar la imagen
          img.style.display = "none";
        }
      })
    );
  };

  const exportPdf = async () => {
    // Si hay URL guardada en S3, descargar directamente
    if (cvUrl) {
      window.open(cvUrl, "_blank");
      return;
    }
    // Fallback: generar en tiempo real
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const el = exportRef.current;
      // Convertir imágenes a base64 antes de generar PDF
      await convertImagesToBase64(el);
      const origPosition = el.style.position;
      const origLeft = el.style.left;
      const origTop = el.style.top;
      el.style.position = "fixed";
      el.style.left = "0";
      el.style.top = "0";
      el.style.zIndex = "9999";
      await new Promise((r) => setTimeout(r, 100));
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
      el.style.position = origPosition;
      el.style.left = origLeft;
      el.style.top = origTop;
      el.style.zIndex = "";
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
    <>
      {/* Preview invisible para exportación */}
      <div ref={exportRef} style={{ position: "absolute", left: "-9999px", top: "0", width: "21cm" }}>
        <CvPreview data={formData} />
      </div>

      {/* Botones de exportación */}
      <div className="flex items-center gap-2">
        <button
          onClick={exportPdf}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {isExporting ? "Generando..." : "PDF"}
        </button>
        <button
          onClick={exportWord}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-xs font-semibold hover:bg-[#1B3A6B]/90 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Word
        </button>
      </div>
    </>
  );
}
