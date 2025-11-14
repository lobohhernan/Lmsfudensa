import { Clock, BarChart3, Award } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface CourseCardProps {
  id: string;
  title: string;
  image: string;
  duration: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  certified: boolean;
  students?: number;
  onClick?: () => void;
}

export function CourseCard({
  title,
  image,
  duration,
  level,
  certified,
  students,
  onClick,
}: CourseCardProps) {
  const levelColors = {
    Básico: "bg-[#22C55E] text-white",
    Intermedio: "bg-[#F59E0B] text-white",
    Avanzado: "bg-[#EF4444] text-white",
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-gray-200/50 bg-white transition-all duration-300 hover:border-white/20 hover:bg-gradient-to-b hover:from-white/90 hover:to-white/70 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:backdrop-blur-xl hover:scale-105 flex flex-col h-full"
      onClick={onClick}
    >
      {/* Glass effect top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative aspect-video overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
          {certified && (
            <div className="absolute right-3 top-3">
              <Badge className="border border-white/30 bg-[#1e467c]/90 text-white backdrop-blur-md shadow-[0_4px_16px_0_rgba(30,70,124,0.3)]">
                <Award className="mr-1 h-3 w-3" />
                Certificado
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="mb-3 line-clamp-2 text-[#0F172A] min-h-[3.5rem]">{title}</h3>
        <div className="flex flex-wrap items-center gap-3 mt-auto">
          <div className="flex items-center gap-1 text-[#64748B]">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-[#64748B]">
            <BarChart3 className="h-4 w-4" />
            <Badge variant="outline" className={levelColors[level]}>
              {level}
            </Badge>
          </div>
        </div>
      </CardContent>
      {students !== undefined && students !== null ? (
        <CardFooter className="border-t p-4 shrink-0">
          <p className="text-sm text-[#64748B]">{students.toLocaleString()} estudiantes</p>
        </CardFooter>
      ) : (
        <CardFooter className="border-t p-4 shrink-0 bg-linear-to-r from-[#F8FAFC] to-[#F1F5F9]">
          <p className="text-sm text-[#94A3B8] italic">Sin estudiantes aún</p>
        </CardFooter>
      )}
    </Card>
  );
}
