"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { recupererTachesProjet } from "@/services/taskService";
import styles from "./projectDetail.module.css";
import TaskModal from "@/components/TaskModal";
import { recupererProjetParId } from "@/services/projectService";
import { creerCommentaire } from "@/services/commentService";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [taches, setTaches] = useState([]);
  const [projet, setProjet] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [modalTacheOuverte, setModalTacheOuverte] = useState(false);
  const [commentairesOuverts, setCommentairesOuverts] = useState({});
  const [nouveauxCommentaires, setNouveauxCommentaires] = useState({});

  useEffect(() => {
    async function chargerTaches() {
      try {
        const projetApi = await recupererProjetParId(id);
        setProjet(projetApi);
        console.log("Projet récupéré :", projetApi);
        const tachesApi = await recupererTachesProjet(id);
        setTaches(tachesApi);
      } catch (erreur) {
        setErreur("Impossible de charger les tâches du projet.");
      } finally {
        setChargement(false);
      }
    }

    chargerTaches();
  }, [id]);

  if (chargement) {
    return <p>Chargement du projet...</p>;
  }

  if (erreur) {
    return <p>{erreur}</p>; 
  }

  function traduireStatut(statut) {
  switch (statut) {
    case "TODO":
      return "À faire";
    case "IN_PROGRESS":
      return "En cours";
    case "DONE":
      return "Terminée";
    case "CANCELLED":
      return "Annulée";
    default:
      return statut;
  }
}

function getClasseStatut(statut) {
  switch (statut) {
    case "TODO":
      return styles.badgeTodo;
    case "IN_PROGRESS":
      return styles.badgeProgress;
    case "DONE":
      return styles.badgeDone;
    default:
      return styles.badge;
  }
}

function toggleCommentaires(taskId) {
  setCommentairesOuverts({
    ...commentairesOuverts,
    [taskId]: !commentairesOuverts[taskId],
  });
}

async function gererAjoutCommentaire(taskId) {
  try {
    const contenu = nouveauxCommentaires[taskId];

    if (!contenu?.trim()) return;

    await creerCommentaire({
      projectId: id,
      taskId,
      content: contenu,
    });

    const tachesApi = await recupererTachesProjet(id);
    setTaches(tachesApi);

    setNouveauxCommentaires({
      ...nouveauxCommentaires,
      [taskId]: "",
    });

  } catch (erreur) {
    console.error("Erreur ajout commentaire :", erreur);
  }
}

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.top}>
          <button onClick={() => router.back()} className={styles.back}>
            ←
          </button>

          <div className={styles.titleBlock}> 
            <h1>{projet?.name}</h1>      {/* Le ?. évite une erreur pendant le chargement si le projet n'est pas encore récupéré */}
            <p>{projet?.description}</p> 
          </div>

          <div className={styles.actions}>
            <button className={styles.taskButton} onClick={() => setModalTacheOuverte(true)}>
              Créer une tâche
            </button>
            <button className={styles.aiButton}>IA</button>
          </div>
        </div>

       <div className={styles.contributors}>
  <p>Contributeurs</p>

  <div className={styles.users}>

    {/* Propriétaire du projet */}
    <div className={styles.userCard}>
      <span className={styles.avatar}>
        {projet?.owner?.name?.charAt(0).toUpperCase()}
      </span>

      <span className={styles.role}>
        Propriétaire
      </span>
    </div>

    {/* Membres du projet */}
    {projet?.members?.map((membre) => (
      <div key={membre.id} className={styles.userCard}>

        <span className={styles.avatar}>
          {membre.user.name.charAt(0).toUpperCase()}
        </span>

        <span className={styles.memberName}>
          {membre.user.name}
        </span>

      </div>
    ))}

  </div>
</div>

        <div className={styles.tasks}>
          <div className={styles.tasksHeader}>
            <div>
              <h2>Tâches</h2>
              <p>Par ordre de priorité</p>
            </div>

            <div className={styles.filters}>
              <button>Liste</button>
              <button>Calendrier</button>
              <select>
                <option>Statut</option>
              </select>
              <input placeholder="Rechercher une tâche" />
            </div>
          </div>

          {taches.length === 0 ? (
            <p>Aucune tâche pour ce projet pour le moment.</p>
          ) : (
            taches.map((tache) => (
              <div key={tache.id} className={styles.taskCard}>
                <div className={styles.taskTop}>
                  <div>
                  <h3>{tache.title}</h3>

                  <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
                  {traduireStatut(tache.status)}
                  </span>
                  </div>

                  <button className={styles.moreButton}>...</button>
                </div> 

                <p>{tache.description}</p>

              <p>
               Échéance :{" "}
               {tache.dueDate
               ? new Date(tache.dueDate).toLocaleDateString("fr-FR", {
               day: "numeric",
               month: "long",
               })
                 : "Non définie"}
              </p>

              <div className={styles.assignees}>
                <p>Assigné à :</p>

                {tache.assignees?.map((assignation) => (
               <div key={assignation.id} className={styles.assigneeItem}>
                <span className={styles.assigneeAvatar}>
                  {assignation.user.name
                  .split(" ")
                  .map((mot) => mot[0])
                  .join("")
                  .toUpperCase()}
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
          <p className={styles.commentAuthor}>
            {commentaire.author.name}
          </p>

          <p className={styles.commentText}>
            {commentaire.content}
          </p>
        </div>
      ))
    ) : (
      <p className={styles.noComment}>
        Aucun commentaire pour le moment.
      </p>
    )}

    <div className={styles.commentForm}>
      <input
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
            ))
          )}
        </div>
      </main>

      <Footer />
      {modalTacheOuverte && (
       <TaskModal
         projectId={id}
         projet={projet}
         onClose={() => setModalTacheOuverte(false)}
         onTacheCree={async () => {
         const tachesApi = await recupererTachesProjet(id);
         setTaches(tachesApi);
  }}
/>
      )}
    </div>
  );
}