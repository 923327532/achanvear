// features/profile/components/CvExportHelper.tsx
"use client";

import type { FormData } from "./CvBuilder";
import html2pdf from "html2pdf.js";

/**
 * Genera un blob PDF a partir de los datos del CV.
 * Crea un elemento temporal, lo renderiza, y usa html2pdf para generar el PDF.
 */
export async function generatePdfBlob(data: FormData): Promise<Blob> {
  // Crear un contenedor temporal
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-9999";
  container.style.width = "21cm";
  container.style.background = "white";
  document.body.appendChild(container);

  // Renderizar el preview dentro del contenedor
  const root = document.createElement("div");
  container.appendChild(root);

  renderCvPreviewHtml(root, data);

  // Esperar a que se renderice
  await new Promise((r) => setTimeout(r, 200));

  // Convertir imagenes a base64
  const imgs = root.querySelectorAll("img");
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
        img.style.display = "none";
      }
    })
  );

  // Generar PDF
  const pdfBlob = await html2pdf()
    .set({
      margin: 0,
      filename: "CV_Profesional.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(root)
    .outputPdf("blob");

  // Limpiar
  document.body.removeChild(container);

  return pdfBlob;
}

/**
 * Genera un blob Word (HTML) a partir de los datos del CV.
 */
export function generateWordBlob(data: FormData): Blob {
  const content = generateCvHtml(data);
  const html =
    '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>CV Profesional</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>@page{margin:2.54cm}body{font-family:"Times New Roman","Georgia","Cambria",serif;font-size:12pt;line-height:2.0;color:#000}h1{font-size:12pt;font-weight:bold;margin:0;text-transform:uppercase}h2{font-size:12pt;font-weight:bold;margin:0;text-transform:uppercase}p{margin:0;text-align:justify}ul{margin:0;padding-left:1.27cm}li{margin:0}strong{font-weight:bold}a{color:#000;text-decoration:underline}</style></head><body>' +
    content +
    "</body></html>";
  return new Blob(["\ufeff" + html], { type: "application/msword" });
}

/**
 * Renderiza el HTML del CV en un elemento DOM (sin React).
 */
function renderCvPreviewHtml(container: HTMLElement, data: FormData) {
  const { header, professionalSummary, skills, experiences, education, projects, certifications, languages } = data;

  const style = document.createElement("style");
  style.textContent = [
    ".cv-preview {",
    "  font-family: 'Times New Roman', 'Georgia', 'Cambria', serif;",
    "  font-size: 12pt;",
    "  line-height: 2.0;",
    "  color: #000;",
    "  padding: 2.54cm;",
    "  background: white;",
    "}",
    ".cv-preview h1 { font-size: 12pt; font-weight: bold; margin: 0; text-transform: uppercase; }",
    ".cv-preview h2 { font-size: 12pt; font-weight: bold; margin: 12pt 0 0 0; text-transform: uppercase; }",
    ".cv-preview p { margin: 0; text-align: justify; }",
    ".cv-preview ul { margin: 0; padding-left: 1.27cm; }",
    ".cv-preview li { margin: 0; text-align: justify; }",
    ".cv-preview strong { font-weight: bold; }",
    ".cv-preview a { color: #000; text-decoration: underline; }",
    ".cv-preview .header-container { display: flex; align-items: flex-start; margin-bottom: 0; }",
    ".cv-preview .header-text { flex: 1; text-align: center; }",
    ".cv-preview .header-photo { flex-shrink: 0; margin-left: 1cm; width: 2.5cm; height: 2.5cm; }",
    ".cv-preview .header-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 1px solid #ccc; }",
    ".cv-preview .italic { font-style: italic; }",
    ".cv-preview .indent { text-indent: 1.27cm; }",
  ].join("\n");
  container.appendChild(style);

  const div = document.createElement("div");
  div.className = "cv-preview";
  container.appendChild(div);

  // Header
  const headerDiv = document.createElement("div");
  headerDiv.className = "header-container";
  const headerText = document.createElement("div");
  headerText.className = "header-text";
  if (header.fullName) {
    const h1 = document.createElement("h1");
    h1.textContent = header.fullName;
    headerText.appendChild(h1);
  }
  if (header.role) {
    const p = document.createElement("p");
    p.className = "italic";
    p.textContent = header.role;
    headerText.appendChild(p);
  }
  const contactP = document.createElement("p");
  contactP.textContent = [header.email, header.phone, header.location].filter(Boolean).join(" | ");
  headerText.appendChild(contactP);
  const linksP = document.createElement("p");
  linksP.textContent = [header.linkedIn, header.github, header.portfolio].filter(Boolean).join(" | ");
  headerText.appendChild(linksP);
  headerDiv.appendChild(headerText);

  if (header.profilePhotoUrl) {
    const photoDiv = document.createElement("div");
    photoDiv.className = "header-photo";
    const img = document.createElement("img");
    img.src = header.profilePhotoUrl;
    img.alt = "Foto";
    photoDiv.appendChild(img);
    headerDiv.appendChild(photoDiv);
  }
  div.appendChild(headerDiv);

  // Professional Summary
  if (professionalSummary) {
    const h2 = document.createElement("h2");
    h2.textContent = "Perfil Profesional";
    div.appendChild(h2);
    const p = document.createElement("p");
    p.className = "indent";
    p.textContent = professionalSummary;
    div.appendChild(p);
  }

  // Work Experience
  if (experiences.length > 0) {
    const h2 = document.createElement("h2");
    h2.textContent = "Experiencia Laboral";
    div.appendChild(h2);
    experiences.forEach((e) => {
      const p1 = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = [e.position, e.company, e.location].filter(Boolean).join(", ");
      p1.appendChild(strong);
      div.appendChild(p1);
      if (e.startDate) {
        const p2 = document.createElement("p");
        p2.className = "italic";
        p2.textContent = e.startDate + " - " + (e.endDate || "Actual");
        div.appendChild(p2);
      }
      if (e.bullets.length > 0) {
        const ul = document.createElement("ul");
        e.bullets.forEach((b) => {
          const li = document.createElement("li");
          li.textContent = b;
          ul.appendChild(li);
        });
        div.appendChild(ul);
      }
    });
  }

  // Education
  if (education.length > 0) {
    const h2 = document.createElement("h2");
    h2.textContent = "Educaci\u00f3n";
    div.appendChild(h2);
    education.forEach((e) => {
      const p1 = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = [e.institution, e.location].filter(Boolean).join(", ");
      p1.appendChild(strong);
      div.appendChild(p1);
      if (e.program) {
        const p2 = document.createElement("p");
        p2.className = "italic";
        p2.textContent = e.program + (e.startDate ? " \u2014 " + e.startDate + " - " + (e.endDate || "En curso") : "");
        div.appendChild(p2);
      }
    });
  }

  // Skills
  const hasSkills = [skills.programmingLanguages, skills.frameworks, skills.tools, skills.softSkills].some((s) => s.trim());
  if (hasSkills) {
    const h2 = document.createElement("h2");
    h2.textContent = "Habilidades";
    div.appendChild(h2);
    if (skills.programmingLanguages) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Habilidades t\u00e9cnicas: ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(skills.programmingLanguages));
      div.appendChild(p);
    }
    if (skills.frameworks) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Metodolog\u00edas: ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(skills.frameworks));
      div.appendChild(p);
    }
    if (skills.tools) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Herramientas: ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(skills.tools));
      div.appendChild(p);
    }
    if (skills.softSkills) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Habilidades blandas: ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(skills.softSkills));
      div.appendChild(p);
    }
  }

  // Projects
  if (projects.length > 0) {
    const h2 = document.createElement("h2");
    h2.textContent = "Proyectos";
    div.appendChild(h2);
    projects.forEach((p) => {
      const p1 = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = p.name;
      p1.appendChild(strong);
      div.appendChild(p1);
      if (p.description) {
        const p2 = document.createElement("p");
        p2.textContent = p.description;
        div.appendChild(p2);
      }
      if (p.technologies) {
        const p3 = document.createElement("p");
        const strong2 = document.createElement("strong");
        strong2.textContent = "Herramientas: ";
        p3.appendChild(strong2);
        p3.appendChild(document.createTextNode(p.technologies));
        div.appendChild(p3);
      }
      if (p.link) {
        const p4 = document.createElement("p");
        const a = document.createElement("a");
        a.href = p.link;
        a.textContent = p.link;
        p4.appendChild(a);
        div.appendChild(p4);
      }
    });
  }

  // Certifications
  if (certifications.length > 0) {
    const h2 = document.createElement("h2");
    h2.textContent = "Certificaciones";
    div.appendChild(h2);
    certifications.forEach((c) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = c.name;
      p.appendChild(strong);
      const parts = [];
      if (c.issuer) parts.push(c.issuer);
      if (c.year) parts.push("(" + c.year + ")");
      if (parts.length > 0) p.appendChild(document.createTextNode(", " + parts.join(", ")));
      div.appendChild(p);
    });
  }

  // Languages
  if (languages.length > 0) {
    const h2 = document.createElement("h2");
    h2.textContent = "Idiomas";
    div.appendChild(h2);
    languages.forEach((l) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = l.language;
      p.appendChild(strong);
      if (l.level) p.appendChild(document.createTextNode(" \u2014 " + l.level));
      div.appendChild(p);
    });
  }
}

