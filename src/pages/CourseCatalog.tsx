import { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
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
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Badge } from "../components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-[#0F172A]">Filtros</h3>
      </div>

      <Accordion type="multiple" defaultValue={["category", "level"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Categoría</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {["RCP", "Primeros Auxilios", "Emergencias", "Avanzado"].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category));
                      }
                    }}
                  />
                  <Label htmlFor={`cat-${category}`} className="cursor-pointer text-[#64748B]">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="level">
          <AccordionTrigger>Nivel</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {["Básico", "Intermedio", "Avanzado"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLevels([...selectedLevels, level]);
                      } else {
                        setSelectedLevels(selectedLevels.filter((l) => l !== level));
                      }
                    }}
                  />
                  <Label htmlFor={`level-${level}`} className="cursor-pointer text-[#64748B]">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button variant="outline" className="w-full">
        Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="border-b bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => onNavigate?.("home")} className="cursor-pointer">
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Catálogo de Cursos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-[#0F172A]">Catálogo de Cursos</h1>
          <p className="text-[#64748B]">Explora nuestros cursos certificados</p>
        </div>

        {/* Search and Quick Filters */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedLevels.length > 0) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="px-3 py-1">
                {cat}
                <button
                  onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedLevels.map((level) => (
              <Badge key={level} variant="secondary" className="px-3 py-1">
                {level}
                <button
                  onClick={() => setSelectedLevels(selectedLevels.filter((l) => l !== level))}
                  className="ml-2"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border bg-white p-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Course Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[#64748B]">{allCourses.length} cursos disponibles</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
              <Button variant="outline" disabled>
                Anterior
              </Button>
              <Button variant="outline" className="bg-[#0B5FFF] text-white">
                1
              </Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Siguiente</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
