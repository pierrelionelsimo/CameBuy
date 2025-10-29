import { useLocation } from "react-router-dom";

function ConfirmationPage() {
  const location = useLocation();
  const { commandeId, total, transaction_id } = location.state || {};

  if (!commandeId) {
    return <p>Aucune commande à confirmer.</p>;
  }

  return (
    <div>
      <h2>Commande #{commandeId} confirmée</h2>
      <p>Total : {total.toLocaleString()} FCFA</p>
      <p>Transaction ID : {transaction_id}</p>
      <p>Vous pouvez suivre le statut de votre paiement dans votre espace utilisateur.</p>
    </div>
  );
}

export default ConfirmationPage;
