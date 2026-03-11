import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduitsByCategorie, getCategories } from "../services/api";
import ProductCard from "../components/ProductCard";
import { HomeIcon, ChevronLeft } from "lucide-react";
import "./Category.css";

function Category() {
  const { slug } = useParams();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorieNom, setCategorieNom] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const categories = await getCategories();

        const categorie = categories.find(
          (cat) =>
            cat.id.toString() === slug ||
            cat.slug === slug ||
            cat.nom?.toLowerCase() === slug?.toLowerCase()
        );

        if (!categorie) {
          setCategorieNom("Catégorie introuvable");
          setLoading(false);
          return;
        }

        setCategorieNom(categorie.nom);
        const produitsFiltres = await getProduitsByCategorie(categorie.id);
        setProduits(produitsFiltres || []);
      } catch (err) {
        console.error("Erreur récupération données :", err);
        setProduits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <div className="cat-page">
      {/* Top bar */}
      <div className="cat-topbar">
        <button className="cat-back-btn" onClick={() => navigate("/")}>
          <ChevronLeft size={18} />
          Accueil
        </button>
      </div>

      <div className="cat-header">
        <h1 className="cat-title">
          {loading ? "Chargement..." : categorieNom || "Catégorie"}
        </h1>
        {!loading && (
          <p className="cat-count">
            {produits.length} produit{produits.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div className="cat-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cat-skeleton-card" />
          ))}
        </div>
      ) : produits.length === 0 ? (
        <div className="cat-empty">
          <p className="cat-empty-title">Aucun produit dans cette catégorie</p>
          <button className="cat-home-btn" onClick={() => navigate("/")}>
            <HomeIcon size={16} />
            Retour à l'accueil
          </button>
        </div>
      ) : (
        <div className="cat-grid">
          {produits.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Category;
