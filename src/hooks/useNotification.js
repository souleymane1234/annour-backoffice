import { notification } from 'antd';

/**
 * Hook personnalisé pour gérer les notifications de l'API
 * Format de réponse API: { data?, success, message, errors[]? }
 */
export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  /**
   * Affiche une notification de succès
   */
  const showSuccess = (title, description) => {
    api.success({
      message: title,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  /**
   * Affiche une notification d'erreur
   */
  const showError = (title, description) => {
    api.error({
      message: title,
      description,
      placement: 'topRight',
      duration: 5,
    });
  };

  /**
   * Affiche une notification d'avertissement
   */
  const showWarning = (title, description) => {
    api.warning({
      message: title,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  /**
   * Affiche une notification d'information
   */
  const showInfo = (title, description) => {
    api.info({
      message: title,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  /**
   * Traite automatiquement une réponse API et affiche la notification appropriée
   * @param {Object} apiResponse - Réponse de l'API { data?, success, message, errors[]? }
   * @param {Object} options - Options personnalisées
   * @param {string} options.successTitle - Titre personnalisé pour le succès
   * @param {string} options.errorTitle - Titre personnalisé pour l'erreur
   * @param {boolean} options.showNotification - Afficher ou non la notification (défaut: true)
   * @returns {Object} - { success: boolean, data: any, message: string, errors: array }
   */
  const showApiResponse = (apiResponse, options = {}) => {
    const { successTitle = 'Succès', errorTitle = 'Erreur', showNotification = true } = options;

    if (!apiResponse) {
      if (showNotification) {
        showError(errorTitle, 'Aucune réponse du serveur');
      }
      return {
        success: false,
        data: null,
        message: 'Aucune réponse du serveur',
        errors: [],
      };
    }

    const { success, message, errors, data } = apiResponse;

    if (success) {
      // Succès - afficher le message de succès
      if (showNotification) {
        showSuccess(successTitle, message || 'Opération réussie');
      }
      return {
        success: true,
        data,
        message: message || 'Opération réussie',
        errors: [],
      };
    }

    // Erreur - construire le message d'erreur
    let errorDescription = message || 'Une erreur est survenue';

    // Ajouter les erreurs détaillées si disponibles
    if (errors && errors.length > 0) {
      const errorsList = errors
        .map(
          (err, index) =>
            `${index + 1}. ${typeof err === 'string' ? err : err.message || JSON.stringify(err)}`
        )
        .join('\n');
      errorDescription = `${errorDescription}\n\n${errorsList}`;
    }

    if (showNotification) {
      showError(errorTitle, errorDescription);
    }

    return {
      success: false,
      data: null,
      message: message || 'Une erreur est survenue',
      errors: errors || [],
    };
  };

  /**
   * Traite une réponse API sans afficher de notification
   * Utile pour récupérer les données silencieusement
   * @param {Object} apiResponse - Réponse de l'API { data?, success, message, errors[]? }
   * @returns {Object} - { success: boolean, data: any, message: string, errors: array }
   */
  const processApiResponse = (apiResponse) =>
    showApiResponse(apiResponse, { showNotification: false });

  return {
    contextHolder,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiResponse,
    processApiResponse,
  };
};
