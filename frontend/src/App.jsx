// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./components/Header.css"; 
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import PaiementPage from "./pages/PaiementPage";
import ConfirmationPage from "./pages/ConfirmationPage";


function App() {
  //  On garde ici le fournisseur connecté en mémoire (état global du front)
  const [fournisseur, setFournisseur] = useState(null);

  //  Charger le fournisseur dès que l'application démarre
  useEffect(() => {
    const storedFournisseur = localStorage.getItem("fournisseur");
    if (storedFournisseur) {
      setFournisseur(JSON.parse(storedFournisseur));
    }
  }, []);

  //  Écouter les changements dans le localStorage (utile quand on se connecte/déconnecte)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFournisseur = localStorage.getItem("fournisseur");
      if (storedFournisseur) {
        setFournisseur(JSON.parse(storedFournisseur));
      } else {
        setFournisseur(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div>
      {/* 🔹 Le header reçoit le fournisseur connecté */}
      <Header fournisseur={fournisseur} setFournisseur={setFournisseur} />

      <div className="container">
        <Routes>
          <Route path="/paiement" element={<PaiementPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />

          {/* 🔹 Page d'accueil (publique) */}
          <Route path="/" element={<Home fournisseur={fournisseur} />} />

          <Route path="/categories/:id" element={<Category />} />
          <Route path="/cart" element={<Cart />} />

          {/* 🔹 Authentification fournisseur */}
          <Route path="/login" element={<Login setFournisseur={setFournisseur} />} />
          <Route path="/register" element={<Register setFournisseur={setFournisseur} />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
