import axios from 'axios';

import { apiUrl } from 'src/constants/apiUrl';
import { AdminStorage } from 'src/storages/admins_storage';

/**
 * Upload a media file (image, video, or file) to the server and return the URL
 * @param {File} file - The file to upload
 * @param {string} endpoint - The API endpoint to use (default: adminNewsMedia)
 * @returns {Promise<{success: boolean, url?: string, data?: object, message?: string, errors?: string[]}>}
 */
export const uploadMedia = async (file, endpoint = apiUrl.adminNewsMedia) => {
  try {
    if (!file) {
      return {
        success: false,
        message: 'Aucun fichier sélectionné',
        errors: ['Aucun fichier sélectionné'],
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Get authentication token
    const token = AdminStorage.getTokenAdmin();
    const authToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

    // Make the upload request
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: authToken,
      },
    });

    // Handle response
    if (response.status >= 200 && response.status < 400) {
      const { data: responseData, success, message, error, errors } = response.data;
      const isSuccess = success ?? false;
      const finalMessage = message || '';
      const finalErrors = errors || (error ? [error] : []);

      // Check for token expiration
      if (!isSuccess && finalMessage.toLowerCase().includes('token')) {
        AdminStorage.clearStokage();
        window.location.href = '/login';
        return {
          success: false,
          message: 'Session expirée, veuillez vous reconnecter',
          errors: [],
        };
      }

      // Extract URL from response data
      // The API returns: { success: true, data: { url, secureUrl, publicId, ... } }
      const url = responseData?.secureUrl || responseData?.url || null;

      return {
        success: isSuccess,
        url,
        data: responseData,
        message: finalMessage,
        errors: finalErrors,
      };
    }

    return {
      success: false,
      message: 'Un problème avec le serveur. Veuillez réessayer ultérieurement',
      errors: [],
    };
  } catch (error) {
    console.error('Upload Error:', error);
    
    if (error.response?.data) {
      const { message, error: errorMsg, errors } = error.response.data;
      
      // Check for token expiration
      if (
        message?.toLowerCase().includes('token') ||
        message?.toLowerCase().includes('unauthorized')
      ) {
        AdminStorage.clearStokage();
        window.location.href = '/login';
        return {
          success: false,
          message: 'Session expirée, veuillez vous reconnecter',
          errors: [],
        };
      }

      return {
        success: false,
        message: message || errorMsg || "Une erreur s'est produite lors de l'upload",
        errors: errors || (errorMsg ? [errorMsg] : []),
      };
    }

    return {
      success: false,
      message: "Un problème lors de l'envoi. Veuillez vérifier votre connexion internet",
      errors: [],
    };
  }
};

/**
 * Upload an image file to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, url?: string, data?: object, message?: string, errors?: string[]}>}
 */
export const uploadImage = async (file) => uploadMedia(file, apiUrl.uploadImage);

/**
 * Upload a video file to the server
 * @param {File} file - The video file to upload
 * @returns {Promise<{success: boolean, url?: string, data?: object, message?: string, errors?: string[]}>}
 */
export const uploadVideo = async (file) => uploadMedia(file, apiUrl.uploadVideo);

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @returns {Promise<{success: boolean, url?: string, data?: object, message?: string, errors?: string[]}>}
 */
export const uploadFile = async (file) => uploadMedia(file, apiUrl.uploadFile);

/**
 * Upload multiple media files
 * @param {File[]} files - Array of files to upload
 * @param {string} endpoint - The API endpoint to use (default: adminNewsMedia)
 * @returns {Promise<{success: boolean, urls?: string[], data?: object[], message?: string, errors?: string[]}>}
 */
export const uploadMultipleMedia = async (files, endpoint = apiUrl.adminNewsMedia) => {
  try {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: 'Aucun fichier sélectionné',
        errors: ['Aucun fichier sélectionné'],
      };
    }

    const uploadPromises = files.map((file) => uploadMedia(file, endpoint));
    const results = await Promise.all(uploadPromises);

    // Check if all uploads succeeded
    const allSuccess = results.every((result) => result.success);
    const urls = results
      .filter((result) => result.success && result.url)
      .map((result) => result.url);
    const dataArray = results
      .filter((result) => result.success && result.data)
      .map((result) => result.data);

    if (allSuccess && urls.length === files.length) {
      return {
        success: true,
        urls,
        data: dataArray,
        message: `${urls.length} fichier(s) uploadé(s) avec succès`,
        errors: [],
      };
    }

    // Some uploads failed
    const failedCount = results.filter((result) => !result.success).length;
    const errorMessages = results
      .filter((result) => !result.success)
      .map((result) => result.message)
      .filter(Boolean);

    return {
      success: false,
      urls,
      data: dataArray,
      message: `${urls.length} fichier(s) uploadé(s), ${failedCount} échec(s)`,
      errors: errorMessages,
    };
  } catch (error) {
    console.error('Multiple Upload Error:', error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de l'upload multiple",
      errors: [],
    };
  }
};

/**
 * Get file type from file object
 * @param {File} file - The file object
 * @returns {string} - 'image', 'video', or 'file'
 */
export const getFileType = (file) => {
  if (!file || !file.type) return 'file';
  
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  if (file.type.startsWith('video/')) {
    return 'video';
  }
  return 'file';
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns {boolean}
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  if (!file) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Get human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / (k ** i)) * 100) / 100} ${sizes[i]}`;
};

