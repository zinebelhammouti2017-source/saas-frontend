import styles from "@/app/projects/[id]/projectDetail.module.css";

export default function TaskCard({
  tache,
  projet,
  menuOuvert,
  commentairesOuverts,
  nouveauxCommentaires,
  utilisateurEstAssigne,
  utilisateurPeutModifierOuSupprimerTache,
  getClasseStatut,
  traduireStatut,
  obtenirInitiales,
  formaterDateCommentaire,
  toggleMenuTache,
  toggleCommentaires,
  ouvrirModificationTache,
  setTacheASupprimer,
  setMenuOuvert,
  setNouveauxCommentaires,
  gererAjoutCommentaire,
}) {
  const peutModifierOuSupprimer =
    utilisateurPeutModifierOuSupprimerTache(tache);

  return (
    <div
      className={`${styles.taskCard} ${
        utilisateurEstAssigne(tache) ? styles.maTache : ""
      }`}
    >
      <div className={styles.taskTop}>
        <div>
          <h3>{tache.title}</h3>

          <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
            {traduireStatut(tache.status)}
          </span>
        </div>

        {peutModifierOuSupprimer && (
          <div className={styles.taskMenuWrapper}>
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => toggleMenuTache(tache.id)}
              aria-label="Ouvrir le menu de la tâche"
            >
              ...
            </button>

            {menuOuvert === tache.id && (
              <div className={styles.taskMenu}>
                <button
                  type="button"
                  onClick={() => ouvrirModificationTache(tache)}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  className={styles.deleteAction}
                  onClick={() => {
                    setTacheASupprimer(tache);
                    setMenuOuvert(null);
                  }}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p>{tache.description}</p>

      <p>
        Échéance :{" "}
        {tache.dueDate
          ? new Date(tache.dueDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Non définie"}
      </p>

      <div className={styles.assignees}>
        <p>Assigné à :</p>

        {tache.assignees?.map((assignation) => (
          <div key={assignation.id} className={styles.assigneeItem}>
            <span
              className={`${styles.assigneeAvatar} ${
                assignation.user.id === projet?.ownerId ||
                assignation.user.id === projet?.owner?.id
                  ? styles.ownerAvatar
                  : ""
              }`}
            >
              {obtenirInitiales(assignation.user.name)}
            </span>

            <span className={styles.assigneeName}>
              {assignation.user.name}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.commentsRow}
        onClick={() => toggleCommentaires(tache.id)}
      >
        <p>Commentaires ({tache.comments?.length || 0})</p>
        <span>{commentairesOuverts[tache.id] ? "⌃" : "⌄"}</span>
      </button>

      {commentairesOuverts[tache.id] && (
        <div className={styles.commentsContent}>
          {tache.comments?.length > 0 ? (
            tache.comments.map((commentaire) => (
              <div key={commentaire.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <p className={styles.commentAuthor}>
                    {commentaire.author.name}
                  </p>

                  <span className={styles.commentDate}>
                    {formaterDateCommentaire(commentaire.createdAt)}
                  </span>
                </div>

                <p className={styles.commentText}>{commentaire.content}</p>
              </div>
            ))
          ) : (
            <p className={styles.noComment}>
              Aucun commentaire pour le moment.
            </p>
          )}

          <div className={styles.commentForm}>
          <label
            htmlFor={`commentaire-${tache.id}`}
            className={styles.srOnly}
          >
            Ajouter un commentaire
          </label>

          <input
             id={`commentaire-${tache.id}`}
             type="text"
             placeholder="Ajouter un commentaire..."
             value={nouveauxCommentaires[tache.id] || ""}
             onChange={(e) =>
               setNouveauxCommentaires({
               ...nouveauxCommentaires,
               [tache.id]: e.target.value,
              })
             }
          />

            <button
              type="button"
              onClick={() => gererAjoutCommentaire(tache.id)}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
