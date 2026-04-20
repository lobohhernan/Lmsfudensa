import { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CourseCard } from "../components/CourseCard";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { SEOHead } from "../components/SEOHead";
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
  const [catalogPage, setCatalogPage] = useState(1);
  const COURSES_PER_PAGE = 8;
  const { courses, loading } = useCourses();

  // Reset pagination when filters change
  useEffect(() => {
    setCatalogPage(1);
  }, [searchQuery, selectedLevel]);

  // Filter courses (memoized)
  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLevel =
      !selectedLevel || selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  }), [courses, searchQuery, selectedLevel]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const start = (catalogPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourses, catalogPage]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEOHead
        title="Catálogo de Cursos - FUDENSA"
        description="Explora nuestro catálogo completo de cursos en enfermería, RCP y cuidados de salud. Disponibles en diferentes niveles de dificultad con certificación digital verificable."
        keyword="catálogo cursos, cursos enfermería, educación online salud, programas certificados, formación profesional"
        url="https://fudensa.pages.dev/#/catalog"
      />
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="border border-[#0B5FFF]/20 bg-gradient-to-br from-white to-[#0B5FFF]/5 overflow-hidden">
                  {/* Skeleton de imagen - h-48 para tarjeta vertical */}
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    {/* Skeleton de título */}
                    <Skeleton className="h-5 w-3/4" />
                    {/* Skeleton de descripción */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    {/* Skeleton de nivel */}
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </div>
                </Card>
              ))}
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
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {paginatedCourses.map((course) => (
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  {/* BOTÓN ANTERIOR */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                    disabled={catalogPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* BOTONES NUMERADOS */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={catalogPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCatalogPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  {/* BOTÓN SIGUIENTE */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCatalogPage(p => Math.min(totalPages, p + 1))}
                    disabled={catalogPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* CONTADOR TOTAL */}
                  <span className="text-sm text-[#64748B] ml-2">
                    {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
