// Fonction qui permet de récupérer le token stocké dans les cookies
export function recupererToken() {

  // document.cookie contient TOUS les cookies sous forme de texte :
  // exemple : "token=abc123; autreCookie=xyz"
  
  // On transforme cette chaîne de texte en tableau grâce à split
  // => ["token=abc123", "autreCookie=xyz"]
  const cookies = document.cookie.split("; ");

  // On cherche dans le tableau le cookie qui commence par "token="
  // => on récupère uniquement le cookie du token
  const cookieToken = cookies.find((cookie) => cookie.startsWith("token="));

  // Si aucun cookie "token" n'existe → on retourne null
  if (!cookieToken) {
    return null;
  }

  // cookieToken = "token=abc123"
  // On coupe à "=" pour récupérer uniquement la valeur
  // => ["token", "abc123"]
  
  // On retourne la partie droite = le token
  return cookieToken.split("=")[1];
}