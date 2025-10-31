import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e467c]">
                <span className="font-bold text-white">F</span>
              </div>
              <span className="font-bold text-[#0F172A]">FUDENSA</span>
            </div>
            <p className="text-[#64748B]">
              Educación certificada en salud y primeros auxilios
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#1e467c] hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#1e467c] hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#1e467c] hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] transition-colors hover:bg-[#1e467c] hover:text-white"
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
                  RCP Adultos
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  RCP Pediátrica
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Primeros Auxilios
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Emergencias Médicas
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="mb-4 text-[#0F172A]">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Certificaciones
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-[#64748B] hover:text-[#1e467c]">
                  Blog
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
