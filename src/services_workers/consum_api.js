import axios from 'axios';

import { apiUrl } from 'src/constants/apiUrl';
import { useAdminStore } from 'src/store/useAdminStore';
import { AdminStorage } from 'src/storages/admins_storage';

import apiClient from './apiClient';

export default class ConsumApi {
  static api = axios.create({ headers: { 'Access-Control-Allow-Origin': '*' } });

  // ========== AUTHENTICATION ==========

  static async login({ email, password }) {
    const result = await apiClient.post(apiUrl.authentication, { email, password });
    console.log('Login response:', result);
    if (result.success && result.data) {
      // La nouvelle structure de l'API retourne : { accessToken, refreshToken, user }
      updateClientInfo(result.data);
      return { 
        data: result.data.user, 
        success: true, 
        message: result.message || 'Connexion réussie' 
      };
    }
    return { 
      success: false, 
      message: result.message || 'Erreur de connexion',
      errors: result.errors || []
    };
  }

  static async resetPassword({ email }) {
    return apiClient.put(apiUrl.resetPassword, { email });
  }

  // ========== SUPER ADMIN - CRITICAL ADMINISTRATION ACTIONS ==========

  // Kill switch - Blocage système d'urgence
  static async activateKillSwitch() {
    return apiClient.post(apiUrl.adminCriticalKillSwitch);
  }

  // Bannir un pompiste
  static async banPompiste(pompisteId) {
    return apiClient.post(apiUrl.adminCriticalPompisteBan(pompisteId));
  }

  // Réassigner un pompiste à une autre station
  static async reassignPompiste(pompisteId, newStationId) {
    const body = { newStationId };
    return apiClient.post(apiUrl.adminCriticalPompisteReassign(pompisteId), body);
  }

  // Corriger un réservoir (erreur déclarée)
  static async correctReservoir(sessionId, correctedCapacity) {
    const body = { correctedCapacity };
    return apiClient.post(apiUrl.adminCriticalSessionCorrectReservoir(sessionId), body);
  }

  // Corriger une capacité servie (en cas de fraude)
  static async correctServedCapacity(sessionId, correctedCapacity) {
    const body = { correctedCapacity };
    return apiClient.post(apiUrl.adminCriticalSessionCorrectServed(sessionId), body);
  }

  // Bannir une station
  static async banStation(stationId) {
    return apiClient.post(apiUrl.adminCriticalStationBan(stationId));
  }

  // Supprimer définitivement une station
  static async deleteStationPermanent(stationId) {
    return apiClient.delete(apiUrl.adminCriticalStationDelete(stationId));
  }

  // Bannir un utilisateur (admin/station/user)
  static async banUser(userId) {
    return apiClient.post(apiUrl.adminCriticalUserBan(userId));
  }

  // Supprimer un utilisateur du système
  static async deleteUserPermanent(userId) {
    return apiClient.delete(apiUrl.adminCriticalUserDelete(userId));
  }

  // Réinitialiser les passages d'un utilisateur
  static async resetUserPassages(userId) {
    return apiClient.post(apiUrl.adminCriticalUserResetPassages(userId));
  }

  // ========== SUPER ADMIN - ADMINISTRATION ADMINS MANAGEMENT ==========

  // Obtenir tous les Admins
  static async getAdministrationAdmins() {
    return apiClient.get(apiUrl.adminAdministrationAdmins);
  }

  // Obtenir un Admin par ID
  static async getAdministrationAdminById(adminId) {
    return apiClient.get(apiUrl.adminAdministrationAdminById(adminId));
  }

  // Voir l'activité d'un Admin
  static async getAdministrationAdminActivity(adminId) {
    return apiClient.get(apiUrl.adminAdministrationAdminActivity(adminId));
  }

  // Créer un Admin
  static async createAdministrationAdmin({ email, phone, password, firstName, lastName }) {
    const body = { email, phone, password, firstName, lastName };
    return apiClient.post(apiUrl.adminAdministrationAdmins, body);
  }

