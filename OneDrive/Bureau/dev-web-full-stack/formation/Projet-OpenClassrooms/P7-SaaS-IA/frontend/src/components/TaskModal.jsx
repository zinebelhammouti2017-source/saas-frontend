import { useState } from "react";
import { creerTache, modifierTache } from "@/services/taskService";
import styles from "./TaskModal.module.css";

export default function TaskModal({
  onClose,
  projectId,
  projet,
  onTacheCree,
  tacheAModifier,
}) {
  const [titre, setTitre] = useState(tacheAModifier?.title || "");
  const [description, setDescription] = useState(
    tacheAModifier?.description || ""
  );
  const [dateEcheance, setDateEcheance] = useState(
    tacheAModifier?.dueDate
      ? new Date(tacheAModifier.dueDate).toISOString().split("T")[0]
      : ""
  );
  const [statut, setStatut] = useState(tacheAModifier?.status || "TODO");
  const [assignesSelectionnes, setAssignesSelectionnes] = useState(
    tacheAModifier?.assignees?.map((assignation) => assignation.user) || []
  );
  const [messageErreur, setMessageErreur] = useState("");

  const formulaireValide = titre && description && dateEcheance;
  const utilisateursDisponibles =
    projet?.members?.map((membre) => membre.user) || [];

  function ajouterAssigne(idUtilisateur) {
    const utilisateur = utilisateursDisponibles.find(
      (user) => user.id === idUtilisateur
    );

    if (!utilisateur) return;

    const dejaAjoute = assignesSelectionnes.some(
      (user) => user.id === utilisateur.id
    );

    if (!dejaAjoute) {
      setAssignesSelectionnes([...assignesSelectionnes, utilisateur]);
    }
  }

  function retirerAssigne(idUtilisateur) {
    setAssignesSelectionnes(
      assignesSelectionnes.filter((user) => user.id !== idUtilisateur)
    );
  }

  async function gererEnregistrementTache() {
    setMessageErreur("");

    try {
      const donneesTache = {
        projectId,
        title: titre,
        description,
        status: tacheAModifier ? statut : "TODO",
        priority: "LOW",
        dueDate: new Date(dateEcheance).toISOString(),
        assigneeIds: assignesSelectionnes.map((user) => user.id),
      };

      if (tacheAModifier) {
        await modifierTache({
          ...donneesTache,
          taskId: tacheAModifier.id,
        });
      } else {
        await creerTache(donneesTache);
      }

      await onTacheCree();
      onClose();
    } catch (erreur) {
      setMessageErreur(
        erreur.message ||
          "Une erreur est survenue pendant l'enregistrement de la tâche."
      );
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>{tacheAModifier ? "Modifier la tâche" : "Créer une tâche"}</h2>

        <form className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title">Titre*</label>
            <input
              id="title"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description*</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="dueDate">Échéance*</label>
            <input
              id="dueDate"
              type="date"
              value={dateEcheance}
              onChange={(e) => setDateEcheance(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="assignee">Assigné à :</label>

            <select
              id="assignee"
              value=""
              onChange={(e) => ajouterAssigne(e.target.value)}
            >
              <option value="">Choisir un ou plusieurs collaborateurs</option>

              {utilisateursDisponibles.map((utilisateur) => (
                <option key={utilisateur.id} value={utilisateur.id}>
                  {utilisateur.name}
                </option>
              ))}
            </select>

            {assignesSelectionnes.length > 0 && (
              <div className={styles.selectedAssignees}>
                {assignesSelectionnes.map((utilisateur) => (
                  <span key={utilisateur.id} className={styles.assigneeTag}>
                    {utilisateur.name}
                    <button
                      type="button"
                      onClick={() => retirerAssigne(utilisateur.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {!tacheAModifier && (
            <div className={styles.defaultStatus}>
              <span className={styles.defaultStatusLabel}>Statut par défaut</span>
              <span className={`${styles.statusBadge} ${styles.todo}`}>
                À faire
              </span>
            </div>
          )}

          {tacheAModifier && (
            <div className={styles.statusSection}>
              <p>Statut :</p>

              <div className={styles.statusList}>
                <button
                  type="button"
                  className={`${styles.statusButton} ${styles.todo} ${
                    statut === "TODO" ? styles.statusActive : ""
                  }`}
                  onClick={() => setStatut("TODO")}
                >
                  À faire
                </button>

                <button
                  type="button"
                  className={`${styles.statusButton} ${styles.progress} ${
                    statut === "IN_PROGRESS" ? styles.statusActive : ""
                  }`}
                  onClick={() => setStatut("IN_PROGRESS")}
                >
                  En cours
                </button>

                <button
                  type="button"
                  className={`${styles.statusButton} ${styles.done} ${
                    statut === "DONE" ? styles.statusActive : ""
                  }`}
                  onClick={() => setStatut("DONE")}
                >
                  Terminée
                </button>
              </div>
            </div>
          )}

          {messageErreur && (
            <p className={styles.errorMessage}>{messageErreur}</p>
          )}

          <button
            className={`${styles.submitButton} ${
              formulaireValide ? styles.submitButtonActive : ""
            }`}
            type="button"
            disabled={!formulaireValide}
            onClick={gererEnregistrementTache}
          >
            {tacheAModifier
              ? "Enregistrer les modifications"
              : "+ Ajouter une tâche"}
          </button>
        </form>
      </div>
    </div>
  );
}