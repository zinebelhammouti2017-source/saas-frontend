import { useState } from "react";
import styles from "./AITaskModal.module.css";

export default function AITaskModal({ onClose }) {
  const [description, setDescription] = useState("");
  const [tachesGenerees, setTachesGenerees] = useState([]);

 function genererTaches() {

  if (!description.trim()) return;

  const nouvellesTaches = [
    {
      id: crypto.randomUUID(),
      titre: "Analyser le besoin du projet",
      description:
        "Étudier les fonctionnalités demandées par l'utilisateur.",
    },

    {
      id: crypto.randomUUID(),
      titre: "Créer la structure des pages",
      description:
        "Préparer les différentes pages nécessaires du projet.",
    },

    {
      id: crypto.randomUUID(),
      titre: "Développer l'interface utilisateur",
      description:
        "Créer les composants et l'affichage principal.",
    },

    {
      id: crypto.randomUUID(),
      titre: "Tester le responsive",
      description:
        "Vérifier l'affichage sur différentes tailles d'écran.",
    },
  ];

  setTachesGenerees(nouvellesTaches);
}
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>✦ Créer une tâche</h2>

        {tachesGenerees.length > 0 && (
          <div className={styles.generatedTasks}>
        {tachesGenerees.map((tache) => (
          <div key={tache.id} className={styles.taskCard}>
        <h3>{tache.titre}</h3>

          <p>{tache.description}</p>
      </div>
    ))}
  </div>
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