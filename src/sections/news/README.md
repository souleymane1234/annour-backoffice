# Gestion des Actualités - Documentation

## Vue d'ensemble

Le module de gestion des actualités permet aux administrateurs de créer, modifier, publier et gérer les actualités de la plateforme. Il comprend également la gestion des catégories et des médias associés.

## Fonctionnalités

### 1. Liste des Actualités (`admin-news-view.jsx`)
- Affichage de toutes les actualités avec pagination
- Filtres avancés :
  - Recherche par titre ou contenu
  - Filtre par statut de publication (Toutes / Publiées / Brouillons)
  - Filtre par catégorie
- Actions disponibles :
  - Créer une nouvelle actualité
  - Modifier une actualité
  - Publier/Dépublier une actualité
  - Gérer les médias d'une actualité
  - Supprimer une actualité
- Affichage des informations :
  - Titre et résumé
  - Image principale
  - Auteur
  - Catégorie
  - Statut de publication
  - Nombre de vues
  - Date de publication

**Route**: `/admin/news`

### 2. Création/Édition d'Actualité (`news-form-view.jsx`)
- Formulaire complet pour créer ou modifier une actualité
- Champs disponibles :
  - Titre (requis)
  - Résumé (requis)
  - Contenu (requis)
  - Slug (généré automatiquement depuis le titre)
  - Image principale (URL)
  - Source (URL)
  - Catégorie (requis)
  - Auteur
  - Date de publication
  - Statut de publication (publié/brouillon)
- Validation des données avant soumission
- Auto-génération du slug à partir du titre

**Routes**: 
- Création: `/admin/news/create`
- Édition: `/admin/news/:id/edit`

