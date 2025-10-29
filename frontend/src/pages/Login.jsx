// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { loginFournisseur } from "../services/api";

function Login({ setFournisseur }) {  // ✅ On récupère la fonction depuis App.jsx
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ======================================================================
  // 🧩  Soumission du formulaire de connexion
  // ======================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    try {
      // 🔹 Appel API pour se connecter
      const data = await loginFournisseur({ username, password });

      // 🔹 Vérifier la présence des tokens
      if (!data?.tokens?.access || !data?.tokens?.refresh) {
        throw new Error("Tokens manquants dans la réponse du serveur.");
      }

      // 🔹 Nettoyer d’éventuels anciens tokens invalides
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // 🔹 Stocker les nouveaux tokens
      localStorage.setItem("access", data.tokens.access);
      localStorage.setItem("refresh", data.tokens.refresh);

      // 🔹 Stocker les infos du fournisseur connecté
      if (data.fournisseur) {
        localStorage.setItem("fournisseur", JSON.stringify(data.fournisseur));
        setFournisseur(data.fournisseur); // ✅ met à jour immédiatement le header
      }

      setMessage("✅ Connexion réussie !");
      console.log("Fournisseur connecté :", data.fournisseur);

      // 🔹 Rediriger vers la page d’accueil après un court délai
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Erreur connexion :", error.response?.data || error.message);

      if (error.response?.status === 401) {
        setMessage("❌ Identifiants invalides.");
      } else if (error.response?.status === 403) {
        setMessage("⛔ Accès refusé.");
      } else {
        setMessage("⚠️ Erreur de connexion au serveur.");
      }

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("fournisseur");
    }
  };

  // ======================================================================
  // 🧩  Rendu du composant
  // ======================================================================
  return (
    <div className="login-container">
      <h2>Connexion </h2>

      <form onSubmit={handleSubmit} className="login-form">
       
        <div className="username-field">
            <label>👤</label>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
          />
        </div>
        <div className="password-field">
            <label>🔑</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
        </div>

        <button type="submit">Se connecter</button>
        <p className="redirect">si vous n'avez pas de compte,
        <Link to="/register" className="link">
              s'inscrire
        </Link></p>
      </form>

      {message && <p className="login-message">{message}</p>}
    </div>
  );
}

export default Login;
