// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header({ fournisseur, setFournisseur }) {
  const navigate = useNavigate();

  // 🔹 Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("fournisseur");
    setFournisseur(null);
    navigate("/login");
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo">
        <Link to="/">🛍️ CAMEBUY</Link>
        <p className="header-slogan">La marketplace qui vous correspond</p>
      </div>

      {/* 🔹 Texte central */}
      <div className="header-center-text">
        
        <h1>Bienvenue là où chaque produit a sa place… et la vôtre aussi.</h1>
        <p>Des offres irrésistibles, pour un plaisir d’achat sans compromis. 🛒</p>
        <p>Découvrez des produits qui bougent au rythme de vos envies.</p>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        {!fournisseur ? (
          <>
            <Link to="/" className="nav-link">Accueil</Link>
            <Link to="/login" className="nav-link">Connexion</Link>
            <Link to="/register" className="nav-link">Inscription</Link>
          </>
        ) : (
          <>
            
            <span className="welcome-msg">
              👋 Bonjour, <strong>{fournisseur.nom || fournisseur.username}</strong>
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
