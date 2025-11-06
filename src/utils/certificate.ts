import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { CertificateData } from "../components/CertificateTemplate";

/**
 * Genera un ID único para el certificado
 */
export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Formatea la fecha del certificado con formato: "Ciudad, DD/MM/YYYY"
 */
export function formatCertificateDate(date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `San Miguel de Tucumán, ${day}/${month}/${year}`;
}

/** Render nítido del nodo A4 (3508x2480) a PNG */
export async function generateCertificatePreview(node: HTMLElement) {
  const canvas = await html2canvas(node, {
    backgroundColor: "#ffffff",
    scale: 2,          // alta nitidez
    useCORS: true,     // por si usás imágenes externas (logos/firmas)
    logging: false,
    removeContainer: true,
    allowTaint: false,
    windowWidth: 3508, // asegura layout 1:1 con el template
    windowHeight: 2480,
  });
  return canvas.toDataURL("image/png");
}

/** Exporta PDF A4 apaisado manteniendo proporción exacta del template */
export async function generateCertificatePDF(
  node: HTMLElement,
  data: CertificateData
) {
  const pngUrl = await generateCertificatePreview(node);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  // A4 landscape en puntos (~842 x 595)
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Mantener el aspect ratio del lienzo (3508x2480)
  const targetW = pageW;
  const targetH = (2480 / 3508) * targetW; // ≈ 595pt

  // Centrado vertical por si hay bordes de la impresora
  const y = (pageH - targetH) / 2;

  pdf.addImage(pngUrl, "PNG", 0, y, targetW, targetH, "", "FAST");

  const filenameSafe = `${(data.studentName || "Certificado")
    .replace(/[^\p{L}\p{N}\s\-_]/gu, "")
    .trim()} - ${data.courseName}.pdf`;

  pdf.save(filenameSafe);
}