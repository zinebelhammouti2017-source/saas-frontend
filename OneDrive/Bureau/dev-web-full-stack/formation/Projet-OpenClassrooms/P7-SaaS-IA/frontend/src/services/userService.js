import { recupererToken } from "@/utils/cookies";

export async function rechercherUtilisateurs(query) {
  const token = recupererToken();

  const reponse = await fetch(
    `http://localhost:8000/users/search?query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(
      donneesApi.message || "Impossible de rechercher les utilisateurs"
    );
  }

  return donneesApi.data.users;
}