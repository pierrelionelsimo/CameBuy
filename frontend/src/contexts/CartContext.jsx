// src/contexts/CartContext.jsx
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // ✅ Charger depuis localStorage au démarrage
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Sauvegarder automatiquement dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ➕ Ajouter un produit (ou incrémenter si déjà présent)
  const addToCart = (produit) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === produit.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === produit.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...produit, quantity: 1 }];
      }
    });
  };

  // ➖ Retirer un produit (décrémente ou supprime)
  const removeFromCart = (produit) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === produit.id);
      if (!existingItem) return prevCart;

      if (existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === produit.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter((item) => item.id !== produit.id);
      }
    });
  };

  // ❌ Supprimer complètement un produit du panier
  const removeAllOfItem = (produit) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== produit.id));
  };

  // 🧹 Vider complètement le panier
  const clearCart = () => {
    setCart([]);
  };

  // 🧮 Obtenir le nombre total d'articles (pour le badge rouge)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 💰 Obtenir le total global du panier
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.prix * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeAllOfItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
