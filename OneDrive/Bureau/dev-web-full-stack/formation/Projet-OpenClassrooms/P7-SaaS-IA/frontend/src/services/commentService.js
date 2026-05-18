import { recupererToken } from "@/utils/cookies";

export async function creerCommentaire({ projectId, taskId, content }) {
  const token = recupererToken();

  const reponse = await fetch(
    `http://localhost:8000/projects/${projectId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  const donneesApi = await reponse.json();

  if (!reponse.ok) {
    throw new Error(donneesApi.message || "Erreur création commentaire");
  }

  return donneesApi.data.comment;
}