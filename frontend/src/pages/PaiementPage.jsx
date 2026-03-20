import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initiateMomoPayment, checkMomoStatus } from "../services/api";
import { Phone, CreditCard, CheckCircle, AlertCircle, Loader, ArrowLeft } from "lucide-react";
import "./PaiementPage.css";

// 🔧 Remplace par ton vrai numéro WhatsApp support (format international sans +)
const SUPPORT_WHATSAPP = "237691000000";

const OPERATORS = [
  { id: "mtn",     label: "MTN",    emoji: "🟡", color: "#FFCC00" },
  { id: "orange",  label: "Orange", emoji: "🟠", color: "#FF6600" },
  { id: "nexttel", label: "Nexttel",emoji: "🔵", color: "#003399" },
];

function PaiementPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { commandeId, total } = location.state || {};

  const [numeroMobile, setNumeroMobile]   = useState("");
  const [operator, setOperator]           = useState("mtn");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [status, setStatus]               = useState("en attente");
  const [showWA, setShowWA]               = useState(false);

  // Formatage : garde uniquement les chiffres, max 9
  const handlePhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setNumeroMobile(digits);
  };

  // Commande invalide
  if (!commandeId || !total) {
    return (
      <div className="pp-page">
        <div className="pp-card pp-card--error">
          <div className="pp-error-icon"><AlertCircle size={36} /></div>
          <p>Commande invalide. Veuillez revenir au panier.</p>
          <button className="pp-back-btn" onClick={() => navigate("/cart")}>
            <ArrowLeft size={16} /> Retour au panier
          </button>
        </div>
      </div>
    );
  }

  const handlePaiement = async () => {
    setError("");
    setShowWA(false);

    // Validation : on accepte 9 chiffres (on préfixe 237 côté envoi)
    if (!/^\d{9}$/.test(numeroMobile)) {
      setError("Numéro invalide — entrez 9 chiffres (ex: 677 000 000).");
      return;
    }

    const fullNumber = `237${numeroMobile}`;

    try {
      setLoading(true);
      const data = await initiateMomoPayment({
        montant:   total,
        numero:    fullNumber,
        reference: `Commande #${commandeId}`,
      });
      setTransactionId(data.transaction_id);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Erreur lors de l'initiation du paiement.";
      setError(msg);
      setShowWA(true);
    } finally {
      setLoading(false);
    }
  };

  // Polling statut toutes les 5 secondes (identique à l'original)
  useEffect(() => {
    if (!transactionId || status === "success" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const result = await checkMomoStatus(transactionId);
        if (result.status === "success") {
          setStatus("success");
          clearInterval(interval);
          navigate("/confirmation", {
            state: { commandeId, total, transaction_id: transactionId },
          });
        } else if (result.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
          setError("Paiement échoué. Veuillez réessayer ou contacter le support.");
          setShowWA(true);
        }
      } catch (err) {
        console.error("Erreur vérification paiement :", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, status, commandeId, total, navigate]);

  const waMsg  = encodeURIComponent(
    `Bonjour, j'ai un problème avec mon paiement MoMo pour la commande #${commandeId}. Pouvez-vous m'aider ?`
  );
  const waLink = `https://wa.me/${SUPPORT_WHATSAPP}?text=${waMsg}`;

  // Étape courante pour l'indicateur
  const currentStep = status === "success" ? 3
    : success ? 2
    : 1;

  return (
    <div className="pp-page">
      {/* Fond animé */}
      <div className="pp-bg">
        <div className="pp-glow pp-glow--1" />
        <div className="pp-glow pp-glow--2" />
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="pp-particle"
            style={{
              left: `${Math.random() * 100}%`,
              width:  `${4 + Math.random() * 5}px`,
              height: `${4 + Math.random() * 5}px`,
              animationDuration: `${9 + Math.random() * 11}s`,
              animationDelay:    `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="pp-card">
        {/* ── En-tête ── */}
        <div className="pp-header">
          <div className="pp-logo-pill">
            <div className="pp-logo-square">M</div>
            <span>MTN MoMo Pay</span>
          </div>
          <h2>Paiement sécurisé</h2>
          <p>Commande <strong>#{commandeId}</strong></p>
        </div>

        {/* ── Montant ── */}
        <div className="pp-amount-bar">
          <span className="pp-amount-label">Montant à payer</span>
          <span className="pp-amount-value">
            <span className="pp-currency">FCFA</span>
            {Number(total).toLocaleString("fr-FR")}
          </span>
        </div>

        {/* ── Indicateur d'étapes ── */}
        <div className="pp-steps">
          {["Infos", "Validation", "Confirmé"].map((label, i) => {
            const n = i + 1;
            const cls = n < currentStep ? "done" : n === currentStep ? "active" : "pending";
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div className="pp-step-wrap">
                  <div className={`pp-step-circle pp-step-circle--${cls}`}>
                    {n < currentStep ? "✓" : n}
                  </div>
                  <span className={`pp-step-label pp-step-label--${cls}`}>{label}</span>
                </div>
                {i < 2 && <div className={`pp-step-line ${n < currentStep ? "pp-step-line--done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* ── Corps ── */}
        <div className="pp-body">

          {/* Choix opérateur */}
          <div className="pp-field">
            <label className="pp-label">📡 Opérateur</label>
            <div className="pp-operators">
              {OPERATORS.map((op) => (
                <div
                  key={op.id}
                  className={`pp-op ${operator === op.id ? "pp-op--sel" : ""}`}
                  onClick={() => !success && setOperator(op.id)}
                >
                  <span className="pp-op-emoji">{op.emoji}</span>
                  <span className="pp-op-name">{op.label}</span>
                  <div className="pp-op-bar" style={{ background: op.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Numéro téléphone */}
          <div className="pp-field">
            <label className="pp-label">
              <Phone size={14} /> Numéro MoMo
            </label>
            <div className="pp-input-wrap">
              <div className="pp-prefix">🇨🇲 <span>+237</span></div>
              <input
                type="tel"
                inputMode="numeric"
                className="pp-input"
                placeholder="6XX XXX XXX"
                value={numeroMobile}
                onChange={handlePhone}
                disabled={success}
                maxLength={9}
              />
            </div>
            <span className="pp-hint">9 chiffres après l'indicatif +237</span>
          </div>

          {/* Badge sécurité */}
          <div className="pp-secure-badge">
            🔒 <span>Paiement chiffré SSL — données sécurisées</span>
          </div>

          {/* ── Messages d'état ── */}
          {error && (
            <div className="pp-msg pp-msg--error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && status !== "success" && status !== "failed" && (
            <div className="pp-msg pp-msg--pending">
              <Loader size={16} className="pp-spin" />
              <span>Paiement initié — en attente de validation MoMo...</span>
            </div>
          )}

          {status === "success" && (
            <div className="pp-msg pp-msg--success">
              <CheckCircle size={16} />
              <span>Paiement validé avec succès !</span>
            </div>
          )}

          {/* ── Panneau d'aide WhatsApp ── */}
          {showWA && (
            <div className="pp-wa-panel">
              <div className="pp-wa-header">
                <span className="pp-wa-icon">❌</span>
                <div>
                  <strong>Problème avec MoMo ?</strong>
                  <p>Contactez notre support directement</p>
                </div>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="pp-wa-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contacter le support MoMo
              </a>
              <button
                className="pp-retry-btn"
                onClick={() => { setError(""); setShowWA(false); setSuccess(false); setTransactionId(null); setStatus("en attente"); }}
              >
                🔄 Réessayer le paiement
              </button>
            </div>
          )}

          {/* ── Bouton principal ── */}
          <button
            className="pp-submit-btn"
            onClick={handlePaiement}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span className="pp-spinner" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Payer {Number(total).toLocaleString("fr-FR")} FCFA
              </>
            )}
          </button>

          <button className="pp-back-btn" onClick={() => navigate("/cart")}>
            <ArrowLeft size={16} /> Retour au panier
          </button>
        </div>

        <div className="pp-footer">
          🔒 Paiement sécurisé · MTN MoMo Cameroun
        </div>
      </div>
    </div>
  );
}

export default PaiementPage;