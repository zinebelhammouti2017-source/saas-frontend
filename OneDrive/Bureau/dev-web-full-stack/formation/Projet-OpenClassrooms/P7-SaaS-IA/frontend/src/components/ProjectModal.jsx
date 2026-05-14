import { useState } from "react";
import { creerProjet } from "@/services/projectService";
import { rechercherUtilisateurs } from "@/services/userService";
import styles from "./ProjectModal.module.css";

export default function ProjectModal({ onClose, onProjetCree }) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [contributeurs, setContributeurs] = useState([]);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const formulaireValide = titre && description;

  async function gererRechercheUtilisateur(valeur) {
    setRecherche(valeur);

    if (valeur.length < 2) {
      setResultats([]);
      return;
    }

    try {
      const utilisateurs = await rechercherUtilisateurs(valeur);
      setResultats(utilisateurs);
    } catch (erreur) {
      setErreur("Impossible de rechercher les utilisateurs.");
    }
  }

  function ajouterContributeur(utilisateur) {
    const dejaAjoute = contributeurs.some(
      (contributeur) => contributeur.email === utilisateur.email
    );

    if (dejaAjoute) {
      return;
    }

    setContributeurs([...contributeurs, utilisateur]);
    setRecherche("");
    setResultats([]);
  }

  function retirerContributeur(email) {
    setContributeurs(
      contributeurs.filter((contributeur) => contributeur.email !== email)
    );
  }

  async function gererCreationProjet(e) {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const nouveauProjet = await creerProjet({
        name: titre,
        description,
        contributors: contributeurs.map((contributeur) => contributeur.email),
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
            <input
              id="contributors"
              type="text"
              placeholder="Rechercher un utilisateur par nom ou email"
              value={recherche}
              onChange={(e) => gererRechercheUtilisateur(e.target.value)}
            />

            {resultats.length > 0 && (
              <div className={styles.results}>
                {resultats.map((utilisateur) => (
                  <button
                    key={utilisateur.id}
                    type="button"
                    className={styles.resultItem}
                    onClick={() => ajouterContributeur(utilisateur)}
                  >
                    {utilisateur.name} - {utilisateur.email}
                  </button>
                ))}
              </div>
            )}

            {contributeurs.length > 0 && (
              <div className={styles.selectedContributors}>
                {contributeurs.map((contributeur) => (
                  <span key={contributeur.email} className={styles.contributorTag}>
                    {contributeur.name}
                    <button
                      type="button"
                      onClick={() => retirerContributeur(contributeur.email)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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