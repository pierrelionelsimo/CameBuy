import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import { getProduits } from "../services/api";
import ProductCard from "../components/ProductCard";
import AddProductForm from "../components/AddProductForm";
import "./Home.css";

function Home() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFournisseur, setIsFournisseur] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const { cart } = useContext(CartContext);

  // ✅ Compte le nombre total d’articles dans le panier
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const data = await getProduits();
        setProduits(data || []);

        const uniqueCategories = [];
        data.forEach((p) => {
          if (p.categorie && !uniqueCategories.find(c => c.id === p.categorie.id)) {
            uniqueCategories.push(p.categorie);
          }
        });
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Erreur récupération produits :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();

    // Vérifier si l’utilisateur est fournisseur
    const access = localStorage.getItem("access");
    if (access) {
      const fournisseur = JSON.parse(localStorage.getItem("fournisseur"));
      if (fournisseur && fournisseur.nom) setIsFournisseur(true);
    }
  }, []);

  return (
    <div className="home-container">
      <div className="cart-link">
        <Link to="/cart" className="cart-link-inner">
          🛒 Panier
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </Link>
      </div>

      {/* Message d’intro dynamique */}
      <div className="intro-banner">
        <h1>Trouvez l’article à votre convenance 🛍️</h1>
        <p>Nos produits prennent vie pour vous séduire !</p>


        </div>

        {/* Animation de chargement */}
        {loading && (
          <div className="loader">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        )}

        {/* Bouton Fournisseur */}
        {!loading && isFournisseur && (
          <div className="actions">
            <button
              className="btn-add-product"
              onClick={() => setShowAddForm(true)}
            >
              + Ajouter un produit
            </button>
          </div>
        )}

        {/* Formulaire modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
              <AddProductForm
                onProductAdded={(newProduct) => {
                  setProduits((prev) => [newProduct, ...prev]);
                  setShowAddForm(false);
                }}
              />
            </div>
          </div>
        )}

        {/* ✅ Section Catégories cliquables */}
        {!loading && categories.length > 0 && (
          <div className="categories-list">
            <h2>Catégories</h2>
            <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={`cat-${cat.id || cat.nom}`}  // ✅ clé toujours unique
                to={`/categories/${cat.id}`}
                className="category-card"
              >
                {cat.nom}
              </Link>
            ))}

            </div>
          </div>
        )}

        {/* Section Produits */}
        {!loading && produits.length > 0 && (
          <section className="products-section">
            <h2>Produits disponibles</h2>
            <div className="products-grid">
              {produits.map((produit) => (
                <div
                  key={`prod-${produit.id}`} // ✅ clé unique et stable
                  className="animated-card"
                >
                  <ProductCard produit={produit} />
                </div>
              ))}

            </div>
          </section>
        )}

        {!loading && produits.length === 0 && (
          <p>Aucun produit disponible.</p>
        )}
      </div>
    );
  }

  export default Home;
