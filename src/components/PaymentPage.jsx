import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { useState } from "react";
import { Check, X } from "lucide-react";
import "./PaymentPage.css";

const stripePromise = loadStripe(
  "pk_test_51SAtWhKFPi4gMQQnl5IahKw9gDsuSYHUGgs3cFuFasveKQIu7TMbIe4fkwOGwzAYovd2DXAuGebBF1qVze0LSPhp00QjNbOjEf"
);

const PLANS = {
  MONTHLY: {
    id: "price_1STRTuKFPi4gMQQnEZL9oIYo",
    name: "Plan Mensual",
    amount: 499,
    interval: "/mes",
    features: [
      "Información de todos los artistas",
      "Acceso completo a Charts",
      "Métricas avanzadas",
    ],
  },
  YEARLY: {
    id: "price_1STRTuKFPi4gMQQnRrzC1aXX",
    name: "Plan Anual",
    amount: 999,
    interval: "/año",
    features: [
      "Información de todos los artistas",
      "Acceso completo a Charts",
      "Métricas avanzadas",
    ],
  },
  ARTIST: {
    id: "price_1SXXeBKFPi4gMQQn2cx9SPB1",
    name: "Plan Artista",
    amount: 99,
    interval: "/mes",
    features: [
      "Acceso único al Artista ",
      "Metricas exclusivas del Artista",
      "Sin acceso a comparativas",
    ],
  },
};

const PlanCard = ({
  plan,
  onSelect,
  formatPrice,
  isPopular = false,
}) => (
  <div
    className={`plan-card ${isPopular ? "plan-card-popular" : "plan-card-normal"}`}
    onClick={onSelect}
  >
    {isPopular && (
      <div className="plan-popular-tag">
        MÁS POPULAR
      </div>
    )}
    <div className="plan-card-header">
      <h3 className="plan-name">{plan.name}</h3>
      <span className="plan-free-tag">
        15 DÍAS GRATIS
      </span>
    </div>

    <div className="plan-price-container">
      <span className="plan-currency">USD</span>
      <span className="plan-price">
        {formatPrice(plan.amount)}
      </span>
      <span className="plan-interval">
        {plan.interval}
      </span>
    </div>
    <ul className="plan-features">
      {plan.features.map((feature) => (
        <li key={feature} className="plan-feature-item">
          <Check className="plan-feature-icon" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="btn-gradient"
    >
      Seleccionar Plan
    </button>
  </div>
);

const PaymentPage = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!selectedPlan) {
    return (
      <div className="payment-page-container">
        <div className="payment-page-inner">
          {onClose && (
            <button onClick={onClose} className="payment-modal-close-btn">
              <X size={24} />
            </button>
          )}
          <div className="payment-header">
            {/* Imagen corregida usando el logo local que sí existe */}
            <img
              src="/logo.png"
              alt="Digital Latino"
              className="payment-logo"
            />
            <h1 className="payment-title">
              Elige tu Plan
            </h1>
            <p className="payment-subtitle">
              Accede a todas las funciones premium y maximiza tu impacto.
            </p>
          </div>
          <div className="payment-grid">
            <PlanCard
              plan={PLANS.MONTHLY}
              onSelect={() => setSelectedPlan(PLANS.MONTHLY)}
              formatPrice={formatPrice}
            />
            <PlanCard
              plan={PLANS.YEARLY}
              onSelect={() => setSelectedPlan(PLANS.YEARLY)}
              formatPrice={formatPrice}
              isPopular={true}
            />
            <PlanCard
              plan={PLANS.ARTIST}
              onSelect={() => setSelectedPlan(PLANS.ARTIST)}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page-container">
      <div className="checkout-view-container">
        {onClose && (
          <button onClick={onClose} className="payment-modal-close-btn">
            <X size={24} />
          </button>
        )}
        <div className="payment-header">
          <img
            src="/logo.png"
            alt="Digital Latino"
            className="payment-logo"
          />
          <h1 className="checkout-title">
            Completa tu Suscripción
          </h1>
          <p className="payment-subtitle">Estás a un paso de activar tu cuenta.</p>
        </div>
        
        <div className="checkout-summary">
          <div className="checkout-summary-glow" />
          
          <p className="checkout-summary-title">Total a pagar HOY:</p>
          <p className="checkout-summary-total">$0.00 USD</p>

          <div className="checkout-summary-desc">
            <span className="checkout-summary-free">
              ¡15 días de prueba gratis!
            </span>
            <span>
              Después {formatPrice(selectedPlan.amount)} {selectedPlan.interval}
            </span>
          </div>
          <button
            onClick={() => setSelectedPlan(null)}
            className="checkout-back-btn"
          >
            ← Cambiar de plan
          </button>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm priceId={selectedPlan.id} />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
