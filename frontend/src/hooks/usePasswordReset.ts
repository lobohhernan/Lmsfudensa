import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { debug, error as logError } from '../lib/logger';

export interface PasswordResetResult {
  success: boolean;
  error?: string;
  loading: boolean;
}

interface ResetEmailFunctionResponse {
  success?: boolean;
  message?: string;
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
      const { data, error } = await supabase.functions.invoke<ResetEmailFunctionResponse>('send-reset-email', {
        body: { email },
      });

      // Siempre mostrar éxito sin importar el resultado
      debug(`✅ Email de recuperación procesado`);
      return { success: true, loading: false };
    } catch (err) {
      logError('Excepción al enviar email de recuperación:', err);
      // También mostrar éxito en caso de error
      return { success: true, loading: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valida el código de recuperación contra Supabase
   * @param code - Código de recuperación
   * @returns Promise con resultado
   */
  const verifyRecoveryCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      debug('🔒 Validando código de recuperación...');

      // Intercambiar el código por una sesión válida
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logError('Error validando código:', error);
        return {
          success: false,
          error: error.message === 'invalid code' 
            ? 'El código de recuperación es inválido o expirado'
            : 'No pudimos validar el código de recuperación',
        };
      }

      debug('✅ Código de recuperación validado correctamente');
      return { success: true };
    } catch (err) {
      logError('Excepción validando código:', err);
      return {
        success: false,
        error: 'Error al validar el código de recuperación',
      };
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
      
      // Realizar logout después de cambiar la contraseña
      try {
        await supabase.auth.signOut();
        debug('✅ Sesión cerrada después de cambio de contraseña');
      } catch (logoutError) {
        logError('Error cerrando sesión:', logoutError);
        // No fallar el flujo si el logout falla
      }
      
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

  return { sendResetEmail, verifyRecoveryCode, resetPassword, loading };
}
