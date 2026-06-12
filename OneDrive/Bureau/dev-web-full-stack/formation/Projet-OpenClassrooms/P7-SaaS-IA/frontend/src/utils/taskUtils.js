export function traduireStatut(statut) {
  switch (statut) {
    case "TODO":
      return "À faire";
    case "IN_PROGRESS":
      return "En cours";
    case "DONE":
      return "Terminée";
    case "CANCELLED":
      return "Annulée";
    default:
      return statut;
  }
}

export function obtenirInitiales(nom) {
  if (!nom) return "?";

  const mots = nom.trim().split(" ");

  if (mots.length === 1) {
    return mots[0].slice(0, 2).toUpperCase();
  }

  return mots
    .map((mot) => mot[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formaterDateCommentaire(date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
