import { Search, Menu, X, User, LogOut, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner@2.0.3";

interface AppNavbarProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function AppNavbar({ onNavigate, isLoggedIn = false, onLogout }: AppNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => onNavigate?.("home")}
                className="flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e467c]">
                  <span className="font-bold text-white">F</span>
                </div>
                <span className="hidden font-bold text-[#0F172A] sm:block">FUDENSA</span>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden items-center gap-6 md:flex">
                <button
                  onClick={() => onNavigate?.("catalog")}
                  className="text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  Cursos
                </button>
                <button
                  onClick={() => onNavigate?.("about")}
                  className="text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  Sobre Nosotros
                </button>
                <button
                  onClick={() => onNavigate?.("contact")}
                  className="text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  Contacto
                </button>
              </div>
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden items-center gap-4 md:flex">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#0B5FFF] text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">Juan Pérez</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => {
                        onNavigate?.("profile");
                        toast.success("Navegando a tu perfil");
                      }}
                      className="cursor-pointer"
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        onLogout?.();
                        toast.success("Sesión cerrada correctamente");
                      }}
                      className="cursor-pointer text-[#EF4444]"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLoginOpen(true)}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button onClick={() => setRegisterOpen(true)}>
                    Registrar
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white md:hidden">
            <div className="space-y-1 px-4 py-4">
              <button
                onClick={() => {
                  onNavigate?.("catalog");
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-[#64748B] hover:bg-[#F1F5F9]"
              >
                Cursos
              </button>
              <button
                onClick={() => {
                  onNavigate?.("about");
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-[#64748B] hover:bg-[#F1F5F9]"
              >
                Sobre Nosotros
              </button>
              <button
                onClick={() => {
                  onNavigate?.("contact");
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-[#64748B] hover:bg-[#F1F5F9]"
              >
                Contacto
              </button>
              <div className="flex flex-col gap-2 pt-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-2 rounded-md border bg-[#F8FAFC] px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#0B5FFF] text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Juan Pérez</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onNavigate?.("profile");
                        setMobileMenuOpen(false);
                        toast.success("Navegando a tu perfil");
                      }}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout?.();
                        setMobileMenuOpen(false);
                        toast.success("Sesión cerrada correctamente");
                      }}
                      className="text-[#EF4444]"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setLoginOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      onClick={() => {
                        setRegisterOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Registrar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Iniciar Sesión</DialogTitle>
            <DialogDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-[#0B5FFF] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
            <p className="text-center text-sm text-[#64748B]">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setLoginOpen(false);
                  setRegisterOpen(true);
                }}
                className="text-[#0B5FFF] hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Cuenta</DialogTitle>
            <DialogDescription>
              Completa el formulario para registrarte en FUDENSA
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Nombre completo</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Correo electrónico</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Contraseña</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm">Confirmar contraseña</Label>
              <Input
                id="register-confirm"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Crear Cuenta
            </Button>
            <p className="text-center text-sm text-[#64748B]">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setRegisterOpen(false);
                  setLoginOpen(true);
                }}
                className="text-[#0B5FFF] hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
