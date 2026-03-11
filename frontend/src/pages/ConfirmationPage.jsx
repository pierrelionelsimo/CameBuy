import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import "./ConfirmationPage.css";

function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { commandeId, total, transaction_id } = location.state || {};

  return (
    <div className="conf-page">
      <div className="conf-card">
        <div className="conf-icon-wrap">
          <CheckCircle size={52} className="conf-icon" />
        </div>

        <h1 className="conf-title">Commande confirmée !</h1>
        <p className="conf-sub">
          Votre paiement a été validé avec succès. Merci pour votre achat.
        </p>

        {commandeId && (
          <div className="conf-details">
            <div className="conf-detail-row">
              <span className="conf-detail-label">Numéro de commande</span>
              <span className="conf-detail-value">#{commandeId}</span>
            </div>
            {total && (
              <div className="conf-detail-row">
                <span className="conf-detail-label">Montant payé</span>
                <span className="conf-detail-value">
                  {Number(total).toLocaleString()} FCFA
                </span>
              </div>
            )}
            {transaction_id && (
              <div className="conf-detail-row">
                <span className="conf-detail-label">Transaction MoMo</span>
                <span className="conf-detail-value conf-detail-value--mono">
                  {transaction_id}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="conf-actions">
          <button
            className="conf-btn conf-btn--primary"
            onClick={() => navigate("/")}
          >
            <Home size={16} />
            Retour à l'accueil
          </button>
          <button
            className="conf-btn conf-btn--secondary"
            onClick={() => navigate("/cart")}
          >
            <ShoppingBag size={16} />
            Mon panier
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
