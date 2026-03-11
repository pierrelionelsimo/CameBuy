import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import PaiementPage from "./pages/PaiementPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import { WhatsAppButton, ContactWidget } from "./components/FloatingWidgets";
import AdminPanel from "./pages/AdminPanel";
import NotificationsPage from "./pages/NotificationsPage";
import "./App.css";

// ── Garde admin : redirige vers /login si pas is_admin ───
function AdminGuard({ children }) {
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const hasToken = !!localStorage.getItem("access");
  if (!hasToken || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [fournisseur, setFournisseur] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("fournisseur");
    if (stored) {
      try { setFournisseur(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("fournisseur");
      try { setFournisseur(stored ? JSON.parse(stored) : null); } catch { setFournisseur(null); }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const hideHeaderRoutes = ["/login", "/register", "/paiement", "/confirmation", "/admin-panel", "/notifications"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="app-root">
      {shouldShowHeader && (
        <div className="main-wrapper">
          <Header fournisseur={fournisseur} setFournisseur={setFournisseur} />
          <div className="cercle-image-container">
            <img src="/images/panier.jpg" alt="panier" />
          </div>
        </div>
      )}

      <div className="container">
        <Routes>
          {/* ✅ :slug = cat.id passé depuis CategoryList */}
          <Route path="/categories/:slug" element={<Category />} />
          <Route path="/paiement" element={<PaiementPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/" element={<Home fournisseur={fournisseur} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login setFournisseur={setFournisseur} />} />
          <Route path="/register" element={<Register setFournisseur={setFournisseur} />} />
          <Route path="/notifications" element={<NotificationsPage fournisseur={fournisseur} />} />
          <Route path="/admin-panel" element={<AdminGuard><AdminPanel /></AdminGuard>} />
        </Routes>
      </div>

      <Footer />

      {/* Floating widgets (toujours visibles) */}
      <WhatsAppButton />
      <ContactWidget />
    </div>
  );
}

export default App;
