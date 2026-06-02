"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { recupererToken } from "@/utils/cookies";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {

    // Point d'entrée de l'application :
    // on vérifie uniquement la présence du token afin d'orienter
    // l'utilisateur vers la bonne page selon son état de connexion.

    const token = recupererToken();

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <p>Redirection...</p>;
}