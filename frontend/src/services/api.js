import axios from "axios";

console.log("API URL :", import.meta.env.VITE_API_URL);
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Injecte automatiquement le token JWT sur toutes les requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===================== AUTHENTIFICATION FOURNISSEUR =====================

export const registerFournisseur = async (data) => {
  try {
    const res = await api.post("/auth/fournisseur/register/", data);
    return res.data;
  } catch (error) {
    console.error("Erreur enregistrement fournisseur :", error.response?.data || error.message);
    throw error;
  }
};

export const loginFournisseur = async (data) => {
  try {
    const res = await api.post("/auth/fournisseur/login/", data);
    return res.data;
  } catch (error) {
    console.error("Erreur connexion fournisseur :", error.response?.data || error.message);
    throw error;
  }
};

// ===================== PRODUITS =====================

export const createProduit = async (produitData) => {
  try {
    const res = await api.post("/produits/", produitData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur création produit :", err.response?.data || err.message);
    throw err;
  }
};

export const getProduits = async (options = {}) => {
  try {
    const res = await api.get("/produits/", options);
    return res.data;
  } catch (error) {
    console.error("Erreur récupération produits :", error.response?.data || error.message);
    throw error;
  }
};

export const getProduitsByCategorie = async (categorieId) => {
  try {
    const res = await api.get(`/produits/?categorie=${categorieId}`);
    return res.data;
  } catch (error) {
    console.error("Erreur récupération produits par catégorie :", error.response?.data || error.message);
    throw error;
  }
};

// ===================== CATEGORIES =====================

export const getCategories = async () => {
  try {
    const res = await api.get("/categories/");
    return res.data;
  } catch (error) {
    console.error("Erreur récupération catégories :", error.response?.data || error.message);
    throw error;
  }
};

// ===================== COMMANDES =====================

export const createCommande = async () => {
  try {
    const res = await api.post("/passer-commande/");
    return res.data;
  } catch (err) {
    console.error("Erreur création commande :", err.response?.data || err.message);
    throw err;
  }
};

export const getCommandes = async () => {
  try {
    const res = await api.get("/commandes/");
    return res.data;
  } catch (err) {
    console.error("Erreur récupération commandes :", err.response?.data || err.message);
    throw err;
  }
};

// ===================== PAIEMENTS =====================

export const getPaiements = async () => {
  try {
    const res = await api.get("/paiements/");
    return res.data;
  } catch (err) {
    console.error("Erreur récupération paiements :", err.response?.data || err.message);
    throw err;
  }
};

// ===================== MTN MOMO =====================

export const initiateMomoPayment = async (data) => {
  try {
    const res = await api.post("/momo/init/", data);
    return res.data;
  } catch (err) {
    console.error("Erreur initialisation paiement MoMo :", err.response?.data || err.message);
    throw err;
  }
};

export const checkMomoStatus = async (transactionId) => {
  try {
    const res = await api.get(`/momo/status/?transaction_id=${transactionId}`);
    return res.data;
  } catch (err) {
    console.error("Erreur vérification statut MoMo :", err.response?.data || err.message);
    throw err;
  }
};

export default api;
