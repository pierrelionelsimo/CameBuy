import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initiateMomoPayment, checkMomoStatus } from "../services/api";
import { NotificationContext } from "../contexts/NotificationContext";
import { ThemeContext } from "../contexts/ThemeContext";
import api from "../services/api";
import {
  Phone, CreditCard, CheckCircle,
  AlertCircle, Loader, ArrowLeft, ShieldCheck
} from "lucide-react";
import "./PaiementPage.css";

// Regex numéro MTN Cameroun : 2376XXXXXXXX ou 6XXXXXXXX
const PHONE_REGEX = /^(2376\d{8}|6\d{8})$/;

function PaiementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(ThemeContext);

  const { commandeId, total, fournisseurs_notifies } = location.state || {};

  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initiated, setInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [pollStatus, setPollStatus] = useState("pending"); // pending | success | failed
  const [pollCount, setPollCount] = useState(0);

  // ── Guard: commande invalide ──────────────────────────
  if (!commandeId || !total) {
    return (
      <div className="pay-page">
        <div className="pay-guard">
          <AlertCircle size={44} className="pay-guard-icon" />
          <h2>Commande invalide</h2>
          <p>Aucune commande trouvée. Retournez au panier.</p>
          <button className="pay-back-btn" onClick={() => navigate("/cart")}>
            <ArrowLeft size={15} /> Retour au panier
          </button>
        </div>
      </div>
    );
  }

  // ── Polling statut MoMo ───────────────────────────────
  useEffect(() => {
    if (!transactionId || pollStatus !== "pending") return;
    if (pollCount >= 24) { // 24 × 5s = 2 minutes max
      setPollStatus("failed");
      setError("Délai d'attente dépassé. Vérifiez votre solde MoMo et réessayez.");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const result = await checkMomoStatus(transactionId);
        const st = result.status?.toLowerCase();

        if (st === "successful" || st === "success") {
          setPollStatus("success");
          clearInterval(interval);

          // ── Mettre à jour la commande côté Django ────
          try {
            await api.patch(`/commandes/${commandeId}/statut/`, {
              statut: "payee",
              transaction_id: transactionId,
            });
          } catch (e) {
            console.warn("Impossible de mettre à jour le statut commande :", e);
          }

          // ── Notifier le fournisseur (via contexte) ───
          // En production : le backend ferait du WebSocket / SSE.
          // Ici on simule côté front pour les fournisseurs connectés.
          addNotification({
            type: "success",
            role: "fournisseur",
            message: `🛍️ Nouvelle commande #${commandeId} reçue — ${Number(total).toLocaleString()} FCFA`,
          });

          // Notif client
          addNotification({
            type: "success",
            role: "client",
            message: `✅ Paiement confirmé pour la commande #${commandeId}`,
          });

          // ── Redirect vers confirmation ───────────────
          setTimeout(() => {
            navigate("/confirmation", {
              state: { commandeId, total, transaction_id: transactionId },
            });
          }, 1200);

        } else if (st === "failed" || st === "rejected") {
          setPollStatus("failed");
          clearInterval(interval);
          setError("Paiement refusé. Vérifiez votre solde MoMo.");

          addNotification({
            type: "error",
            role: "client",
            message: `❌ Paiement échoué pour la commande #${commandeId}`,
          });
        }

        setPollCount((c) => c + 1);
      } catch (err) {
        console.error("Erreur polling MoMo :", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, pollStatus, pollCount]);

  // ── Initier le paiement ───────────────────────────────
  const handlePayer = async () => {
    setError("");

    const clean = numero.replace(/\s/g, "");
    if (!PHONE_REGEX.test(clean)) {
      setError("Numéro invalide. Format : 6XXXXXXXX ou 2376XXXXXXXX");
      return;
    }

    setLoading(true);
    try {
      const data = await initiateMomoPayment({
        montant: total,
        numero: clean,
        reference: `Commande #${commandeId}`,
      });

      setTransactionId(data.transaction_id);
      setInitiated(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Erreur lors de l'initiation du paiement. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pay-page">
      <div className="pay-card">

        {/* ── Header ── */}
        <div className="pay-header">
          <div className="pay-header-icon">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="pay-title">Paiement MoMo</h2>
            <p className="pay-order-ref">Commande #{commandeId}</p>
          </div>
        </div>

        {/* ── Montant ── */}
        <div className="pay-amount-box">
          <span className="pay-amount-label">Montant à payer</span>
          <span className="pay-amount-value">
            {Number(total).toLocaleString()} <span className="pay-amount-currency">FCFA</span>
          </span>
        </div>

        {/* ── Statut polling ── */}
        {initiated && pollStatus === "pending" && (
          <div className="pay-status pay-status--pending">
            <Loader size={16} className="pay-spin" />
            <div>
              <p className="pay-status-title">Paiement en cours…</p>
              <p className="pay-status-sub">
                Validez la demande sur votre téléphone MoMo.<br />
                Vérification automatique toutes les 5 secondes.
              </p>
            </div>
          </div>
        )}

        {pollStatus === "success" && (
          <div className="pay-status pay-status--success">
            <CheckCircle size={16} />
            <p className="pay-status-title">Paiement validé ! Redirection…</p>
          </div>
        )}

        {pollStatus === "failed" && (
          <div className="pay-status pay-status--failed">
            <AlertCircle size={16} />
            <p className="pay-status-title">Paiement échoué</p>
          </div>
        )}

        {/* ── Formulaire ── */}
        {!initiated && (
          <>
            <div className="pay-field">
              <label className="pay-label">
                <Phone size={13} />
                Numéro MTN MoMo
              </label>
              <div className="pay-input-wrap">
                <input
                  type="tel"
                  className="pay-input"
                  placeholder="6XXXXXXXX ou 2376XXXXXXXX"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  maxLength={13}
                  onKeyDown={(e) => e.key === "Enter" && handlePayer()}
                />
              </div>
              <span className="pay-hint">
                Entrez votre numéro MTN MoMo pour recevoir la demande de paiement
              </span>
            </div>

            {error && (
              <div className="pay-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              className="pay-submit"
              onClick={handlePayer}
              disabled={loading || !numero}
            >
              {loading ? (
                <span className="pay-loading">
                  <Loader size={15} className="pay-spin" /> Traitement…
                </span>
              ) : (
                <>Payer {Number(total).toLocaleString()} FCFA</>
              )}
            </button>

            <div className="pay-secure">
              <ShieldCheck size={13} />
              <span>Paiement sécurisé · MTN MoMo sandbox</span>
            </div>
          </>
        )}

        {/* ── Erreur après initiation ── */}
        {initiated && error && (
          <div className="pay-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Bouton retour ── */}
        {!initiated && (
          <button className="pay-back" onClick={() => navigate("/cart")}>
            <ArrowLeft size={14} /> Retour au panier
          </button>
        )}
      </div>
    </div>
  );
}

export default PaiementPage;
