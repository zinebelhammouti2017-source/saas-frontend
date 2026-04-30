import { recupererToken } from "@/utils/cookies";

export async function recupererProjets() {
  const token = recupererToken();

  const reponse = await fetch("http://localhost:8000/projects", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const donnees = await reponse.json();

  if (!reponse.ok) {
    throw new Error(donnees.message || "Impossible de récupérer les projets");
  }

  return donnees.data.projects;
}

export async function creerProjet({ name, description, contributors }) {
  const token = recupererToken();

  const reponse = await fetch("http://localhost:8000/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      description,
      contributors,
    }),
  });

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(donneesApi.message || "Erreur création projet");
  }

  return donneesApi.data;
}