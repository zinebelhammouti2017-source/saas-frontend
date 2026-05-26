"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { recupererToken } from "@/utils/cookies";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = recupererToken();

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <p>Redirection...</p>;
}