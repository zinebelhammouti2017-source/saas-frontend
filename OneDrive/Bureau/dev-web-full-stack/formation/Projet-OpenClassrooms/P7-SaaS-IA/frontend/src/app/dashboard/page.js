"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";

import { recupererProfil } from "@/services/authService";
import { recupererTachesAssignees } from "@/services/dashboardService";
import { recupererProjets } from "@/services/projectService";

import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();

  const [taches, setTaches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);
  const [vueActive, setVueActive] = useState("kanban");
  const [modalProjetOuverte, setModalProjetOuverte] = useState(false);

  useEffect(() => {
    async function chargerDashboard() {
      try {
        const profil = await recupererProfil();
        const tachesApi = await recupererTachesAssignees();

        setUtilisateur(profil);
        setTaches(tachesApi);
      } catch (erreur) {
        console.error("Erreur dashboard :", erreur);
      } finally {
        setChargement(false);
      }
    }

    chargerDashboard();
  }, []);

  function traduireStatut(statut) {
    switch (statut) {
      case "TODO":
        return "À faire";
      case "IN_PROGRESS":
        return "En cours";
      case "DONE":
        return "Terminée";
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

  async function actualiserDashboard() {
  const tachesApi = await recupererTachesAssignees();
  setTaches(tachesApi);
}

  function afficherCarteTache(tache) {
    return (
      <div key={tache.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>{tache.title}</h3>

          <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
            {traduireStatut(tache.status)}
          </span>
        </div>

        <p className={styles.description}>{tache.description}</p>

        <div className={styles.meta}>
          <span>{tache.project?.name || "Projet"}</span>

          <span>
            {tache.dueDate
              ? new Date(tache.dueDate).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              : "Sans échéance"}
          </span>

          <span>
            {tache.comments?.length || 0} commentaire
            {tache.comments?.length > 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          className={styles.viewButton}
          onClick={() => {
            const idProjet = tache.projectId || tache.project?.id;

            if (!idProjet) {
              console.error("Aucun projectId trouvé pour cette tâche");
              return;
            }

            router.push(`/projects/${idProjet}`);
          }}
        >
          Voir
        </button>
      </div>
    );
  }

  const tachesTodo = taches.filter((tache) => tache.status === "TODO");
  const tachesEnCours = taches.filter(
    (tache) => tache.status === "IN_PROGRESS"
  );
  const tachesTerminees = taches.filter((tache) => tache.status === "DONE");

  if (chargement) {
    return <p>Chargement du dashboard...</p>;
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.top}>
          <div>
            <h1>Tableau de bord</h1>

            <p>
              Bonjour {utilisateur?.user?.name || "Utilisateur"}, voici un
              aperçu de vos projets et tâches.
            </p>
          </div>

          <button
            type="button"
            className={styles.createButton}
            onClick={() => setModalProjetOuverte(true)}
          >
            + Créer un projet
          </button>
        </div>

        <div className={styles.viewSwitcher}>
          <button
            type="button"
            className={`${styles.switchButton} ${
              vueActive === "liste" ? styles.activeView : ""
            }`}
            onClick={() => setVueActive("liste")}
          >
            Liste
          </button>

          <button
            type="button"
            className={`${styles.switchButton} ${
              vueActive === "kanban" ? styles.activeView : ""
            }`}
            onClick={() => setVueActive("kanban")}
          >
            Kanban
          </button>
        </div>



        {vueActive === "kanban" && (
          <div className={styles.columns}>
            <div className={styles.column}>
              <h2>À faire ({tachesTodo.length})</h2>
              {tachesTodo.map(afficherCarteTache)}
            </div>

            <div className={styles.column}>
              <h2>En cours ({tachesEnCours.length})</h2>
              {tachesEnCours.map(afficherCarteTache)}
            </div>

            <div className={styles.column}>
              <h2>Terminées ({tachesTerminees.length})</h2>
              {tachesTerminees.map(afficherCarteTache)}
            </div>
          </div>
        )}
       
       {vueActive === "liste" && (
  <div className={styles.listView}>
    {taches.length === 0 ? (
      <p>Aucune tâche assignée pour le moment.</p>
    ) : (
      [...tachesTodo, ...tachesEnCours, ...tachesTerminees].map(
        afficherCarteTache
      )
    )}
  </div>
)}

      </main>
      
      {modalProjetOuverte && (
  <ProjectModal
    onClose={() => setModalProjetOuverte(false)}
    onProjetCree={actualiserDashboard}
  />
)}

      <Footer />
    </div>
  );
}