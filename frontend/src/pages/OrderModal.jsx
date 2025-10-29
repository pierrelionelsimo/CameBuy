import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import api from "../services/api"; // Axios avec JWT
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
        // ✅ Vider le panier
        cart.forEach((item) => removeAllOfItem(item));

        const commandeId = response.data.id;

        // 🔁 Redirection automatique vers la page de paiement
        navigate("/paiement", { state: { commandeId, total } });

        // Fermer la modal après redirection
        onClose();
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
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          ×
        </button>

        <h2>Récapitulatif de la commande</h2>

        {cart.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <>
            <ul className="order-items">
              {cart.map((item) => (
                <li key={item.id} className="order-item">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.nom}
                    className="order-item-image"
                  />
                  <div className="order-item-info">
                    <span>{item.nom}</span>
                    <span>×{item.quantity}</span>
                    <span>
                      {(item.prix * item.quantity).toLocaleString()} FCFA
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="order-total">
              Total : <strong>{total.toLocaleString()} FCFA</strong>
            </div>

            {error && <div className="order-error">{error}</div>}

            <div className="order-actions">
              <button
                className="btn-confirm-order"
                onClick={handleConfirmOrder}
                disabled={loading}
              >
                {loading ? "Validation..." : "Confirmer la commande"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderModal;