### 3. Gestion des Catégories (`news-categories-view.jsx`)
- Affichage de toutes les catégories
- Actions disponibles :
  - Créer une nouvelle catégorie
  - Modifier une catégorie
  - Supprimer une catégorie (si elle ne contient pas d'actualités)
- Affichage du nombre d'actualités par catégorie

**Route**: `/admin/news/categories`

### 4. Statistiques (`news-stats-view.jsx`)
- Vue d'ensemble des statistiques :
  - Total d'actualités
  - Actualités publiées
  - Brouillons
  - Total de vues
- Actualité la plus consultée
- Statistiques par catégorie

**Route**: `/admin/news/stats`

### 5. Gestion des Médias (`news-media-view.jsx`)
- Ajout et gestion des médias pour une actualité
- Types de médias supportés :
  - IMAGE : Images, photos, illustrations
  - VIDEO : Vidéos et contenus multimédia
  - DOCUMENT : Documents et fichiers PDF
- Actions disponibles :
  - Ajouter un média
  - Modifier un média
  - Supprimer un média
  - Supprimer tous les médias
- Prévisualisation des médias

**Route**: `/admin/news/:id/media`

## API Endpoints

Le module utilise les endpoints suivants :

### Actualités
- `GET /api/v1/admin/news` - Lister les actualités
- `POST /api/v1/admin/news` - Créer une actualité
- `GET /api/v1/admin/news/:id` - Obtenir une actualité
- `PUT /api/v1/admin/news/:id` - Modifier une actualité
- `DELETE /api/v1/admin/news/:id` - Supprimer une actualité
- `GET /api/v1/admin/news/scheduled` - Lister les actualités programmées
- `GET /api/v1/admin/news/stats` - Obtenir les statistiques
- `POST /api/v1/admin/news/:id/schedule` - Programmer une publication
- `POST /api/v1/admin/news/:id/moderate` - Modérer une actualité

### Catégories
- `GET /api/v1/admin/news/categories` - Lister les catégories
- `POST /api/v1/admin/news/categories` - Créer une catégorie
- `GET /api/v1/admin/news/categories/:id` - Obtenir une catégorie
- `PUT /api/v1/admin/news/categories/:id` - Modifier une catégorie
- `DELETE /api/v1/admin/news/categories/:id` - Supprimer une catégorie
- `GET /api/v1/admin/news/categories/:id/stats` - Statistiques d'une catégorie

### Médias
- `POST /api/v1/admin/news/media` - Ajouter un média
- `POST /api/v1/admin/news/media/bulk` - Ajouter plusieurs médias
- `GET /api/v1/admin/news/media/news/:newsId` - Obtenir les médias d'une actualité
- `GET /api/v1/admin/news/media/:id` - Obtenir un média
- `PUT /api/v1/admin/news/media/:id` - Modifier un média
- `DELETE /api/v1/admin/news/media/:id` - Supprimer un média
- `GET /api/v1/admin/news/media/stats/:newsId` - Statistiques des médias
- `DELETE /api/v1/admin/news/media/news/:newsId/all` - Supprimer tous les médias

## Structure des Fichiers

```
src/sections/news/
├── admin-news-view.jsx        # Liste principale des actualités
├── news-form-view.jsx          # Formulaire de création/édition
├── news-categories-view.jsx    # Gestion des catégories
├── news-stats-view.jsx         # Vue des statistiques
├── news-media-view.jsx         # Gestion des médias
├── index.js                    # Export des composants
└── README.md                   # Cette documentation
```

## Services API

Les méthodes API sont définies dans `src/services_workers/consum_api.js` :

### Actualités
- `ConsumApi.createNews(data)` - Créer une actualité
- `ConsumApi.getNews(filters)` - Obtenir les actualités avec filtres
- `ConsumApi.getNewsById(id)` - Obtenir une actualité par ID
- `ConsumApi.updateNews(id, data)` - Mettre à jour une actualité
- `ConsumApi.deleteNews(id)` - Supprimer une actualité
- `ConsumApi.getScheduledNews()` - Obtenir les actualités programmées
- `ConsumApi.getNewsStats()` - Obtenir les statistiques
- `ConsumApi.scheduleNews(id, publishedAt)` - Programmer une publication
- `ConsumApi.moderateNews(id, action, reason)` - Modérer une actualité

### Catégories
- `ConsumApi.getNewsCategories()` - Obtenir toutes les catégories
- `ConsumApi.createNewsCategory(name)` - Créer une catégorie
- `ConsumApi.getNewsCategoryById(id)` - Obtenir une catégorie par ID
- `ConsumApi.updateNewsCategory(id, name)` - Mettre à jour une catégorie
- `ConsumApi.deleteNewsCategory(id)` - Supprimer une catégorie
- `ConsumApi.getNewsCategoryStats(id)` - Obtenir les statistiques d'une catégorie

### Médias
- `ConsumApi.addNewsMedia(newsId, url, type)` - Ajouter un média
- `ConsumApi.addNewsMediaBulk(newsId, mediaList)` - Ajouter plusieurs médias
- `ConsumApi.getNewsMediaByNewsId(newsId)` - Obtenir les médias d'une actualité
- `ConsumApi.getNewsMediaById(id)` - Obtenir un média par ID
- `ConsumApi.updateNewsMedia(id, url, type)` - Mettre à jour un média
- `ConsumApi.deleteNewsMedia(id)` - Supprimer un média
- `ConsumApi.getNewsMediaStats(newsId)` - Obtenir les statistiques des médias
- `ConsumApi.deleteAllNewsMedia(newsId)` - Supprimer tous les médias

## Routes

Les routes sont définies dans `src/constants/routes.js` :

```javascript
adminNews: '/admin/news',
adminNewsCreate: '/admin/news/create',
adminNewsCategories: '/admin/news/categories',
adminNewsStats: '/admin/news/stats',
```

## Navigation

La navigation est configurée dans `src/layouts/dashboard/config-navigation.jsx`. L'item "Actualités" dans le menu principal redirige vers `/admin/news`.

## Utilisation

### Créer une actualité
1. Cliquer sur "Créer une actualité" depuis la liste
2. Remplir le formulaire avec les informations requises
3. Sélectionner une catégorie
4. Activer "Publier l'actualité" pour publier immédiatement
5. Cliquer sur "Créer"

### Gérer les médias
1. Depuis la liste des actualités, cliquer sur "Plus d'actions" (⋮)
2. Sélectionner "Gérer les médias"
3. Ajouter des images, vidéos ou documents via URL
4. Les médias sont associés à l'actualité

### Créer une catégorie
1. Cliquer sur "Catégories" depuis la liste des actualités
2. Cliquer sur "Nouvelle catégorie"
3. Entrer le nom de la catégorie
4. Cliquer sur "Enregistrer"

## Remarques

- Les actualités peuvent être créées en brouillon et publiées plus tard
- Le slug est généré automatiquement depuis le titre
- Une actualité doit avoir une catégorie pour être créée
- Les médias sont stockés via URL (pas de upload de fichiers pour le moment)
- Les catégories ne peuvent être supprimées que si elles ne contiennent aucune actualité

