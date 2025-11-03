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
      <section className="bg-[rgb(30,70,124)] py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="hero-h1 mb-6">Contacto</h1>
            <p className="text-pretty leading-relaxed text-white/90 md:text-xl font-[Montserrat] text-[18px]">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e467c]/10">
                <Mail className="h-6 w-6 text-[#1e467c]" />
              </div>
              <h3 className="mb-2">Email</h3>
              <p className="text-[#64748B]">info@fudensa.com.ar</p>
              <p className="text-[#64748B]">soporte@fudensa.com.ar</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e467c]/10">
                <Phone className="h-6 w-6 text-[#1e467c]" />
              </div>
              <h3 className="mb-2">Teléfono</h3>
              <p className="text-[#64748B]">+54 11 4567-8900</p>
              <p className="text-[#64748B]">WhatsApp: +54 9 11 4567-8900</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e467c]/10">
                <Clock className="h-6 w-6 text-[#1e467c]" />
              </div>
              <h3 className="mb-2">Horario de Atención</h3>
              <p className="text-[#64748B]">Lunes a Viernes</p>
              <p className="text-[#64748B]">9:00 - 18:00 hs</p>
            </Card>
          </div>

          {/* Contact Form and Address */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <Card className="p-8 lg:col-span-2">
              <div className="mb-6">
                <h2 className="mb-2">Envíanos un Mensaje</h2>
                <p className="text-[#64748B]">
                  Completa el formulario y nos pondremos en contacto contigo a la brevedad.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Tu nombre"
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
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                      <SelectTrigger id="subject">
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
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </Button>
              </form>
            </Card>

            {/* Address and Map */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e467c]/10">
                  <MapPin className="h-6 w-6 text-[#1e467c]" />
                </div>
                <h3 className="mb-4">Nuestra Oficina</h3>
                <p className="mb-2 text-[#64748B]">
                  Av. Corrientes 1234, Piso 5
                </p>
                <p className="mb-2 text-[#64748B]">
                  C1043 CABA
                </p>
                <p className="text-[#64748B]">Buenos Aires, Argentina</p>
              </Card>

              <Card className="overflow-hidden p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168881329144!2d-58.38375908477125!3d-34.60373446501796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf7bb4c44f%3A0x5d8b1a8c5a5f9f6d!2sAv.%20Corrientes%2C%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2sar!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación FUDENSA"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