  // Réinitialiser le mot de passe d'un Admin
  static async resetAdministrationAdminPassword(adminId, newPassword) {
    const body = { newPassword };
    return apiClient.post(apiUrl.adminAdministrationAdminResetPassword(adminId), body);
  }

  // Mettre à jour un Admin
  static async updateAdministrationAdmin(adminId, { email, phone, firstName, lastName, isSuspended }) {
    const body = { email, phone, firstName, lastName, isSuspended };
    return apiClient.put(apiUrl.adminAdministrationAdminById(adminId), body);
  }

  // Activer/désactiver un Admin
  static async updateAdministrationAdminStatus(adminId, isSuspended) {
    const url = `${apiUrl.adminAdministrationAdminStatus(adminId)}?isSuspended=${isSuspended}`;
    // PATCH avec paramètres dans l'URL (query string)
    return apiClient.request('PATCH', url, null);
  }

  // Supprimer un Admin
  static async deleteAdministrationAdmin(adminId) {
    return apiClient.delete(apiUrl.adminAdministrationAdminById(adminId));
  }

  // ========== FILE ACTIVE MANAGEMENT ==========

  // Obtenir la file active d'une session
  static async getFileActiveBySession(sessionId) {
    return apiClient.get(apiUrl.administrationFileActiveBySession(sessionId));
  }

  // Modifier le statut d'un utilisateur dans FILE ACTIVE
  static async updateFileActiveStatus(fileActiveId, status) {
    const body = { status };
    const url = apiUrl.administrationFileActiveUpdateStatus(fileActiveId);
    return apiClient.request('PATCH', url, body);
  }

  // ============================================
  // Administration - Global Configuration
  // ============================================

  // Récupérer toutes les configurations système
  static async getAdministrationConfig() {
    return apiClient.get(apiUrl.administrationConfig);
  }

  // Récupérer une configuration spécifique
  static async getAdministrationConfigByKey(key) {
    return apiClient.get(apiUrl.administrationConfigByKey(key));
  }

  // Mettre à jour une configuration générique
  static async updateAdministrationConfig(key, value, description = null) {
    const body = { value };
    if (description) {
      body.description = description;
    }
    return apiClient.put(apiUrl.administrationConfigByKey(key), body);
  }

  // Config notifications
  static async updateAdministrationConfigNotifications({ pushEnabled, emailEnabled, smsEnabled }) {
    const body = {
      pushEnabled: pushEnabled ?? false,
      emailEnabled: emailEnabled ?? false,
      smsEnabled: smsEnabled ?? false,
    };
    return apiClient.put(apiUrl.administrationConfigNotifications, body);
  }

  // Définir limite passages (ex: 1/jour – 2/semaine)
  static async updateAdministrationConfigPassagesLimits({ dailyLimit, weeklyLimit }) {
    const body = {
      dailyLimit: dailyLimit ?? null,
      weeklyLimit: weeklyLimit ?? null,
    };
    return apiClient.put(apiUrl.administrationConfigPassagesLimits, body);
  }

  // Définir durée validité QR Code
  static async updateAdministrationConfigQRCodeValidity({ validityMinutes }) {
    const body = {
      validityMinutes: validityMinutes ?? 15,
    };
    return apiClient.put(apiUrl.administrationConfigQRCodeValidity, body);
  }

  // Définir rayon minimum/maximum stations
  static async updateAdministrationConfigStationRadius({ minRadiusKm, maxRadiusKm }) {
    const body = {
      minRadiusKm: minRadiusKm ?? null,
      maxRadiusKm: maxRadiusKm ?? null,
    };
    return apiClient.put(apiUrl.administrationConfigStationRadius, body);
  }

  // ============================================
  // Administration - Reports & Statistics
  // ============================================

  // Occupation des files actives
  static async getReportsActiveFilesOccupation() {
    return apiClient.get(apiUrl.administrationReportsActiveFilesOccupation);
  }

  // Moyenne temps service pompiste
  static async getReportsAverageServiceTime() {
    return apiClient.get(apiUrl.administrationReportsAverageServiceTime);
  }

