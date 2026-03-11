import { useContext, useState, useRef } from "react";
import { CartContext } from "../contexts/CartContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { NotificationContext } from "../contexts/NotificationContext";
import {
  Calendar, ShoppingCart, PackageX, Phone,
  MapPin, Package, X, Star, BadgeCheck,
  ChevronRight, Store
} from "lucide-react";
import "./ProductCard.css";

// ══════════════════════════════════════════════════════════
// SUPPLIER PROFILE MODAL
// ══════════════════════════════════════════════════════════
function SupplierModal({ fournisseur, produits, onClose }) {
  const { t } = useContext(ThemeContext);
  const photo = fournisseur?.photo || null;
  const nom = fournisseur?.nom || "Fournisseur";
  const initials = nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const fournisseurProduits = produits || [];

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-modal" onClick={(e) => e.stopPropagation()}>

        <button className="sm-close" onClick={onClose}><X size={15} /></button>

        {/* ── Bandeau hero ── */}
        <div className="sm-hero">
          <div className="sm-hero-bg" />
          <div className="sm-avatar-wrap">
            {photo ? (
              <img src={photo} alt={nom} className="sm-avatar-photo"
                onError={(e) => (e.target.style.display = "none")} />
            ) : (
              <div className="sm-avatar-initials">{initials}</div>
            )}
            <span className="sm-online-dot" title="Vendeur actif" />
          </div>
        </div>

        {/* ── Identité ── */}
        <div className="sm-identity">
          <h2 className="sm-name">{nom}</h2>
          <span className="sm-verified">
            <BadgeCheck size={13} /> Vendeur vérifié CAMEBUY
          </span>
        </div>

        {/* ── Infos ── */}
        <div className="sm-info-grid">
          {fournisseur?.telephone && (
            <div className="sm-info-row">
              <Phone size={13} />
              <span>{fournisseur.telephone}</span>
            </div>
          )}
          {fournisseur?.adresse && (
            <div className="sm-info-row">
              <MapPin size={13} />
              <span>{fournisseur.adresse}</span>
            </div>
          )}
          <div className="sm-info-row">
            <Package size={13} />
            <span>
              {fournisseurProduits.length} produit{fournisseurProduits.length !== 1 ? "s" : ""} publiés
            </span>
          </div>
          <div className="sm-info-row">
            <Star size={13} />
            <span>4.8 / 5 · Membre CAMEBUY</span>
          </div>
        </div>

        {/* ── Produits publiés ── */}
        {fournisseurProduits.length > 0 && (
          <div className="sm-products">
            <h3 className="sm-products-title">
              <Store size={14} /> {t("publishedProducts")}
            </h3>
            <div className="sm-products-grid">
              {fournisseurProduits.slice(0, 6).map((p) => (
                <div key={p.id} className="sm-prod">
                  <div className="sm-prod-img">
                    <img
                      src={p.image || "/placeholder.png"}
                      alt={p.nom}
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                  </div>
                  <div className="sm-prod-info">
                    <span className="sm-prod-name">{p.nom}</span>
                    <span className="sm-prod-price">
                      {Number(p.prix).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WhatsApp contact ── */}
        {fournisseur?.telephone && (
          <a
            href={`https://wa.me/${fournisseur.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, je vous contacte via CAMEBUY 🛍️`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sm-wa-btn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contacter sur WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUPPLIER HOVER CHIP (visible au survol de la carte)
// ══════════════════════════════════════════════════════════
function SupplierChip({ fournisseur, onOpenModal }) {
  const nom = fournisseur?.nom || "Vendeur";
  const initials = nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="pc-chip"
      onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
      title={`Profil de ${nom}`}
    >
      {/* Point coloré animé */}
      <span className="pc-chip-dot">
        <span className="pc-chip-dot-ping" />
      </span>

      {/* Avatar initiales */}
      <div className="pc-chip-avatar">{initials}</div>

      {/* Nom */}
      <span className="pc-chip-name">{nom}</span>

      {/* Flèche */}
      <ChevronRight size={11} className="pc-chip-arrow" />

      {/* Tooltip mini */}
      <div className="pc-chip-tooltip">
        <strong>{nom}</strong>
        {fournisseur?.telephone && (
          <span><Phone size={9} /> {fournisseur.telephone}</span>
        )}
        {fournisseur?.adresse && (
          <span><MapPin size={9} /> {fournisseur.adresse}</span>
        )}
        <em>Cliquer pour le profil complet</em>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PRODUCT CARD
// ══════════════════════════════════════════════════════════
function ProductCard({ produit, allProduits = [] }) {
  const { addToCart } = useContext(CartContext);
  const { t } = useContext(ThemeContext);
  const { addNotification } = useContext(NotificationContext);
  const [showModal, setShowModal] = useState(false);
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!produit) return null;

  const imageSrc = produit.image || "/placeholder.png";
  const isInStock = produit.stock > 0;
  const isLowStock = isInStock && produit.stock <= 5;
  const fournisseur = produit.fournisseur || null;

  // Tous les produits du même fournisseur
  const sameFournisseurProduits = fournisseur
    ? allProduits.filter((p) => p.id !== produit.id && p.fournisseur?.id === fournisseur.id)
    : [];

  const dateAjout = produit.cree_le
    ? new Date(produit.cree_le).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  const handleAddToCart = () => {
    if (!isInStock) return;
    addToCart(produit);
    setAdded(true);
    addNotification({
      type: "success",
      role: "client",
      message: `"${produit.nom}" ajouté au panier`,
    });
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <article
        className={`pc-card${isHovered ? " pc-card--hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Badges ── */}
        {!isInStock && <span className="pc-badge pc-badge--out">Rupture</span>}
        {isLowStock && <span className="pc-badge pc-badge--low">Limité</span>}

        {/* ── Image ── */}
        <div className="pc-img-wrap">
          <img
            src={imageSrc}
            alt={produit.nom || "Produit"}
            className="pc-img"
            onError={(e) => (e.target.src = "/placeholder.png")}
          />

          {/* Overlay au hover */}
          <div className="pc-img-overlay" />

          {/* Chip fournisseur — apparaît au hover de la carte */}
          {fournisseur && (
            <div className={`pc-chip-wrap${isHovered ? " pc-chip-wrap--visible" : ""}`}>
              <SupplierChip
                fournisseur={fournisseur}
                onOpenModal={() => setShowModal(true)}
              />
            </div>
          )}
        </div>

        {/* ── Contenu ── */}
        <div className="pc-body">
          <h3 className="pc-name">{produit.nom || "Produit"}</h3>

          {produit.description && (
            <p className="pc-desc">{produit.description}</p>
          )}

          <div className="pc-footer">
            <div className="pc-meta">
              <span className="pc-price">
                {produit.prix
                  ? `${Number(produit.prix).toLocaleString()} FCFA`
                  : "—"}
              </span>
              {dateAjout && (
                <div className="pc-date">
                  <Calendar size={10} />
                  <span>{dateAjout}</span>
                </div>
              )}
            </div>

            {isInStock ? (
              <button
                className={`pc-btn pc-btn--add${added ? " pc-btn--added" : ""}`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={13} />
                <span>{added ? "Ajouté ✓" : t("addToCart")}</span>
              </button>
            ) : (
              <button className="pc-btn pc-btn--out" disabled>
                <PackageX size={13} />
                <span>{t("outOfStock")}</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {/* ── Modal profil fournisseur ── */}
      {showModal && fournisseur && (
        <SupplierModal
          fournisseur={fournisseur}
          produits={[produit, ...sameFournisseurProduits]}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default ProductCard;
