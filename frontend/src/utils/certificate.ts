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
 * Formatea la fecha del certificado con formato: "DD de [mes] de YYYY"
 */
export function formatCertificateDate(date: Date = new Date()): string {
  const locale = 'es-ES';
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: '2-digit' 
  };
  
  const formatted = date.toLocaleDateString(locale, options);
  // Formato: "19 de marzo de 2026"
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Render nítido del nodo A4 (3508x2480) a PNG con máxima calidad */
export async function generateCertificatePreview(node: HTMLElement) {
  try {
    // Esperar un poco para que los estilos y fondos se apliquen
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2,          // alta nitidez
      useCORS: true,     // permitir imágenes externas
      logging: false,
      removeContainer: false,  // no remover para poder reutilizarlo
      allowTaint: true,   // permitir tainting para assets locales
      windowWidth: 3508, // asegura layout 1:1 con el template
      windowHeight: 2480,
      proxy: undefined,  // evitar problemas de CORS
      imageTimeout: 5000, // esperar hasta 5s por imágenes
    });
    
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error en generateCertificatePreview:", error);
    throw new Error("No se pudo generar la vista previa del certificado");
  }
}

/** Exporta PDF A4 apaisado manteniendo proporción exacta del template */
export async function generateCertificatePDF(
  node: HTMLElement,
  data: CertificateData
) {
  try {
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

    // Sanitizar nombres para el archivo
    const safeStudentName = (data.studentName || "Certificado")
      .replace(/[^\p{L}\p{N}\s\-_ñáéíóúàèìòùäëïöü]/gu, "")
      .trim()
      .substring(0, 50);
      
    const safeCourseName = (data.courseName || "Curso")
      .replace(/[^\p{L}\p{N}\s\-_ñáéíóúàèìòùäëïöü]/gu, "")
      .trim()
      .substring(0, 50);

    const filenameSafe = `${safeStudentName} - ${safeCourseName}.pdf`;

    pdf.save(filenameSafe);
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    throw new Error("No se pudo generar el PDF del certificado");
  }
}