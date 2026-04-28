import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <img src="/logo.svg" alt="Logo Abricot" className={styles.logo} />
      <p className={styles.text}>Abricot 2025</p>
    </footer>
  );
}