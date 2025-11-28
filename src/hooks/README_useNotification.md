# Hook useNotification

Hook personnalisé pour gérer les notifications de l'API AlloEcole.

## Format de réponse API

```javascript
{
  success: boolean,
  message: string,
  data?: any,
  errors?: array
}
```

## Utilisation de base

### 1. Avec notification et récupération des données

```javascript
import { useNotification } from 'src/hooks/useNotification';
import ConsumApi from 'src/services_workers/consum_api';

export default function MonComposant() {
  const { contextHolder, showApiResponse } = useNotification();
  const [ecoles, setEcoles] = useState([]);

  const loadEcoles = async () => {
    const response = await ConsumApi.getAllEcoles();

    // Affiche la notification ET récupère les données
    const result = showApiResponse(response, {
      successTitle: 'Écoles chargées',
      errorTitle: 'Erreur de chargement',
    });

    if (result.success) {
      // Utiliser les données retournées
      setEcoles(result.data);
      console.log('Données récupérées:', result.data);
    }
  };

  return (
    <div>
      {contextHolder}
      {/* Votre contenu */}
    </div>
  );
}
```

### 2. Récupération silencieuse (sans notification)

```javascript
const { processApiResponse } = useNotification();

const checkData = async () => {
  const response = await ConsumApi.getDashboard();

  // Traite la réponse SANS afficher de notification
  const result = processApiResponse(response);

  if (result.success) {
    console.log('Données:', result.data);
    return result.data;
  } else {
    console.error('Erreur:', result.message, result.errors);
    return null;
  }
};
```

### 3. Notifications manuelles

```javascript
const { showSuccess, showError, showWarning, showInfo } = useNotification();

// Succès
showSuccess('Opération réussie', "L'école a été créée avec succès");

// Erreur
showError('Erreur', "Impossible de créer l'école");

// Avertissement
showWarning('Attention', 'Certaines données sont manquantes');

// Information
showInfo('Information', 'Pensez à vérifier vos données');
```

## Exemples d'utilisation avancés

### Exemple 1: Création d'une école avec gestion complète

```javascript
const { contextHolder, showApiResponse } = useNotification();

const handleCreateEcole = async (formData) => {
  try {
    const response = await ConsumApi.createEcole(formData);

    const result = showApiResponse(response, {
      successTitle: 'École créée',
      errorTitle: 'Erreur de création',
    });

    if (result.success) {
      // Redirection ou actualisation
      router.push(`/ecoles/${result.data.id}`);
    } else {
      // Gérer les erreurs spécifiques
      if (result.errors.length > 0) {
        console.log('Erreurs détaillées:', result.errors);
      }
    }
  } catch (error) {
    showError('Erreur système', 'Une erreur inattendue est survenue');
  }
};
```

### Exemple 2: Chargement de données avec gestion de session

```javascript
const { contextHolder, showApiResponse, showError } = useNotification();

const loadData = async () => {
  const response = await ConsumApi.getFormations();

  const result = showApiResponse(response, {
    errorTitle: 'Erreur de chargement',
  });

  if (result.success) {
    setFormations(result.data);
  } else if (result.message.includes('Session Expiré')) {
    // Session expirée - redirection
    setTimeout(() => router.replace('/login'), 2000);
  }
};
```

### Exemple 3: Traitement par lot sans notifications

```javascript
const { processApiResponse } = useNotification();

const loadMultipleData = async () => {
  const [ecolesRes, formationsRes, boursesRes] = await Promise.all([
    ConsumApi.getAllEcoles(),
    ConsumApi.getAllFormations(),
    ConsumApi.getAllBourses(),
  ]);

  // Traiter sans notifier
  const ecoles = processApiResponse(ecolesRes);
  const formations = processApiResponse(formationsRes);
  const bourses = processApiResponse(boursesRes);

  if (ecoles.success && formations.success && bourses.success) {
    // Toutes les données sont chargées
    setData({
      ecoles: ecoles.data,
      formations: formations.data,
      bourses: bourses.data,
    });

    // Notification globale de succès
    showSuccess('Données chargées', 'Toutes les données ont été chargées');
  } else {
    showError('Erreur partielle', "Certaines données n'ont pas pu être chargées");
  }
};
```

### Exemple 4: Formulaire avec validation

```javascript
const { contextHolder, showApiResponse, showError } = useNotification();

const handleSubmit = async (formData) => {
  // Validation locale
  if (!formData.nom || !formData.email) {
    showError('Validation', 'Veuillez remplir tous les champs obligatoires');
    return;
  }

  // Envoi à l'API
  const response = await ConsumApi.createBourse(formData);

  const result = showApiResponse(response, {
    successTitle: 'Bourse créée',
    errorTitle: 'Erreur de création',
  });

  if (result.success) {
    // Réinitialiser le formulaire
    resetForm();
    // Actualiser la liste
    refetchBourses();
  }
};
```

## API du hook

### Fonctions exportées

| Fonction                             | Description                              | Retour      |
| ------------------------------------ | ---------------------------------------- | ----------- |
| `contextHolder`                      | Composant React à placer dans le JSX     | JSX Element |
| `showSuccess(title, description)`    | Affiche une notification de succès       | void        |
| `showError(title, description)`      | Affiche une notification d'erreur        | void        |
| `showWarning(title, description)`    | Affiche une notification d'avertissement | void        |
| `showInfo(title, description)`       | Affiche une notification d'information   | void        |
| `showApiResponse(response, options)` | Traite et notifie une réponse API        | Object      |
| `processApiResponse(response)`       | Traite une réponse sans notifier         | Object      |

### Options de showApiResponse

```javascript
{
  successTitle: string,      // Titre personnalisé pour succès
  errorTitle: string,         // Titre personnalisé pour erreur
  showNotification: boolean   // Afficher ou non (défaut: true)
}
```

### Objet retourné

```javascript
{
  success: boolean,   // true si opération réussie
  data: any,         // Données retournées (null en cas d'erreur)
  message: string,   // Message de l'API
  errors: array      // Liste des erreurs (vide si succès)
}
```

## Notes importantes

1. **Toujours inclure contextHolder** : `{contextHolder}` doit être dans le JSX
2. **Gestion des erreurs** : Le hook gère automatiquement les erreurs multiples
3. **Position** : Les notifications apparaissent en haut à droite
4. **Durée** : Succès (4s), Erreur (5s), Warning/Info (4s)
5. **Format API** : Le hook attend `{ success, message, data?, errors[]? }`
