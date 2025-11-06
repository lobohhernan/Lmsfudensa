import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import logoHorizontal from "figma:asset/8052e84e5f711ed276951754c7c911a5c6a4f35f.png";

export function AppFooter() {
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
                src={logoHorizontal} 
                alt="FUDENSA" 
                className="h-10 w-auto sm:h-12"
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
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  RCP Adultos AHA 2020
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  RCP Neonatal
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Primeros Auxilios Básicos
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Emergencias Médicas
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Ver Todos los Cursos
                </a>
              </li>
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="mb-4 text-[#0F172A]">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Mi Perfil
                </a>
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
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  WhatsApp: +54 11 1234-5678
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
