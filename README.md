# Disponibilité des bureaux

Web app interne pour voir en temps réel quels espaces de travail sont libres ou occupés dans les bureaux Alloprof, via Google Calendar.

## Fonctionnalités

- Authentification via compte Google Workspace (@alloprof.qc.ca)
- Vue par bureau (onglets) avec rafraîchissement automatique toutes les 3 minutes
- Plan de salle visuel pour le bureau MTL
- Grille de disponibilité pour Québec et Papineau
- Affichage du nom du réservateur sur les espaces occupés
- Sélecteur de date/heure pour voir la disponibilité à un moment précis

## Stack

- [Next.js 14](https://nextjs.org) (App Router)
- [NextAuth.js v5](https://authjs.dev) — Google OAuth
- [Google Calendar API](https://developers.google.com/calendar) + [Admin SDK](https://developers.google.com/admin-sdk)
- [Tailwind CSS](https://tailwindcss.com)

## Développement local

### 1. Prérequis Google Cloud

1. Créer un projet dans [Google Cloud Console](https://console.cloud.google.com)
2. Activer **Google Calendar API** et **Admin SDK API**
3. Créer des credentials OAuth 2.0 (type : Application Web)
   - Redirect URI : `http://localhost:3000/api/auth/callback/google`
4. L'utilisateur connecté doit avoir un rôle admin Google Workspace pour accéder aux ressources

### 2. Variables d'environnement

Copier `.env.example` en `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...   # générer avec : npx auth secret
```

### 3. Lancer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration du plan de salle MTL

Le fichier [`lib/mtl-floorplan.ts`](lib/mtl-floorplan.ts) définit la disposition des bureaux.  
Les ressources sont matchées automatiquement via le pattern `Bureau #N` dans leur nom Google Workspace.

Pour changer l'ID du bâtiment MTL, modifier `MTL_BUILDING_ID` dans ce même fichier.

## Déploiement sur Vercel

### 1. Variables d'environnement

Dans Vercel → projet → Settings → Environment Variables, ajouter :

| Variable | Valeur |
|---|---|
| `GOOGLE_CLIENT_ID` | ID client OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Secret client OAuth Google |
| `AUTH_SECRET` | Valeur générée avec `npx auth secret` |

### 2. Redirect URI

Dans Google Cloud Console → Credentials → OAuth client, ajouter l'URI de prod :

```
https://votre-domaine.vercel.app/api/auth/callback/google
```

### 3. Deploy

```bash
npm i -g vercel
vercel
```
