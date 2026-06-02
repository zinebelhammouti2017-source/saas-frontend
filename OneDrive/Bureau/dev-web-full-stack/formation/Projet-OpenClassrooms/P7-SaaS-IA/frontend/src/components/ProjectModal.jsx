import { useState } from "react";
import { rechercherUtilisateurs } from "@/services/userService";
import {
  creerProjet,
  modifierProjet,
  ajouterContributeurProjet,
  retirerContributeurProjet,
} from "@/services/projectService";
import styles from "./ProjectModal.module.css";

export default function ProjectModal({ onClose, onProjetCree, projetAModifier }) {
  const [titre, setTitre] = useState(projetAModifier?.name || "");
  const [description, setDescription] = useState(
    projetAModifier?.description || ""
  );
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [contributeurs, setContributeurs] = useState(
    projetAModifier?.members?.map((membre) => membre.user) || []
  );
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const formulaireValide = titre.trim() && description.trim();

  async function gererRechercheUtilisateur(valeur) {
    setRecherche(valeur);

    if (valeur.length < 2) {
      setResultats([]);
      return;
    }

    try {
      const utilisateurs = await rechercherUtilisateurs(valeur);
      setResultats(utilisateurs);
    } catch {
      setErreur("Impossible de rechercher les utilisateurs.");
    }
  }

  function ajouterContributeur(utilisateur) {
    const dejaAjoute = contributeurs.some(
      (contributeur) => contributeur.email === utilisateur.email
    );

    if (dejaAjoute) return;

    setContributeurs([...contributeurs, utilisateur]);
    setRecherche("");
    setResultats([]);
  }

  function retirerContributeur(email) {
    setContributeurs(
      contributeurs.filter((contributeur) => contributeur.email !== email)
    );
  }

  async function gererEnvoiProjet(e) {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const donneesProjet = {
        name: titre,
        description,
        contributors: contributeurs.map((contributeur) => contributeur.email),
      };

      if (projetAModifier) {
        await modifierProjet({
          projectId: projetAModifier.id,
          name: titre,
          description,
        });

        // Comparaison entre les contributeurs actuellement enregistrés
        // sur le projet et ceux sélectionnés dans le formulaire.
        // Cette étape permet de déterminer précisément :
        // - les contributeurs à ajouter ;
        // - les contributeurs à retirer ;
        // afin d'utiliser les routes dédiées du backend
        // (POST /contributors et DELETE /contributors/:userId).
        const anciensContributeurs =
          projetAModifier.members?.map((membre) => membre.user) || [];

        const contributeursAAjouter = contributeurs.filter(
          (contributeur) =>
            !anciensContributeurs.some(
              (ancien) => ancien.email === contributeur.email
            )
        );

        const contributeursARetirer = anciensContributeurs.filter(
          (ancien) =>
            !contributeurs.some(
              (contributeur) => contributeur.email === ancien.email
            )
        );

        for (const contributeur of contributeursAAjouter) {
          await ajouterContributeurProjet({
            projectId: projetAModifier.id,
            email: contributeur.email,
          });
        }

        for (const contributeur of contributeursARetirer) {
          await retirerContributeurProjet({
            projectId: projetAModifier.id,
            userId: contributeur.id,
          });
        }
      } else {
        await creerProjet(donneesProjet);
      }

      await onProjetCree();
      onClose();
    } catch (erreur) {
      setErreur(erreur.message || "Erreur lors de l'enregistrement du projet.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>{projetAModifier ? "Modifier le projet" : "Créer un projet"}</h2>

        <form className={styles.form} onSubmit={gererEnvoiProjet}>
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
                  <span
                    key={contributeur.email}
                    className={styles.contributorTag}
                  >
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
            type="submit"
            disabled={!formulaireValide || chargement}
            className={`${styles.submitButton} ${
              formulaireValide ? styles.active : styles.disabled
            }`}
          >
            {chargement
              ? projetAModifier
                ? "Modification..."
                : "Création..."
              : projetAModifier
              ? "Enregistrer les modifications"
              : "Ajouter un projet"}
          </button>

          {erreur && <p>{erreur}</p>}
        </form>
      </div>
    </div>
  );
}