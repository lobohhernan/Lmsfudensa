import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePasswordReset } from '../hooks/usePasswordReset';
import { debug } from '../lib/logger';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin?: () => void;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { sendResetEmail } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setIsSubmitting(true);
    debug(`📧 Solicitando reset de contraseña para: ${email}`);

    const result = await sendResetEmail(email);

    if (result.success) {
      setEmailSent(true);
      toast.success('Email enviado! Revisa tu bandeja de entrada');
      debug('✅ Email de recuperación enviado exitosamente');
    } else {
      toast.error(result.error || 'Error al enviar el email');
      debug('❌ Error al enviar email: ' + result.error);
    }

    setIsSubmitting(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setEmail('');
      setEmailSent(false);
      setIsSubmitting(false);
    }
    onOpenChange(open);
  };

  const handleBackToLogin = () => {
    setEmail('');
    setEmailSent(false);
    onBackToLogin?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] relative overflow-hidden border-white/20 bg-gradient-to-br from-[#1e467c]/95 via-[#2c5a9e]/95 to-[#1e467c]/95 backdrop-blur-2xl shadow-[0_24px_64px_0_rgba(31,38,135,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        {/* Inner glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {!emailSent && (
                <button
                  onClick={handleBackToLogin}
                  className="p-0 hover:bg-white/10 rounded transition-all"
                  aria-label="Volver al login"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              {emailSent ? 'Email Enviado' : 'Recuperar Contraseña'}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {emailSent
                ? 'Hemos enviado un link de recuperación a tu email. Revisa tu bandeja de entrada.'
                : 'Ingresa tu email y te enviaremos un link para resetear tu contraseña.'}
            </DialogDescription>
          </DialogHeader>

          {emailSent ? (
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                <p className="text-green-200 text-sm">
                  📧 Revisa tu email (incluyendo la carpeta de spam) dentro de los próximos 5 minutos.
                </p>
              </div>
              <p className="text-sm text-white/70">
                El link expirará en 1 hora por seguridad. Si no recibiste nada, intenta nuevamente.
              </p>
              <Button
                onClick={() => handleClose(false)}
                className="w-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_12px_0_rgba(34,197,94,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_6px_16px_0_rgba(34,197,94,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-white/90">
                  Correo electrónico
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] focus:border-white/40 focus:bg-white/15 disabled:opacity-50"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_12px_0_rgba(34,197,94,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_6px_16px_0_rgba(34,197,94,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperación'
                )}
              </Button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-sm text-white/70 hover:text-white transition-all hover:underline"
                >
                  Volver a Iniciar Sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
