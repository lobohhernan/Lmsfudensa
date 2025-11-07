import { useState, useEffect } from "react";
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
  | "design"
  | "evaluation"
  | "about"
  | "contact";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ email: string; name: string } | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{ page: string; courseId?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = (page: string, courseId?: string) => {
    setCurrentPage(page as Page);
    if (courseId) {
      setCurrentCourseId(courseId);
    }
  };

  const handleLogin = (user: { email: string; name: string }) => {
    setIsLoggedIn(true);
    setUserData(user);
    
    // Si había una navegación pendiente, ejecutarla
    if (pendingNavigation) {
      handleNavigate(pendingNavigation.page, pendingNavigation.courseId);
      setPendingNavigation(null);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
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
        onLogin={handleLogin}
        currentPage={currentPage}
        openLoginModal={showAuthModal}
        onLoginModalChange={setShowAuthModal}
      />
      
      <main className="flex-1">
        {currentPage === "home" && <Home onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />}
        {currentPage === "catalog" && <CourseCatalog onNavigate={handleNavigate} />}
        {currentPage === "course" && (
          <CourseDetail 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn}
            onAuthRequired={(page, courseId) => {
              setPendingNavigation({ page, courseId });
              setShowAuthModal(true);
            }}
          />
        )}
        {currentPage === "checkout" && (
          <Checkout 
            onNavigate={handleNavigate}
            courseId={currentCourseId}
            userData={userData}
          />
        )}
        {currentPage === "profile" && <UserProfile onNavigate={handleNavigate} />}
        {currentPage === "design" && <DesignSystem />}
        {currentPage === "about" && <AboutUs onNavigate={handleNavigate} />}
        {currentPage === "contact" && <Contact onNavigate={handleNavigate} />}
      </main>

      <AppFooter />
      
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Toaster />
    </div>
  );
}
