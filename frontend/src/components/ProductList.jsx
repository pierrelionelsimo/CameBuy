// src/components/ProductList.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProduits } from "../services/api";
import "./ProductList.css";

function ProductList() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const data = await getProduits();
        const produitsData = data || [];
        setProduits(produitsData);

        // Extraire les catégories uniques
        const uniqueCategories = [
          "Tous",
          ...new Set(produitsData.map((p) => p.categorie))
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Erreur récupération produits :", err);
        setProduits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  // Filtrer les produits selon la catégorie sélectionnée
  const filteredProduits =
    selectedCategory === "Tous"
      ? produits
      : produits.filter((p) => p.categorie === selectedCategory);

  if (loading) return <p>Chargement des produits...</p>;
  if (produits.length === 0) return <p>Aucun produit disponible.</p>;

  return (
    <div className="product-list-container">
      {/* Filtre par catégorie */}
      <div className="filter-category">
        <label htmlFor="category-select">Filtrer par catégorie : </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage des produits filtrés */}
      <div className="product-list">
        {filteredProduits.map((p) => (
          <ProductCard key={p.id} produit={p} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
