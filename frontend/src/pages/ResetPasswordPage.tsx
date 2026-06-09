import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { ResetPasswordSchema, validateFormData } from '../lib/validation';
import { debug, error as logError } from '../lib/logger';

export interface ResetPasswordPageProps {
  onNavigate?: (page: string) => void;
}

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { resetPassword, verifyRecoveryCode } = usePasswordReset();

  // Validar código de recuperación en URL
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        debug('⚠️ Código de recuperación faltante en URL');
        toast.error('Link de recuperación inválido o expirado');
        // Redirigir a home después de 2 segundos
        setTimeout(() => onNavigate?.('home'), 2000);
        return;
      }

      // Validar el código contra Supabase
      const result = await verifyRecoveryCode(code);
      if (!result.success) {
        debug('❌ Código de recuperación inválido:', result.error);
        toast.error(result.error || 'Link de recuperación inválido o expirado');
        // Redirigir a home después de 2 segundos
        setTimeout(() => onNavigate?.('home'), 2000);
        return;
      }

      debug('✅ Código de recuperación validado');
      setIsValidatingCode(false);
    };

    validateCode();
  }, [code, onNavigate, verifyRecoveryCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    debug('🔐 Validando nueva contraseña...');

    // Validar usando schema
    const validation = await validateFormData(ResetPasswordSchema, {
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setErrors(validation.errors || {});
      debug('❌ Validación fallida', validation.errors);
      return;
    }

    setIsSubmitting(true);


    const result = await resetPassword(password);

    if (result.success) {
      debug('✅ Contraseña actualizada exitosamente');
      setResetSuccess(true);
      toast.success('¡Contraseña actualizada correctamente!');

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        onNavigate?.('home');
      }, 3000);
    } else {
      toast.error(result.error || 'Error al actualizar la contraseña');
      debug('❌ Error: ' + result.error);
    }

    setIsSubmitting(false);
  };

  if (isValidatingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e467c] to-[#2c5a9e] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Validando tu solicitud...</CardTitle>
            <CardDescription className="text-white/70">
              Estamos verificando tu link de recuperación.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e467c] to-[#2c5a9e] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Link Inválido</CardTitle>
            <CardDescription className="text-white/70">
              El link de recuperación es inválido o ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 text-sm">
              Redirigiendo... Si no te redirige automáticamente, haz clic en "Iniciar Sesión".
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e467c] to-[#2c5a9e] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              ¡Éxito!
            </CardTitle>
            <CardDescription className="text-white/70">
              Tu contraseña ha sido actualizada correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80 text-sm">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button
              onClick={() => onNavigate?.('home')}
              className="w-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_12px_0_rgba(34,197,94,0.3)] hover:shadow-[0_6px_16px_0_rgba(34,197,94,0.4)]"
            >
              Ir al Inicio
            </Button>
            <p className="text-white/60 text-xs text-center">
              Redirigiendo en 3 segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e467c] to-[#2c5a9e] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Establecer Nueva Contraseña</CardTitle>
          <CardDescription className="text-white/70">
            Ingresa tu nueva contraseña para recuperar tu cuenta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-white/90">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: [] });
                    }
                  }}
                  disabled={isSubmitting}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-all"
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <ul className="text-xs text-red-300 space-y-1">
                  {errors.password.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-white/60">
                Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password" className="text-white/90">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: [] });
                    }
                  }}
                  disabled={isSubmitting}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-all"
                  aria-label="Mostrar/ocultar contraseña de confirmación"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <ul className="text-xs text-red-300 space-y-1">
                  {errors.confirmPassword.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_12px_0_rgba(34,197,94,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_6px_16px_0_rgba(34,197,94,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>

            {/* Error General */}
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <p className="text-red-200 text-sm">
                  {errors.general.join(', ')}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
