"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TaskModal from "@/components/TaskModal";
import ConfirmModal from "@/components/ConfirmModal";
import AITaskModal from "@/components/AITaskModal";
import TaskCard from "@/components/TaskCard";
import ProjectCalendarView from "@/components/ProjectCalendarView";

import { recupererProjetParId } from "@/services/projectService";
import { recupererTachesProjet, supprimerTache } from "@/services/taskService";
import { creerCommentaire } from "@/services/commentService";
import { recupererProfil } from "@/services/authService";

import {
  traduireStatut,
  obtenirInitiales,
  formaterDateCommentaire,
} from "@/utils/taskUtils";
import {
  utilisateurEstAssigne,
  utilisateurPeutModifierOuSupprimerTache,
} from "@/utils/permissionsUtils";
import {
  filtrerEtTrierTaches,
  preparerTachesCalendrier,
} from "@/utils/taskFilters";

import styles from "./projectDetail.module.css";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [taches, setTaches] = useState([]);
  const [projet, setProjet] = useState(null);
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);
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
        const profil = await recupererProfil();
        const projetApi = await recupererProjetParId(id);

        if (!projetApi.userRole) {
          router.push("/projects");
          return;
        }

        const tachesApi = await recupererTachesProjet(id);

        setUtilisateurConnecte(profil.user || profil);
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

  const tachesFiltrees = filtrerEtTrierTaches({
    taches,
    rechercheTache,
    statutFiltre,
    utilisateurConnecte,
  });

  const tachesCalendrier = preparerTachesCalendrier(
    tachesFiltrees,
    utilisateurConnecte
  );

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.top}>
          <button
            onClick={() => router.back()}
            className={styles.back}
            aria-label="Retour à la page précédente"
          >
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
              <button type="button" onClick={() => setVueActive("liste")}>
                Liste
              </button>

              <button type="button" onClick={() => setVueActive("calendrier")}>
                Calendrier
              </button>

              <label htmlFor="statutFiltre" className={styles.srOnly}>
                Filtrer les tâches par statut
              </label>
              <select
                id="statutFiltre"
                value={statutFiltre}
                onChange={(e) => setStatutFiltre(e.target.value)}
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminée</option>
              </select>

              <label
                 htmlFor="rechercheTache"
                 className={styles.srOnly}
               >
                Rechercher une tâche
              </label>

              <input
                id="rechercheTache"
                type="search"
                placeholder="Rechercher une tâche"
                value={rechercheTache}
                onChange={(e) => setRechercheTache(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {tachesFiltrees.length === 0 ? (
            <p>Aucune tâche ne correspond à votre recherche.</p>
          ) : vueActive === "liste" ? (
            tachesFiltrees.map((tache) => (
              <TaskCard
                key={tache.id}
                tache={tache}
                projet={projet}
                menuOuvert={menuOuvert}
                commentairesOuverts={commentairesOuverts}
                nouveauxCommentaires={nouveauxCommentaires}
                utilisateurEstAssigne={(tache) =>
                  utilisateurEstAssigne(tache, utilisateurConnecte)
                }
                utilisateurPeutModifierOuSupprimerTache={(tache) =>
                  utilisateurPeutModifierOuSupprimerTache(
                    tache,
                    projet,
                    utilisateurConnecte
                  )
                }
                getClasseStatut={getClasseStatut}
                traduireStatut={traduireStatut}
                obtenirInitiales={obtenirInitiales}
                formaterDateCommentaire={formaterDateCommentaire}
                toggleMenuTache={toggleMenuTache}
                toggleCommentaires={toggleCommentaires}
                ouvrirModificationTache={ouvrirModificationTache}
                setTacheASupprimer={setTacheASupprimer}
                setMenuOuvert={setMenuOuvert}
                setNouveauxCommentaires={setNouveauxCommentaires}
                gererAjoutCommentaire={gererAjoutCommentaire}
              />
            ))
          ) : (
            <ProjectCalendarView
              tachesCalendrier={tachesCalendrier}
              utilisateurEstAssigne={(tache) =>
                utilisateurEstAssigne(tache, utilisateurConnecte)
              }
              getClasseStatut={getClasseStatut}
              traduireStatut={traduireStatut}
            />
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
