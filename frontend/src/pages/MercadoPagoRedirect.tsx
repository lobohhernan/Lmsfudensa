import React, { useEffect } from "react";
import { NavigationParams } from "../lib/types";

interface Props {
  onNavigate: (page: string, params?: Partial<NavigationParams>) => void;
}

export default function MercadoPagoRedirect({ onNavigate }: Props) {
  useEffect(() => {
    // Obtener todos los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    
    // Los parámetros que Mercado Pago puede enviar:
    // - payment_id
    // - preference_id
    // - external_reference (course ID)
    // - merchant_order_id
    // - collection_id

    const paymentId = params.get("payment_id");
    const preferenceId = params.get("preference_id");
    const externalRef = params.get("external_reference");
    const merchantOrderId = params.get("merchant_order_id");
    const collectionId = params.get("collection_id");

    console.log("🔄 [MP Redirect] Parámetros recibidos:", {
      paymentId,
      preferenceId,
      externalRef,
      merchantOrderId,
      collectionId,
    });

    // Esperar un momento para que Mercado Pago complete su procesamiento
    const timer = setTimeout(() => {
      // Redirigir a la página de éxito con todos los parámetros
      const newUrl = `/?external_reference=${externalRef}&status=approved&payment_id=${paymentId || collectionId || preferenceId}`;
      
      console.log("🔄 [MP Redirect] Redirigiendo a:", newUrl);
      window.location.replace(newUrl);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "20px" }}>⏳</div>
      <h2>Procesando tu pago...</h2>
      <p>Redirigiendo a la aplicación...</p>
      <p style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}>
        Si no se redirige automáticamente en 5 segundos, haz clic{" "}
        <a href="/" style={{ color: "#0066cc" }}>
          aquí
        </a>
      </p>
    </div>
  );
}
