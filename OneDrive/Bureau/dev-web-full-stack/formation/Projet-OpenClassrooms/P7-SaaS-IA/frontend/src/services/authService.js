export async function inscrireUtilisateur(donneesUtilisateur) {
  const reponse = await fetch("http://localhost:8000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(donneesUtilisateur), //on transforme l'objet javascript en texte JSON car retour API
  });

  const donnees = await reponse.json(); //lit le body de la réponse et le transforme en objet JavaScript.

  if (!reponse.ok) {
    throw new Error(donnees.message || "Erreur lors de l'inscription");
  }

  return donnees;
}

export async function connecterUtilisateur(donnees) {
  const reponse = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(donnees),
  });

  const data = await reponse.json();

  if (!reponse.ok) {
    throw new Error(data.message || "Erreur lors de la connexion");
  }

  return data;
}

import { recupererToken } from "@/utils/cookies";



