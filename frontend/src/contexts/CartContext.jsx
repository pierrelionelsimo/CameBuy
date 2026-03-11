import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ➕ Ajouter ou incrémenter
  const addToCart = (produit) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === produit.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === produit.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...produit, quantity: 1 }];
    });
  };

  // ➖ Décrémenter ou supprimer
  const removeFromCart = (produit) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === produit.id);
      if (!existing) return prevCart;
      if (existing.quantity > 1) {
        return prevCart.map((item) =>
          item.id === produit.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter((item) => item.id !== produit.id);
    });
  };

  // ❌ Supprimer complètement un produit
  const removeAllOfItem = (produit) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== produit.id));
  };

  // 🧹 Vider le panier
  const clearCart = () => setCart([]);

  // 🧮 Total articles
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 💰 Total prix
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
