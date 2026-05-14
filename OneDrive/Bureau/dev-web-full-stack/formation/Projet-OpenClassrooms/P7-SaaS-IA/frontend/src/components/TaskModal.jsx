import { useState } from "react";
import { creerTache } from "@/services/taskService";
import styles from "./TaskModal.module.css";

export default function TaskModal({ onClose, projectId, projet, onTacheCree }) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [statut, setStatut] = useState("TODO");
  const [assignesSelectionnes, setAssignesSelectionnes] = useState([]);

  const formulaireValide = titre && description && dateEcheance;

  const utilisateursDisponibles = [
    projet?.owner,
    ...(projet?.members?.map((membre) => membre.user) || []),
  ].filter(Boolean);

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

  async function gererCreationTache() {
    try {
      const nouvelleTache = await creerTache({
        projectId,
        title: titre,
        description,
        priority: "LOW",
        dueDate: new Date(dateEcheance).toISOString(),
        assigneeIds: assignesSelectionnes.map((user) => user.id),
      });

      console.log("Tâche créée :", nouvelleTache);

      await onTacheCree();
      onClose();
    } catch (erreur) {
      console.error("Erreur création tâche :", erreur);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>Créer une tâche</h2>

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

          <div className={styles.statusSection}>
            <p>Statut :</p>

            <div className={styles.statusList}>
              <button
                type="button"
                className={`${styles.statusButton} ${
                  statut === "TODO" ? styles.activeTodo : styles.todo
                }`}
                onClick={() => setStatut("TODO")}
              >
                À faire
              </button>

              <button
                type="button"
                className={`${styles.statusButton} ${
                  statut === "IN_PROGRESS"
                    ? styles.activeProgress
                    : styles.progress
                }`}
                onClick={() => setStatut("IN_PROGRESS")}
              >
                En cours
              </button>

              <button
                type="button"
                className={`${styles.statusButton} ${
                  statut === "DONE" ? styles.activeDone : styles.done
                }`}
                onClick={() => setStatut("DONE")}
              >
                Terminée
              </button>
            </div>
          </div>

          <button
            className={`${styles.submitButton} ${
              formulaireValide ? styles.submitButtonActive : ""
            }`}
            type="button"
            disabled={!formulaireValide}
            onClick={gererCreationTache}
          >
            + Ajouter une tâche
          </button>
        </form>
      </div>
    </div>
  );
}