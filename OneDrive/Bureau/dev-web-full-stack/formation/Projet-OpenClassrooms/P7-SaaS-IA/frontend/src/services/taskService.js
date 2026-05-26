import { recupererToken } from "@/utils/cookies";

const API_URL = "http://localhost:8000";

export async function creerTache({
  projectId,
  assigneeIds,
  title,
  description,
  status,
  priority,
  dueDate,
}) {
  const token = recupererToken();

  const reponse = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
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

  if (!reponse.ok) {
    throw new Error(donneesApi.message || "Erreur création tâche");
  }

  return donneesApi.data;
}

export async function modifierTache({
  projectId,
  taskId,
  assigneeIds,
  title,
  description,
  status,
  priority,
  dueDate,
}) {
  const token = recupererToken();

  const reponse = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assigneeIds,
      title,
      description,
      status,
      priority,
      dueDate,
    }),
  });

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(donneesApi.message || "Erreur modification tâche");
  }

  return donneesApi.data;
}

export async function supprimerTache({ projectId, taskId }) {
  const token = recupererToken();

  const reponse = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(donneesApi.message || "Erreur suppression tâche");
  }

  return donneesApi;
}

export async function recupererTachesProjet(idProjet) {
  const token = recupererToken();

  const reponse = await fetch(`${API_URL}/projects/${idProjet}/tasks`, {
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