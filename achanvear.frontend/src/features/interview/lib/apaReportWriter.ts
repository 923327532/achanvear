import type { jsPDF } from "jspdf";

export function createApaReportWriter(pdf: jsPDF) {
  const margin = 25.4;
  const width = 165.1;
  const bottom = 252;
  let y = margin;
  let figure = 0;
  let centered = false;
  const next = () => {
    pdf.addPage();
    y = margin;
  };
  const space = (height: number) => {
    if (y + height > bottom) next();
  };
  const paragraph = (value: string, bold = false, size = 12) => {
    pdf.setFont("times", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(25, 35, 48);
    const lines: string[] = pdf.splitTextToSize(value || "No registrado.", width);
    for (const line of lines) {
      space(8.47);
      pdf.text(line, centered ? 107.95 : margin, y, { align: centered ? "center" : "left" });
      y += 8.47;
    }
    y += 3;
  };
  const heading = (value: string) => {
    space(25);
    y += 3;
    paragraph(value, true);
  };
  const bullets = (values: string[]) => values.length ? values.forEach((v, i) => paragraph(`${i + 1}. ${v}`)) : paragraph("No se registraron hallazgos en este apartado.");
  const chart = (title: string, items: Array<{ label: string; value: number | null }>) => {
    if(items.length > 10) {
      for(let i = 0; i < items.length; i += 10) chart(`${title} (${i + 1}–${Math.min(i + 10, items.length)})`, items.slice(i, i + 10));
      return;
    }
    // Keep the number, italic title, plot and explanatory note on the same page.
    space(65 + items.length * 15);
    paragraph(`Figura ${++figure}`, true);
    pdf.setFont("times", "italic");
    pdf.text(title, margin, y);
    y += 10;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    for(const item of items) {
      pdf.setTextColor(40, 53, 65);
      pdf.text(item.label, margin, y);
      pdf.setFillColor(232, 238, 242);
      pdf.roundedRect(margin + 59, y - 4, 80, 5, 1, 1, "F");
      if(item.value !== null) {
        pdf.setFillColor(15, 118, 110);
        pdf.roundedRect(margin + 59, y - 4, Math.max(.1, item.value * .8), 5, 1, 1, "F");
      }
      pdf.text(item.value === null ? "Sin dato" : `${item.value}/100`, margin + 143, y);
      y += 15;
    }
    paragraph("Nota. Escala de 0 a 100. Las barras muestran puntajes registrados; un dato ausente no equivale a cero.", false, 10);
  };

  const startCover = () => {
    y = 62;
    centered = true;
  };
  const finishCover = () => {
    centered = false;
    next();
  };
  const finish = () => {
    const pages = pdf.getNumberOfPages();
    for(let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFont("times", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(45, 55, 65);
      pdf.text(String(i), 190.5, 14, { align: "right" });
      pdf.setFontSize(9);
      pdf.text("Achanvear · Informe confidencial de selección", margin, 267);
    }
  };
  return { paragraph, heading, bullets, chart, newPage: next, startCover, finishCover, finish };
}
