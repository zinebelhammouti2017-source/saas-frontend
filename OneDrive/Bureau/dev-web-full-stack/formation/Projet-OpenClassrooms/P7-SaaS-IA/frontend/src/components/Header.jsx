"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Folder, LogOut } from "lucide-react";
import { supprimerToken } from "@/utils/cookies";
import styles from "./Header.module.css";

export default function Header({ utilisateur }) {
  const router = useRouter();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const initiale = utilisateur?.name?.charAt(0).toUpperCase() || "?";

  function gererDeconnexion() {
    supprimerToken();
    router.push("/login");
  }

  return (
    <header className={styles.header}>
      <Link href="/projects">
        <img src="/logo.svg" alt="Logo Abricot" className={styles.logo} />
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