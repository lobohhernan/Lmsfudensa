import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { CourseCard } from "../components/CourseCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useCourses } from "../hooks/useCourses";

interface CourseCatalogProps {
  onNavigate?: (page: string, courseId?: string, courseSlug?: string) => void;
}

export function CourseCatalog({ onNavigate }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const { courses, loading } = useCourses();

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLevel =
      !selectedLevel || selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

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
            <p className="text-[#64748B]">
              {loading ? (
                <span className="text-gray-400">Cargando cursos...</span>
              ) : filteredCourses.length === 0 ? (
                <span className="text-gray-400">
                  {courses.length === 0
                    ? "No hay cursos disponibles aún"
                    : "No se encontraron cursos con esos filtros"}
                </span>
              ) : (
                `${filteredCourses.length} cursos disponibles`
              )}
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block animate-spin">
                  <div className="h-8 w-8 border-4 border-[#0B5FFF] border-r-transparent rounded-full"></div>
                </div>
                <p className="text-gray-500">Cargando cursos...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500">
                  {courses.length === 0
                    ? "No hay cursos disponibles aún. Crea uno desde el Admin Panel."
                    : "No se encontraron cursos con esos filtros"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  image={course.image}
                  duration={course.duration}
                  level={course.level as "Básico" | "Intermedio" | "Avanzado"}
                  certified={course.certified}
                  students={course.students}
                  onClick={() => onNavigate?.("course", course.id, course.slug)}
                />
              ))}
            </div>
          )}

          {/* Pagination - Removed for now */}
        </div>
      </div>
    </div>
  );
}
