"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TaskModal from "@/components/TaskModal";
import ConfirmModal from "@/components/ConfirmModal";
import AITaskModal from "@/components/AITaskModal";

import { recupererProjetParId } from "@/services/projectService";
import { recupererTachesProjet, supprimerTache } from "@/services/taskService";
import { creerCommentaire } from "@/services/commentService";

import styles from "./projectDetail.module.css";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [taches, setTaches] = useState([]);
  const [projet, setProjet] = useState(null);
  const [chargement, setChargement] = useState(true);

  const [rechercheTache, setRechercheTache] = useState("");
  const [statutFiltre, setStatutFiltre] = useState("TOUS");
  const [vueActive, setVueActive] = useState("liste");

  const [modalTacheOuverte, setModalTacheOuverte] = useState(false);
  const [modalIAOuverte, setModalIAOuverte] = useState(false);

  const [commentairesOuverts, setCommentairesOuverts] = useState({});
  const [nouveauxCommentaires, setNouveauxCommentaires] = useState({});
  const [menuOuvert, setMenuOuvert] = useState(null);

  const [tacheAModifier, setTacheAModifier] = useState(null);
  const [tacheASupprimer, setTacheASupprimer] = useState(null);

  useEffect(() => {
    async function chargerProjetEtTaches() {
      try {
        const projetApi = await recupererProjetParId(id);

        if (!projetApi.userRole) {
          router.push("/projects");
          return;
        }

        const tachesApi = await recupererTachesProjet(id);

        setProjet(projetApi);
        setTaches(tachesApi);
      } catch {
        router.push("/projects");
      } finally {
        setChargement(false);
      }
    }

    chargerProjetEtTaches();
  }, [id, router]);

  useEffect(() => {
    function fermerMenuSiClicExterieur(event) {
      if (!event.target.closest(`.${styles.taskMenuWrapper}`)) {
        setMenuOuvert(null);
      }
    }

    document.addEventListener("mousedown", fermerMenuSiClicExterieur);

    return () => {
      document.removeEventListener("mousedown", fermerMenuSiClicExterieur);
    };
  }, []);

  async function rechargerTaches() {
    const tachesApi = await recupererTachesProjet(id);
    setTaches(tachesApi);
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

  function obtenirInitiales(nom) {
    if (!nom) return "?";

    const mots = nom.trim().split(" ");

    if (mots.length === 1) {
      return mots[0].slice(0, 2).toUpperCase();
    }

    return mots
      .map((mot) => mot[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function toggleCommentaires(taskId) {
    setCommentairesOuverts({
      ...commentairesOuverts,
      [taskId]: !commentairesOuverts[taskId],
    });
  }

  function toggleMenuTache(taskId) {
    setMenuOuvert(menuOuvert === taskId ? null : taskId);
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

      await rechargerTaches();

      setNouveauxCommentaires({
        ...nouveauxCommentaires,
        [taskId]: "",
      });
    } catch (erreur) {
      console.error("Erreur ajout commentaire :", erreur);
    }
  }

  async function gererSuppressionTache() {
    if (!tacheASupprimer) return;

    try {
      await supprimerTache({
        projectId: id,
        taskId: tacheASupprimer.id,
      });

      await rechargerTaches();
      setTacheASupprimer(null);
    } catch (erreur) {
      console.error("Erreur suppression tâche :", erreur);
    }
  }

  function ouvrirModificationTache(tache) {
    setTacheAModifier(tache);
    setModalTacheOuverte(true);
    setMenuOuvert(null);
  }

  function fermerModalTache() {
    setModalTacheOuverte(false);
    setTacheAModifier(null);
  }

  if (chargement) {
    return <p>Chargement du projet...</p>;
  }

  const peutGererTaches =
    projet?.userRole === "ADMIN" || projet?.userRole === "CONTRIBUTOR";

  const tachesFiltrees = taches
    .filter((tache) => {
      const correspondRecherche =
        tache.title.toLowerCase().includes(rechercheTache.toLowerCase()) ||
        tache.description
          ?.toLowerCase()
          .includes(rechercheTache.toLowerCase());

      const correspondStatut =
        statutFiltre === "TOUS" || tache.status === statutFiltre;

      return correspondRecherche && correspondStatut;
    })
  .sort((a, b) => {
  const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
  const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

  if (dateA !== dateB) {
    return dateA - dateB;
  }

  const ordreStatuts = {
    TODO: 1,
    IN_PROGRESS: 2,
    DONE: 3,
    CANCELLED: 4,
  };

  return ordreStatuts[a.status] - ordreStatuts[b.status];
});

  // Vue calendrier simplifiée :
  // les tâches filtrées sont regroupées par date d'échéance.
  // Cela permet d'avoir une vision planning sans ajouter de librairie externe.
  const tachesParDate = tachesFiltrees.reduce((acc, tache) => {
    const date = tache.dueDate
      ? new Date(tache.dueDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Sans échéance";

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(tache);

    return acc;
  }, {});

  function afficherTacheListe(tache) {
    return (
      <div key={tache.id} className={styles.taskCard}>
        <div className={styles.taskTop}>
          <div>
            <h3>{tache.title}</h3>

            <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
              {traduireStatut(tache.status)}
            </span>
          </div>

          {peutGererTaches && (
            <div className={styles.taskMenuWrapper}>
              <button
                type="button"
                className={styles.moreButton}
                onClick={() => toggleMenuTache(tache.id)}
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
                  <p className={styles.commentAuthor}>
                    {commentaire.author.name}
                  </p>

                  <p className={styles.commentText}>{commentaire.content}</p>
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
    );
  }

  function afficherTacheCalendrier(tache) {
    return (
      <div key={tache.id} className={styles.calendarTask}>
        <strong>{tache.title}</strong>

        <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
          {traduireStatut(tache.status)}
        </span>
      </div>
    );
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
            <h1>{projet?.name}</h1>
            <p>{projet?.description}</p>
          </div>

          <div className={styles.actions}>
            {peutGererTaches && (
              <button
                className={styles.taskButton}
                onClick={() => setModalTacheOuverte(true)}
              >
                Créer une tâche
              </button>
            )}

            {peutGererTaches && (
              <button
                className={styles.aiButton}
                onClick={() => setModalIAOuverte(true)}
              >
                IA
              </button>
            )}
          </div>
        </div>

        <div className={styles.contributors}>
          <p>Contributeurs</p>

          <div className={styles.users}>
            <div className={styles.userCard}>
              <span className={`${styles.avatar} ${styles.ownerAvatar}`}>
                {obtenirInitiales(projet?.owner?.name)}
              </span>

              <span className={styles.role}>Propriétaire</span>
            </div>

            {projet?.members?.map((membre) => (
              <div key={membre.id} className={styles.userCard}>
                <span className={styles.avatar}>
                  {obtenirInitiales(membre.user?.name)}
                </span>

                <span className={styles.memberName}>{membre.user.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tasks}>
          <div className={styles.tasksHeader}>
            <div>
              <h2>Tâches</h2>
              <p>
                {vueActive === "liste"
                  ? "Par ordre de priorité"
                  : "Par date d’échéance"}
              </p>
            </div>

            <div className={styles.filters}>
              <button
                type="button"
                onClick={() => setVueActive("liste")}
              >
                Liste
              </button>

              <button
                type="button"
                onClick={() => setVueActive("calendrier")}
              >
                Calendrier
              </button>

              <select
                value={statutFiltre}
                onChange={(e) => setStatutFiltre(e.target.value)}
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminée</option>
              </select>

              <input
                type="search"
                placeholder="Rechercher une tâche"
                value={rechercheTache}
                onChange={(e) => setRechercheTache(e.target.value)}
              />
            </div>
          </div>

          {tachesFiltrees.length === 0 ? (
            <p>Aucune tâche ne correspond à votre recherche.</p>
          ) : vueActive === "liste" ? (
            tachesFiltrees.map(afficherTacheListe)
          ) : (
            Object.entries(tachesParDate).map(([date, tachesDate]) => (
              <div key={date} className={styles.calendarSection}>
                <h3 className={styles.calendarDate}>📅 {date}</h3>

                {tachesDate.map(afficherTacheCalendrier)}
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
          tacheAModifier={tacheAModifier}
          onClose={fermerModalTache}
          onTacheCree={rechargerTaches}
        />
      )}

      {modalIAOuverte && (
        <AITaskModal
          projectId={id}
          onClose={() => setModalIAOuverte(false)}
          onTachesCreees={rechargerTaches}
        />
      )}

      {tacheASupprimer && (
        <ConfirmModal
          title="Supprimer la tâche"
          message={`Êtes-vous sûre de vouloir supprimer la tâche "${tacheASupprimer.title}" ? Cette action est définitive.`}
          onCancel={() => setTacheASupprimer(null)}
          onConfirm={gererSuppressionTache}
        />
      )}
    </div>
  );
}