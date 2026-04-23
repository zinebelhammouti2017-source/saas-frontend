import "./globals.css";

export const metadata = {
  title: "Abricot",
  description: "Application de gestion de projets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}