"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";

import { recupererProfil } from "@/services/authService";
import { recupererTachesAssignees } from "@/services/dashboardService";

import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();

  const [taches, setTaches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);
  const [vueActive, setVueActive] = useState("kanban");
  const [modalProjetOuverte, setModalProjetOuverte] = useState(false);
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    async function chargerDashboard() {
      try {
        const profil = await recupererProfil();
        const tachesApi = await recupererTachesAssignees();

        setUtilisateur(profil);
        setTaches(tachesApi);
        setChargement(false);
      } catch {
        router.replace("/login");
      }
    }

    chargerDashboard();
  }, [router]);

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
        return "";
    }
  }

  function trierParDate(taches) {
    return [...taches].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  async function actualiserDashboard() {
    const tachesApi = await recupererTachesAssignees();
    setTaches(tachesApi);
  }

  function afficherCarteTache(tache) {
    const idProjet = tache.projectId || tache.project?.id;

    return (
      <article
        key={tache.id}
        className={`${styles.card} ${
          vueActive === "liste" ? styles.cardList : styles.cardKanban
        }`}
      >
        <div className={styles.cardHeader}>
          <h3>{tache.title}</h3>

          <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
            {traduireStatut(tache.status)}
          </span>
        </div>

        <p className={styles.description}>{tache.description}</p>

        <div className={styles.meta}>
          <span>📁 {tache.project?.name || "Projet"}</span>

          <span>
            📅{" "}
            {tache.dueDate
              ? new Date(tache.dueDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Sans échéance"}
          </span>

          <span>
            💬 {tache.comments?.length || 0} commentaire
            {tache.comments?.length > 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          className={styles.viewButton}
          onClick={() => {
            if (!idProjet) return;
            router.push(`/projects/${idProjet}`);
          }}
        >
          Voir
        </button>
      </article>
    );
  }

  const rechercheNormalisee = recherche.toLowerCase().trim();

  const tachesFiltrees = taches.filter((tache) => {
    const titre = tache.title?.toLowerCase() || "";
    const description = tache.description?.toLowerCase() || "";
    const nomProjet = tache.project?.name?.toLowerCase() || "";

    return (
      titre.includes(rechercheNormalisee) ||
      description.includes(rechercheNormalisee) ||
      nomProjet.includes(rechercheNormalisee)
    );
  });

  const tachesTodo = trierParDate(
    tachesFiltrees.filter((tache) => tache.status === "TODO")
  );

  const tachesEnCours = trierParDate(
    tachesFiltrees.filter((tache) => tache.status === "IN_PROGRESS")
  );

  const tachesTerminees = trierParDate(
    tachesFiltrees.filter((tache) => tache.status === "DONE")
  );

  const tachesListe = [...tachesTodo, ...tachesEnCours, ...tachesTerminees];

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

        {vueActive === "liste" && (
          <section className={styles.tasksPanel}>
            <div className={styles.tasksPanelHeader}>
              <div>
                <h2>Mes tâches assignées</h2>
                <p>Par ordre de date</p>
              </div>

              <input
                type="search"
                placeholder="Rechercher une tâche"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.listView}>
              {tachesListe.length === 0 ? (
                <p className={styles.emptyText}>Aucune tâche trouvée.</p>
              ) : (
                tachesListe.map(afficherCarteTache)
              )}
            </div>
          </section>
        )}

        {vueActive === "kanban" && (
          <div className={styles.columns}>
            <section className={styles.column}>
              <h2>
                À faire <span>{tachesTodo.length}</span>
              </h2>
              {tachesTodo.map(afficherCarteTache)}
            </section>

            <section className={styles.column}>
              <h2>
                En cours <span>{tachesEnCours.length}</span>
              </h2>
              {tachesEnCours.map(afficherCarteTache)}
            </section>

            <section className={styles.column}>
              <h2>
                Terminées <span>{tachesTerminees.length}</span>
              </h2>
              {tachesTerminees.map(afficherCarteTache)}
            </section>
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