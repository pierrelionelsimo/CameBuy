import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import api from "../services/api";
import { X, ShoppingBag, AlertCircle, Loader } from "lucide-react";
import "./OrderModal.css";

function OrderModal({ cart, onClose }) {
  const { removeAllOfItem } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const itemsPayload = cart.map((item) => ({
        produit_id: item.id,
        quantite: item.quantity,
      }));

      const response = await api.post("/commandes/", {
        total,
        items: itemsPayload,
      });

      if (response.status === 201 || response.status === 200) {
        // Vider le panier
        cart.forEach((item) => removeAllOfItem(item));
        const commandeId = response.data.id;
        onClose();
        // Rediriger vers la page de paiement
        navigate("/paiement", { state: { commandeId, total } });
      } else {
        setError("Erreur lors de la création de la commande.");
      }
    } catch (err) {
      console.error("Erreur création commande :", err);
      setError(
        err.response?.data?.detail ||
          "Impossible de confirmer la commande. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="om-overlay" onClick={onClose}>
      <div className="om-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="om-header">
          <div className="om-header-left">
            <ShoppingBag size={20} />
            <h2 className="om-title">Récapitulatif</h2>
          </div>
          <button className="om-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="om-empty">Votre panier est vide.</p>
        ) : (
          <>
            {/* Liste des articles */}
            <ul className="om-list">
              {cart.map((item) => (
                <li key={item.id} className="om-item">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.nom}
                    className="om-item-img"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                  <div className="om-item-info">
                    <span className="om-item-name">{item.nom}</span>
                    <span className="om-item-qty">×{item.quantity}</span>
                  </div>
                  <span className="om-item-price">
                    {(item.prix * item.quantity).toLocaleString()} FCFA
                  </span>
                </li>
              ))}
            </ul>

            {/* Séparateur + Total */}
            <div className="om-total-row">
              <span className="om-total-label">Total de la commande</span>
              <span className="om-total-amount">
                {total.toLocaleString()} FCFA
              </span>
            </div>

            {/* Erreur */}
            {error && (
              <div className="om-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Bouton confirmer */}
            <button
              className="om-confirm-btn"
              onClick={handleConfirmOrder}
              disabled={loading}
            >
              {loading ? (
                <span className="om-spinner-wrap">
                  <Loader size={16} className="om-spin" />
                  Validation...
                </span>
              ) : (
                "Confirmer la commande"
              )}
            </button>

            <button className="om-cancel-btn" onClick={onClose}>
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderModal;
