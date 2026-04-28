"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recupererToken } from "@/utils/cookies";
import { getProfile } from "@/services/authService";

export default function ProfilePage() {
  const router = useRouter();

  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerProfil() {
      const token = recupererToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const profil = await getProfile();
        console.log("Profil récupéré :", profil);
        setUtilisateur(profil);
      } catch (erreur) {
        setErreur("Impossible de charger le profil.");
      } finally {
        setChargement(false);
      }
    }

    chargerProfil();
  }, [router]);

  if (chargement) {
    return <p>Chargement du profil...</p>;
  }

  if (erreur) {
    return <p>{erreur}</p>;
  }

  return (
    <main>
      <h1>Mon profil</h1>

      <p>Nom : {utilisateur.name}</p>
      <p>Email : {utilisateur.email}</p>
    </main>
  );
}