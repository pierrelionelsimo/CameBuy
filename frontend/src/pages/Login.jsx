import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginFournisseur } from "../services/api";
import { HomeIcon, User, Lock, Eye, EyeOff, Shield, AlertTriangle, Clock } from "lucide-react";
import "./Login.css";

function Login({ setFournisseur }) {
  const [username, setUsername]           = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [warning, setWarning]             = useState("");
  const [success, setSuccess]             = useState(false);
  const [showAdminHint, setShowAdminHint] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setWarning("");

    if (!username.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginFournisseur({ username, password });

      localStorage.setItem("access",  data.tokens.access);
      localStorage.setItem("refresh", data.tokens.refresh);

      // ── Admin détecté ───────────────────────────────
      if (data.is_admin) {
        localStorage.setItem("is_admin", "true");
        localStorage.setItem("admin", JSON.stringify(data.admin));
        localStorage.removeItem("fournisseur");
        setSuccess(true);
        setTimeout(() => navigate("/admin-panel"), 600);
        return;
      }

      // ── Fournisseur ─────────────────────────────────
      localStorage.removeItem("is_admin");
      localStorage.removeItem("admin");
      if (data.fournisseur) {
        localStorage.setItem("fournisseur", JSON.stringify(data.fournisseur));
        setFournisseur(data.fournisseur);
      }
      if (data.statut === "en_attente") setWarning(data.message);
      setSuccess(true);
      setTimeout(() => navigate("/"), 800);

    } catch (err) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("fournisseur");
      localStorage.removeItem("is_admin");

      const resp = err.response?.data;
      const st   = err.response?.status;
      if (st === 401)                            setError("Identifiants incorrects.");
      else if (st === 403 && resp?.statut === "refuse")   setError(`Demande refusée.${resp.detail ? " " + resp.detail : ""}`);
      else if (st === 403 && resp?.statut === "suspendu") setError(`Compte suspendu.${resp.detail ? " " + resp.detail : ""}`);
      else if (st === 403)                       setError(resp?.error || "Accès refusé.");
      else                                       setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── Panneau gauche ── */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-brand">
              <span className="login-brand-came">CAME</span>
              <span className="login-brand-buy">BUY</span>
              <span className="login-brand-dot">.</span>
            </div>
            <h1>Bon retour parmi nous</h1>
            <p>Gérez vos produits, suivez vos commandes et développez votre activité au Cameroun.</p>
            <Link to="/register" className="login-register-link">
              Créer un compte fournisseur →
            </Link>
          </div>

          {/* ── Lien admin discret ── */}
          <div className="login-admin-area">
            <button
              className="login-admin-btn"
              onClick={() => setShowAdminHint(v => !v)}
              type="button"
            >
              <Shield size={11} />
              Accès administrateur
            </button>
            {showAdminHint && (
              <div className="login-admin-tooltip">
                Connectez-vous avec votre compte <strong>superuser Django</strong>.
                Vous serez automatiquement redirigé vers le panneau d'administration.
              </div>
            )}
          </div>
        </div>

        {/* ── Panneau droit ── */}
        <div className="login-right">
          <button className="login-home-btn" onClick={() => navigate("/")} type="button">
            <HomeIcon size={18} />
          </button>

          <div className="login-form-wrap">
            <h2 className="login-title">Connexion</h2>
            <p className="login-sub">Fournisseur ou administrateur</p>

            <form onSubmit={handleSubmit} className="login-form">

              <div className="login-field">
                <label className="login-label">Nom d'utilisateur</label>
                <div className="login-input-wrap">
                  <User size={15} className="login-input-icon" />
                  <input type="text" className="login-input"
                    placeholder="Votre identifiant"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading || success}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Mot de passe</label>
                <div className="login-input-wrap">
                  <Lock size={15} className="login-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input login-input--padded"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading || success}
                    required
                  />
                  <button type="button" className="login-eye-btn"
                    onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="login-msg login-msg--error">
                  <AlertTriangle size={13} /> <span>{error}</span>
                </div>
              )}
              {warning && !error && (
                <div className="login-msg login-msg--warning">
                  <Clock size={13} /> <span>{warning}</span>
                </div>
              )}
              {success && !error && (
                <div className="login-msg login-msg--success">
                  ✅ Connexion réussie ! Redirection…
                </div>
              )}

              <button type="submit" className="login-submit-btn" disabled={loading || success}>
                {loading
                  ? <span className="login-spinner-wrap"><span className="login-spinner" /> Connexion…</span>
                  : success ? "Redirection…" : "Se connecter"
                }
              </button>

              <p className="login-redirect">
                Pas encore de compte ?{" "}
                <Link to="/register" className="login-link">S'inscrire gratuitement</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
