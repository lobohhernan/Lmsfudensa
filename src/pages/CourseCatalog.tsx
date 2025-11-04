import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CourseCard } from "../components/CourseCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";

interface CourseCatalogProps {
  onNavigate?: (page: string, courseId?: string) => void;
}

const allCourses = [
  {
    id: "1",
    title: "RCP Adultos AHA 2020 - Reanimación Cardiopulmonar",
    image: "https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400",
    duration: "8 horas",
    level: "Básico" as const,
    certified: true,
    students: 12450,
    category: "RCP",
  },
  {
    id: "2",
    title: "RCP Neonatal - Soporte Vital Pediátrico Avanzado",
    image: "https://images.unsplash.com/photo-1725870475677-7dc91efe9f93?w=400",
    duration: "12 horas",
    level: "Avanzado" as const,
    certified: true,
    students: 8320,
    category: "RCP",
  },
  {
    id: "3",
    title: "Primeros Auxilios Básicos - Manejo de Emergencias",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?w=400",
    duration: "6 horas",
    level: "Básico" as const,
    certified: true,
    students: 15680,
    category: "Primeros Auxilios",
  },
  {
    id: "4",
    title: "Emergencias Médicas - Atención Prehospitalaria",
    image: "https://images.unsplash.com/photo-1644488483724-4daed4a30390?w=400",
    duration: "10 horas",
    level: "Intermedio" as const,
    certified: true,
    students: 9540,
    category: "Emergencias",
  },
  {
    id: "5",
    title: "Certificación en Soporte Vital Cardiovascular",
    image: "https://images.unsplash.com/photo-1722235623200-59966a71af50?w=400",
    duration: "15 horas",
    level: "Avanzado" as const,
    certified: true,
    students: 6720,
    category: "RCP",
  },
  {
    id: "6",
    title: "Atención de Heridas y Quemaduras - Técnicas Avanzadas",
    image: "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?w=400",
    duration: "8 horas",
    level: "Intermedio" as const,
    certified: true,
    students: 11230,
    category: "Primeros Auxilios",
  },
];

export function CourseCatalog({ onNavigate }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] -mt-16 pt-32 pb-20 text-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-[#55a5c7]/20 blur-3xl"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/3 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="hero-h1 mb-6 text-balance">Catálogo de Cursos</h1>
            <p className="text-pretty leading-relaxed text-white/90 md:text-xl font-[Montserrat] text-[18px]">
              Explora nuestros cursos certificados
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Search and Quick Filters - Glass Effect */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#0B5FFF]/20 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] transition-all hover:border-[#0B5FFF]/40 focus:border-[#0B5FFF] focus:bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px] border-[#0B5FFF]/20 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-[#0B5FFF]/40">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px] border-[#0B5FFF]/20 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-[#0B5FFF]/40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {selectedLevel && selectedLevel !== "all" && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1 border border-[#0B5FFF]/30 bg-[#0B5FFF]/10 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
              Nivel: {selectedLevel}
              <button
                onClick={() => setSelectedLevel("")}
                className="ml-2 hover:text-[#0B5FFF]"
              >
                ×
              </button>
            </Badge>
          </div>
        )}

        {/* Main Content */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[#64748B]">{allCourses.length} cursos disponibles</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onClick={() => onNavigate?.("course", course.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Button 
              variant="outline" 
              disabled
              className="border-gray-300/50 bg-white/40 backdrop-blur-sm text-gray-400"
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              className="border-[#0B5FFF]/30 bg-gradient-to-br from-[#0B5FFF] to-[#0B5FFF]/80 text-white backdrop-blur-sm shadow-[0_4px_12px_0_rgba(11,95,255,0.25)] hover:shadow-[0_6px_16px_0_rgba(11,95,255,0.35)] hover:from-[#0B5FFF]/90 hover:to-[#0B5FFF]/70"
            >
              1
            </Button>
            <Button 
              variant="outline"
              className="border-[#0B5FFF]/20 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-[#0B5FFF]/40 hover:bg-white/80 hover:shadow-[0_4px_12px_0_rgba(11,95,255,0.08)]"
            >
              2
            </Button>
            <Button 
              variant="outline"
              className="border-[#0B5FFF]/20 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-[#0B5FFF]/40 hover:bg-white/80 hover:shadow-[0_4px_12px_0_rgba(11,95,255,0.08)]"
            >
              3
            </Button>
            <Button 
              variant="outline"
              className="border-[#0B5FFF]/20 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-[#0B5FFF]/40 hover:bg-white/80 hover:shadow-[0_4px_12px_0_rgba(11,95,255,0.08)]"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
