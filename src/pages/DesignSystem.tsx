import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Check, X, Heart, Star, Award } from "lucide-react";

export function DesignSystem() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-[#0F172A]">FUDENSA Design System</h1>
          <p className="text-[#64748B]">
            Sistema de diseño completo para el LMS de FUDENSA
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Paleta de Colores</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Primary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg bg-[#1e467c]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #1e467c</p>
                  <p className="text-sm text-[#64748B]">RGB: 30, 70, 124</p>
                  <p className="text-sm text-[#64748B]">Variable: --brand-primary</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Secondary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg bg-[#55a5c7]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #55a5c7</p>
                  <p className="text-sm text-[#64748B]">RGB: 85, 165, 199</p>
                  <p className="text-sm text-[#64748B]">Variable: --brand-secondary</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg bg-[#22C55E]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #22C55E</p>
                  <p className="text-sm text-[#64748B]">RGB: 34, 197, 94</p>
                  <p className="text-sm text-[#64748B]">Variable: --success</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg bg-[#EF4444]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #EF4444</p>
                  <p className="text-sm text-[#64748B]">RGB: 239, 68, 68</p>
                  <p className="text-sm text-[#64748B]">Variable: --error</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg bg-[#F59E0B]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #F59E0B</p>
                  <p className="text-sm text-[#64748B]">Variable: --warning</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg border bg-[#F8FAFC]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #F8FAFC</p>
                  <p className="text-sm text-[#64748B]">Variable: --bg</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Foreground</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 rounded-lg bg-[#0F172A]"></div>
                <div className="space-y-1">
                  <p className="text-sm text-[#64748B]">Hex: #0F172A</p>
                  <p className="text-sm text-[#64748B]">Variable: --fg</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Tipografía</h2>
          <Card>
            <CardContent className="space-y-6 p-8">
              <div>
                <p className="mb-2 text-sm text-[#64748B]">Display (32px/40px/700)</p>
                <h1 style={{ fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>
                  Aprendé y certifícate con FUDENSA
                </h1>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-[#64748B]">H1 (28px/36px/700)</p>
                <h1>Cursos Destacados de la Plataforma</h1>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-[#64748B]">H2 (24px/32px/600)</p>
                <h2>RCP Adultos AHA 2020</h2>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-[#64748B]">H3 (20px/28px/600)</p>
                <h3>Información del Curso</h3>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-[#64748B]">Body (16px/24px/400)</p>
                <p>
                  Este es un párrafo de texto normal que se usa para el contenido principal de la
                  plataforma. Debe ser legible y tener un buen contraste con el fondo.
                </p>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-[#64748B]">Small (14px/20px/400)</p>
                <p className="text-sm">
                  Texto pequeño para metadata y descripciones secundarias.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Botones</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Variantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tamaños</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Check className="mr-2 h-4 w-4" />
                    Con Icono
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Con Iconos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Heart className="mr-2 h-4 w-4" />
                    Me gusta
                  </Button>
                  <Button variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    Favorito
                  </Button>
                  <Button variant="secondary">
                    <Award className="mr-2 h-4 w-4" />
                    Certificado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Elementos de Formulario</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Input normal" />
                <Input placeholder="Input con texto" defaultValue="Valor predeterminado" />
                <Input placeholder="Input deshabilitado" disabled />
                <Input type="email" placeholder="email@ejemplo.com" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkboxes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="check1" />
                  <label htmlFor="check1" className="cursor-pointer text-[#0F172A]">
                    Checkbox normal
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="check2" defaultChecked />
                  <label htmlFor="check2" className="cursor-pointer text-[#0F172A]">
                    Checkbox seleccionado
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="check3" disabled />
                  <label htmlFor="check3" className="cursor-not-allowed text-[#64748B]">
                    Checkbox deshabilitado
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Componentes</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="bg-[#1e467c] text-white">Primary</Badge>
                  <Badge className="bg-[#55a5c7] text-white">Secondary</Badge>
                  <Badge className="bg-[#F59E0B] text-white">Warning</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=User1"
                      alt="User"
                    />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=User2"
                      alt="User"
                    />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JP</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=User3"
                      alt="User"
                    />
                    <AvatarFallback>U3</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">50%</span>
                  </div>
                  <Progress value={50} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
                <CardDescription>Tarjetas con header, content y footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#64748B]">
                  Las cards son contenedores versátiles que se usan en toda la plataforma para
                  agrupar contenido relacionado.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Espaciado (Sistema 8pt)</h2>
          <Card>
            <CardContent className="space-y-4 p-8">
              <div className="space-y-3">
                {[4, 8, 12, 16, 20, 24, 32, 40].map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-[#64748B]">{size}px</div>
                    <div className="h-6 bg-[#1e467c]" style={{ width: `${size}px` }}></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Border Radius */}
        <section className="mb-16">
          <h2 className="mb-6 text-[#0F172A]">Border Radius</h2>
          <div className="grid gap-6 sm:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-3 h-20 w-20 bg-[#1e467c]" style={{ borderRadius: '4px' }}></div>
                <p className="text-sm text-[#64748B]">sm (4px)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-3 h-20 w-20 rounded-md bg-[#1e467c]"></div>
                <p className="text-sm text-[#64748B]">md (6px)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-3 h-20 w-20 rounded-lg bg-[#1e467c]"></div>
                <p className="text-sm text-[#64748B]">lg (8px)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-3 h-20 w-20 rounded-2xl bg-[#1e467c]"></div>
                <p className="text-sm text-[#64748B]">2xl (16px)</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Iconography */}
        <section>
          <h2 className="mb-6 text-[#0F172A]">Iconografía (Lucide React)</h2>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-6">
                {[Check, X, Heart, Star, Award].map((Icon, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F1F5F9]">
                      <Icon className="h-6 w-6 text-[#1e467c]" />
                    </div>
                    <p className="text-xs text-[#64748B]">{Icon.name}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-[#64748B]">
                Los iconos se utilizan de lucide-react y se dimensionan típicamente a 16px (h-4 w-4),
                20px (h-5 w-5) o 24px (h-6 w-6)
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
