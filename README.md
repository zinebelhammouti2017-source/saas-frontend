# Abricot - Application SaaS de gestion de projets et de tâches

## Description

Ce projet a été réalisé dans le cadre de la formation **Développeur Web** d'OpenClassrooms.

Abricot est une application SaaS permettant de gérer des projets collaboratifs et leurs tâches. Les utilisateurs peuvent créer un compte, se connecter, gérer leurs projets, ajouter des contributeurs et suivre l'avancement des tâches grâce à une interface développée avec Next.js.

---

## Fonctionnalités

### Authentification

- Inscription
- Connexion
- Déconnexion
- Gestion du profil utilisateur
- Protection des routes privées

### Gestion des projets

- Création d'un projet
- Modification d'un projet
- Suppression d'un projet
- Gestion des contributeurs

### Gestion des tâches

- Création de tâches
- Modification de tâches
- Suppression de tâches
- Attribution des tâches aux utilisateurs
- Gestion des statuts
- Gestion des priorités
- Ajout de commentaires

### Tableau de bord

- Vue d'ensemble des projets
- Affichage des tâches assignées
- Suivi de l'avancement des projets

---

## Technologies utilisées

- Next.js
- React
- JavaScript
- CSS Modules
- API REST
- Cookies (authentification)
- Git
- GitHub

---

## Structure du projet

```text
src/
├── app/
├── components/
├── services/
├── utils/
├── styles/
└── public/
```

---

## Installation

### Cloner le dépôt

```bash
git clone https://github.com/zinebelhammouti2017-source/saas-frontend.git
```

### Installer les dépendances

```bash
npm install
```

### Lancer le projet

```bash
npm run dev
```

L'application sera accessible à l'adresse suivante :

```
http://localhost:3000
```

---

## Accessibilité

Une attention particulière a été portée à l'accessibilité de l'application :

- amélioration des contrastes ;
- ajout des labels sur les formulaires ;
- navigation au clavier ;
- correction des principales erreurs détectées avec l'outil WAVE.

---

## Responsive Design

L'application est entièrement responsive et s'adapte aux différents formats d'écran :

- Ordinateur
- Tablette
- Mobile

---

## Backend

Ce frontend communique avec une API REST fournie dans le cadre du projet OpenClassrooms.

---

## Auteur

**Zineb El Hammouti**

Projet réalisé dans le cadre de la formation **Développeur Web – OpenClassrooms**.
