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
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {certified && (
            <div className="absolute right-3 top-3">
              <Badge className="bg-[#1e467c] text-white">
                <Award className="mr-1 h-3 w-3" />
                Certificado
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="mb-3 line-clamp-2 text-[#0F172A]">{title}</h3>
        <div className="flex flex-wrap items-center gap-3">
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
      {students && (
        <CardFooter className="border-t p-4">
          <p className="text-sm text-[#64748B]">{students.toLocaleString()} estudiantes</p>
        </CardFooter>
      )}
    </Card>
  );
}
