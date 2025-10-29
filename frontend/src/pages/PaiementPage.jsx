import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PaiementPage.css";

function PaiementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { commandeId, total } = location.state || {};

  const [numeroMobile, setNumeroMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [status, setStatus] = useState("en attente");

  if (!commandeId || !total) return <p>Commande invalide. Veuillez revenir au panier.</p>;

  const handlePaiement = async () => {
    setError("");
    if (!/^2376\d{8}$/.test(numeroMobile)) {
      setError("Numéro MTN MoMo invalide (ex : 2376XXXXXXXX).");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/momo/init/", {
        montant: total,
        numero: numeroMobile,
        reference: `Commande #${commandeId}`,
      });

      const { transaction_id } = response.data;
      setTransactionId(transaction_id);
      setSuccess(true);

    } catch (err) {
      setError(
        err.response?.data?.error || "Erreur lors de l'initiation du paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Vérification automatique du statut du paiement toutes les 5 secondes ---
  useEffect(() => {
    if (!transactionId || status === "success") return;

    const interval = setInterval(async () => {
      try {
        const result = await api.get(`/momo/status/?transaction_id=${transactionId}`);
        if (result.status === "success") {
          setStatus("success");
          clearInterval(interval);

          // Redirection vers confirmation
          navigate("/confirmation", {
            state: { commandeId, total, transaction_id: transactionId },
          });
        } else if (result.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
          setError("Paiement échoué. Veuillez réessayer.");
        }
      } catch (err) {
        console.error("Erreur vérification paiement :", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, status, commandeId, total, navigate]);

  return (
    <div className="paiement-page">
      <h2>Paiement de la commande #{commandeId}</h2>
      <p>Total à payer : <strong>{total.toLocaleString()} FCFA</strong></p>

      <label>
        Numéro Mobile (MTN MoMo) :
        <input
          type="text"
          placeholder="2376XXXXXXXX"
          value={numeroMobile}
          onChange={(e) => setNumeroMobile(e.target.value)}
          disabled={success}
        />
      </label>

      {error && <div className="paiement-error">{error}</div>}
      {success && status !== "success" && (
        <div className="paiement-success">
          Paiement initié avec succès ! En attente de validation...
        </div>
      )}

      <button
        className="btn-payer"
        onClick={handlePaiement}
        disabled={loading || success}
      >
        {loading ? "Traitement..." : "Payer maintenant"}
      </button>
    </div>
  );
}

export default PaiementPage;
