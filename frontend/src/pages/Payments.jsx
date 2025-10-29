// src/pages/Paiement.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Payments.css";

function Payments() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [total, setTotal] = useState(0);

  const API_URL = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access");

  useEffect(() => {
    // Récupérer les détails de la commande
    const fetchCommande = async () => {
      try {
        const res = await axios.get(`${API_URL}/commandes/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
        setError("Impossible de récupérer la commande.");
      }
    };
    fetchCommande();
  }, [orderId]);

  const handlePaiement = async () => {
    setLoading(true);
    setError("");
    try {
      // Appel à ton endpoint MTN MoMo sandbox
      const res = await axios.post(
        `${API_URL}/paiements/`,
        { montant: total, numero: "2376xxxxxxx", reference: `Commande ${orderId}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setSuccess(true);
      } else {
        setError("Échec du paiement.");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de traiter le paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paiement-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>
      <h2>🧾 Paiement de la commande #{orderId}</h2>

      <p>Total à payer : <strong>{total.toLocaleString()} FCFA</strong></p>

      {error && <div className="paiement-error">{error}</div>}
      {success && <div className="paiement-success">✅ Paiement effectué avec succès !</div>}

      {!success && (
        <button
          className="btn-pay-now"
          onClick={handlePaiement}
          disabled={loading}
        >
          {loading ? "Paiement en cours..." : "Payer maintenant"}
        </button>
      )}
    </div>
  );
}

export default Payments;
