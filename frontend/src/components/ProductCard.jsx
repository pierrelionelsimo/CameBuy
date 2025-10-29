// src/components/ProductCard.jsx
import React, { useContext } from "react";
import "./ProductCard.css";
import { CartContext } from "../contexts/CartContext";
//import { Calendar } from "lucide-react";

function ProductCard({ produit }) {
  const { addToCart } = useContext(CartContext);

  if (!produit) return null;

  const imageSrc = produit.image || "/default-image.png";

  /* Formatage de la date d’ajout
  const dateAjout = produit.date_ajout
    ? new Date(produit.date_ajout).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date inconnue";
    */

  return (
    <div className="product-card">
      {/* Image */}
      <div className="product-image-container">
        <img src={imageSrc} alt={produit.nom || "Produit"} className="product-image" />
      </div>

      {/* Contenu principal */}
      <div className="product-content">
        <h3 className="product-name">{produit.nom || "Nom non disponible"}</h3>
        <p className="product-price">{produit.prix ? `${produit.prix} FCFA` : "Prix non disponible"}</p>
        <p className="product-description">
          {produit.description || "Pas de description"}
        </p>

        {/* Date d’ajout 
        <div className="product-date">
          <Calendar className="calendar-icon" size={16} />
          <span>Ajouté le {dateAjout}</span>
        </div>
    */}

        {/* Bouton */}
        {produit.stock > 0 ? (
          <button className="btn-add" onClick={() => addToCart(produit)}>
            Ajouter au panier
          </button>
        ) : (
          <button className="btn-disabled" disabled>
            Rupture de stock
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
