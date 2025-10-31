import { Award, Users, Target, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface AboutUsProps {
  onNavigate?: (page: string) => void;
}

export function AboutUs({ onNavigate }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#1e467c] py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-4xl font-bold md:text-5xl">
              Sobre FUDENSA
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-white/90 md:text-xl">
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
            <Card>
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

            {/* Vocación */}
            <Card>
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

            {/* Comunidad */}
            <Card>
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

            {/* Impacto */}
            <Card>
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
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">1,250+</div>
              <div className="text-lg text-white/90">Profesionales Capacitados</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">15+</div>
              <div className="text-lg text-white/90">Cursos Especializados</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">450+</div>
              <div className="text-lg text-white/90">Certificaciones Emitidas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
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
      </section>
    </div>
  );
}
