import { createContext, useState, useEffect, useContext } from "react";

const themes = {
  light: {
    "--bg-primary": "#f4f6f9",
    "--bg-secondary": "#ffffff",
    "--bg-card": "#ffffff",
    "--text-primary": "#0b2239",
    "--text-secondary": "#5a6a7a",
    "--text-muted": "#9aa5b4",
    "--accent": "#4db8e8",
    "--accent-hover": "#29a8dd",
    "--border": "#e5e8ed",
    "--shadow": "0 4px 24px rgba(11,34,57,0.10)",
    "--shadow-lg": "0 8px 40px rgba(11,34,57,0.15)",
    "--input-bg": "#f8fafc",
    "--nav-bg": "rgba(255,255,255,0.95)",
    "--gradient-animated-1": "#c8d8f0",
    "--gradient-animated-2": "#e8f4fd",
    "--gradient-animated-3": "#dde8f5",
  },
  dark: {
    "--bg-primary": "#0d1117",
    "--bg-secondary": "#161b22",
    "--bg-card": "#1c2128",
    "--text-primary": "#e6edf3",
    "--text-secondary": "#8b949e",
    "--text-muted": "#484f58",
    "--accent": "#58a6ff",
    "--accent-hover": "#79b8ff",
    "--border": "#30363d",
    "--shadow": "0 4px 24px rgba(0,0,0,0.4)",
    "--shadow-lg": "0 8px 40px rgba(0,0,0,0.6)",
    "--input-bg": "#0d1117",
    "--nav-bg": "rgba(22,27,34,0.97)",
    "--gradient-animated-1": "#0d1117",
    "--gradient-animated-2": "#161b22",
    "--gradient-animated-3": "#1c2128",
  },
  "blue-night": {
    "--bg-primary": "#060e1c",
    "--bg-secondary": "#0b1629",
    "--bg-card": "#0f1e36",
    "--text-primary": "#cde4f8",
    "--text-secondary": "#7aaed6",
    "--text-muted": "#3a5a7a",
    "--accent": "#4db8e8",
    "--accent-hover": "#74caf0",
    "--border": "#1a2d47",
    "--shadow": "0 4px 24px rgba(0,20,60,0.5)",
    "--shadow-lg": "0 8px 40px rgba(0,20,60,0.7)",
    "--input-bg": "#0b1629",
    "--nav-bg": "rgba(6,14,28,0.98)",
    "--gradient-animated-1": "#060e1c",
    "--gradient-animated-2": "#0d1e36",
    "--gradient-animated-3": "#071628",
  },
};

export const translations = {
  fr: {
    login: "Connexion", register: "Inscription", logout: "Déconnexion",
    home: "Accueil", cart: "Panier", categories: "Catégories",
    slogan: "La marketplace de confiance au Cameroun",
    welcome: "Bonjour",
    addToCart: "Ajouter au panier", outOfStock: "Rupture de stock",
    seeProfile: "Voir le profil", products: "Produits",
    noProducts: "Aucun produit disponible",
    yourCart: "Votre panier", emptyCart: "Votre panier est vide",
    total: "Total", checkout: "Commander", backHome: "Accueil", remove: "Supprimer",
    orderSummary: "Récapitulatif", confirmOrder: "Confirmer la commande",
    cancel: "Annuler", processing: "Validation...",
    payment: "Paiement", payNow: "Payer maintenant",
    phoneNumber: "Numéro MoMo", paymentSuccess: "Paiement effectué avec succès !",
    orderConfirmed: "Commande confirmée !", thankYou: "Merci pour votre achat.",
    orderNumber: "N° commande", amountPaid: "Montant payé",
    username: "Nom d'utilisateur", password: "Mot de passe", email: "Email",
    phone: "Téléphone", address: "Adresse", companyName: "Nom de l'entreprise",
    loginTitle: "Connexion", registerTitle: "Créer un compte",
    loginBtn: "Se connecter", registerBtn: "S'inscrire",
    contactTitle: "Contacter le support", contactName: "Votre nom",
    contactEmail: "Votre email", contactMessage: "Votre message",
    contactSend: "Envoyer", contactSuccess: "Message envoyé !",
    notifications: "Notifications", noNotifications: "Aucune notification",
    newOrder: "Nouvelle commande", lowStock: "Stock faible",
    orderConfirmedNotif: "Commande confirmée", markAllRead: "Tout marquer lu",
    supplierProfile: "Profil fournisseur", publishedProducts: "Produits publiés",
    addProduct: "Ajouter un produit",
    theme: "Thème", themeLight: "Clair", themeDark: "Sombre", themeBlueNight: "Bleu nuit",
    language: "Langue", search: "Rechercher...", price: "Prix",
    inStock: "En stock", category: "Catégorie", back: "Retour",
    by: "Par", postedOn: "Ajouté le", quantity: "Quantité",
  },
  en: {
    login: "Login", register: "Sign up", logout: "Logout",
    home: "Home", cart: "Cart", categories: "Categories",
    slogan: "The trusted marketplace in Cameroon",
    welcome: "Hello",
    addToCart: "Add to cart", outOfStock: "Out of stock",
    seeProfile: "View profile", products: "Products",
    noProducts: "No products available",
    yourCart: "Your cart", emptyCart: "Your cart is empty",
    total: "Total", checkout: "Checkout", backHome: "Home", remove: "Remove",
    orderSummary: "Order summary", confirmOrder: "Confirm order",
    cancel: "Cancel", processing: "Processing...",
    payment: "Payment", payNow: "Pay now",
    phoneNumber: "MoMo number", paymentSuccess: "Payment successful!",
    orderConfirmed: "Order confirmed!", thankYou: "Thank you for your purchase.",
    orderNumber: "Order #", amountPaid: "Amount paid",
    username: "Username", password: "Password", email: "Email",
    phone: "Phone", address: "Address", companyName: "Company name",
    loginTitle: "Login", registerTitle: "Create account",
    loginBtn: "Log in", registerBtn: "Sign up",
    contactTitle: "Contact support", contactName: "Your name",
    contactEmail: "Your email", contactMessage: "Your message",
    contactSend: "Send", contactSuccess: "Message sent!",
    notifications: "Notifications", noNotifications: "No notifications",
    newOrder: "New order", lowStock: "Low stock",
    orderConfirmedNotif: "Order confirmed", markAllRead: "Mark all read",
    supplierProfile: "Supplier profile", publishedProducts: "Published products",
    addProduct: "Add product",
    theme: "Theme", themeLight: "Light", themeDark: "Dark", themeBlueNight: "Blue night",
    language: "Language", search: "Search...", price: "Price",
    inStock: "In stock", category: "Category", back: "Back",
    by: "By", postedOn: "Added on", quantity: "Quantity",
  },
};

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("camebuy-theme") || "light");
  const [lang, setLang] = useState(() => localStorage.getItem("camebuy-lang") || "fr");

  useEffect(() => {
    const vars = themes[theme] || themes.light;
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("camebuy-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("camebuy-lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations.fr[key] ?? key;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, lang, setLang, t, themes: Object.keys(themes) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
