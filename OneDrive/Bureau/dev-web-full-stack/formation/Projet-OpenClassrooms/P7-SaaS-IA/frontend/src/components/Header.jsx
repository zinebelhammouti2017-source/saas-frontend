"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {LayoutDashboard,Folder,LogOut,User,} from "lucide-react";

import { supprimerToken } from "@/utils/cookies";
import { recupererProfil } from "@/services/authService";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();

  // Informations utilisateur connecté
  const [utilisateur, setUtilisateur] = useState(null);

  // Ouverture / fermeture menu avatar
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Chargement automatique du profil connecté
  useEffect(() => {
    async function chargerProfil() {
      try {
        const profil = await recupererProfil();
        setUtilisateur(profil.user || profil);
      } catch (erreur) {
        console.error("Erreur récupération profil :", erreur);
      }
    }

    chargerProfil();
  }, []);

  // Déconnexion utilisateur
  function gererDeconnexion() {
    supprimerToken();
    router.push("/login");
  }

  // Première lettre du nom et prénom utilisateur
 const initiale =
  utilisateur?.name
    ?.split(" ")
    .map((mot) => mot.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <header className={styles.header}>
      <Link href="/projects">
        <img
          src="/logo.svg"
          alt="Logo Abricot"
          className={styles.logo}
        />
      </Link>

      <nav className={styles.nav}>
        <Link href="/dashboard">
          <LayoutDashboard size={16} />
          Tableau de bord
        </Link>

        <Link href="/projects">
          <Folder size={16} />
          Projets
        </Link>
      </nav>

      <div className={styles.userMenu}>
        <button
          type="button"
          className={styles.avatar}
          onClick={() => setMenuOuvert(!menuOuvert)}
        >
          {initiale}
        </button>

        {menuOuvert && (
          <div className={styles.dropdown}>
            <Link href="/profile">
              <User size={16} />
              Mon compte
            </Link>

            <button type="button" onClick={gererDeconnexion}>
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}