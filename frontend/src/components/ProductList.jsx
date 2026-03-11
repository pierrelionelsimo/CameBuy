import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProduits, getCategories } from "../services/api";
import "./ProductList.css";

function ProductList() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produitsData, categoriesData] = await Promise.all([
          getProduits(),
          getCategories(),
        ]);

        setProduits(produitsData || []);
        setCategories([
          { id: "all", nom: "Toutes les catégories" },
          ...(categoriesData || []),
        ]);
      } catch (err) {
        console.error("Erreur récupération données :", err);
        setProduits([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProduits =
    selectedCategory === "all"
      ? produits
      : produits.filter(
          (p) => p.categorie?.toString() === selectedCategory.toString()
        );

  if (loading) {
    return (
      <div className="pl-skeleton-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="pl-skeleton-card" />
        ))}
      </div>
    );
  }

  if (produits.length === 0) {
    return (
      <div className="pl-empty">
        <p className="pl-empty-title">Aucun produit disponible</p>
        <p className="pl-empty-sub">Vérifiez que votre backend Django est actif.</p>
      </div>
    );
  }

  return (
    <div className="pl-container">
      {/* Filtre */}
      <div className="pl-filter-bar">
        <div className="pl-filter-left">
          <label htmlFor="cat-select" className="pl-filter-label">
            Catégorie
          </label>
          <div className="pl-select-wrap">
            <select
              id="cat-select"
              className="pl-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="pl-count">
          {filteredProduits.length} produit{filteredProduits.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Grille produits */}
      {filteredProduits.length === 0 ? (
        <div className="pl-no-result">
          <p>Aucun produit dans cette catégorie.</p>
          <button className="pl-reset-btn" onClick={() => setSelectedCategory("all")}>
            Voir tous les produits
          </button>
        </div>
      ) : (
        <div className="pl-grid">
          {filteredProduits.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
