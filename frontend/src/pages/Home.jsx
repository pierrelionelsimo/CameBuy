import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { getProduits, getCategories } from "../services/api";
import AddProductForm from "../components/AddProductForm";
import CategoryList from "../components/CategoryList";
import {
  ShoppingCart, Plus, ChevronLeft, ChevronRight,
  Star, TrendingUp, Users, Package, ArrowRight,
  Tag, Zap, X, Quote, Shield, Truck, Headphones
} from "lucide-react";
import "./Home.css";

// ─── Données statiques ────────────────────────────────────
const TESTIMONIALS = [
  { id: 1, name: "Marie Nguessong", city: "Yaoundé", role: "Cliente", rating: 5, avatar: "MN", color: "#4db8e8", product: "Sac à main premium", text: "CAMEBUY a transformé ma façon de faire mes achats. Livraison rapide, produits conformes aux photos. Je commande chaque semaine !" },
  { id: 2, name: "Paul Mbarga", city: "Douala", role: "Fournisseur", rating: 5, avatar: "PM", color: "#f59e0b", product: "Électronique", text: "En tant que fournisseur, mes ventes ont triplé en 2 mois. La plateforme est intuitive et les clients sont sérieux." },
  { id: 3, name: "Cécile Atangana", city: "Bafoussam", role: "Cliente", rating: 4, avatar: "CA", color: "#10b981", product: "Cosmétiques", text: "Le paiement MoMo est une révolution ! Plus besoin de sortir d'argent liquide, tout se fait depuis mon téléphone." },
  { id: 4, name: "Rodrigue Fopa", city: "Garoua", role: "Client", rating: 5, avatar: "RF", color: "#8b5cf6", product: "Chaussures sport", text: "Service client au top — mon problème résolu en 45 minutes. Une marketplace vraiment pensée pour le Cameroun !" },
  { id: 5, name: "Aïcha Mahamat", city: "Ngaoundéré", role: "Cliente", rating: 5, avatar: "AM", color: "#ef4444", product: "Mode & vêtements", text: "Les prix sont imbattables et les vendeurs vérifiés. C'est devenu mon réflexe avant chaque achat, sans hésitation." },
  { id: 6, name: "Jean Fosso", city: "Maroua", role: "Fournisseur", rating: 5, avatar: "JF", color: "#06b6d4", product: "Artisanat local", text: "Grâce à CAMEBUY, mes produits artisanaux touchent maintenant des clients de tout le pays. Merci infiniment !" },
];

const PROMOS = [
  { id: 1, label: "FLASH", title: "Soldes d'été", sub: "Jusqu'à -40% sur l'électronique", color: "#ef4444", bg: "rgba(239,68,68,0.12)", emoji: "⚡" },
  { id: 2, label: "NOUVEAU", title: "Livraison gratuite", sub: "Pour toute commande > 15 000 FCFA", color: "#10b981", bg: "rgba(16,185,129,0.12)", emoji: "🚚" },
  { id: 3, label: "OFFRE", title: "Devenez fournisseur", sub: "Inscription gratuite — vendez dès aujourd'hui", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", emoji: "🏪", cta: true },
  { id: 4, label: "PROMO", title: "Paiement MoMo sécurisé", sub: "100% de vos transactions protégées", color: "#4db8e8", bg: "rgba(77,184,232,0.12)", emoji: "🔒" },
];

const STATS = [
  { icon: <Users size={24} />, value: "1 200+", label: "Clients satisfaits", color: "#4db8e8" },
  { icon: <Package size={24} />, value: "3 500+", label: "Produits disponibles", color: "#f59e0b" },
  { icon: <TrendingUp size={24} />, value: "250+", label: "Fournisseurs actifs", color: "#10b981" },
  { icon: <Star size={24} />, value: "4.8/5", label: "Note moyenne", color: "#8b5cf6" },
];

const FEATURES = [
  { icon: <Shield size={22} />, title: "Paiements sécurisés", desc: "MoMo intégré, transactions chiffrées et protégées" },
  { icon: <Truck size={22} />, title: "Livraison rapide", desc: "Partout au Cameroun, suivi en temps réel" },
  { icon: <Headphones size={22} />, title: "Support 24/7", desc: "Une équipe disponible pour vous aider" },
  { icon: <Shield size={22} />, title: "Fournisseurs vérifiés", desc: "Chaque vendeur est contrôlé avant publication" },
];

// ─── Modal AddProduct ─────────────────────────────────────
function ProductModal({ onClose, onProductAdded }) {
  return (
    <div className="h-modal-overlay" onClick={onClose}>
      <div className="h-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="h-modal-close" onClick={onClose}><X size={18} /></button>
        <AddProductForm onProductAdded={onProductAdded} />
      </div>
    </div>
  );
}

// ─── Promo Ticker (défilement horizontal) ─────────────────
function PromoBanner({ onClose }) {
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % PROMOS.length);
      setAnimKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const promo = PROMOS[idx];

  return (
    <div className="h-promo-bar" style={{ "--pc": promo.color, "--pb": promo.bg }}>
      <div className="h-promo-inner" key={animKey}>
        <span className="h-promo-emoji">{promo.emoji}</span>
        <span className="h-promo-badge">{promo.label}</span>
        <span className="h-promo-text">
          <strong>{promo.title}</strong> — {promo.sub}
        </span>
        {promo.cta && (
          <button className="h-promo-cta" onClick={() => navigate("/register")}>
            S'inscrire gratuitement →
          </button>
        )}
      </div>
      <div className="h-promo-dots">
        {PROMOS.map((_, i) => (
          <span key={i} className={`h-promo-dot${i === idx ? " h-promo-dot--on" : ""}`} onClick={() => setIdx(i)} />
        ))}
      </div>
      <button className="h-promo-close" onClick={onClose}><X size={12} /></button>
    </div>
  );
}

