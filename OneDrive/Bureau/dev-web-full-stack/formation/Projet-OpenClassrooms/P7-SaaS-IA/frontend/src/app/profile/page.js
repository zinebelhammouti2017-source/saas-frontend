"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recupererToken } from "@/utils/cookies";
import { getProfile } from "@/services/authService";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();

  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [modeEdition, setModeEdition] = useState(false);

  useEffect(() => {
    async function chargerProfil() {
      const token = recupererToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const profil = await getProfile();
        setUtilisateur(profil);
      } catch (erreur) {
        setErreur("Impossible de charger le profil.");
      } finally {
        setChargement(false);
      }
    }

    chargerProfil();
  }, [router]);

  if (chargement) {
    return <p>Chargement du profil...</p>;
  }

  if (erreur) {
    return <p>{erreur}</p>;
  }

  return (
    <div className={styles.page}>
      <Header utilisateur={utilisateur} />

      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h1>Mon compte</h1>
            <p>{utilisateur.name}</p>
          </div>

          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Nom</label>
              <input
                id="name"
                type="text"
                value={utilisateur.name}
                readOnly={!modeEdition}
                onChange={(e) =>
                  setUtilisateur({
                    ...utilisateur,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={utilisateur.email}
                readOnly={!modeEdition}
                onChange={(e) =>
                  setUtilisateur({
                    ...utilisateur,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value="************"
                readOnly
              />
            </div>

            <button
              className={styles.button}
              onClick={() => setModeEdition(!modeEdition)}
            >
              {modeEdition ? "Enregistrer" : "Modifier les informations"}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}