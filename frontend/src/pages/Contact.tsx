import { Mail, Phone, Clock, Send } from "lucide-react";
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
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ContactFormSchema, validateFormData } from "../lib/validation";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Auto-fill email when user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setIsLoggedIn(true);
        setFormData((prev) => ({ ...prev, email: session.user.email! }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setIsLoggedIn(true);
        setFormData((prev) => ({ ...prev, email: session.user.email! }));
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validar datos antes de enviar
      const validationResult = await validateFormData(ContactFormSchema, formData);
      
      if (!validationResult.success) {
        setErrors(validationResult.errors || {});
        toast.error("Por favor corrige los errores en el formulario");
        setIsLoading(false);
        return;
      }

      // Guardar mensaje en Supabase
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Enviar email de notificación via Supabase Edge Function
      const { error: fnError } = await supabase.functions.invoke("send_contact_email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          subject: formData.subject,
          message: formData.message,
        },
      });

      if (fnError) {
        console.error("Error en la función de email:", fnError);
        // Notificamos al usuario pero no bloqueamos (el mensaje ya quedó en Supabase)
        toast.warning("Mensaje guardado, pero hubo un problema al enviar el email de notificación.", {
          description: "Nos contactaremos contigo igualmente.",
        });
      } else {
        toast.success("¡Mensaje enviado correctamente!", {
          description: "Nos pondremos en contacto contigo a la brevedad.",
        });
      }

      // Resetear formulario (mantener email si está logueado)
      setFormData((prev) => ({
        name: "",
        email: isLoggedIn ? prev.email : "",
        phone: "",
        subject: "",
        message: "",
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error al enviar mensaje:", message);
      toast.error("Error al enviar el mensaje", {
        description: "Intenta de nuevo más tarde",
      });
    } finally {
      setIsLoading(false);
    }
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
                  <a href="mailto:fudensa.fundacion@gmail.com" className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors block">
                    fudensa.fundacion@gmail.com
                  </a>
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
                  <a href="https://wa.me/543813314457" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors block">
                    +54 9 3813 31-4457
                  </a>
                  <a href="https://wa.me/543813314457" target="_blank" rel="noopener noreferrer" className="text-sm text-[#64748B] hover:text-[#1e467c] transition-colors block">
                    WhatsApp: +54 9 3813 31-4457
                  </a>
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

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              {/* Liquid Glass border effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#1e467c]/40 via-[#55a5c7]/40 to-[#FCD34D]/40 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <Card className="relative h-full p-8 lg:p-12 border-white/30 bg-white/90 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(30,70,124,0.15)]">
                <div className="mb-10 text-center">
                  <h2 className="mb-4">Envíanos un Mensaje</h2>
                  <p className="text-[#64748B] leading-relaxed max-w-2xl mx-auto">
                    Completa el formulario y nos pondremos en contacto contigo a la brevedad.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Tu nombre"
                        className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email *
                        {isLoggedIn && (
                          <span className="ml-2 text-xs text-[#64748B] font-normal">(asociado a tu cuenta)</span>
                        )}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          !isLoggedIn && handleInputChange('email', e.target.value)
                        }
                        placeholder="tu@email.com"
                        className={`h-12 ${errors.email ? 'border-red-500' : ''} ${isLoggedIn ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                        readOnly={isLoggedIn}
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono <span className="font-normal text-[#64748B]">(opcional)</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder="+54 9 11 1234-5678"
                        className={`h-12 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) =>
                          handleInputChange('subject', value)
                        }
                        required
                      >
                        <SelectTrigger id="subject" className={`h-12 ${errors.subject ? 'border-red-500' : ''}`}>
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
                      {errors.subject && (
                        <p className="text-sm text-red-500">{errors.subject[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange('message', e.target.value)
                      }
                      placeholder="Escribe tu mensaje aquí..."
                      rows={8}
                      className={`resize-none ${errors.message ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message[0]}</p>
                    )}
                    <p className="text-xs text-[#64748B]">{formData.message.length} / 5000</p>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="min-w-[250px] h-12"
                      disabled={isLoading}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      {isLoading ? "Enviando..." : "Enviar Mensaje"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
