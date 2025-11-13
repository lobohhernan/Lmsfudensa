import { useState, useRef } from "react";
import { Award, Calendar, Shield, Download, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { CertificateTemplate, type CertificateData } from "./CertificateTemplate";
import { generateCertificatePDF, generateCertificatePreview } from "../utils/certificate";
import { toast } from "sonner";

export interface CertificateCardProps {
  courseName: string;
  issueDate: string;
  hash: string;
  studentName?: string;
  dni?: string;
  courseHours?: string;
  certificateId?: string;
}

export function CertificateCard({
  courseName,
  issueDate,
  hash,
  studentName = "Certificado",
  dni = "",
  courseHours = "40",
  certificateId = hash.substring(0, 16).toUpperCase(),
}: CertificateCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const certificateRef = useRef<HTMLDivElement>(null);

  const certificateData: CertificateData = {
    studentName,
    dni,
    courseName,
    courseHours,
    issueDate,
    certificateId,
  };

  const handleViewCertificate = async () => {
    if (!certificateRef.current) {
      toast.error("No se pudo generar la vista previa");
      return;
    }

    try {
      const url = await generateCertificatePreview(certificateRef.current);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      toast.error("Error al generar la vista previa");
      console.error("Error:", error);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) {
      toast.error("No se pudo generar el certificado");
      return;
    }

    setIsGenerating(true);
    try {
      await generateCertificatePDF(certificateRef.current, certificateData);
      toast.success("Certificado descargado exitosamente");
    } catch (error) {
      toast.error("Error al generar el certificado. Por favor, intente nuevamente.");
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <Card className="group relative overflow-hidden border-l-4 border-l-[#55a5c7] border border-[#55a5c7]/20 bg-gradient-to-br from-white to-[#55a5c7]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#55a5c7]/40 hover:shadow-[0_8px_32px_0_rgba(85,165,199,0.25),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:scale-105 cursor-pointer flex flex-col h-full">
      {/* Glass effect top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#55a5c7]/40 to-transparent" />
      
      <CardHeader className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#55a5c7]/20 backdrop-blur-sm border border-[#55a5c7]/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
              <Award className="h-6 w-6 text-[#55a5c7]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-[#0F172A] line-clamp-2">{courseName}</h3>
              <div className="flex items-center gap-2 text-[#64748B]">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{issueDate}</span>
              </div>
            </div>
          </div>
          <Badge className="border border-white/30 bg-[#22C55E]/90 text-white backdrop-blur-md shadow-[0_4px_12px_0_rgba(34,197,94,0.3)] flex-shrink-0">
            <Shield className="mr-1 h-3 w-3" />
            Verificado
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 bg-white/50 flex-1">
        <div>
          <p className="mb-1 text-sm text-[#64748B]">Hash de verificación</p>
          <code className="block rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 p-2 text-xs text-[#0F172A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] break-all">
            {hash}
          </code>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 flex-shrink-0 gap-2">
        <Button 
          variant="outline"
          className="flex-1" 
          onClick={handleViewCertificate}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleDownload}
          disabled={isGenerating}
        >
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generando..." : "Descargar"}
        </Button>
      </CardFooter>

      {/* Hidden Certificate Template for PDF Generation */}
      <div className="fixed -left-[10000px] top-0">
        <CertificateTemplate ref={certificateRef} data={certificateData} />
      </div>

      {/* Certificate Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e467c]">Vista Previa del Certificado</DialogTitle>
            <DialogDescription>
              {courseName}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full overflow-auto">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Vista previa del certificado" 
                className="w-full h-auto border-2 border-[#E2E8F0] rounded-lg shadow-lg"
              />
            )}
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                handleDownload();
              }}
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Generando..." : "Descargar PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