// ─── Testimonial Carousel ─────────────────────────────────
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("next");
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const intervalRef = useRef(null);

  const go = (newIdx, dir) => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setCurrent(newIdx);
  };

  const next = () => go((current + 1) % TESTIMONIALS.length, "next");
  const prev = () => go((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, "prev");

  useEffect(() => {
    if (!paused) intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [paused, current]);

  const t = TESTIMONIALS[current];

  return (
    <section className="h-testimonials">
      <div className="h-section-header">
        <span className="h-section-tag"><Quote size={13} /> Témoignages</span>
        <h2 className="h-section-title">Ce que disent nos utilisateurs</h2>
        <p className="h-section-sub">Plus de 1 200 clients et fournisseurs nous font confiance</p>
      </div>

      <div
        className="h-carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button className="h-car-arrow h-car-arrow--left" onClick={prev}>
          <ChevronLeft size={18} />
        </button>

        {/* Card */}
        <div className={`h-testi-card h-testi-card--${direction}`} key={animKey}>
          {/* Top accent */}
          <div className="h-testi-accent" style={{ background: t.color }} />

          <div className="h-testi-header">
            <div className="h-testi-avatar" style={{ background: t.color }}>
              {t.avatar}
            </div>
            <div className="h-testi-meta">
              <span className="h-testi-name">{t.name}</span>
              <span className="h-testi-role">{t.role} · 📍{t.city}</span>
            </div>
            <div className="h-testi-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14}
                  fill={i < t.rating ? "#f59e0b" : "transparent"}
                  color={i < t.rating ? "#f59e0b" : "#cbd5e1"}
                />
              ))}
            </div>
          </div>

          <blockquote className="h-testi-text">"{t.text}"</blockquote>

          <div className="h-testi-product">
            <Tag size={12} /> <span>{t.product}</span>
          </div>
        </div>

        <button className="h-car-arrow h-car-arrow--right" onClick={next}>
          <ChevronRight size={18} />
        </button>

        {/* Progress bar */}
        <div className="h-car-progress">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`h-car-pip${i === current ? " h-car-pip--active" : ""}`}
              onClick={() => go(i, i > current ? "next" : "prev")}
            />
          ))}
        </div>
      </div>

      {/* Mini cards row — 3 autres témoignages en arrière-plan */}
      <div className="h-testi-mini-row">
        {TESTIMONIALS.filter((_, i) => i !== current).slice(0, 3).map((tst) => (
          <div
            key={tst.id}
            className="h-testi-mini"
            onClick={() => go(TESTIMONIALS.indexOf(tst), "next")}
          >
            <div className="h-testi-mini-avatar" style={{ background: tst.color }}>{tst.avatar}</div>
            <div className="h-testi-mini-body">
              <span className="h-testi-mini-name">{tst.name}</span>
              <p className="h-testi-mini-text">"{tst.text.slice(0, 55)}..."</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HOME ─────────────────────────────────────────────────
function Home({ fournisseur }) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const { cart } = useContext(CartContext);
  const { t } = useContext(ThemeContext);
  const navigate = useNavigate();

  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const isFournisseur = !!fournisseur;

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getProduits({ signal: controller.signal })
      .then((data) => setProduits(data || []))
      .catch((err) => { if (!controller.signal.aborted) console.error(err); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const handleProductAdded = (p) => { setProduits((prev) => [p, ...prev]); setShowAddForm(false); };

  return (
    <div className="h-page">

      {/* ── PROMO BANNER ── */}
      {showPromo && <PromoBanner onClose={() => setShowPromo(false)} />}

      {/* ── HERO ── */}
      <section className={`h-hero${heroVisible ? " h-hero--visible" : ""}`}>
        <div className="h-hero-bg">
          {/* Animated orbs */}
          <div className="h-orb h-orb--1" />
          <div className="h-orb h-orb--2" />
          <div className="h-orb h-orb--3" />
        </div>

        <div className="h-hero-content">
          <div className="h-hero-badge">
            <Zap size={12} fill="currentColor" />
            Marketplace N°1 au Cameroun
          </div>

          <h1 className="h-hero-title">
            Achetez & vendez<br />
            <span className="h-hero-accent">en toute confiance</span>
          </h1>

          <p className="h-hero-sub">
            Des milliers de produits, des fournisseurs vérifiés,
            le paiement MoMo intégré — tout en un seul endroit.
          </p>

          <div className="h-hero-actions">

            {isFournisseur ? (
              <button className="h-btn-secondary" onClick={() => setShowAddForm(true)}>
                <Plus size={15} /> Ajouter un produit
              </button>
            ) : (
              <button className="h-btn-secondary" onClick={() => navigate("/register")}>
                Devenir fournisseur
              </button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="h-stats">
          {STATS.map((s, i) => (
            <div key={i} className="h-stat" style={{ "--sc": s.color, animationDelay: `${0.2 + i * 0.1}s` }}>
              <span className="h-stat-icon">{s.icon}</span>
              <span className="h-stat-val">{s.value}</span>
              <span className="h-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="h-features">
        {FEATURES.map((f, i) => (
          <div key={i} className="h-feature">
            <span className="h-feature-icon">{f.icon}</span>
            <div>
              <h4 className="h-feature-title">{f.title}</h4>
              <p className="h-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── CATÉGORIES ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-section-tag"><Tag size={12} /> Parcourir</span>
          <h2 className="h-section-title">Nos catégories</h2>
        </div>
        <CategoryList />
      </section>

      {/* ── PRODUITS RÉCENTS ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-section-tag"><TrendingUp size={12} /> Tendances</span>
          <h2 className="h-section-title">Produits récents</h2>
          <Link to="/categories" className="h-see-all">Tout voir <ArrowRight size={13} /></Link>
        </div>

        {loading ? (
          <div className="h-skeleton-row">
            {[...Array(4)].map((_, i) => <div key={i} className="h-skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : produits.length === 0 ? (
          <div className="h-empty">
            <Package size={44} opacity={0.18} />
            <p>Aucun produit pour le moment.</p>
          </div>
        ) : (
          <div className="h-products-scroll">
            {produits.slice(0, 8).map((p) => (
              <div key={p.id} className="h-prod-card">
                <div className="h-prod-img">
                  <img src={p.image || "/placeholder.png"} alt={p.nom}
                    onError={(e) => (e.target.src = "/placeholder.png")} />
                  {p.stock === 0 && <span className="h-prod-badge">Épuisé</span>}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="h-prod-badge h-prod-badge--low">Stock limité</span>
                  )}
                </div>
                <div className="h-prod-info">
                  <p className="h-prod-name">{p.nom}</p>
                  <p className="h-prod-price">{Number(p.prix).toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialCarousel />

      {/* ── CTA FOURNISSEUR ── */}
      {!isFournisseur && (
        <section className="h-cta">
          <div className="h-cta-card">
            <div className="h-cta-glow" />
            <div className="h-cta-left">
              <span className="h-cta-emoji">🏪</span>
              <div>
                <h2 className="h-cta-title">Vous êtes commerçant ?</h2>
                <p className="h-cta-sub">
                  Rejoignez nos 250+ fournisseurs et vendez à des milliers de clients
                  à travers tout le Cameroun. Inscription 100% gratuite.
                </p>
              </div>
            </div>
            <Link to="/register" className="h-cta-btn">
              Créer mon espace vendeur <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ── FAB CART ── */}
      <Link to="/cart" className="h-fab-cart" title={t("cart")}>
        <ShoppingCart size={20} />
        {totalItems > 0 && <span className="h-fab-badge">{totalItems > 9 ? "9+" : totalItems}</span>}
      </Link>

      {/* ── FAB ADD (fournisseur) ── */}
      {isFournisseur && (
        <button className="h-fab-add" onClick={() => setShowAddForm(true)} title={t("addProduct")}>
          <Plus size={22} />
        </button>
      )}

      {/* ── MODAL ── */}
      {showAddForm && (
        <ProductModal onClose={() => setShowAddForm(false)} onProductAdded={handleProductAdded} />
      )}
    </div>
  );
}

export default Home;
