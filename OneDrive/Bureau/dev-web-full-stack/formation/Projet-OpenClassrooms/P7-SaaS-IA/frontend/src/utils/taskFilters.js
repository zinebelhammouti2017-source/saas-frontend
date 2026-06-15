import { utilisateurEstAssigne } from "@/utils/permissionsUtils";

const ordreStatuts = {
  TODO: 1,
  IN_PROGRESS: 2,
  DONE: 3,
  CANCELLED: 4,
};

export function filtrerEtTrierTaches({
  taches,
  rechercheTache,
  statutFiltre,
  utilisateurConnecte,
}) {
  return taches
    .filter((tache) => {
      const correspondRecherche =
        tache.title.toLowerCase().includes(rechercheTache.toLowerCase()) ||
        tache.description
          ?.toLowerCase()
          .includes(rechercheTache.toLowerCase());

      const correspondStatut =
        statutFiltre === "TOUS" || tache.status === statutFiltre;

      return correspondRecherche && correspondStatut;
    })
    .sort((a, b) => {
      const aEstAssignee = utilisateurEstAssigne(a, utilisateurConnecte);
      const bEstAssignee = utilisateurEstAssigne(b, utilisateurConnecte);

      if (aEstAssignee !== bEstAssignee) {
        return aEstAssignee ? -1 : 1;
      }

      const ordreStatutA = ordreStatuts[a.status] || 99;
      const ordreStatutB = ordreStatuts[b.status] || 99;

      if (ordreStatutA !== ordreStatutB) {
        return ordreStatutA - ordreStatutB;
      }

      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

      return dateA - dateB;
    });
}

export function preparerTachesCalendrier(tachesFiltrees, utilisateurConnecte) {
  return tachesFiltrees.filter((tache) => {
    const estAssignee = utilisateurEstAssigne(tache, utilisateurConnecte);
    const estTerminee = tache.status === "DONE";

    return estAssignee && !estTerminee;
  });
}
