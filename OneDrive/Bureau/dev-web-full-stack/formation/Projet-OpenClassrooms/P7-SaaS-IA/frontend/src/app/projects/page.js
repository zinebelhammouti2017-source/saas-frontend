"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";
import { recupererToken } from "@/utils/cookies";
import { recupererProfil } from "@/services/authService";
import { recupererProjets } from "@/services/projectService";
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

        setUtilisateurConnecte(profil);
        setProjets(projetsApi);
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

  async function actualiserProjets() {
    const projetsApi = await recupererProjets();
    setProjets(projetsApi);
  }

  function obtenirInitiales(nom) {
    if (!nom) return "?";

    return nom
      .split(" ")
      .map((mot) => mot[0])
      .join("")
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
            {projets.map((projet) => {
              const estOwner = projet.ownerId === utilisateurConnecte?.user?.id;
              console.log("Utilisateur connecté :", utilisateurConnecte);
              console.log("Owner projet :", projet.ownerId);

              return (
                <div
                  key={projet.id}
                  className={styles.card}
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
                        </div>
                      )}
                    </div>
                  )}

                  <h2 className={styles.title}>{projet.name}</h2>
                  <p className={styles.description}>{projet.description}</p>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span>Progression</span>
                      <span>0%</span>
                    </div>

                    <div className={styles.progressBar}>
                      <div className={styles.progressFill}></div>
                    </div>

                    <p className={styles.progressText}>0/2 tâches terminées</p>
                  </div>

                  <div className={styles.teamSection}>
                    <p className={styles.teamTitle}>
                      Équipe ({1 + (projet.members?.length || 0)})
                    </p>

                    <div className={styles.teamMembers}>
                      <span className={styles.avatar}>
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
    </div>
  );
}