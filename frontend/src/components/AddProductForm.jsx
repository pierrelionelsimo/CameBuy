import { useState, useEffect, useRef } from "react";
import { createProduit, getCategories } from "../services/api";
import { Upload, X, Package, Tag, DollarSign, Layers, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import "./AddProductForm.css";

function AddProductForm({ onProductAdded }) {
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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Erreur récupération catégories :", err);
        setMessage({ text: "Impossible de charger les catégories.", type: "error" });
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (loading) return;
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      const newProduct = await createProduit(data);
      setMessage({ text: "Produit publié avec succès !", type: "success" });
      setFormData({ nom: "", description: "", prix: "", stock: "", categorie: "", image: null });
      setImagePreview(null);
      if (onProductAdded) onProductAdded(newProduct);
    } catch (err) {
      console.error("Erreur création produit :", err);
      setMessage({ text: "Erreur lors de la création du produit.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apf-container">
      <div className="apf-card">
        {/* Header */}
        <div className="apf-header">
          <div className="apf-header-icon">
            <Package size={22} />
          </div>
          <div>
            <h2 className="apf-title">Nouveau produit</h2>
            <p className="apf-subtitle">Remplissez les informations ci-dessous</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="apf-form" encType="multipart/form-data">

          {/* Nom */}
          <div className="apf-field">
            <label className="apf-label">
              <Tag size={14} className="apf-label-icon" />
              Nom du produit
            </label>
            <input
              className="apf-input"
              name="nom"
              placeholder="Ex : Chaussures Nike Air"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="apf-field">
            <label className="apf-label">
              <Layers size={14} className="apf-label-icon" />
              Description
            </label>
            <textarea
              className="apf-textarea"
              name="description"
              placeholder="Décrivez votre produit en quelques mots..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Prix + Stock */}
          <div className="apf-row">
            <div className="apf-field">
              <label className="apf-label">
                <DollarSign size={14} className="apf-label-icon" />
                Prix (FCFA)
              </label>
              <div className="apf-input-wrap">
                <input
                  className="apf-input"
                  name="prix"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.prix}
                  onChange={handleChange}
                  required
                />
                <span className="apf-input-suffix">FCFA</span>
              </div>
            </div>

            <div className="apf-field">
              <label className="apf-label">
                <Layers size={14} className="apf-label-icon" />
                Stock disponible
              </label>
              <input
                className="apf-input"
                name="stock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className="apf-field">
            <label className="apf-label">
              <ChevronDown size={14} className="apf-label-icon" />
              Catégorie
            </label>
            <div className="apf-select-wrap">
              <select
                className="apf-select"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                required
              >
                <option value="">— Choisir une catégorie —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="apf-select-arrow" />
            </div>
          </div>

          {/* Upload image */}
          <div className="apf-field">
            <label className="apf-label">
              <Upload size={14} className="apf-label-icon" />
              Image du produit
            </label>

            {imagePreview ? (
              <div className="apf-preview">
                <img src={imagePreview} alt="Aperçu" className="apf-preview-img" />
                <button
                  type="button"
                  className="apf-remove-img"
                  onClick={handleRemoveImage}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                className={`apf-dropzone ${dragOver ? "apf-dropzone--active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={28} className="apf-dropzone-icon" />
                <p className="apf-dropzone-text">Glisser-déposer ou <span>cliquer</span></p>
                <p className="apf-dropzone-hint">JPG, PNG, WEBP — Max 5 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="apf-hidden-input"
                />
              </div>
            )}
          </div>

          {/* Message */}
          {message.text && (
            <div className={`apf-message apf-message--${message.type}`}>
              {message.type === "success"
                ? <CheckCircle size={16} />
                : <AlertCircle size={16} />
              }
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="apf-submit" disabled={loading}>
            {loading ? (
              <span className="apf-spinner-wrap">
                <span className="apf-spinner" /> Création en cours...
              </span>
            ) : (
              "Publier le produit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProductForm;
