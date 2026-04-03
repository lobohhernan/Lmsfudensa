/**
 * Payment Simulator for Development/Testing
 * Simulates Mercado Pago webhook responses without calling the real API
 * Executes the exact same logic that the real webhook would trigger
 */

import { supabase } from "./supabase";

export type PaymentStatus = "approved" | "pending" | "rejected";

/**
 * Simulates a payment and processes it through the same enrollment logic
 * This replicates exactly what the mercadopago-webhook function does
 */
export async function simulatePayment(
  userId: string,
  courseId: string,
  userEmail: string,
  status: PaymentStatus
): Promise<{
  success: boolean;
  paymentId: string;
  message: string;
  error?: string;
}> {
  try {
    // Generate a test payment ID
    const testPaymentId = `TEST-${status.toUpperCase()}-${Date.now()}`;

    console.log("🧪 [PAYMENT SIMULATOR] Simulating payment:", {
      paymentId: testPaymentId,
      userId,
      courseId,
      userEmail,
      status,
    });

    // Only approved payments create/update enrollments
    if (status === "approved") {
      await createOrUpdateEnrollment(userId, courseId, userEmail, testPaymentId);

      console.log("✅ [PAYMENT SIMULATOR] Payment simulated successfully (APPROVED)");
      return {
        success: true,
        paymentId: testPaymentId,
        message: "Pago simulado - APROBADO. Acceso habilitado al curso.",
      };
    } else if (status === "pending") {
      // Pending payments: log but don't create enrollment
      console.log("⏳ [PAYMENT SIMULATOR] Payment simulated (PENDING)");
      return {
        success: true,
        paymentId: testPaymentId,
        message: "Pago simulado - PENDIENTE. Aguardando confirmación.",
      };
    } else if (status === "rejected") {
      // Rejected payments: log rejection
      console.log("❌ [PAYMENT SIMULATOR] Payment simulated (REJECTED)");
      return {
        success: true,
        paymentId: testPaymentId,
        message: "Pago simulado - RECHAZADO. Intenta nuevamente.",
      };
    }

    return {
      success: false,
      paymentId: testPaymentId,
      message: `Unknown payment status: ${status}`,
      error: `Unknown payment status: ${status}`,
    };
  } catch (error) {
    console.error("❌ [PAYMENT SIMULATOR] Error:", error);
    return {
      success: false,
      paymentId: "",
      message: "",
      error:
        error instanceof Error
          ? error.message
          : "Error en simulación de pago",
    };
  }
}

/**
 * Replicates the exact enrollment logic from the webhook
 * Mimics createEnrollment function from mercadopago-webhook
 */
async function createOrUpdateEnrollment(
  userId: string,
  courseId: string,
  _userEmail: string,
  paymentId: string
): Promise<void> {
  console.log("📝 [PAYMENT SIMULATOR] Creating/updating enrollment:", {
    userId,
    courseId,
  });

  // First check if enrollment already exists
  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (existingEnrollment) {
    console.warn(
      "⚠️ [PAYMENT SIMULATOR] Enrollment already exists, skipping update..."
    );
    console.log("✅ [PAYMENT SIMULATOR] Enrollment already active");
    return;
  }

  // Create new enrollment with only the columns that exist in the table
  const { data: enrollment, error: enrollError } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
    })
    .select();

  if (enrollError) {
    // If error is duplicate key, another instance created it
    if (enrollError.message?.includes("duplicate")) {
      console.warn(
        "⚠️ [PAYMENT SIMULATOR] Enrollment created by another process, ignoring"
      );
      return;
    }

    console.error(
      "❌ [PAYMENT SIMULATOR] Error creating enrollment:",
      enrollError
    );
    throw enrollError;
  }

  console.log(
    "✅ [PAYMENT SIMULATOR] Enrollment created:",
    enrollment?.[0]?.id
  );
}

/**
 * Check if payment simulation is enabled (development mode)
 */
export function isPaymentSimulationEnabled(): boolean {
  const isDev = import.meta.env.MODE === "development";
  return isDev;
}
