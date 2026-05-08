"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";
import { recupererToken } from "@/utils/cookies";
import { recupererProjets } from "@/services/projectService";
import styles from "./projects.module.css";

export default function ProjectsPage() {
  const router = useRouter();

  const [projets, setProjets] = useState([]); // liste des projets
  const [chargement, setChargement] = useState(true); // état de chargement
  const [erreur, setErreur] = useState(""); // message d'erreur
  const [modalOuverte, setModalOuverte] = useState(false); // ouverture modale

  useEffect(() => {
    async function chargerProjets() {
      const token = recupererToken(); // vérifie si utilisateur connecté

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const projetsApi = await recupererProjets(); // appel API GET /projects
        setProjets(projetsApi); // stockage dans le state
      } catch (erreur) {
        setErreur("Impossible de charger les projets.");
      } finally {
        setChargement(false);
      }
    }

    chargerProjets();
  }, [router]);

  async function actualiserProjets() {
    const projetsApi = await recupererProjets(); // recharge sans F5
    setProjets(projetsApi);
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

          <button
            className={styles.button}
            onClick={() => setModalOuverte(true)}
          >
            + Créer un projet
          </button>
        </div>

        {projets.length === 0 ? (
          <p className={styles.empty}>Aucun projet pour le moment</p>
        ) : (
        <div className={styles.grid}>
  
         {projets.map((projet) => (
        <div
          key={projet.id}
          className={styles.card}
          onClick={() => router.push(`/projects/${projet.id}`)}
  >
      
      {/* HEADER */}
      <h2 className={styles.title}>{projet.name}</h2>
      <p className={styles.description}>{projet.description}</p>

      {/* PROGRESSION */}
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

      {/* ÉQUIPE */}
      <div className={styles.teamSection}>
        <p className={styles.teamTitle}>Équipe (3)</p>

        <div className={styles.teamMembers}>
          <span className={styles.avatar}>AD</span>
          <span className={styles.role}>Propriétaire</span>
          <span className={styles.avatar}>BC</span>
          <span className={styles.avatar}>CV</span>
        </div>
      </div>

    </div>
  ))}
</div>
        )}
      </main>

      <Footer />

      {modalOuverte && (
        <ProjectModal
          onClose={() => setModalOuverte(false)}
          onProjetCree={actualiserProjets}
        />
      )}
    </div>
  );
}