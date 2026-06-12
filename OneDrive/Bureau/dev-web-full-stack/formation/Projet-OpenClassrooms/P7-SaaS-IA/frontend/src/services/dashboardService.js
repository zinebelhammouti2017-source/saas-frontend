import { recupererToken } from "@/utils/cookies";

const API_URL = "http://localhost:8000";

export async function recupererTachesAssignees() {
  const token = recupererToken();

  const reponse = await fetch(`${API_URL}/dashboard/assigned-tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(
      donneesApi.message || "Impossible de récupérer les tâches assignées"
    );
  }

  return donneesApi.data.tasks;
}