import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { debug, error as logError } from '../lib/logger';

export interface PasswordResetResult {
  success: boolean;
  error?: string;
  loading: boolean;
}

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);

  /**
   * Envía un email de recuperación de contraseña
   * @param email - Email del usuario
   * @returns Promise con resultado
   */
  const sendResetEmail = async (email: string): Promise<PasswordResetResult> => {
    setLoading(true);
    try {
      debug(`📧 Enviando email de recuperación a: ${email}`);

      // Llamar edge function para enviar email
      const { data, error } = await supabase.functions.invoke('send-reset-email', {
        body: { email },
      });

      if (error) {
        logError('Error enviando email de recuperación:', error);
        return {
          success: false,
          error: 'No pudimos enviar el email. Intenta más tarde.',
          loading: false,
        };
      }

      debug(`✅ Email de recuperación enviado exitosamente`);
      return { success: true, loading: false };
    } catch (err) {
      logError('Excepción al enviar email de recuperación:', err);
      return {
        success: false,
        error: 'Error al procesar tu solicitud. Intenta más tarde.',
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza la contraseña del usuario autenticado
   * @param newPassword - Nueva contraseña
   * @returns Promise con resultado
   */
  const resetPassword = async (newPassword: string): Promise<PasswordResetResult> => {
    setLoading(true);
    try {
      debug('🔐 Actualizando contraseña...');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logError('Error actualizando contraseña:', error);
        return {
          success: false,
          error: 'No pudimos actualizar tu contraseña. Intenta más tarde.',
          loading: false,
        };
      }

      debug('✅ Contraseña actualizada exitosamente');
      return { success: true, loading: false };
    } catch (err) {
      logError('Excepción al actualizar contraseña:', err);
      return {
        success: false,
        error: 'Error al procesar tu solicitud. Intenta más tarde.',
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return { sendResetEmail, resetPassword, loading };
}
