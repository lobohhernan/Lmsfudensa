import { Award, Calendar, Shield, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export interface CertificateCardProps {
  courseName: string;
  issueDate: string;
  hash: string;
  onVerify?: () => void;
}

export function CertificateCard({
  courseName,
  issueDate,
  hash,
  onVerify,
}: CertificateCardProps) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-[#55a5c7]">
      <CardHeader className="bg-gradient-to-r from-[#F8FAFC] to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#55a5c7]/10">
              <Award className="h-6 w-6 text-[#55a5c7]" />
            </div>
            <div>
              <h3 className="mb-1 text-[#0F172A]">{courseName}</h3>
              <div className="flex items-center gap-2 text-[#64748B]">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{issueDate}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-[#22C55E] text-white">
            <Shield className="mr-1 h-3 w-3" />
            Verificado
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="mb-1 text-sm text-[#64748B]">Hash de verificación</p>
          <code className="block rounded bg-[#F1F5F9] p-2 text-xs text-[#0F172A]">
            {hash}
          </code>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onVerify}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Verificar
          </Button>
          <Button className="flex-1">Descargar PDF</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
