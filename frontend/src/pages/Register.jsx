// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { registerFournisseur } from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomFournisseur, setNomFournisseur] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerFournisseur({
        username,
        email,
        password,
        nom_fournisseur: nomFournisseur,
        telephone,
        adresse,
      });

      // Stockage des tokens
      localStorage.setItem("access", res.tokens.access);
      localStorage.setItem("refresh", res.tokens.refresh);

      setMessage("Inscription réussie ! Redirection…");

      // Redirection vers Home
      navigate("/");
    } catch (error) {
      console.error("Erreur inscription :", error.response?.data || error.message);
      setMessage(
        error.response?.data?.error ||
          "Erreur lors de l'inscription. Vérifie les informations."
      );
    }
  };

  return (
    <div className="register-container">
      <h2>Inscription </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nom du fournisseur"
          value={nomFournisseur}
          onChange={(e) => setNomFournisseur(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Adresse (optionnel)"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
        />
        <button type="submit">S'inscrire</button>

        <p className="redirect">si vous avez un compte,
        <Link to="/login" className="link">
              se connecter
        </Link></p>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
