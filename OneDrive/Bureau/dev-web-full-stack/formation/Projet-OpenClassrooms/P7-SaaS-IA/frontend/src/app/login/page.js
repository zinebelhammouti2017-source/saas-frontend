"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import { connecterUtilisateur } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [messageErreur, setMessageErreur] = useState("");
  const [messageSucces, setMessageSucces] = useState("");

  async function gererConnexion(e) {
    e.preventDefault();

    setMessageErreur("");
    setMessageSucces("");

    try {
      const reponse = await connecterUtilisateur({
        email: email,
        password: motDePasse,
      });

      document.cookie = `token=${reponse.data.token}; path=/; max-age=3600; SameSite=Strict`;
      // Stockage du token dans un cookie avec sécurité renforcée
      // max-age=3600 → expiration du token après 1 heure
      // SameSite=Strict → protection contre les attaques CSRF (Cross-Site Request Forgery)
      // En production, on privilégierait un cookie HttpOnly et Secure côté backend

      console.log("Connexion réussie :", reponse);

      setMessageSucces("Connexion réussie.");

      router.push("/profile");
    } catch (erreur) {
      setMessageErreur(erreur.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.header}>
          <img src="/logo.svg" alt="Abricot" className={styles.logo} />
          <h2 className={styles.title}>Connexion</h2>
        </div>

        <form className={styles.form} onSubmit={gererConnexion}>
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

          <button type="submit">Se connecter</button>
        </form>

        {messageErreur && (
          <p className={styles.messageErreur}>{messageErreur}</p>
        )}

        {messageSucces && (
          <p className={styles.messageSucces}>{messageSucces}</p>
        )}

        <p className={styles.login}>
          <span>Mot de passe oublié ?</span>
        </p>

        <p className={styles.login}>
          Pas encore de compte ?{" "}
          <span onClick={() => router.push("/register")}>Créer un compte</span>
        </p>
      </div>

      <div className={styles.right}>
        <img
          src="/9189668ee5c377da76dbf17f0a6a747f7ec69dcc.jpg"
          alt="Illustration"
        />
      </div>
    </div>
  );
}