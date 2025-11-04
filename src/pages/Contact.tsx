import { Mail, Phone, MapPin, MessageSquare, Clock, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner@2.0.3";
import { useState } from "react";

interface ContactProps {
  onNavigate?: (page: string) => void;
}

export function Contact({ onNavigate }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular envío del formulario
    toast.success("Mensaje enviado correctamente", {
      description: "Nos pondremos en contacto contigo en las próximas 24-48 horas.",
    });
    // Resetear formulario
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

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
            <h1 className="hero-h1 mb-6">Contacto</h1>
            <p className="text-pretty leading-relaxed text-white/90 md:text-xl font-[Montserrat] text-[18px]">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Contact Info Cards */}
          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Email Card */}
            <div className="relative group cursor-pointer h-full">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative h-full p-8 text-center transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e467c]/10 to-[#55a5c7]/10">
                  <Mail className="h-7 w-7 text-[#1e467c]" />
                </div>
                <h3 className="mb-4 text-lg">Email</h3>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors">info@fudensa.com.ar</p>
                  <p className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors">soporte@fudensa.com.ar</p>
                </div>
              </Card>
            </div>

            {/* Phone Card */}
            <div className="relative group cursor-pointer h-full">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative h-full p-8 text-center transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e467c]/10 to-[#55a5c7]/10">
                  <Phone className="h-7 w-7 text-[#1e467c]" />
                </div>
                <h3 className="mb-4 text-lg">Teléfono</h3>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors">+54 11 4567-8900</p>
                  <p className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors">WhatsApp: +54 9 11 4567-8900</p>
                </div>
              </Card>
            </div>

            {/* Hours Card */}
            <div className="relative group cursor-pointer h-full sm:col-span-2 lg:col-span-1">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Card className="relative h-full p-8 text-center transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e467c]/10 to-[#55a5c7]/10">
                  <Clock className="h-7 w-7 text-[#1e467c]" />
                </div>
                <h3 className="mb-4 text-lg">Horario de Atención</h3>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Lunes a Viernes</p>
                  <p className="text-sm text-[#64748B]">9:00 - 18:00 hs</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Form and Address */}
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <div className="relative group lg:col-span-3">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <Card className="relative h-full p-8 lg:p-10 border-white/30 bg-white/90 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.15)]">
                <div className="mb-8">
                  <h2 className="mb-3">Envíanos un Mensaje</h2>
                  <p className="text-[#64748B] leading-relaxed">
                    Completa el formulario y nos pondremos en contacto contigo a la brevedad.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Tu nombre"
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="tu@email.com"
                        className="h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+54 9 11 1234-5678"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) =>
                          setFormData({ ...formData, subject: value })
                        }
                        required
                      >
                        <SelectTrigger id="subject" className="h-11">
                          <SelectValue placeholder="Selecciona un asunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Consulta General</SelectItem>
                          <SelectItem value="cursos">Información sobre Cursos</SelectItem>
                          <SelectItem value="certificacion">Certificaciones</SelectItem>
                          <SelectItem value="pagos">Pagos y Facturación</SelectItem>
                          <SelectItem value="tecnico">Soporte Técnico</SelectItem>
                          <SelectItem value="corporativo">Planes Corporativos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Escribe tu mensaje aquí..."
                      rows={6}
                      className="resize-none"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px]">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </Button>
                </form>
              </Card>
            </div>

            {/* Address and Map */}
            <div className="space-y-8 lg:col-span-2">
              {/* Address Card */}
              <div className="relative group">
                {/* Liquid Glass border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Card className="relative p-8 border-white/20 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)] transition-all duration-300 hover:scale-[1.02]">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e467c]/10 to-[#55a5c7]/10">
                    <MapPin className="h-7 w-7 text-[#1e467c]" />
                  </div>
                  <h3 className="mb-4 text-lg">Nuestra Oficina</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#64748B] leading-relaxed">
                      Av. Corrientes 1234, Piso 5
                    </p>
                    <p className="text-[#64748B] leading-relaxed">
                      C1043 CABA
                    </p>
                    <p className="text-[#64748B] leading-relaxed">Buenos Aires, Argentina</p>
                  </div>
                </Card>
              </div>

              {/* Map Card */}
              <div className="relative group">
                {/* Liquid Glass border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Card className="relative overflow-hidden p-0 border-white/20 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.1)]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168881329144!2d-58.38375908477125!3d-34.60373446501796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf7bb4c44f%3A0x5d8b1a8c5a5f9f6d!2sAv.%20Corrientes%2C%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2sar!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "350px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación FUDENSA"
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
