import { useState } from "react";
import { Search, ShieldCheck, AlertCircle, Award, Calendar, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

interface CertificateVerifyProps {
  onNavigate?: (page: string) => void;
}

export function CertificateVerify() {
  const [hash, setHash] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const handleVerify = () => {
    // Simulate verification
    if (hash.length > 10) {
      setVerificationStatus("valid");
    } else {
      setVerificationStatus("invalid");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B5FFF]/10">
            <ShieldCheck className="h-8 w-8 text-[#0B5FFF]" />
          </div>
          <h1 className="mb-2 text-[#0F172A]">Verificación de Certificados</h1>
          <p className="text-[#64748B]">
            Verifica la autenticidad de un certificado FUDENSA
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ingresa el Hash del Certificado</CardTitle>
            <CardDescription>
              El hash es un código único que identifica cada certificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hash">Hash de verificación</Label>
              <div className="flex gap-2">
                <Input
                  id="hash"
                  placeholder="a7f8e9c2b4d6f1a3c5e7b9d2f4a6c8e0..."
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button onClick={handleVerify}>
                  <Search className="mr-2 h-4 w-4" />
                  Verificar
                </Button>
              </div>
            </div>
            <p className="text-sm text-[#64748B]">
              El hash se encuentra en la parte inferior del certificado PDF
            </p>
          </CardContent>
        </Card>

        {/* Valid Certificate */}
        {verificationStatus === "valid" && (
          <Card className="border-2 border-[#22C55E]">
            <CardHeader className="bg-gradient-to-r from-[#22C55E]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[#22C55E]">Certificado Válido</CardTitle>
                  <CardDescription>
                    Este certificado ha sido verificado exitosamente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Certificate Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="mt-1 h-5 w-5 flex-shrink-0 text-[#0B5FFF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#64748B]">Curso</p>
                    <p className="text-[#0F172A]">
                      RCP Adultos AHA 2020 - Reanimación Cardiopulmonar
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-1 h-5 w-5 flex-shrink-0 text-[#0B5FFF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#64748B]">Otorgado a</p>
                    <p className="text-[#0F172A]">Datos del certificado</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-[#0B5FFF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#64748B]">Fecha de emisión</p>
                    <p className="text-[#0F172A]">15 de Octubre, 2025</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-[#0B5FFF]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#64748B]">Hash de verificación</p>
                    <code className="block break-all rounded bg-[#F1F5F9] p-2 text-xs text-[#0F172A]">
                      {hash}
                    </code>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 border-t pt-6">
                <Badge className="bg-[#0B5FFF] text-white">FUDENSA</Badge>
                <Badge className="bg-[#16A34A] text-white">AHA Certified</Badge>
                <Badge className="bg-[#22C55E] text-white">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              </div>

              {/* QR Code Mock */}
              <div className="border-t pt-6">
                <p className="mb-3 text-sm text-[#64748B]">Código QR de verificación</p>
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-white">
                  <span className="text-xs text-[#64748B]">QR Code</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invalid Certificate */}
        {verificationStatus === "invalid" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Certificado No Válido</AlertTitle>
            <AlertDescription>
              No se encontró ningún certificado con este hash. Verifica que hayas ingresado el
              código correctamente o contacta con soporte.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Section */}
        {verificationStatus === "idle" && (
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo verificar un certificado?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0B5FFF] text-white">
                    1
                  </div>
                  <div>
                    <p className="text-[#0F172A]">Localiza el hash</p>
                    <p className="text-sm text-[#64748B]">
                      El código de verificación se encuentra en la parte inferior del certificado PDF
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0B5FFF] text-white">
                    2
                  </div>
                  <div>
                    <p className="text-[#0F172A]">Ingresa el código</p>
                    <p className="text-sm text-[#64748B]">
                      Copia y pega el hash completo en el campo de verificación
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0B5FFF] text-white">
                    3
                  </div>
                  <div>
                    <p className="text-[#0F172A]">Verifica la autenticidad</p>
                    <p className="text-sm text-[#64748B]">
                      El sistema verificará el certificado contra nuestra base de datos blockchain
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-[#64748B]">
                  ¿Necesitas ayuda? Contacta con nuestro equipo de soporte por WhatsApp: +54 11
                  1234-5678
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
