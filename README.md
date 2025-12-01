# WebCraft AI - Créateur de Sites Web Intelligent

Bienvenue dans la documentation technique de WebCraft AI. Ce guide vous expliquera comment cloner, configurer et lancer le projet en local pour le développement.

## 1. Architecture du Projet

WebCraft AI est une application web "serverless" qui s'appuie entièrement sur l'écosystème **Supabase** pour son backend.

-   **Authentification** : Gérée par Supabase Auth (Email/Password, OAuth).
-   **Base de Données** : PostgreSQL avec des politiques de sécurité au niveau des lignes (RLS) pour garantir l'isolation des données utilisateur.
-   **Temps Réel** : Supabase Realtime est utilisé pour les mises à jour en direct (statut de génération, collaboration).
-   **Frontend** : HTML, CSS, et JavaScript vanilla (ES Modules) communiquant directement avec l'API Supabase via le client JS.
-   **Workflows IA** : Déclenchés via des webhooks vers un service externe comme n8n, qui utilise la clé `service_role` de Supabase pour effectuer des opérations en arrière-plan.

## 2. Prérequis

-   [Git](https://git-scm.com/) pour cloner le dépôt.
-   Un compte [Supabase](https://supabase.com/) pour créer votre backend.
-   Un serveur de développement local pour servir les fichiers statiques (ex: VS Code Live Server, `python -m http.server`, ou `npx http-server`).

## 3. Configuration du Projet

Suivez ces étapes pour mettre en place votre environnement de développement local.

### Étape 1 : Cloner le Dépôt

Ouvrez votre terminal et clonez le dépôt sur votre machine locale :

```bash
git clone https://github.com/votre-utilisateur/webcraft-ai.git
cd webcraft-ai
```

### Étape 2 : Créer un Projet Supabase

1.  Rendez-vous sur [supabase.com](https://supabase.com/) et créez un nouveau projet.
2.  Choisissez un nom et une région pour votre projet.
3.  **Important** : Lors de la création, générez et sauvegardez en lieu sûr le mot de passe de votre base de données.

### Étape 3 : Appliquer le Schéma de Base de Données

Une fois votre projet Supabase créé :

1.  Dans le tableau de bord de votre projet, allez dans la section **SQL Editor**.
2.  Cliquez sur **New query**.
3.  Copiez l'intégralité du contenu du fichier `schema.sql` de ce dépôt.
4.  Collez le contenu dans l'éditeur SQL et cliquez sur **RUN**.

Cela créera toutes les tables, relations, fonctions et politiques de sécurité (RLS) nécessaires au bon fonctionnement de l'application.

### Étape 4 : Configurer les Clés d'API Supabase

Le frontend a besoin de connaître l'URL de votre projet Supabase et sa clé publique `anon` pour communiquer avec le backend.

1.  Dans le tableau de bord Supabase, allez dans **Project Settings** > **API**.
2.  Vous y trouverez :
    -   L'**URL** du projet.
    -   La clé publique **`anon`** (Project API Keys > `anon` `public`).
3.  Ouvrez le fichier `supabaseClient.js` dans votre éditeur de code.
4.  Remplacez les placeholders par vos propres clés :

    ```javascript
    // Dans supabaseClient.js

    // Remplacez ces valeurs par les vôtres
    const SUPABASE_URL = 'VOTRE_URL_SUPABASE_ICI'; // ex: 'https://xyz.supabase.co'
    const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_ICI';

    // ...
    ```

### Étape 5 (Optionnel) : Configurer les Fournisseurs OAuth

Si vous souhaitez utiliser la connexion via Google, GitHub, etc. :

1.  Allez dans **Authentication** > **Providers** dans votre tableau de bord Supabase.
2.  Activez les fournisseurs de votre choix.
3.  Suivez les instructions pour obtenir les `Client ID` et `Client Secret` de chaque plateforme.
4.  **Important** : Assurez-vous que l'URL de callback dans la configuration de votre fournisseur OAuth correspond à celle fournie par Supabase. Pour le développement local, elle est généralement de la forme `http://127.0.0.1:5500` ou similaire.

## 4. Lancement du Serveur de Développement

Ce projet utilise des modules JavaScript (`type="module"`). Pour cette raison, vous ne pouvez pas ouvrir les fichiers `*.html` directement dans votre navigateur (via le protocole `file:///`). Vous devez les servir via un serveur HTTP local.

Voici quelques options simples :

#### Option A : VS Code Live Server

Si vous utilisez Visual Studio Code, installez l'extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) et cliquez sur "Go Live" en bas à droite de votre éditeur.

#### Option B : Python

Si vous avez Python installé, ouvrez un terminal à la racine du projet et exécutez :

```bash
# Pour Python 3
python -m http.server

# Pour Python 2
python -m SimpleHTTPServer
```

Le site sera accessible sur `http://localhost:8000`.

#### Option C : Node.js (http-server)

Si vous avez Node.js, vous pouvez utiliser le package `http-server` :

```bash
npx http-server .
```

Le site sera accessible sur `http://localhost:8080`.

---

Votre environnement de développement est maintenant prêt ! Vous pouvez commencer à coder.