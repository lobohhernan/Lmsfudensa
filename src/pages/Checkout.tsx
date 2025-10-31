import { useState } from "react";
import { CreditCard, Award, Check, ChevronRight, ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Badge } from "../components/ui/badge";

interface CheckoutProps {
  onNavigate?: (page: string) => void;
}

export function Checkout({ onNavigate }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("AR");
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [couponCode, setCouponCode] = useState("");

  const prices: Record<string, number> = {
    AR: 29900,
    UY: 29900,
    MX: 29900,
    CO: 29900,
    US: 29900,
  };

  const currencies: Record<string, string> = {
    AR: "ARS",
    UY: "ARS",
    MX: "ARS",
    CO: "ARS",
    US: "ARS",
  };

  const price = prices[country] || prices.US;
  const currency = currencies[country] || currencies.US;

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/10">
              <Check className="h-10 w-10 text-[#22C55E]" />
            </div>
            <h1 className="mb-4 text-[#0F172A]">¡Pago Confirmado!</h1>
            <p className="mb-8 text-[#64748B]">
              Tu certificado está listo para ser descargado
            </p>

            {/* Certificate Preview */}
            <Card className="mb-8 overflow-hidden border-2 border-[#16A34A]">
              <CardContent className="bg-gradient-to-br from-white to-[#F8FAFC] p-8">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="mb-2 text-[#0F172A]">Certificado de Finalización</h2>
                <p className="mb-6 text-[#64748B]">
                  Este certifica que has completado exitosamente
                </p>
                <h3 className="mb-6 text-[#0F172A]">
                  RCP Adultos AHA 2020 - Reanimación Cardiopulmonar
                </h3>
                <div className="mb-6 space-y-2 text-sm text-[#64748B]">
                  <p>Duración: 8 horas</p>
                  <p>Fecha de emisión: 30 de Octubre, 2025</p>
                  <p className="font-mono">
                    Hash: a7f8e9c2b4d6f1a3c5e7b9d2f4a6c8e0
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <Badge className="bg-[#0B5FFF] text-white">FUDENSA</Badge>
                  <Badge className="bg-[#16A34A] text-white">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verificado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => onNavigate?.("profile")}>
                <Award className="mr-2 h-5 w-5" />
                Ver en Mi Perfil
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate?.("home")}
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumbs */}
      <div className="border-b bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => onNavigate?.("home")} className="cursor-pointer">
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => onNavigate?.("course")} className="cursor-pointer">
                  Curso
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= stepNum
                      ? "bg-[#0B5FFF] text-white"
                      : "bg-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 2 && (
                  <ChevronRight
                    className={`mx-2 h-5 w-5 ${
                      step > stepNum ? "text-[#0B5FFF]" : "text-[#64748B]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-[#64748B]">
              Paso {step} de 2: {step === 1 ? "Resumen del pedido" : "Método de pago"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Content */}
          <div className="space-y-6">
            {step === 1 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#E2E8F0]">
                        <img
                          src="https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=200"
                          alt="Curso"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 text-[#0F172A]">
                          RCP Adultos AHA 2020 - Reanimación Cardiopulmonar
                        </h3>
                        <p className="text-sm text-[#64748B]">8 horas • Nivel Básico</p>
                        <Badge className="mt-2 bg-[#22C55E] text-white">
                          <Award className="mr-1 h-3 w-3" />
                          Certificado Incluido
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selecciona tu País</CardTitle>
                    <CardDescription>
                      Todos los pagos se procesan en Pesos Argentinos (ARS) mediante Mercado Pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                        <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                        <SelectItem value="MX">🇲🇽 México</SelectItem>
                        <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                        <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cupón de Descuento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ingresa tu código"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="outline">Aplicar</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                  <CardDescription>
                    Selecciona tu método de pago preferido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 rounded-lg border-2 border-[#00A8FF] bg-[#00A8FF]/5 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-[#00A8FF]">
                        <span className="font-bold text-white">MP</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0F172A]">Mercado Pago</p>
                        <p className="text-sm text-[#64748B]">
                          Paga con tarjetas de crédito/débito, efectivo (Rapipago/Pago Fácil) o dinero en cuenta
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-[#00A8FF]" />
                    </div>

                    <div className="rounded-lg bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                      <p className="mb-2 font-semibold text-[#0F172A]">Métodos aceptados:</p>
                      <ul className="space-y-1">
                        <li>• Visa, Mastercard, American Express</li>
                        <li>• Tarjetas de débito</li>
                        <li>• Efectivo (Rapipago, Pago Fácil)</li>
                        <li>• Saldo en Mercado Pago</li>
                        <li>• Cuotas sin interés disponibles</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <aside>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Certificado</span>
                    <span className="text-[#0F172A]">
                      $ {price.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Descuento</span>
                    <span className="text-[#22C55E]">-$ 0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#0F172A]">Total ({currency})</span>
                    <span className="text-xl font-bold text-[#0F172A]">
                      $ {price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start gap-2 text-sm">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#22C55E]" />
                    <span className="text-[#64748B]">
                      Pago seguro y encriptado
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0B5FFF]" />
                    <span className="text-[#64748B]">
                      Certificado verificable con blockchain
                    </span>
                  </div>
                </div>

                {step === 1 && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setStep(2)}
                  >
                    Continuar al Pago
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}

                {step === 2 && (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setStep(3)}
                    >
                      Confirmar Pago
                      <CreditCard className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setStep(1)}
                    >
                      Volver
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
