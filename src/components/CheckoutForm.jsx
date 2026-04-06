import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const CheckoutForm = ({ priceId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token, login } = useAuth();
  console.log("¿Tengo token?:", token);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !token) {
      toast({
        title: "Error",
        description: "El formulario de pago no está listo",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      //      const createSubResponse = await fetch('https://security.digital-latino.com/api/subscriptions/create-subscription-trial', {
      const createSubResponse = await fetch('http://localhost:8085/api/subscriptions/create-subscription-trial', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId }),
      }
      );

      if (!createSubResponse.ok) {
        const errorBody = await createSubResponse.text();
        throw new Error(errorBody || "No se pudo iniciar el proceso de pago");
      }

      const { clientSecret } = await createSubResponse.json();
      console.log("Clave recibida:", clientSecret);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("El campo de la tarjeta no se encontro");
      }

      let result;
      // if is free trial, the setUpIntent starts with 'seti_'
      if (clientSecret.startsWith("seti_")) {
        result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: { card: cardElement },
        });
      } else {
        // if is not free trial, the paymentIntent starts with 'pi_'
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });
      }

      const { error, setupIntent, paymentIntent } = result;

      if (error) {
        throw new Error(error.message || "Ocurrió un error con el pago.");
      }

      if (
        (setupIntent && setupIntent.status === "succeeded") ||
        (paymentIntent && paymentIntent.status === "succeeded")
      ) {
        toast({
          title: "¡Pago exitoso!",
          description: "Tu prueba gratis de 15 días ha comenzado. Redirigiendo...",
        });

        //Get new token with updated user info
        try {
          //          const refreshResponse = await fetch('https://security.digital-latino.com/api/auth/refresh-token', {
          const refreshResponse = await fetch('http://localhost:8085/api/auth/refresh-token', {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
          );
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            // update the login state with the new token
            login(data.token);
            navigate("/");
          } else {
            console.error("No se pudo refrescar el token");
            window.location.href = "/";
          }
        } catch (refreshError) {
          console.error("Error de red al refrescar:", refreshError);
          window.location.href = "/";
        }
      }

    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2 className="checkout-form-title">
        Ingresa los datos de tu tarjeta
      </h2>

      {/* Contenedor Oscuro de Stripe con mayor padding */}
      <div className="checkout-stripe-container">
        <CardElement
          options={{
            style: {
              base: {
                iconColor: '#c084fc',
                fontSize: "18px",
                color: "#ffffff",
                fontFamily: "Outfit, sans-serif",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>

      <p className="checkout-form-note">
        Se validará tu tarjeta pero no se cobrará nada hoy.
      </p>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-gradient"
      >
        {loading ? "Procesando..." : "Iniciar 15 Días Gratis"}
      </button>
    </form>
  );
};
