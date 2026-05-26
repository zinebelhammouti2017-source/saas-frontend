import { useState } from "react";
import { creerTache } from "@/services/taskService";
import styles from "./AITaskModal.module.css";

export default function AITaskModal({ projectId, onClose, onTachesCreees }) {
  const [description, setDescription] = useState("");
  const [tachesGenerees, setTachesGenerees] = useState([]);
  const [tacheEnEdition, setTacheEnEdition] = useState(null);

  function genererTaches() {
    if (!description.trim()) return;

    // Génération locale simulée : cette partie pourra être remplacée plus tard par une vraie API IA.
    const nouvellesTaches = [
      {
        id: crypto.randomUUID(),
        titre: "Analyser le besoin du projet",
        description: "Étudier les fonctionnalités demandées par l'utilisateur.",
      },
      {
        id: crypto.randomUUID(),
        titre: "Créer la structure des pages",
        description: "Préparer les différentes pages nécessaires du projet.",
      },
      {
        id: crypto.randomUUID(),
        titre: "Développer l'interface utilisateur",
        description: "Créer les composants et l'affichage principal.",
      },
      {
        id: crypto.randomUUID(),
        titre: "Tester le responsive",
        description: "Vérifier l'affichage sur différentes tailles d'écran.",
      },
    ];

    setTachesGenerees(nouvellesTaches);
  }

  function modifierTacheGeneree(idTache, champ, valeur) {
    setTachesGenerees(
      tachesGenerees.map((tache) => {
        if (tache.id === idTache) {
          return {
            ...tache,
            [champ]: valeur,
          };
        }

        return tache;
      })
    );
  }

  function supprimerTacheGeneree(idTache) {
    setTachesGenerees(
      tachesGenerees.filter((tache) => tache.id !== idTache)
    );
  }

  async function ajouterTachesAuProjet() {
    try {
      for (const tache of tachesGenerees) {
        await creerTache({
          projectId,
          title: tache.titre,
          description: tache.description,
          status: "TODO",
          priority: "MEDIUM",
          dueDate: null,
          assigneeIds: [],
        });
      }

      await onTachesCreees();
      onClose();
    } catch (erreur) {
      console.error("Erreur création tâches IA :", erreur);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>✦ Vos tâches...</h2>

        {tachesGenerees.length > 0 && (
          <div className={styles.generatedTasks}>
            {tachesGenerees.map((tache) => (
              <div key={tache.id} className={styles.taskCard}>
                {tacheEnEdition === tache.id ? (
                  <>
                    <input
                      type="text"
                      value={tache.titre}
                      onChange={(e) =>
                        modifierTacheGeneree(
                          tache.id,
                          "titre",
                          e.target.value
                        )
                      }
                      className={styles.taskInput}
                    />

                    <textarea
                      value={tache.description}
                      onChange={(e) =>
                        modifierTacheGeneree(
                          tache.id,
                          "description",
                          e.target.value
                        )
                      }
                      className={styles.taskTextarea}
                    />

                    <button
                      type="button"
                      className={styles.saveEditButton}
                      onClick={() => setTacheEnEdition(null)}
                    >
                      Valider
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{tache.titre}</h3>
                    <p>{tache.description}</p>

                    <div className={styles.taskActions}>
                      <button
                        type="button"
                        onClick={() => supprimerTacheGeneree(tache.id)}
                      >
                        Supprimer
                      </button>

                      <span>|</span>

                      <button
                        type="button"
                        onClick={() => setTacheEnEdition(tache.id)}
                      >
                        Modifier
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {tachesGenerees.length > 0 && (
          <button
            type="button"
            className={styles.addTasksButton}
            onClick={ajouterTachesAuProjet}
          >
            + Ajouter les tâches
          </button>
        )}

        <div className={styles.inputBar}>
          <input
            type="text"
            placeholder="Décrivez les tâches que vous souhaitez ajouter..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="button" onClick={genererTaches}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}