import Link from "next/link";
import { LayoutDashboard, Folder } from "lucide-react";
import styles from "./Header.module.css";

export default function Header({ utilisateur }) {
  const initiale = utilisateur?.name?.charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <img src="/logo.svg" alt="Logo Abricot" className={styles.logo} />

     <nav className={styles.nav}>
  <a href="/dashboard">
    <LayoutDashboard size={16} />
    Tableau de bord
  </a>

  <a href="/projects">
    <Folder size={16} />
    Projets
  </a>
</nav>

      <div className={styles.avatar}>{initiale}</div>
    </header>
  );
}