  // Litres distribués par jour / semaine / mois
  static async getReportsLitersDistribution(period) {
    if (!['day', 'week', 'month'].includes(period)) {
      throw new Error('Period must be "day", "week", or "month"');
    }
    return apiClient.get(apiUrl.administrationReportsLitersDistribution(period));
  }

  // Stations les plus actives
  static async getReportsMostActiveStations(limit = null) {
    return apiClient.get(apiUrl.administrationReportsMostActiveStations(limit));
  }

  // Taux de refus / expiration par station
  static async getReportsRefusalExpirationRates() {
    return apiClient.get(apiUrl.administrationReportsRefusalExpirationRates);
  }

  // Nombre total de passages (1/jour — 2/7j)
  static async getReportsTotalPassages(period) {
    if (!['day', 'week'].includes(period)) {
      throw new Error('Period must be "day" or "week"');
    }
    return apiClient.get(apiUrl.administrationReportsTotalPassages(period));
  }

  // Croissance des utilisateurs
  static async getReportsUserGrowth() {
    return apiClient.get(apiUrl.administrationReportsUserGrowth);
  }

  // Export CSV / Excel / PDF (statistiques par station, audit)
  static async exportReports({ reportType, format, stationId = null, startDate = null, endDate = null }) {
    const body = {
      reportType: reportType || 'NATIONAL',
      format: format || 'CSV',
    };
    
    if (stationId) {
      body.stationId = stationId;
    }
    if (startDate) {
      body.startDate = startDate;
    }
    if (endDate) {
      body.endDate = endDate;
    }

    // Pour les exports, nous utilisons axios directement pour gérer le blob
    try {
      const token = AdminStorage.getTokenAdmin();
      const authToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await ConsumApi.api.post(apiUrl.administrationReportsExport, body, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
      });

      return {
        success: true,
        data: response.data,
        blob: response.data,
        contentType: response.headers['content-type'],
        message: 'Rapport exporté avec succès',
        errors: [],
      };
    } catch (error) {
      console.error('Export Error:', error);
      if (error.response?.data) {
        // Si la réponse est un blob d'erreur, essayer de le lire
        const errorBlob = error.response.data;
        const errorText = await errorBlob.text();
        let errorMessage = 'Erreur lors de l\'export';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // Si ce n'est pas du JSON, utiliser le texte brut
        }
        return {
          success: false,
          message: errorMessage,
          errors: [errorMessage],
        };
      }
      return {
        success: false,
        message: "Erreur lors de l'export du rapport",
        errors: [],
      };
    }
  }

  // ============================================
  // Administration - Roles & Permissions
  // ============================================

  // Obtenir la matrice des rôles et permissions
  static async getRolesPermissionsMatrix() {
    return apiClient.get(apiUrl.administrationRolesPermissionsMatrix);
  }

  // Voir tous les utilisateurs (tous rôles confondus)
  static async getRolesUsers() {
    return apiClient.get(apiUrl.administrationRolesUsers);
  }

  // Obtenir un utilisateur par ID
  static async getRolesUserById(userId) {
    return apiClient.get(apiUrl.administrationRolesUserById(userId));
  }

  // Forcer la déconnexion d'un utilisateur
  static async disconnectRolesUser(userId) {
    return apiClient.post(apiUrl.administrationRolesUserDisconnect(userId), {});
  }

  // Forcer un reset de mot de passe utilisateur
  static async resetRolesUserPassword(userId, newPassword) {
    const body = { newPassword };
    return apiClient.post(apiUrl.administrationRolesUserResetPassword(userId), body);
  }

  // Modifier le rôle d'un utilisateur (déclasser/promouvoir)
  static async updateRolesUserRole(userId, role) {
    const body = { role };
    return apiClient.put(apiUrl.administrationRolesUserUpdateRole(userId), body);
  }

  // ============================================
  // Stations Management
  // ============================================

  // Obtenir toutes les stations
  static async getStations() {
    return apiClient.get(apiUrl.stations);
  }

  // Obtenir l'historique complet d'une station
  static async getStationById(stationId) {
    return apiClient.get(apiUrl.stationById(stationId));
  }

  // Obtenir la capacité consommée d'une station
  static async getStationCapacity(stationId) {
    return apiClient.get(apiUrl.stationCapacity(stationId));
  }

  // Obtenir les files actives d'une station
  static async getStationFiles(stationId) {
    return apiClient.get(apiUrl.stationFiles(stationId));
  }

  // Obtenir la performance des pompistes d'une station
  static async getStationPompistesPerformance(stationId) {
    return apiClient.get(apiUrl.stationPompistesPerformance(stationId));
  }

  // Obtenir toutes les sessions d'une station
  static async getStationSessions(stationId) {
    return apiClient.get(apiUrl.stationSessions(stationId));
  }

  // Créer une nouvelle station
  static async createStation({ name, latitude, longitude, capacityTotal, capacityRemaining, volumePerService, isActive = true }) {
    const body = {
      name,
      latitude,
      longitude,
      capacityTotal,
      capacityRemaining: capacityRemaining ?? capacityTotal,
      volumePerService,
      isActive,
    };
    return apiClient.post(apiUrl.stations, body);
  }

  // Créer un pompiste pour une station
  static async createStationPompiste(stationId, { email, phone, password, firstName, lastName }) {
    const body = { email, phone, password, firstName, lastName };
    return apiClient.post(apiUrl.stationPompistes(stationId), body);
  }

  // Réinitialiser une station (forcer fermeture de toutes les sessions actives)
  static async resetStation(stationId) {
    return apiClient.post(apiUrl.stationReset(stationId));
  }

  // Modifier une station
  static async updateStation(stationId, { name, latitude, longitude, capacityTotal, capacityRemaining, volumePerService, isActive }) {
    const body = {
      name,
      latitude,
      longitude,
      capacityTotal,
      capacityRemaining,
      volumePerService,
      isActive,
    };
    return apiClient.put(apiUrl.stationById(stationId), body);
  }

  // Activer/désactiver une station
  static async updateStationStatus(stationId, isActive) {
    const url = `${apiUrl.stationStatus(stationId)}?isActive=${isActive}`;
    return apiClient.request('PATCH', url, null);
  }

  // Supprimer une station
  static async deleteStation(stationId) {
    return apiClient.delete(apiUrl.stationById(stationId));
  }
}

