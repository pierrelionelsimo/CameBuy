import { useContext, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import OrderModal from "../pages/OrderModal";
import { Minus, Plus, X, ShoppingCart, ArrowLeft } from "lucide-react";
import "./Cart.css";

function Cart() {
  const { cart, addToCart, removeFromCart, removeAllOfItem } = useContext(CartContext);
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <button className="cart-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Retour
          </button>
          <div className="cart-title-wrap">
            <ShoppingCart size={22} />
            <h2>Mon Panier</h2>
            {cart.length > 0 && (
              <span className="cart-count-badge">{cart.length}</span>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={48} className="cart-empty-icon" />
            <p className="cart-empty-title">Votre panier est vide</p>
            <p className="cart-empty-sub">Découvrez nos produits et ajoutez-en !</p>
            <button className="cart-shop-btn" onClick={() => navigate("/")}>
              Parcourir les produits
            </button>
          </div>
        ) : (
          <>
            {/* Liste */}
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

                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.nom}</h3>
                    <p className="cart-item-unit">
                      {Number(item.prix).toLocaleString()} FCFA / unité
                    </p>
                    <p className="cart-item-total">
                      {(item.prix * item.quantity).toLocaleString()} FCFA
                    </p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-qty-controls">
                      <button
                        className="cart-qty-btn"
                        onClick={() => removeFromCart(item)}
                        aria-label="Diminuer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => addToCart(item)}
                        aria-label="Augmenter"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      className="cart-remove-btn"
                      onClick={() => removeAllOfItem(item)}
                      aria-label="Supprimer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-amount">
                  {total.toLocaleString()} FCFA
                </span>
              </div>

              <button
                className="cart-checkout-btn"
                onClick={() => setShowOrderModal(true)}
              >
                Commander
              </button>
            </div>
          </>
        )}
      </div>

      {showOrderModal && (
        <OrderModal cart={cart} onClose={() => setShowOrderModal(false)} />
      )}
    </div>
  );
}

export default Cart;