/**
 * Genera el HTML del CV como string (para Word).
 */
function generateCvHtml(data: FormData): string {
  const { header, professionalSummary, skills, experiences, education, projects, certifications, languages } = data;

  let html = "";

  // Header
  html += '<div style="display:flex;align-items:flex-start;margin-bottom:0pt">';
  html += '<div style="flex:1;text-align:center">';
  if (header.fullName) html += "<h1>" + esc(header.fullName) + "</h1>";
  if (header.role) html += '<p style="font-style:italic">' + esc(header.role) + "</p>";
  html += "<p>" + [header.email, header.phone, header.location].filter(Boolean).join(" | ") + "</p>";
  html += "<p>" + [header.linkedIn, header.github, header.portfolio].filter(Boolean).join(" | ") + "</p>";
  html += "</div>";
  if (header.profilePhotoUrl) {
    html += '<div style="flex-shrink:0;margin-left:1cm;width:2.5cm;height:2.5cm">';
    html += '<img src="' + esc(header.profilePhotoUrl) + '" alt="Foto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:1px solid #ccc" />';
    html += "</div>";
  }
  html += "</div>";

  // Professional Summary
  if (professionalSummary) {
    html += "<h2>Perfil Profesional</h2>";
    html += '<p style="text-indent:1.27cm">' + esc(professionalSummary) + "</p>";
  }

  // Work Experience
  if (experiences.length > 0) {
    html += "<h2>Experiencia Laboral</h2>";
    experiences.forEach((e) => {
      html += "<p><strong>" + esc([e.position, e.company, e.location].filter(Boolean).join(", ")) + "</strong></p>";
      if (e.startDate) html += '<p style="font-style:italic">' + esc(e.startDate) + " - " + esc(e.endDate || "Actual") + "</p>";
      if (e.bullets.length > 0) {
        html += "<ul>";
        e.bullets.forEach((b) => {
          html += "<li>" + esc(b) + "</li>";
        });
        html += "</ul>";
      }
    });
  }

  // Education
  if (education.length > 0) {
    html += "<h2>Educaci\u00f3n</h2>";
    education.forEach((e) => {
      html += "<p><strong>" + esc([e.institution, e.location].filter(Boolean).join(", ")) + "</strong></p>";
      if (e.program) {
        html += '<p style="font-style:italic">' + esc(e.program) + (e.startDate ? " \u2014 " + esc(e.startDate) + " - " + esc(e.endDate || "En curso") : "") + "</p>";
      }
    });
  }

  // Skills
  const hasSkills = [skills.programmingLanguages, skills.frameworks, skills.tools, skills.softSkills].some((s) => s.trim());
  if (hasSkills) {
    html += "<h2>Habilidades</h2>";
    if (skills.programmingLanguages) html += "<p><strong>Habilidades t\u00e9cnicas:</strong> " + esc(skills.programmingLanguages) + "</p>";
    if (skills.frameworks) html += "<p><strong>Metodolog\u00edas:</strong> " + esc(skills.frameworks) + "</p>";
    if (skills.tools) html += "<p><strong>Herramientas:</strong> " + esc(skills.tools) + "</p>";
    if (skills.softSkills) html += "<p><strong>Habilidades blandas:</strong> " + esc(skills.softSkills) + "</p>";
  }

  // Projects
  if (projects.length > 0) {
    html += "<h2>Proyectos</h2>";
    projects.forEach((p) => {
      html += "<p><strong>" + esc(p.name) + "</strong></p>";
      if (p.description) html += "<p>" + esc(p.description) + "</p>";
      if (p.technologies) html += "<p><strong>Herramientas:</strong> " + esc(p.technologies) + "</p>";
      if (p.link) html += '<p><a href="' + esc(p.link) + '">' + esc(p.link) + "</a></p>";
    });
  }

  // Certifications
  if (certifications.length > 0) {
    html += "<h2>Certificaciones</h2>";
    certifications.forEach((c) => {
      const parts = [];
      if (c.issuer) parts.push(c.issuer);
      if (c.year) parts.push("(" + c.year + ")");
      html += "<p><strong>" + esc(c.name) + "</strong>" + (parts.length > 0 ? ", " + parts.join(", ") : "") + "</p>";
    });
  }

  // Languages
  if (languages.length > 0) {
    html += "<h2>Idiomas</h2>";
    languages.forEach((l) => {
      html += "<p><strong>" + esc(l.language) + "</strong>" + (l.level ? " \u2014 " + esc(l.level) : "") + "</p>";
    });
  }

  return html;
}

function esc(str: string): string {
  const amp = String.fromCharCode(38);
  const lt = String.fromCharCode(60);
  const gt = String.fromCharCode(62);
  const quot = String.fromCharCode(34);
  const hash = String.fromCharCode(35);
  const semi = String.fromCharCode(59);
  return str
    .replace(new RegExp(amp, "g"), amp + "amp" + semi)
    .replace(new RegExp(lt, "g"), amp + "lt" + semi)
    .replace(new RegExp(gt, "g"), amp + "gt" + semi)
    .replace(new RegExp(quot, "g"), amp + "quot" + semi)
    .replace(/'/g, amp + hash + "039" + semi);
}


