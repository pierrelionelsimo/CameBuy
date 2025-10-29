import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Category.css";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Category() {
  const { id } = useParams(); // <-- récupère l’ID de catégorie
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get(`/categories/${id}/products/`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Erreur chargement catégorie:", err));
  }, [id]);

  return (
    <div className="category-page">
      <h2>Produits de la catégorie</h2>
      <div className="category-products">
        {products.length > 0 ? (
          products.map((p) => <ProductCard key={p.id} produit={p} />)
        ) : (
          <p>Aucun produit trouvé pour cette catégorie.</p>
        )}
      </div>
    </div>
  );
}

export default Category;
