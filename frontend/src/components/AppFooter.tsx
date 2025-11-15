import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import logoVertical from "../assets/logo-vertical.svg";
import { supabase } from "../lib/supabase";

interface Course {
  id: string;
  title: string;
}

interface AppFooterProps {
  onNavigate?: (page: string, courseId?: string) => void;
}

export function AppFooter({ onNavigate }: AppFooterProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, title")
          .limit(10)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Reordenar cursos según especificación
        const courseOrder = ["Neonatal", "Pediátrico", "Adultos", "padres"];
        const sortedCourses = [...(data || [])].sort((a, b) => {
          const aIndex = courseOrder.findIndex(course => a.title.includes(course));
          const bIndex = courseOrder.findIndex(course => b.title.includes(course));
          return aIndex - bIndex;
        }).slice(0, 4);
        
        setCourses(sortedCourses);
      } catch (error) {
        console.error("Error cargando cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("courses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courses" },
        () => {
          loadCourses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return (
    <footer className="relative border-t border-[#1e467c]/10 bg-gradient-to-b from-white to-[#1e467c]/5 backdrop-blur-sm">
      {/* Glass effect top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e467c]/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src={logoVertical} 
                alt="FUDENSA" 
                className="h-32 w-auto"
              />
            </div>
            <p className="text-[#64748B]">
              Plataforma líder en educación certificada para profesionales de la salud
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e467c]/20 bg-white/60 backdrop-blur-sm text-[#64748B] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] transition-all hover:border-[#1e467c]/40 hover:bg-[#1e467c] hover:text-white hover:shadow-[0_4px_12px_0_rgba(30,70,124,0.2)]"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e467c]/20 bg-white/60 backdrop-blur-sm text-[#64748B] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] transition-all hover:border-[#1e467c]/40 hover:bg-[#1e467c] hover:text-white hover:shadow-[0_4px_12px_0_rgba(30,70,124,0.2)]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e467c]/20 bg-white/60 backdrop-blur-sm text-[#64748B] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] transition-all hover:border-[#1e467c]/40 hover:bg-[#1e467c] hover:text-white hover:shadow-[0_4px_12px_0_rgba(30,70,124,0.2)]"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e467c]/20 bg-white/60 backdrop-blur-sm text-[#64748B] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] transition-all hover:border-[#1e467c]/40 hover:bg-[#1e467c] hover:text-white hover:shadow-[0_4px_12px_0_rgba(30,70,124,0.2)]"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Cursos */}
          <div>
            <h3 className="mb-4 text-[#0F172A]">Cursos</h3>
            <ul className="space-y-3">
              {loading ? (
                <li className="text-[#64748B] text-sm">Cargando cursos...</li>
              ) : courses.length > 0 ? (
                <>
                  {courses.map((course) => (
                    <li key={course.id}>
                      <button 
                        onClick={() => onNavigate?.("course", course.id)}
                        className="text-[#64748B] hover:text-[#1e467c] cursor-pointer bg-none border-none p-0"
                      >
                        {course.title}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => onNavigate?.("catalog")}
                      className="text-[#64748B] hover:text-[#1e467c] cursor-pointer bg-none border-none p-0"
                    >
                      Ver Todos los Cursos
                    </button>
                  </li>
                </>
              ) : (
                <li className="text-[#64748B] text-sm">No hay cursos disponibles</li>
              )}
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="mb-4 text-[#0F172A]">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onNavigate?.("about")}
                  className="text-[#64748B] hover:text-[#1e467c] cursor-pointer bg-none border-none p-0"
                >
                  Sobre Nosotros
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("contact")}
                  className="text-[#64748B] hover:text-[#1e467c] cursor-pointer bg-none border-none p-0"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="mb-4 text-[#0F172A]">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Términos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="https://wa.me/543815537057" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#1e467c]">
                  WhatsApp: +54 9 3815 53-7057
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-[#64748B]">
          <p>© 2025 FUDENSA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
