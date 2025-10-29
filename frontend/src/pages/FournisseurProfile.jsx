import React, { useEffect, useState } from "react";
import "./FournisseurProfile.css";
import api from "../services/api";

function FournisseurProfile() {
  const [fournisseur, setFournisseur] = useState(null);

  useEffect(() => {
    api.get("/fournisseurs/me/")
      .then(res => setFournisseur(res.data))
      .catch(err => console.error("Erreur profil fournisseur:", err));
  }, []);

  if (!fournisseur) return <p>Chargement...</p>;

  return (
    <div className="fournisseur-profile">
      <h2>Profil Fournisseur</h2>
      <p><strong>Nom:</strong> {fournisseur.nom}</p>
      <p><strong>Email:</strong> {fournisseur.email}</p>
      <p><strong>Adresse:</strong> {fournisseur.adresse}</p>
    </div>
  );
}

export default FournisseurProfile;
