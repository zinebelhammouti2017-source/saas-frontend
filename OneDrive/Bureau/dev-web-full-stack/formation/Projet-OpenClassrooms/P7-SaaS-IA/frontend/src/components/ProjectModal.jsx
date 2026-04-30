import { useState } from "react";
import { creerProjet } from "@/services/projectService";
import styles from "./ProjectModal.module.css";

export default function ProjectModal({ onClose, onProjetCree }) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const formulaireValide = titre && description;

  async function gererCreationProjet(e) {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const nouveauProjet = await creerProjet({
       name: titre,
       description: description,
       contributors: [],
      });
      onProjetCree(nouveauProjet);
      onClose();

    } catch (erreur) {
      setErreur(erreur.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>Créer un projet</h2>

        <form className={styles.form} onSubmit={gererCreationProjet}>
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
            <label htmlFor="contributors">Contributeurs</label>
            <select id="contributors">
              <option>Choisir un ou plusieurs collaborateurs</option>
            </select>
          </div>
      
        <button
           className={`${styles.submitButton} ${
                     formulaireValide ? styles.active : styles.disabled
                   }`}
                    type="submit"
                    disabled={!formulaireValide || chargement}
                    >
                   {chargement ? "Création..." : "Ajouter un projet"}
          </button>

          {erreur && <p>{erreur}</p>}
        </form>
      </div>
    </div>
  );
}