import { recupererToken } from "@/utils/cookies";

export async function creerTache({ projectId, assigneeIds, title, description, priority, dueDate }) {
  const token = recupererToken();

  const reponse = await fetch(`http://localhost:8000/projects/${projectId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assigneeIds,
      title,
      description,
      priority,
      dueDate,
    }),
  });

  const donneesApi = await reponse.json();
  console.log("Réponse création tâche :", donneesApi);

  if (!reponse.ok) {
    throw new Error(donneesApi.message || "Erreur création tâche");
  }

  return donneesApi.data;
}

export async function recupererTachesProjet(idProjet) {
  const token = recupererToken();

  const reponse = await fetch(`http://localhost:8000/projects/${idProjet}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(
      donneesApi.message || "Impossible de récupérer les tâches du projet"
    );
  }

  return donneesApi.data.tasks;
}

