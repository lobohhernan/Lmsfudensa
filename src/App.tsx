import { useState } from "react";
import { Palette, LayoutDashboard, Menu, X, Award, User, LogIn, LogOut } from "lucide-react";
import { AppNavbar } from "./components/AppNavbar";
import { AppFooter } from "./components/AppFooter";
import { Home } from "./pages/Home";
import { CourseCatalog } from "./pages/CourseCatalog";
import { CourseDetail } from "./pages/CourseDetail";
import { LessonPlayer } from "./pages/LessonPlayer";
import { Checkout } from "./pages/Checkout";
import { UserProfile } from "./pages/UserProfile";
import { AdminPanel } from "./pages/AdminPanel";
import { CertificateVerify } from "./pages/CertificateVerify";
import { DesignSystem } from "./pages/DesignSystem";
import { Evaluation } from "./pages/Evaluation";
import { AboutUs } from "./pages/AboutUs";
import { Contact } from "./pages/Contact";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";
import { toast } from "sonner@2.0.3";

type Page =
  | "home"
  | "catalog"
  | "course"
  | "lesson"
  | "checkout"
  | "profile"
  | "admin"
  | "verify"
  | "design"
  | "evaluation"
  | "about"
  | "contact";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (page: string, courseId?: string) => {
    setCurrentPage(page as Page);
    if (courseId) {
      setCurrentCourseId(courseId);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("home");
  };

  // Admin, Lesson Player, and Evaluation have their own layouts
  if (currentPage === "admin") {
    return (
      <>
        <AdminPanel onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === "lesson") {
    return (
      <>
        <LessonPlayer onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === "evaluation") {
    return (
      <>
        <Evaluation onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  // All other pages use the standard layout with navbar and footer
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar 
        onNavigate={handleNavigate} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        currentPage={currentPage}
      />
      
      <main className="flex-1">
        {currentPage === "home" && <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "catalog" && <CourseCatalog onNavigate={handleNavigate} />}
        {currentPage === "course" && <CourseDetail onNavigate={handleNavigate} />}
        {currentPage === "checkout" && <Checkout onNavigate={handleNavigate} />}
        {currentPage === "profile" && <UserProfile onNavigate={handleNavigate} />}
        {currentPage === "verify" && <CertificateVerify onNavigate={handleNavigate} />}
        {currentPage === "design" && <DesignSystem />}
        {currentPage === "about" && <AboutUs onNavigate={handleNavigate} />}
        {currentPage === "contact" && <Contact onNavigate={handleNavigate} />}
      </main>

      {currentPage !== "verify" && <AppFooter />}
      
      {/* Quick Access Menu - Demo purposes */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
              aria-label="Menú de acceso rápido"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56"
            sideOffset={5}
          >
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                setIsLoggedIn(!isLoggedIn);
                toast.success(
                  isLoggedIn 
                    ? "Vista de visitante activada" 
                    : "Vista de usuario autenticado activada"
                );
                if (!isLoggedIn) {
                  handleNavigate("home");
                }
              }}
              className="cursor-pointer"
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Ver como Visitante
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Ver como Usuario Autenticado
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("profile");
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Perfil de Usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("design");
              }}
              className="cursor-pointer"
            >
              <Palette className="mr-2 h-4 w-4" />
              Design System
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("admin");
              }}
              className="cursor-pointer"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Panel Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("evaluation");
              }}
              className="cursor-pointer"
            >
              <Award className="mr-2 h-4 w-4" />
              Evaluación
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("verify");
              }}
              className="cursor-pointer"
            >
              Verificar Certificado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Toaster />
    </div>
  );
}
