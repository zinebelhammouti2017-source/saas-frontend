"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recupererToken } from "@/utils/cookies";
import { getProfile, modifierProfil, modifierMotDePasse, } from "@/services/profileService";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();

  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [modeEdition, setModeEdition] = useState(false);
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");

  // 🔥 Charger le profil au chargement de la page
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

  // 🔥 Fonction pour sauvegarder les modifications
  async function gererModification() {
    
    if (
      (motDePasseActuel && !nouveauMotDePasse) ||
      (!motDePasseActuel && nouveauMotDePasse)
       ) {
      setErreur("Veuillez renseigner l'ancien et le nouveau mot de passe.");
      return;
     }


    try {
      const reponse = await modifierProfil({
        name: utilisateur.name,
        email: utilisateur.email,
      });

      if (motDePasseActuel && nouveauMotDePasse) {
      await modifierMotDePasse({
      currentPassword: motDePasseActuel,
      newPassword: nouveauMotDePasse,
      });
    }

      console.log("Profil modifié :", reponse);
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setModeEdition(false); // sortir du mode édition

    } catch (erreur) {
      console.error("Erreur modification :", erreur);
      setErreur("Erreur lors de la modification.");
    }
  }

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

            {/* NOM */}
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

            {/* EMAIL */}
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

            {/* MOT DE PASSE (lecture seule) */}
          {modeEdition ? (
  <>
    <div className={styles.field}>
      <label htmlFor="currentPassword">Mot de passe actuel</label>
      <input
        id="currentPassword"
        type="password"
        value={motDePasseActuel}
        onChange={(e) => setMotDePasseActuel(e.target.value)}
      />
    </div>

    <div className={styles.field}>
      <label htmlFor="newPassword">Nouveau mot de passe</label>
      <input
        id="newPassword"
        type="password"
        value={nouveauMotDePasse}
        onChange={(e) => setNouveauMotDePasse(e.target.value)}
      />
    </div>
  </>
) : (
  <div className={styles.field}>
    <label htmlFor="password">Mot de passe</label>
    <input id="password" type="password" value="************" readOnly />
  </div>
)}
            {/* BOUTON */}
            <button
              className={styles.button}
              onClick={() => {
                if (modeEdition) {
                  gererModification(); // 🔥 sauvegarde API
                } else {
                  setModeEdition(true); // 🔥 passe en mode édition
                }
              }}
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