// Fonction pour normaliser le rôle depuis l'API vers le format interne
const normalizeRole = (role) => {
  if (!role) return null;
  
  const roleUpper = role.toUpperCase();
  
  // Normaliser les différentes variations possibles
  if (roleUpper === 'SUPERADMIN' || roleUpper === 'SUPER_ADMIN') {
    return 'SUPERADMIN';
  }
  if (roleUpper === 'ADMIN') {
    return 'ADMIN';
  }
  if (roleUpper === 'STATION') {
    return 'STATION';
  }
  
  // Retourner le rôle tel quel s'il n'est pas reconnu
  return roleUpper;
};

const updateClientInfo = (data) => {
  // Nouvelle structure de l'API : { accessToken, refreshToken, user: { id, email, phone, firstName, lastName, role } }
  const { id, email, phone, firstName, lastName, role } = data.user;
  
  // Normaliser le rôle
  const normalizedRole = normalizeRole(role);
  
  const adminData = { 
    id, 
    email, 
    phone: phone || null,
    firstName: firstName || null,
    lastName: lastName || null,
    role: normalizedRole,
    // Nom complet pour l'affichage
    nom_complet: firstName && lastName ? `${firstName} ${lastName}` : email,
    // Champs optionnels pour compatibilité avec l'ancien code
    emailVerifie: true, // Par défaut, l'utilisateur connecté a un email vérifié
    premiumActif: false, // À mettre à jour selon les besoins
    dateCreation: new Date().toISOString(), // Date de connexion
  };
  useAdminStore.getState().setAdmin(adminData);
  AdminStorage.saveInfoAdmin(adminData);
  AdminStorage.saveTokenAdmin(data.accessToken);
  AdminStorage.saveRefreshToken(data.refreshToken);

  console.log('Admin data saved:', adminData);
};
