import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/api";
import "./CategoryList.css";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Erreur récupération catégories :", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="cl-skeleton-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="cl-skeleton-card" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="cl-empty">
        <p>Aucune catégorie disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <section className="cl-container">
      <div className="cl-header">
        <h2 className="cl-title">Nos Catégories</h2>
        <p className="cl-subtitle">Explorez notre sélection de produits</p>
      </div>

      <div className="cl-grid">
        {categories.map((cat, index) => {
          const imageUrl = cat.image || "/images/default-category.jpg";
          return (
            <Link
              key={`cat-${cat.id}`}
              // ✅ FIX : on passe cat.id comme slug, cohérent avec
              // la route /categories/:slug ET le filtre ?categorie=ID du backend
              to={`/categories/${cat.id}`}
              className="cl-card"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div
                className="cl-card-bg"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              <div className="cl-card-overlay" />
              <div className="cl-card-content">
                <span className="cl-card-name">{cat.nom}</span>
                <span className="cl-card-arrow">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryList;
