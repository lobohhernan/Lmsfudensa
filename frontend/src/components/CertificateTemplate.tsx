// components/CertificateTemplate.tsx
import { forwardRef } from "react";

// Obtener la URL de la imagen del template
const TEMPLATE_IMAGE = new URL("../assets/Certificado Template.png", import.meta.url).href;

export interface CertificateData {
  studentName: string;
  dni: string;
  courseName: string;
  courseHours: string;   // no se muestra (se ignora)
  issueDate: string;     // ej: "15 de Octubre de 2025"
  certificateId: string; // no se muestra (se ignora)
}

interface CertificateTemplateProps {
  data: CertificateData;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ data }, ref) => {
    const navy = "#0f2d52";

    return (
      <div
        ref={ref}
        style={{
          width: 3508,  // A4 landscape ~300ppi
          height: 2480,
          position: "relative",
          background: "#fff",
          color: navy,
          fontFamily: `'Times New Roman', ui-serif, Georgia, 'Liberation Serif', serif`,
          backgroundImage: `url("${TEMPLATE_IMAGE}")`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
        }}
      >
        {/* ===== Nombre del Estudiante ===== */}
        {/* Posicionado donde va el nombre en el template */}
        <div
          style={{
            position: "absolute",
            top: 790,
            left: 220,
            right: 220,
            textAlign: "center",
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1.1,
            wordBreak: "break-word",
            color: navy,
            maxHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {data.studentName}
        </div>

        {/* ===== Nombre del Curso ===== */}
        {/* Posicionado donde va el nombre del curso en el template */}
        <div
          style={{
            position: "absolute",
            top: 1170,
            left: 220,
            right: 220,
            textAlign: "center",
            fontSize: 115,
            fontWeight: 900,
            lineHeight: 1.15,
            color: navy,
            maxHeight: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "uppercase",
            letterSpacing: 1,
            whiteSpace: "normal",
            overflowWrap: "break-word",
          }}
        >
          {data.courseName}
        </div>

        {/* ===== Fecha de Emisión ===== */}
        {/* Posicionado donde va la fecha en el template */}
        <div
          style={{
            position: "absolute",
            top: 1448,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 50,
            fontWeight: 600,
            color: navy,
            letterSpacing: 1,
          }}
        >
          {data.issueDate}
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";

