import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { registerFournisseur } from "../services/api";
import { HomeIcon, Upload, X, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nom_fournisseur: "",
    telephone: "",
    adresse: "",
    photo: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: "Format non supporté. Utilisez JPG, PNG ou GIF.", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "La taille du fichier ne doit pas dépasser 5 MB.", type: "error" });
      return;
    }

    setFormData((prev) => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      const res = await registerFournisseur(submitData);
      localStorage.setItem("access", res.tokens.access);
      localStorage.setItem("refresh", res.tokens.refresh);

      const email = formData.email;
      setMessage({
        text: `Inscription réussie ! Un email de confirmation a été envoyé à ${email}. Vous serez notifié dès que votre compte sera validé par l'administrateur (24-48h).`,
        type: "success"
      });
      setTimeout(() => navigate("/login"), 4000);
    } catch (error) {
      console.error("Erreur inscription :", error.response?.data || error.message);
      setMessage({
        text: error.response?.data?.error || "Erreur lors de l'inscription. Vérifiez les informations.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: "username",         type: "text",     placeholder: "Nom d'utilisateur",  icon: User,  required: true },
    { name: "email",            type: "email",    placeholder: "Adresse email",       icon: Mail,  required: true },
    { name: "nom_fournisseur",  type: "text",     placeholder: "Nom du fournisseur",  icon: User,  required: true },
    { name: "telephone",        type: "text",     placeholder: "Téléphone",           icon: Phone, required: true },
    { name: "adresse",          type: "text",     placeholder: "Adresse (optionnel)", icon: MapPin,required: false },
  ];

  return (
    <div className="reg-page">
      <div className="reg-card">
        {/* Left panel */}
        <div className="reg-left">
          <div className="reg-left-content">
            <div className="reg-brand">🛍️ CAMEBUY</div>
            <h1>Rejoignez la marketplace</h1>
            <p>Créez votre espace fournisseur et commencez à vendre dès aujourd'hui.</p>
            <Link to="/login" className="reg-login-link">
              Déjà un compte ? Se connecter →
            </Link>
          </div>
        </div>

        {/* Right panel */}
        <div className="reg-right">
          <button className="reg-home-btn" onClick={() => navigate("/")}>
            <HomeIcon size={18} />
          </button>

          <div className="reg-form-wrap">
            <h2 className="reg-title">Inscription Fournisseur</h2>
            <p className="reg-sub">Remplissez le formulaire pour créer votre compte</p>

            <form onSubmit={handleSubmit} className="reg-form" encType="multipart/form-data">
              {/* Text fields */}
              {fields.map(({ name, type, placeholder, icon: Icon, required }) => (
                <div className="reg-field" key={name}>
                  <div className="reg-input-wrap">
                    <Icon size={15} className="reg-input-icon" />
                    <input
                      type={type}
                      name={name}
                      className="reg-input"
                      placeholder={placeholder}
                      value={formData[name]}
                      onChange={handleInputChange}
                      required={required}
                    />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div className="reg-field">
                <div className="reg-input-wrap">
                  <Lock size={15} className="reg-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="reg-input reg-input--padded"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="reg-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Photo upload */}
              <div className="reg-field">
                <label className="reg-photo-label">Photo de profil (optionnel)</label>
                {previewUrl ? (
                  <div className="reg-preview">
                    <img src={previewUrl} alt="Aperçu" className="reg-preview-img" />
                    <button type="button" className="reg-remove-photo" onClick={handleRemovePhoto}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="reg-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={22} className="reg-upload-icon" />
                    <span>Cliquer pour ajouter une photo</span>
                    <small>JPG, PNG, GIF — Max 5 MB</small>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  className="reg-hidden-input"
                />
              </div>

              {/* Message */}
              {message.text && (
                <p className={`reg-message reg-message--${message.type}`}>
                  {message.text}
                </p>
              )}

              <button type="submit" className="reg-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="reg-spinner-wrap">
                    <span className="reg-spinner" /> Inscription...
                  </span>
                ) : (
                  "S'inscrire"
                )}
              </button>

              <p className="reg-redirect">
                Déjà un compte ?{" "}
                <Link to="/login" className="reg-link">Se connecter</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
