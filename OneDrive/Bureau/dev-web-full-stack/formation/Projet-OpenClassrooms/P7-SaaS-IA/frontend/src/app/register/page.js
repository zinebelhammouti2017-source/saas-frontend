"use client";

import { useState } from "react";
import styles from "../auth.module.css";
import { inscrireUtilisateur } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [messageErreur, setMessageErreur] = useState("");
  const [messageSucces, setMessageSucces] = useState("");
  const router = useRouter();

  function validerMotDePasse(motDePasse) {
  const contientMajuscule = /[A-Z]/.test(motDePasse);
  const contientChiffre = /[0-9]/.test(motDePasse);
  const longueurValide = motDePasse.length >= 8;

  return contientMajuscule && contientChiffre && longueurValide;
}

  async function gererInscription(evenement) {
    evenement.preventDefault();

    setMessageErreur("");
    setMessageSucces("");

    if (!validerMotDePasse(motDePasse)) {
         setMessageErreur(
          "Le mot de passe ne respecte pas encore les conditions indiquées."
        );
        return;
      }

    try {
      const reponse = await inscrireUtilisateur({
        name: nom,
        email: email,
        password: motDePasse,
      });

      console.log("Inscription réussie :", reponse);

      setMessageSucces("Inscription réussie.");
      setNom("");
      setEmail("");
      setMotDePasse("");

       document.cookie = `token=${reponse.data.token}; path=/; max-age=3600; SameSite=Strict`;

      router.push("/profile"); // Redirection automatique après succès

    } catch (erreur) {
      setMessageErreur(erreur.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.header}>
          <img src="/logo.svg" alt="Abricot" className={styles.logo} />
          <h2 className={styles.title}>Inscription</h2>
        </div>

        <div className={styles.formContainer}>
          <form className={styles.form} onSubmit={gererInscription}>
            <input
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />

           
             <div className={styles.passwordRules}>
              <p>Votre mot de passe doit contenir :</p>

               <ul>
    <li>8 caractères minimum</li>
    <li>Une majuscule</li>
    <li>Un chiffre</li>
  </ul>
</div>
           

            <button type="submit" > S'inscrire </button>
          </form>

          {messageErreur && (
            <p className={styles.messageErreur}>{messageErreur}</p>
          )}

          {messageSucces && (
            <p className={styles.messageSucces}>{messageSucces}</p>
          )}

          <p className={styles.login}>
            Déjà inscrit ? <span onClick={() => window.location.href = "/login"}>Se connecter</span>
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <img src="/9189668ee5c377da76dbf17f0a6a747f7ec69dcc.jpg" alt="Illustration" />
      </div>
    </div>
  );
}