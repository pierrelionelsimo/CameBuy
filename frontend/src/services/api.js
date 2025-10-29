// src/services/api.js
import axios from "axios";

// URL de base de ton backend Django
const BASE_URL = "http://127.0.0.1:8000/api";

// Création d'une instance Axios réutilisable
const api = axios.create({
  baseURL: BASE_URL,
});

// Intercepteur pour ajouter automatiquement le token JWT
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
export const getProduits = async () => {
  try {
    const res = await api.get("/produits/");
    return res.data;
  } catch (err) {
    console.error("Erreur récupération produits :", err.response?.data || err.message);
    return [];
  }
};

export const createProduit = async (produitData) => {
  try {
    const token = localStorage.getItem("access");
    if (!token) throw new Error("Aucun token trouvé. Veuillez vous reconnecter.");

    const res = await api.post("/produits/", produitData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error("Erreur création produit :", err.response?.data || err.message);
    throw err;
  }
};

// ===================== CATÉGORIES =====================
export const getCategories = async () => {
  try {
    const res = await api.get("/categories/");
    return res.data;
  } catch (err) {
    console.error("Erreur récupération catégories :", err.response?.data || err.message);
    throw err;
  }
};

// ===================== COMMANDES =====================
// Crée une commande + paiement
export const createCommande = async () => {
  try {
    const res = await api.post("/passer-commande/");
    return res.data; // { message, commande, paiement_id }
  } catch (err) {
    console.error("Erreur création commande :", err.response?.data || err.message);
    throw err;
  }
};

// Récupère toutes les commandes
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
  // data = { montant, numero, reference }
  try {
    const res = await api.post("/momo/init/", data);
    return res.data; // { transaction_id, status, message }
  } catch (err) {
    console.error("Erreur initialisation paiement MoMo :", err.response?.data || err.message);
    throw err;
  }
};

export const checkMomoStatus = async (transactionId) => {
  try {
    const res = await api.get(`/momo/status/?transaction_id=${transactionId}`);
    return res.data; // { transaction_id, status, message }
  } catch (err) {
    console.error("Erreur vérification statut MoMo :", err.response?.data || err.message);
    throw err;
  }
};

export default api;
