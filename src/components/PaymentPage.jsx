import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { useState } from "react";
import { Check, X } from "lucide-react";
import "./PaymentPage.css";

const stripePromise = loadStripe(
  //"pk_test_51SAtWhKFPi4gMQQnl5IahKw9gDsuSYHUGgs3cFuFasveKQIu7TMbIe4fkwOGwzAYovd2DXAuGebBF1qVze0LSPhp00QjNbOjEf" // key test
  "pk_live_51SAtWhKFPi4gMQQnD1IAJpVSeEx9Hgzn0aslq1Q8IrXgtBkZMBx1Gki8ibAA5yMDJb81qc74jfcamZgNjDLKMIpG005doVUTWO" // key live
);

const PLANS = {
  ARTIST_MONTHLY: {
    id: "price_1Sykf4KFPi4gMQQnG3Je9Z83", // ID Real Artist Monthly
    name: "Plan Artista Mensual",
    amount: 99,
    interval: "/mes",
    features: [
      "Acceso único al Artista",
      "Métricas exclusivas del Artista",
      "Panel de control personalizado",
    ],
  },
  ARTIST_ANNUAL: {
    id: "price_1TRa9DKFPi4gMQQnESdHHgjy", // ID Real Artist Annual
    name: "Plan Artista Anual",
    amount: 999,
    interval: "/año",
    features: [
      "Todo lo del plan mensual",
      "Ahorro de 2 meses",
      "Soporte prioritario",
    ],
  },
  PREMIUM_MONTHLY: {
    id: "price_1TRaBPKFPi4gMQQnU5Y8tSDu", // ID Real Premium Monthly
    name: "Plan Premium Mensual",
    amount: 499,
    interval: "/mes",
    features: [
      "Información de todos los artistas",
      "Acceso completo a Charts",
      "Métricas avanzadas y comparativas",
    ],
  },
};

const PlanCard = ({ plan, onSelect, formatPrice, isPopular = false }) => (
  <div
    className={`plan-card ${isPopular ? "plan-card-popular" : "plan-card-normal"}`}
    onClick={onSelect}
  >
    {isPopular && <div className="plan-popular-tag">MÁS POPULAR</div>}
    <div className="plan-card-header">
      <h3 className="plan-name">{plan.name}</h3>
      <span className="plan-free-tag">PRUEBA 24H GRATIS</span>
    </div>

    <div className="plan-price-container">
      <span className="plan-currency">USD</span>
      <span className="plan-price">{formatPrice(plan.amount)}</span>
      <span className="plan-interval">{plan.interval}</span>
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
            <img src="/logo.png" alt="Digital Latino" className="payment-logo" />
            <h1 className="payment-title">Elige tu Plan</h1>
            <p className="payment-subtitle">
              Prueba nuestra plataforma gratis por 24 horas.
            </p>
          </div>
          <div className="payment-grid">
            {/* 1. Plan Artista Mensual */}
            <PlanCard
              plan={PLANS.ARTIST_MONTHLY}
              onSelect={() => setSelectedPlan(PLANS.ARTIST_MONTHLY)}
              formatPrice={formatPrice}
            />
            {/* 2. Plan Artista Anual (Como popular por el descuento) */}
            <PlanCard
              plan={PLANS.ARTIST_ANNUAL}
              onSelect={() => setSelectedPlan(PLANS.ARTIST_ANNUAL)}
              formatPrice={formatPrice}
              isPopular={true}
            />
            {/* 3. Plan Premium Mensual */}
            <PlanCard
              plan={PLANS.PREMIUM_MONTHLY}
              onSelect={() => setSelectedPlan(PLANS.PREMIUM_MONTHLY)}
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
          <img src="/logo.png" alt="Digital Latino" className="payment-logo" />
          <h1 className="checkout-title">Completa tu Suscripción</h1>
          <p className="payment-subtitle">Tu prueba gratuita termina en 24 horas.</p>
        </div>

        <div className="checkout-summary">
          <div className="checkout-summary-glow" />
          <p className="checkout-summary-title">Total a pagar HOY:</p>
          <p className="checkout-summary-total">$0.00 USD</p>

          <div className="checkout-summary-desc">
            <span className="checkout-summary-free">¡24 horas de acceso gratuito!</span>
            <span>
              Después {formatPrice(selectedPlan.amount)} {selectedPlan.interval}
            </span>
          </div>
          <button onClick={() => setSelectedPlan(null)} className="checkout-back-btn">
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