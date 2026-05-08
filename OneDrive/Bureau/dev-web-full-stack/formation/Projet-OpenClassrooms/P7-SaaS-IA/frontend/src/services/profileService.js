import { recupererToken } from "@/utils/cookies";

export async function getProfile() {
  const token = recupererToken();

  const reponse = await fetch("http://localhost:8000/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const donneesApi = await reponse.json();

  console.log("Réponse profil API :", donneesApi);

  if (!reponse.ok) {
    throw new Error(
      donneesApi.message || "Impossible de récupérer le profil utilisateur"
    );
  }

  return donneesApi.data.user;
}

export async function modifierProfil(donnees) {
  const token = recupererToken();

  const reponse = await fetch("http://localhost:8000/auth/profile", {
    method: "PUT", // ou PATCH selon ton API
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(donnees),
  });

  const data = await reponse.json();

  if (!reponse.ok) {
    throw new Error(data.message || "Erreur modification profil");
  }

  return data;
}

export async function modifierMotDePasse(donneesMotDePasse) {
  const token = recupererToken();

  const reponse = await fetch("http://localhost:8000/auth/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(donneesMotDePasse),
  });

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(
      donneesApi.message || "Erreur lors de la modification du mot de passe"
    );
  }

  return donneesApi;
}