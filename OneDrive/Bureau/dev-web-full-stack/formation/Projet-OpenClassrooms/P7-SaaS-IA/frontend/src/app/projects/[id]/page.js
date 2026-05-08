"use client";

import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./projectDetail.module.css";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        
        {/* 🔙 HEADER PROJET */}
        <div className={styles.top}>
          <button onClick={() => router.back()} className={styles.back}>
            ←
          </button>

          <div className={styles.titleBlock}>
            <h1>Nom du projet</h1>
            <p>
              Description du projet (sera dynamique plus tard)
            </p>
          </div>

          <div className={styles.actions}>
            <button className={styles.taskButton}>Créer une tâche</button>
            <button className={styles.aiButton}>IA</button>
          </div>
        </div>

        {/* 👥 CONTRIBUTEURS */}
        <div className={styles.contributors}>
          <p>Contributeurs (3 personnes)</p>

          <div className={styles.users}>
            <span className={styles.avatar}>AD</span>
            <span className={styles.role}>Propriétaire</span>

            <span className={styles.avatar}>BC</span>
            <span className={styles.avatar}>CV</span>
          </div>
        </div>

        {/* 📋 TÂCHES */}
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

          {/* 🧩 UNE CARTE TÂCHE */}
          <div className={styles.taskCard}>
            <h3>Authentification JWT</h3>
            <span className={styles.badge}>À faire</span>

            <p>
              Implémenter le système d'authentification avec tokens JWT
            </p>

            <p>Échéance : 9 mars</p>

            <div className={styles.assignees}>
              <span>BD</span>
              <span>AD</span>
              <span>CV</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}