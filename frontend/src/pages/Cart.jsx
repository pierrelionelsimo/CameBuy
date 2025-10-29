// src/pages/Cart.jsx
import { useContext, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import OrderModal from "../pages/OrderModal"; // <-- modale de commande
import "./Cart.css";

function Cart() {
  const { cart, addToCart, removeFromCart, removeAllOfItem } =
    useContext(CartContext);
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);

  // ✅ Calcul total (prix * quantité)
  const total = cart.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  return (
    <div className="cart-container">
      <button className="btn-hom" onClick={() => navigate("/")}>
        ← Retour
      </button>

      <h2>🛒 Mon Panier</h2>

      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.nom}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>

                <div className="cart-item-details">
                  <h3>
                    {item.nom}{" "}
                    <span className="quantity">×{item.quantity}</span>
                  </h3>
                  <p className="price">
                    {(item.prix * item.quantity).toLocaleString()} FCFA
                  </p>
                </div>

                <div className="cart-actions-inline">
                  <button
                    className="btn-minus"
                    onClick={() => removeFromCart(item)}
                  >
                    −
                  </button>
                  <span className="qty">{item.quantity}</span>
                  <button
                    className="btn-plus"
                    onClick={() => addToCart(item)}
                  >
                    +
                  </button>
                  <button
                    className="btn-remove"
                    onClick={() => removeAllOfItem(item)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-footer">
            <div className="cart-total">
              Total : <strong>{total.toLocaleString()} FCFA</strong>
            </div>

            <div className="cart-actions">
              <button
                className="btn-checkout"
                onClick={() => setShowOrderModal(true)}
                disabled={cart.length === 0}
              >
                Commander
              </button>
            </div>
          </div>
        </>
      )}

      {/* --- Modale de commande --- */}
      {showOrderModal && (
        <OrderModal cart={cart} onClose={() => setShowOrderModal(false)} />
      )}
    </div>
  );
}

export default Cart;
