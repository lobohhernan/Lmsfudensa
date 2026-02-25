import { Search, Menu, X, User, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { debug, error as logError } from '../lib/logger'
import logoHorizontal from "../assets/logo-horizontal.svg";

interface AppNavbarProps {
  onNavigate?: (page: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogin?: (userData: { email: string; name: string; role: 'student' | 'instructor' | 'admin' }) => void;
  currentPage?: string;
  openLoginModal?: boolean;
  openRegisterModal?: boolean;
  onLoginModalChange?: (open: boolean) => void;
  onRegisterModalChange?: (open: boolean) => void;
  currentUser?: { email: string; name: string; role: 'student' | 'instructor' | 'admin' } | null;
}

export function AppNavbar({ 
  onNavigate, 
  isLoggedIn = false, 
  onLogout, 
  onLogin,
  currentPage = "home",
  openLoginModal,
  openRegisterModal,
  onLoginModalChange,
  onRegisterModalChange,
  currentUser = null
}: AppNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalLoginOpen, setInternalLoginOpen] = useState(false);
  const [internalRegisterOpen, setInternalRegisterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  // Used for loading state during login (setter only)
  const [, setIsLoggingIn] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const loginOpen = openLoginModal !== undefined ? openLoginModal : internalLoginOpen;
  const registerOpen = openRegisterModal !== undefined ? openRegisterModal : internalRegisterOpen;
  
  const setLoginOpen = (open: boolean) => {
    if (onLoginModalChange) {
      onLoginModalChange(open);
    } else {
      setInternalLoginOpen(open);
    }
  };
  
  const setRegisterOpen = (open: boolean) => {
    if (onRegisterModalChange) {
      onRegisterModalChange(open);
    } else {
      setInternalRegisterOpen(open);
    }
  };

  // Memoized handlers to prevent unnecessary re-renders
  const handleNavigate = useCallback((page: string) => {
    onNavigate?.(page);
  }, [onNavigate]);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleProfileNav = useCallback(() => {
    handleNavigate("profile");
    setMobileMenuOpen(false);
  }, [handleNavigate]);

  const handleLogout = useCallback(async () => {
    debug("🔽 Click en Cerrar Sesión");
    setMobileMenuOpen(false);
    onLogout?.();
  }, [onLogout]);

  const handleLoginOpen = useCallback(() => {
    setIsRegistering(false);
    setLoginOpen(true);
  }, []);

  const handleCatalogNav = useCallback(() => {
    handleNavigate("catalog");
    setMobileMenuOpen(false);
  }, [handleNavigate]);

  const handleAboutNav = useCallback(() => {
    handleNavigate("about");
    setMobileMenuOpen(false);
  }, [handleNavigate]);

  const handleContactNav = useCallback(() => {
    handleNavigate("contact");
    setMobileMenuOpen(false);
  }, [handleNavigate]);

  const handleAdminNav = useCallback(() => {
    handleNavigate("admin");
    setMobileMenuOpen(false);
  }, [handleNavigate]);

  // Calcular iniciales del usuario
  const getUserInitials = () => {
    if (!currentUser?.name) return "US";
    return currentUser.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Páginas que necesitan navbar azul desde el inicio
  const solidNavbarPages = ["course", "checkout", "profile", "admin", "lesson", "evaluation"];
  const needsSolidNavbar = solidNavbarPages.includes(currentPage);

  useEffect(() => {
    const scrolledRef = { current: scrolled };
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Skip Links - Keyboard navigation accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-[#1e467c] focus:text-white focus:px-4 focus:py-2">
        Ir al contenido principal
      </a>
      <a href="#footer" className="sr-only focus:not-sr-only focus:fixed focus:top-8 focus:left-0 focus:z-50 focus:bg-[#1e467c] focus:text-white focus:px-4 focus:py-2">
        Ir al pie de página
      </a>
      
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        mobileMenuOpen
          ? 'bg-[#1e467c]/95 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]'
          : needsSolidNavbar || scrolled
          ? 'bg-[#1e467c]/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]' 
          : 'md:bg-transparent bg-[#1e467c]/80 backdrop-blur-xl'
      }`}>
        {/* Glass effect top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button
                onClick={handleNavigate.bind(null, "home")}
                className="flex items-center transition-all duration-200 hover:scale-[1.02] hover:opacity-80"
              >
                <img 
                  src={logoHorizontal} 
                  alt="FUDENSA" 
                  className="h-10 w-auto brightness-0 invert sm:h-12"
                />
              </button>

              {/* Desktop Navigation */}
              <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => handleNavigate("catalog")}
                  className="rounded-lg px-4 py-2 text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                >
                  Cursos
                </button>
                <button
                  onClick={() => handleNavigate("about")}
                  className="rounded-lg px-4 py-2 text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                >
                  Sobre Nosotros
                </button>
                <button
                  onClick={() => handleNavigate("contact")}
                  className="rounded-lg px-4 py-2 text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                >
                  Contacto
                </button>
              </div>
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden items-center gap-3 md:flex">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 rounded-lg text-white transition-all hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                      aria-label={`Menú de usuario: ${currentUser?.name || "Usuario"}`}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white/20">
                        <AvatarFallback className="bg-[#0B5FFF] text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">{currentUser?.name || "Usuario"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#1e467c]/95 backdrop-blur-xl">
                    <DropdownMenuItem
                      onClick={handleProfileNav}
                      className="cursor-pointer text-white hover:bg-white/10"
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>
                    {currentUser?.role === 'admin' && (
                      <>
                        <DropdownMenuItem
                          onClick={handleAdminNav}
                          className="cursor-pointer text-white hover:bg-white/10"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Panel Admin
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-300 hover:bg-red-500/20 hover:text-red-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleLoginOpen}
                  className="rounded-lg border border-white/15 bg-white/5 text-white backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all hover:bg-white/15 hover:text-white"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-all duration-200 hover:bg-white/10 active:scale-95 md:hidden"
              onClick={handleMobileMenuToggle}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#1e467c]/95 to-[#2c5a9e]/95 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.5)] md:hidden"
            >
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />
              {/* Inner glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                id="mobile-menu"
                role="navigation"
                aria-label="Navegación móvil"
                className="relative z-10 space-y-1 px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
              >
                <button
                  onClick={handleCatalogNav}
                  className="block w-full rounded-xl px-4 py-3.5 text-left text-white/95 transition-all duration-200 hover:bg-white/20 hover:text-white hover:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  Cursos
                </button>
                <button
                  onClick={handleAboutNav}
                  className="block w-full rounded-xl px-4 py-3.5 text-left text-white/95 transition-all duration-200 hover:bg-white/20 hover:text-white hover:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  Sobre Nosotros
                </button>
                <button
                  onClick={handleContactNav}
                  className="block w-full rounded-xl px-4 py-3.5 text-left text-white/95 transition-all duration-200 hover:bg-white/20 hover:text-white hover:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  Contacto
                </button>
                <div className="flex flex-col gap-3 pt-6 pb-3">
                  {/* Separator line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-[0_1px_2px_0_rgba(255,255,255,0.1)]" />
                  
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/8 backdrop-blur-sm px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_0_rgba(0,0,0,0.1)]">
                        <Avatar className="h-9 w-9 ring-2 ring-white/30 ring-offset-2 ring-offset-[#1e467c]">
                          <AvatarFallback className="bg-[#0B5FFF] text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white">{currentUser?.name || "Usuario"}</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleProfileNav}
                        className="h-auto rounded-xl border border-white/20 bg-white/8 py-3.5 text-white backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_0_rgba(0,0,0,0.1)] transition-all hover:border-white/30 hover:bg-white/15 hover:text-white active:scale-[0.98] w-full justify-start"
                      >
                        <UserCircle className="mr-2 h-5 w-5" />
                        Mi Perfil
                      </Button>
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          onClick={handleAdminNav}
                          className="h-auto rounded-xl border border-white/20 bg-white/8 py-3.5 text-white backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_0_rgba(0,0,0,0.1)] transition-all hover:border-white/30 hover:bg-white/15 hover:text-white active:scale-[0.98] w-full justify-start"
                        >
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          Panel Admin
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="h-auto rounded-lg py-3 text-red-200 transition-all hover:bg-red-500/20 hover:text-red-100 active:scale-[0.98] w-full justify-start"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsRegistering(false);
                        setLoginOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="h-auto rounded-xl border border-white/20 bg-white/8 py-3.5 text-white backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_2px_8px_0_rgba(0,0,0,0.1)] transition-all hover:border-white/30 hover:bg-white/15 hover:text-white active:scale-[0.98] w-full"
                    >
                      Iniciar Sesión
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal - Login/Register */}
      <Dialog open={loginOpen} onOpenChange={(open) => {
        setLoginOpen(open);
        if (!open) setIsRegistering(false);
      }}>
        <DialogContent className="sm:max-w-[425px] relative overflow-hidden border-white/20 bg-gradient-to-br from-[#1e467c]/95 via-[#2c5a9e]/95 to-[#1e467c]/95 backdrop-blur-2xl shadow-[0_24px_64px_0_rgba(31,38,135,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
          {/* Glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          {/* Inner glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-white">{isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}</DialogTitle>
              <DialogDescription className="text-white/70">
                {isRegistering ? "Completa el formulario para registrarte en FUDENSA" : "Ingresa tus credenciales para acceder a tu cuenta"}
              </DialogDescription>
            </DialogHeader>
            {!isRegistering ? (
              <form 
                className="space-y-4 pt-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoggingIn(true);
                  try {
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('login-email') as string;
                    const password = formData.get('login-password') as string;
                    
                    if (!email || !password) {
                      toast.error("Por favor completa todos los campos");
                      setIsLoggingIn(false);
                      return;
                    }

                    // Intentar login con Supabase
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                      email,
                      password,
                    });

                    if (authError) {
                      toast.error("Email o contraseña incorrectos");
                      setIsLoggingIn(false);
                      return;
                    }

                    if (!authData.user) {
                      toast.error("Error al iniciar sesión");
                      setIsLoggingIn(false);
                      return;
                    }

                    // Obtener perfil para conseguir nombre completo y role
                    const { data: profile, error: profileError } = await supabase
                      .from("profiles")
                      .select("full_name, email, role")
                      .eq("id", authData.user.id)
                      .single();

                    const userName = profile?.full_name || email.split('@')[0];
                    const userRole = profile?.role || 'student';

                    onLogin?.({ email, name: userName, role: userRole });
                    setLoginOpen(false);
                    setIsRegistering(false);
                    toast.success("Sesión iniciada correctamente. ¡Bienvenido!");
                  } catch (error) {
                    logError("Error en login:", error);
                    toast.error("Error al iniciar sesión");
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white/90">Correo electrónico</Label>
                  <Input
                    id="login-email"
                    name="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white/90">Contraseña</Label>
                  <Input
                    id="login-password"
                    name="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <a 
                    href="#" 
                    className="text-white/90 transition-all hover:text-white hover:underline hover:underline-offset-4"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Función de recuperación de contraseña próximamente");
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_12px_0_rgba(34,197,94,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_6px_16px_0_rgba(34,197,94,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:scale-[0.98]">
                  Iniciar Sesión
                </Button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="rounded-full bg-gradient-to-br from-[#1e467c]/95 to-[#2c5a9e]/95 px-3 py-1 text-white/70 backdrop-blur-sm border border-white/10">O continuar con</span>
                  </div>
                </div>
                
                  <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all hover:bg-white/15 hover:border-white/30 hover:text-white"
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: window.location.origin,
                      }
                    });
                    if (error) {
                      toast.error("Error al iniciar sesión con Google: " + error.message);
                    }
                  }}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </Button>
                
                <p className="text-center text-sm text-white/70">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-white/90 transition-all hover:text-white hover:underline hover:underline-offset-4"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </form>
            ) : (
              <form 
                className="space-y-4 pt-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsRegistering(true);
                  
                  try {
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get('register-name') as string;
                    const email = formData.get('register-email') as string;
                    const password = formData.get('register-password') as string;
                    const confirmPassword = formData.get('register-confirm') as string;
                    
                    if (password !== confirmPassword) {
                      toast.error("Las contraseñas no coinciden");
                      setIsRegistering(false);
                      return;
                    }
                    
                    if (password.length < 6) {
                      toast.error("La contraseña debe tener al menos 6 caracteres");
                      setIsRegistering(false);
                      return;
                    }
                    
                    if (!name || !email || !password) {
                      toast.error("Por favor completa todos los campos");
                      setIsRegistering(false);
                      return;
                    }

                    // Registrar en Supabase Auth
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                      email,
                      password,
                      options: {
                        data: {
                          full_name: name
                        }
                      }
                    });

                    if (authError) {
                      toast.error("Error al registrar: " + authError.message);
                      setIsRegistering(false);
                      return;
                    }

                    if (!authData.user) {
                      toast.error("Error al crear la cuenta");
                      setIsRegistering(false);
                      return;
                    }

                    // Crear perfil en tabla profiles
                    const { error: profileError } = await supabase
                      .from("profiles")
                      .insert([{
                        id: authData.user.id,
                        email,
                        full_name: name,
                        role: "student",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      }]);

                    if (profileError) {
                      logError("Error al crear perfil:", profileError);
                      // No mostrar error si el perfil ya existe
                      if (!profileError.message.includes("duplicate key")) {
                        toast.error("Error al crear el perfil: " + profileError.message);
                        setIsRegistering(false);
                        return;
                      }
                    }

                    // Auto-login después del registro exitoso
                    await supabase.auth.signInWithPassword({
                      email,
                      password,
                    });

                    // Llamar onLogin para actualizar el estado en App
                    onLogin?.({ email, name, role: 'student' });
                    
                    // Cerrar modal y resetear estado
                    setLoginOpen(false);
                    setIsRegistering(false);
                    
                    toast.success("¡Cuenta creada exitosamente! Bienvenido a FUDENSA");
                  } catch (error) {
                    console.error("Error en registro:", error);
                    toast.error("Error al registrar la cuenta");
                    setIsRegistering(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white/90">Nombre completo</Label>
                  <Input
                    id="register-name"
                    name="register-name"
                    type="text"
                    placeholder="Juan Pérez"
                    required
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white/90">Correo electrónico</Label>
                  <Input
                    id="register-email"
                    name="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white/90">Contraseña</Label>
                  <Input
                    id="register-password"
                    name="register-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="text-white/90">Confirmar contraseña</Label>
                  <Input
                    id="register-confirm"
                    name="register-confirm"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_12px_0_rgba(34,197,94,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_6px_16px_0_rgba(34,197,94,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:scale-[0.98]">
                  Crear Cuenta
                </Button>
                <p className="text-center text-sm text-white/70">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-white/90 transition-all hover:text-white hover:underline hover:underline-offset-4"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const AppNavbarMemoized = memo(AppNavbar);
