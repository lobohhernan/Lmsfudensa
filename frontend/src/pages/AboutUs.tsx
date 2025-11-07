import { Award, Users, Target, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useState, useEffect, useRef } from "react";

interface AboutUsProps {
  onNavigate?: (page: string) => void;
}

export function AboutUs({ onNavigate }: AboutUsProps) {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate first counter to 1250
          const duration1 = 2000;
          const steps1 = 60;
          const increment1 = 1250 / steps1;
          let current1 = 0;
          
          const timer1 = setInterval(() => {
            current1 += increment1;
            if (current1 >= 1250) {
              setCount1(1250);
              clearInterval(timer1);
            } else {
              setCount1(Math.floor(current1));
            }
          }, duration1 / steps1);

          // Animate second counter to 15
          const duration2 = 2000;
          const steps2 = 15;
          const increment2 = 15 / steps2;
          let current2 = 0;
          
          const timer2 = setInterval(() => {
            current2 += increment2;
            if (current2 >= 15) {
              setCount2(15);
              clearInterval(timer2);
            } else {
              setCount2(Math.floor(current2));
            }
          }, duration2 / steps2);

          // Animate third counter to 450
          const duration3 = 2000;
          const steps3 = 60;
          const increment3 = 450 / steps3;
          let current3 = 0;
          
          const timer3 = setInterval(() => {
            current3 += increment3;
            if (current3 >= 450) {
              setCount3(450);
              clearInterval(timer3);
            } else {
              setCount3(Math.floor(current3));
            }
          }, duration3 / steps3);

          return () => {
            clearInterval(timer1);
            clearInterval(timer2);
            clearInterval(timer3);
          };
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <div className="min-h-screen bg-white">
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
            <h1 className="hero-h1 mb-6 text-balance">
              Sobre FUDENSA
            </h1>
            <p className="text-pretty leading-relaxed text-white/90 md:text-xl font-[Montserrat] text-[18px]">
              Fundación para el Desarrollo de la Enfermería y la Salud
            </p>
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-primary">
              Nuestra Misión
            </h2>
            <p className="text-pretty text-center text-lg leading-relaxed text-muted-foreground">
              FUDENSA es una institución dedicada a la formación continua de profesionales de la salud, 
              con especial énfasis en enfermería y atención de emergencias. Nuestro compromiso es brindar 
              educación de calidad, actualizada y accesible para mejorar la atención sanitaria en toda la región.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary">
            Nuestros Valores
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Excelencia */}
            <div className="relative group cursor-pointer">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Excelencia</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Compromiso con la calidad educativa y la actualización constante de contenidos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Vocación */}
            <div className="relative group cursor-pointer">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Vocación</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Pasión por la enseñanza y el desarrollo profesional en el área de la salud
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Comunidad */}
            <div className="relative group cursor-pointer">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Comunidad</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Construcción de una red de profesionales comprometidos con la salud
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impacto */}
            <div className="relative group cursor-pointer">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative transition-all duration-300 hover:scale-105 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Impacto</h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    Mejora continua de la atención sanitaria a través de la capacitación
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-primary">
              Nuestra Historia
            </h2>
            <div className="space-y-6 text-pretty leading-relaxed text-muted-foreground">
              <p>
                FUDENSA nace de la necesidad de brindar formación continua y especializada a profesionales 
                de la salud, especialmente en áreas críticas como reanimación cardiopulmonar (RCP), 
                atención de emergencias y cuidados intensivos.
              </p>
              <p>
                Con años de experiencia en el sector educativo y sanitario, nuestro equipo de instructores 
                certificados ha capacitado a miles de profesionales, contribuyendo significativamente a 
                mejorar los estándares de atención médica en la región.
              </p>
              <p>
                Hoy, FUDENSA se posiciona como una institución de referencia en educación continua para 
                profesionales de la salud, ofreciendo cursos presenciales y virtuales que combinan teoría 
                actualizada con práctica intensiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e467c] via-[#2d5f93] to-[#55a5c7] py-16 text-white">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#55a5c7]/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
          <div ref={statsRef} className="grid gap-8 md:grid-cols-3">
            {/* Profesionales Capacitados */}
            <div className="relative group">
              <div className="relative text-center">
                <div className="mb-2 text-5xl font-bold" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))' }}>{count1.toLocaleString()}+</div>
                <div className="text-lg text-white/90" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.4))' }}>Profesionales Capacitados</div>
              </div>
            </div>

            {/* Cursos Especializados */}
            <div className="relative group">
              <div className="relative text-center">
                <div className="mb-2 text-5xl font-bold" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))' }}>{count2}+</div>
                <div className="text-lg text-white/90" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.4))' }}>Cursos Especializados</div>
              </div>
            </div>

            {/* Certificaciones Emitidas */}
            <div className="relative group">
              <div className="relative text-center">
                <div className="mb-2 text-5xl font-bold" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))' }}>{count3.toLocaleString()}+</div>
                <div className="text-lg text-white/90" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.4))' }}>Certificaciones Emitidas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-3xl">
            {/* Liquid Glass CTA Container */}
            <div className="relative group">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative rounded-3xl border border-white/30 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm p-12 shadow-[0_8px_32px_0_rgba(30,70,124,0.15)] text-center">
                <h2 className="mb-6 text-3xl font-bold text-primary">
                  Únete a Nuestra Comunidad
                </h2>
                <p className="mb-8 text-pretty text-lg text-muted-foreground">
                  Forma parte de la red de profesionales de la salud más comprometidos con la excelencia 
                  y la actualización continua.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    onClick={() => onNavigate?.("catalog")}
                  >
                    Ver Cursos Disponibles
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => onNavigate?.("contact")}
                  >
                    Contáctanos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
