import { useState, useEffect } from "react";
import { createProduit, getCategories } from "../services/api";
import "./AddProductForm.css";

function AddProductForm() {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    categorie: "",
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;
      try {
        const data = await getCategories(token);
        setCategories(data);
      } catch (err) {
        console.error("Erreur récupération catégories :", err);
        setMessage("❌ Impossible de charger les catégories.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("access");
    if (!token) {
      setMessage("⚠️ Tu dois être connecté pour créer un produit !");
      return;
    }
    if (loading) return;
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await createProduit(data, token);
      setMessage("✅ Produit créé avec succès !");
      setFormData({
        nom: "",
        description: "",
        prix: "",
        stock: "",
        categorie: "",
        image: null,
      });
      setImagePreview(null);
    } catch (err) {
      console.error("Erreur création produit :", err);
      setMessage("❌ Erreur lors de la création du produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <form onSubmit={handleSubmit} className="add-product-form" encType="multipart/form-data">
        <h2>🛍️ Publier un nouveau produit</h2>

        <div className="form-group">
          <label>Nom du produit</label>
          <input
            name="nom"
            placeholder="Ex : Chaussures Nike Air"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="Décris ton produit..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Prix (FCFA)</label>
            <input
              name="prix"
              type="number"
              value={formData.prix}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group half">
            <label>Stock disponible</label>
            <input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <select
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group image-upload">
          <label>Image du produit</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Aperçu du produit" />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "⏳ Création en cours..." : "✅ Créer le produit"}
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default AddProductForm;
