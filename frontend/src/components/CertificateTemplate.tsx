// components/CertificateTemplate.tsx
import { forwardRef } from "react";
import firmaMariaImg from "figma:asset/93fb65c60964c4fd2af7191af141992cd0edfa1c.png";
import firmaEstebanImg from "figma:asset/8ff5fda1303461ce550e6b0900e7dc6bcd7fce1a.png";
import caduceoImg from "figma:asset/83ce44e6f1ef2c1e350a4b446694c175d0b24de9.png";

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
    const inner = "#7fb8d1";
    const accent = "#55a5c7";

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
        }}
      >
        {/* ===== Marcos dobles ===== */}
        <div style={{ position: "absolute", inset: 54, border: `22px solid ${navy}`, borderRadius: 6 }} />
        <div style={{ position: "absolute", inset: 118, border: `10px solid ${inner}`, borderRadius: 4 }} />

        {/* ===== Encabezado (FUDENSA) – corregido ===== */}
        <div
          style={{
            position: "absolute",
            top: 270,          // antes 250
            left: 0,
            right: 0,
            textAlign: "center",
            letterSpacing: 5.5,
            fontWeight: 700,
            fontSize: 144,     // un toque más chico para evitar cruce
            lineHeight: 1,     // evita solaparse con el subtítulo
          }}
        >
          FUDENSA
        </div>
        <div
          style={{
            position: "absolute",
            top: 410,          // antes 372 (lo bajamos para que no se superponga)
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 40,
            lineHeight: 1.2,   // separación correcta en las dos líneas
            whiteSpace: "pre-line",
          }}
        >
          Fundación para el desarrollo de{'\n'}la enfermería y la salud
        </div>

        {/* ===== Se certifica ===== */}
        <div
          style={{
            position: "absolute",
            top: 640,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 66,
            fontWeight: 600,
          }}
        >
          Se certifica que
        </div>

        {/* ===== Nombre ===== */}
        <div
          style={{
            position: "absolute",
            top: 740,
            left: 220,
            right: 220,
            textAlign: "center",
            fontSize: 108,
            fontWeight: 800,
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {data.studentName}
        </div>

        {/* ===== Línea y DNI ===== */}
        <div style={{ position: "absolute", top: 920, left: 360, right: 360, height: 6, backgroundColor: inner }} />
        <div
          style={{
            position: "absolute",
            top: 952,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          DNI{" "}
          <span style={{ fontWeight: 500 }}>{data.dni}</span>
        </div>

        {/* ===== Texto intermedio ===== */}
        <div
          style={{
            position: "absolute",
            top: 1080,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 58,
            fontWeight: 500,
          }}
        >
          Ha concluido satisfactoriamente el cursado de
        </div>

        {/* ===== Curso ===== */}
        <div
          style={{
            position: "absolute",
            top: 1185,
            left: 220,
            right: 220,
            textAlign: "center",
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1.15,
          }}
        >
          {data.courseName}
        </div>

        {/* ===== Fecha ===== */}
        <div style={{ position: "absolute", top: 1368, left: 0, right: 0, textAlign: "center", fontSize: 54 }}>
          Finalizado el día
        </div>
        <div style={{ position: "absolute", top: 1448, left: 0, right: 0, textAlign: "center", fontSize: 36 }}>
          {data.issueDate}
        </div>

        {/* ===== Caduceo (imagen exacta) ===== */}
        <img
          src={caduceoImg}
          alt="Caduceo"
          style={{
            position: "absolute",
            top: 1508,
            left: "50%",
            transform: "translateX(-50%)",
            width: 360,
            height: 360,
            objectFit: "contain",
            opacity: 0.95,
            filter: "saturate(1.05)",
          }}
        />

        {/* ===== P.J. ===== */}
        <div style={{ position: "absolute", top: 1868, left: 0, right: 0, textAlign: "center", fontSize: 30 }}>
          P. J. N° 420/09
        </div>

        {/* ===== Firmas ===== */}
        {/* Izquierda */}
        <div style={{ position: "absolute", left: 320, bottom: 430, width: 700, height: 4, backgroundColor: inner }} />
        <img
          src={firmaMariaImg}
          alt="Firma Lic. Maria Elisa Villoldo"
          style={{
            position: "absolute",
            left: 360,
            bottom: 480,   // +10 para que respire
            width: 560,
            height: 170,
            objectFit: "contain",
            opacity: 0.95,
          }}
        />
        <div style={{ position: "absolute", left: 320, bottom: 340, width: 700, textAlign: "center", fontSize: 40, fontWeight: 800 }}>
          Lic. Maria Elisa Villoldo
        </div>
        <div style={{ position: "absolute", left: 320, bottom: 300, width: 700, textAlign: "center", fontSize: 30 }}>
          Directora
        </div>

        {/* Derecha */}
        <div style={{ position: "absolute", right: 320, bottom: 430, width: 700, height: 4, backgroundColor: inner }} />
        <img
          src={firmaEstebanImg}
          alt="Firma Dr. Esteban J. Lobo Campero"
          style={{
            position: "absolute",
            right: 360,
            bottom: 482,
            width: 560,
            height: 160,
            objectFit: "contain",
            opacity: 0.95,
          }}
        />
        <div style={{ position: "absolute", right: 320, bottom: 340, width: 700, textAlign: "center", fontSize: 40, fontWeight: 800 }}>
          Dr. Esteban J. Lobo Campero
        </div>
        <div style={{ position: "absolute", right: 320, bottom: 300, width: 700, textAlign: "center", fontSize: 30 }}>
          Comité de Docencia e Investigación
        </div>

        {/* ===== Olas inferiores – versión más fiel con sombra ===== */}
        <svg
          viewBox="0 0 3508 560"
          width={3508}
          height={560}
          style={{ position: "absolute", bottom: 46, left: 60, right: 60 }}
          preserveAspectRatio="none"
        >
          {/* sombra suave */}
          <defs>
            <filter id="drop" x="-10%" y="-30%" width="120%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur"/>
              <feOffset dy="-6" result="off"/>
              <feMerge>
                <feMergeNode in="off"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <path d="M0 310c350 110 700 110 1050 0s700-110 1050 0 700 110 1050 0v250H0Z" fill={navy} filter="url(#drop)"/>
          <path d="M0 230c350 120 700 120 1050 0s700-120 1050 0 700 120 1050 0v330H0Z" fill={inner} opacity=".97"/>
          <path d="M0 385c350 85 700 85 1050 0s700-85 1050 0 700 85 1050 0v175H0Z" fill={accent}/>
        </svg>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";

