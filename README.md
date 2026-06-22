# Trend Dashboard

Un tableau de bord personnel pour suivre l'évolution des tendances Google en temps réel. Des mots-clés sont ajoutés, et l'application récupère automatiquement leur popularité sur Google Trends, stocke l'historique en base de données et affiche des graphiques d'évolution.

---

## Présentation

L'objectif est simple : surveiller si un sujet (une marque, un style vestimentaire, un artiste...) est en train de monter ou de descendre sur Google, sans avoir à le vérifier manuellement chaque jour.

**Fonctionnalités principales :**
- Ajout de mots-clés à suivre (ex : "Streetwear", "Cargo pants"...)
- Affichage du score de popularité de chaque mot-clé (de 0 à 100)
- Identification des mots-clés "en hausse" en temps réel
- Graphique d'évolution sur les 3 derniers mois
- Système de favoris pour épingler les mots-clés importants
- Tri par score, par nom ou par tendance montante
- Ajout de notes personnelles sur chaque mot-clé

---

## Stack technique

| Partie | Technologie |
|---|---|
| Frontend | React 19 + Vite |
| Graphiques | Recharts |
| Navigation | React Router |
| Backend | Node.js + Express |
| Base de données | SQLite (via better-sqlite3) |
| Récupération des données | Python + pytrends (API Google Trends) |
| Tâches planifiées | node-cron |

**Architecture en deux parties :**
- Le **frontend** (React) tourne sur le port `5173` et affiche l'interface
- Le **backend** (Node.js) tourne sur le port `3000` et expose une API REST
- Un **script Python** est appelé par le backend pour récupérer les données sur Google Trends

---

## Prérequis

Avant de commencer, s'assurer d'avoir installé :

- [Node.js](https://nodejs.org/) (version 18 ou plus)
- [Python 3](https://www.python.org/) (version 3.8 ou plus)
- `pip` (gestionnaire de paquets Python, inclus avec Python)

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Snehan-Gn/trend-dashboard.git
cd trend-dashboard
```

### 2. Installer les dépendances Node.js

```bash
# Dépendances du frontend
npm install

# Dépendances du backend
cd backend
npm install
cd ..
```

### 3. Installer les dépendances Python

```bash
cd backend

# Créer un environnement virtuel
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate        # Mac / Linux
# .\venv\Scripts\activate       # Windows

# Installer pytrends
pip install pytrends

cd ..
```

---

## Lancer l'application

Une seule commande suffit pour démarrer le frontend et le backend simultanément :

```bash
npm run dev
```

L'application est ensuite accessible sur **http://localhost:5173**

> Le backend tourne en parallèle sur http://localhost:3000. Il est appelé automatiquement par le frontend.

---

## Structure du projet

```
trend-dashboard/
│
├── src/                        # Code du frontend (React)
│   ├── components/             # Composants réutilisables
│   │   ├── TrendCard.jsx       # Carte affichant un mot-clé
│   │   ├── HistoryChart.jsx    # Graphique d'évolution
│   │   ├── KeywordForm.jsx     # Formulaire d'ajout de mot-clé
│   │   ├── NoteForm.jsx        # Formulaire d'ajout de note
│   │   ├── Navbar.jsx          # Barre de navigation
│   │   └── SparkLine.jsx       # Mini graphique sur les cartes
│   ├── pages/
│   │   └── Rising.jsx          # Page des tendances montantes
│   ├── App.jsx                 # Composant principal + routes
│   └── config.js               # URL de l'API
│
├── backend/
│   ├── server.js               # Serveur Express (API REST)
│   ├── db.js                   # Connexion SQLite + création des tables
│   ├── fetchTrends.js          # Exécution du script Python
│   ├── fetch_trends.py         # Script de récupération Google Trends
│   └── trends.db               # Base de données SQLite (générée automatiquement)
│
├── package.json                # Scripts npm et dépendances frontend
└── vite.config.js              # Configuration Vite
```

---

## Fonctionnement interne

### Base de données

L'application utilise SQLite, une base de données contenue dans un seul fichier (`trends.db`). Elle est composée de trois tables :

- **keywords** : les mots-clés suivis (avec leur statut favori)
- **trends** : l'historique des scores par mot-clé (un enregistrement par jour)
- **notes** : les notes personnelles associées à chaque mot-clé

### Récupération des données

Lors de l'ajout d'un mot-clé, le backend exécute le script Python `fetch_trends.py`. Ce script utilise la librairie `pytrends` pour interroger l'API non officielle de Google Trends et récupère les scores des 3 derniers mois.

Un score de **100** représente la popularité maximale, **50** la moitié, et **0** quasiment aucune recherche.

> Les scores sont calculés **indépendamment** pour chaque mot-clé (une requête par mot-clé). Regrouper plusieurs mots-clés dans une même requête amènerait Google à normaliser les scores entre eux, ce qui biaiserait les résultats.

### Mise à jour automatique

Chaque jour à minuit, une tâche planifiée (`node-cron`) récupère automatiquement les nouvelles données pour l'ensemble des mots-clés suivis. Une mise à jour manuelle est également possible via le bouton **Refresh** de l'interface.

### API REST

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/trends` | Liste des mots-clés avec leur score actuel |
| `POST` | `/api/keywords` | Ajout d'un nouveau mot-clé |
| `DELETE` | `/api/keywords/:id` | Suppression d'un mot-clé et de son historique |
| `PATCH` | `/api/keywords/:id/favorite` | Bascule du statut favori |
| `GET` | `/api/trends/:id` | Détails d'un mot-clé (score + notes) |
| `GET` | `/api/trends/:id/history` | Historique complet des scores |
| `POST` | `/api/notes` | Ajout d'une note sur un mot-clé |
| `POST` | `/api/refresh` | Mise à jour manuelle des données |

---

## Problèmes courants

**Le backend ne démarre pas**
> Vérifier que les deux `npm install` ont bien été effectués (dans `/` et dans `/backend`).

**`ModuleNotFoundError: No module named 'pytrends'`**
> L'environnement virtuel Python n'est pas activé ou `pytrends` n'a pas été installé. Se placer dans `backend/`, activer le venv et relancer `pip install pytrends`.

**Erreur 429 (Too Many Requests)**
> Google Trends limite le nombre de requêtes. Le script retente automatiquement jusqu'à 4 fois avec un délai croissant. Si l'erreur persiste, attendre quelques minutes avant de réessayer.

**Les données ne se mettent pas à jour**
> Utiliser le bouton "Refresh" dans l'interface ou redémarrer le serveur. Au démarrage, le serveur vérifie automatiquement si les données du jour sont présentes et les récupère si nécessaire.
