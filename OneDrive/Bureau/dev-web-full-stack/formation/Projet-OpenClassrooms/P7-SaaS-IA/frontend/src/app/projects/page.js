"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";
import ConfirmModal from "@/components/ConfirmModal";

import { recupererToken } from "@/utils/cookies";
import { recupererProfil } from "@/services/authService";
import { recupererTachesProjet } from "@/services/taskService";
import { recupererProjets, supprimerProjet } from "@/services/projectService";

import styles from "./projects.module.css";

export default function ProjectsPage() {
  const router = useRouter();

  const [projets, setProjets] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [modalOuverte, setModalOuverte] = useState(false);
  const [projetAModifier, setProjetAModifier] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(null);
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);
  const [projetASupprimer, setProjetASupprimer] = useState(null);

  useEffect(() => {
    async function chargerDonnees() {
      const token = recupererToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const profil = await recupererProfil();
        const projetsApi = await recupererProjets();

        const projetsAvecProgression = await calculerProgressionProjets(
          projetsApi
        );

        setUtilisateurConnecte(profil);
        setProjets(projetsAvecProgression);
      } catch {
        setErreur("Impossible de charger les projets.");
      } finally {
        setChargement(false);
      }
    }

    chargerDonnees();
  }, [router]);

  useEffect(() => {
    function fermerMenuSiClicExterieur(event) {
      if (!event.target.closest(`.${styles.cardHeader}`)) {
        setMenuOuvert(null);
      }
    }

    document.addEventListener("mousedown", fermerMenuSiClicExterieur);

    return () => {
      document.removeEventListener("mousedown", fermerMenuSiClicExterieur);
    };
  }, []);

  async function calculerProgressionProjets(projetsApi) {
    const projetsAvecProgression = await Promise.all(
      projetsApi.map(async (projet) => {
        const tachesProjet = await recupererTachesProjet(projet.id);

        const totalTaches = tachesProjet.length;

        const tachesTerminees = tachesProjet.filter(
          (tache) => tache.status === "DONE"
        ).length;

        const progression =
          totalTaches === 0
            ? 0
            : Math.round((tachesTerminees / totalTaches) * 100);

        return {
          ...projet,
          totalTaches,
          tachesTerminees,
          progression,
        };
      })
    );

    return projetsAvecProgression;
  }

  async function actualiserProjets() {
    const projetsApi = await recupererProjets();
    const projetsAvecProgression = await calculerProgressionProjets(projetsApi);

    setProjets(projetsAvecProgression);
  }

  function obtenirInitiales(nom) {
    if (!nom) return "?";

    return nom
      .split(" ")
      .map((mot) => mot[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function ouvrirCreationProjet() {
    setProjetAModifier(null);
    setModalOuverte(true);
  }

  function ouvrirModificationProjet(e, projet) {
    e.stopPropagation();
    setProjetAModifier(projet);
    setModalOuverte(true);
    setMenuOuvert(null);
  }

  function fermerModalProjet() {
    setModalOuverte(false);
    setProjetAModifier(null);
  }

  async function gererSuppressionProjet() {
    if (!projetASupprimer) return;

    try {
      await supprimerProjet(projetASupprimer.id);
      await actualiserProjets();
      setProjetASupprimer(null);
    } catch {
      setErreur("Impossible de supprimer le projet.");
    }
  }

  function utilisateurEstOwner(projet) {
    return projet.ownerId === utilisateurConnecte?.user?.id;
  }

  const projetsTries = [...projets].sort((a, b) => {
    const aEstOwner = utilisateurEstOwner(a);
    const bEstOwner = utilisateurEstOwner(b);

    if (aEstOwner !== bEstOwner) {
      return aEstOwner ? -1 : 1;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (chargement) {
    return <p>Chargement des projets...</p>;
  }

  if (erreur) {
    return <p>{erreur}</p>;
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1>Mes projets</h1>
            <p>Gérez vos projets</p>
          </div>

          <button className={styles.button} onClick={ouvrirCreationProjet}>
            + Créer un projet
          </button>
        </div>

        {projets.length === 0 ? (
          <p className={styles.empty}>Aucun projet pour le moment</p>
        ) : (
          <div className={styles.grid}>
            {projetsTries.map((projet) => {
              const estOwner = utilisateurEstOwner(projet);

              return (
                <div
                  key={projet.id}
                  className={`${styles.card} ${
                    estOwner ? styles.monProjet : ""
                  }`}
                  onClick={() => router.push(`/projects/${projet.id}`)}
                >
                  {estOwner && (
                    <div className={styles.cardHeader}>
                      <button
                        type="button"
                        className={styles.moreButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOuvert(
                            menuOuvert === projet.id ? null : projet.id
                          );
                        }}
                      >
                        ...
                      </button>

                      {menuOuvert === projet.id && (
                        <div className={styles.projectMenu}>
                          <button
                            type="button"
                            onClick={(e) => ouvrirModificationProjet(e, projet)}
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className={styles.deleteAction}
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjetASupprimer(projet);
                              setMenuOuvert(null);
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <h2 className={styles.title}>{projet.name}</h2>

                  <p className={styles.description}>{projet.description}</p>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span>Progression</span>
                      <span>{projet.progression}%</span>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          projet.progression === 100
                            ? styles.progressCompleted
                            : ""
                        }`}
                        style={{ width: `${projet.progression}%` }}
                      ></div>
                    </div>

                    <p className={styles.progressText}>
                      {projet.tachesTerminees}/{projet.totalTaches} tâches
                      terminées
                    </p>
                  </div>

                  <div className={styles.teamSection}>
                    <p className={styles.teamTitle}>
                      Équipe ({1 + (projet.members?.length || 0)})
                    </p>

                    <div className={styles.teamMembers}>
                      <span
                        className={`${styles.avatar} ${styles.ownerAvatar}`}
                      >
                        {obtenirInitiales(projet.owner?.name)}
                      </span>

                      <span className={styles.role}>Propriétaire</span>

                      {projet.members?.map((membre) => (
                        <span key={membre.id} className={styles.avatar}>
                          {obtenirInitiales(membre.user?.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {modalOuverte && (
        <ProjectModal
          projetAModifier={projetAModifier}
          onClose={fermerModalProjet}
          onProjetCree={actualiserProjets}
        />
      )}

      {projetASupprimer && (
        <ConfirmModal
          title="Supprimer le projet"
          message={`Êtes-vous sûre de vouloir supprimer le projet "${projetASupprimer.name}" ? Cette action est définitive.`}
          onCancel={() => setProjetASupprimer(null)}
          onConfirm={gererSuppressionProjet}
        />
      )}
    </div>
  );
}