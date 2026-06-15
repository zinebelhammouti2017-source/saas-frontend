export function utilisateurEstAssigne(tache, utilisateurConnecte) {
  return tache.assignees?.some(
    (assignation) => assignation.user.id === utilisateurConnecte?.id
  );
}

export function utilisateurPeutModifierOuSupprimerTache(
  tache,
  projet,
  utilisateurConnecte
) {
  const estAdmin = projet?.userRole === "ADMIN";
  const estAssigne = utilisateurEstAssigne(tache, utilisateurConnecte);

  return estAdmin || estAssigne;
}
