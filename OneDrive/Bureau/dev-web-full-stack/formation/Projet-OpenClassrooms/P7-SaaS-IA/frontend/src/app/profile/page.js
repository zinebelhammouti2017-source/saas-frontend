"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { recupererToken } from "@/utils/cookies";
import {
  getProfile,
  modifierProfil,
  modifierMotDePasse,
} from "@/services/profileService";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import styles from "./profile.module.css";

function motDePasseValide(motDePasse) {
  const contientMajuscule = /[A-Z]/.test(motDePasse);
  const contientChiffre = /\d/.test(motDePasse);
  const longueurValide = motDePasse.length >= 8;

  return contientMajuscule && contientChiffre && longueurValide;
}

export default function ProfilePage() {
  const router = useRouter();

  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");
  const [erreurFormulaire, setErreurFormulaire] = useState("");
  const [messageSucces, setMessageSucces] = useState("");

  const [modeEdition, setModeEdition] = useState(false);
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

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
      } catch {
        setErreurChargement("Impossible de charger le profil.");
      } finally {
        setChargement(false);
      }
    }

    chargerProfil();
  }, [router]);

  async function gererModification() {
    setErreurFormulaire("");
    setMessageSucces("");

    const motDePassePartiellementRempli =
      (motDePasseActuel && !nouveauMotDePasse) ||
      (!motDePasseActuel && nouveauMotDePasse);

    if (motDePassePartiellementRempli) {
      setErreurFormulaire(
        "Veuillez renseigner le mot de passe actuel et le nouveau mot de passe."
      );
      return;
    }

    if (nouveauMotDePasse && !motDePasseValide(nouveauMotDePasse)) {
      setErreurFormulaire(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre."
      );
      return;
    }

    try {
      await modifierProfil({
        name: utilisateur.name,
        email: utilisateur.email,
      });

      if (motDePasseActuel && nouveauMotDePasse) {
        await modifierMotDePasse({
          currentPassword: motDePasseActuel,
          newPassword: nouveauMotDePasse,
        });
      }

      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setModeEdition(false);
      setMessageSucces("Vos informations ont bien été modifiées.");
    } catch {
      setErreurFormulaire(
        "La modification n’a pas pu être enregistrée. Vérifiez les informations saisies."
      );
    }
  }

  if (chargement) {
    return <p>Chargement du profil...</p>;
  }

  if (erreurChargement) {
    return <p>{erreurChargement}</p>;
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

            {modeEdition ? (
              <>
                <div className={styles.field}>
                  <label htmlFor="currentPassword">Mot de passe actuel</label>

                  <div className={styles.passwordWrapper}>
                    <input
                      id="currentPassword"
                      type={afficherMotDePasse ? "text" : "password"}
                      value={motDePasseActuel}
                      onChange={(e) => setMotDePasseActuel(e.target.value)}
                    />

                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() =>
                        setAfficherMotDePasse(!afficherMotDePasse)
                      }
                      aria-label={
                        afficherMotDePasse
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {afficherMotDePasse ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="newPassword">Nouveau mot de passe</label>

                  <div className={styles.passwordWrapper}>
                    <input
                      id="newPassword"
                      type={afficherMotDePasse ? "text" : "password"}
                      value={nouveauMotDePasse}
                      onChange={(e) => setNouveauMotDePasse(e.target.value)}
                    />

                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() =>
                        setAfficherMotDePasse(!afficherMotDePasse)
                      }
                      aria-label={
                        afficherMotDePasse
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {afficherMotDePasse ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className={styles.passwordHint}>
                    Le mot de passe doit contenir au moins 8 caractères, une
                    majuscule et un chiffre.
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.field}>
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value="************"
                  readOnly
                />
              </div>
            )}

            {erreurFormulaire && (
              <p className={styles.errorMessage}>{erreurFormulaire}</p>
            )}

            {messageSucces && (
              <p className={styles.successMessage}>{messageSucces}</p>
            )}

            <button
              type="button"
              className={styles.button}
              onClick={() => {
                if (modeEdition) {
                  gererModification();
                } else {
                  setErreurFormulaire("");
                  setMessageSucces("");
                  setModeEdition(true);
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