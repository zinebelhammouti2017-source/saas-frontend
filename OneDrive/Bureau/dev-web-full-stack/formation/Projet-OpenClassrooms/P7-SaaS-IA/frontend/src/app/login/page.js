"use client";

import { useState } from "react";
import styles from "../auth.module.css";
import { connecterUtilisateur } from "@/services/authService";

export default function LoginPage() {
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

      console.log("Connexion réussie :", reponse);

      setMessageSucces("Connexion réussie.");
      setEmail("");
      setMotDePasse("");
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

      {/* Mot de passe oublié */}
      <p className={styles.login}>
        <span>Mot de passe oublié ?</span>
      </p>

      {/* Créer un compte */}
      <p className={styles.login}>
        Pas encore de compte ? <span onClick={() => window.location.href = "/register"}>Créer un compte</span>
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