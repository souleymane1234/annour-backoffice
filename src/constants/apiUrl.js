// const base_url = import.meta.env.VITE_BASE_URL;
const base_url = 'https://carbugo-dev.up.railway.app/api/v1';
const base_url_asset = import.meta.env.VITE_BASE_URL_ASSET;

export const apiUrl = {
  // Authentication
  authentication: `${base_url}/auth/login`,
  resetPassword: `${base_url}/reset-passord`,

  // Super Admin - Critical Administration Actions
  adminCriticalKillSwitch: `${base_url}/administration/critical/kill-switch`,
  adminCriticalPompisteBan: (pompisteId) => `${base_url}/administration/critical/pompistes/${pompisteId}/ban`,
  adminCriticalPompisteReassign: (pompisteId) => `${base_url}/administration/critical/pompistes/${pompisteId}/reassign`,
  adminCriticalSessionCorrectReservoir: (sessionId) => `${base_url}/administration/critical/sessions/${sessionId}/correct-reservoir`,
  adminCriticalSessionCorrectServed: (sessionId) => `${base_url}/administration/critical/sessions/${sessionId}/correct-served`,
  adminCriticalStationBan: (stationId) => `${base_url}/administration/critical/stations/${stationId}/ban`,
  adminCriticalStationDelete: (stationId) => `${base_url}/administration/critical/stations/${stationId}/permanent`,
  adminCriticalUserBan: (userId) => `${base_url}/administration/critical/users/${userId}/ban`,
  adminCriticalUserDelete: (userId) => `${base_url}/administration/critical/users/${userId}`,
  adminCriticalUserResetPassages: (userId) => `${base_url}/administration/critical/users/${userId}/reset-passages`,

  // Super Admin - Administration Admins Management
  adminAdministrationAdmins: `${base_url}/administration/admins`,
  adminAdministrationAdminById: (adminId) => `${base_url}/administration/admins/${adminId}`,
  adminAdministrationAdminActivity: (adminId) => `${base_url}/administration/admins/${adminId}/activity`,
  adminAdministrationAdminResetPassword: (adminId) => `${base_url}/administration/admins/${adminId}/reset-password`,
  adminAdministrationAdminStatus: (adminId) => `${base_url}/administration/admins/${adminId}/status`,

  // File Active Management
  administrationFileActiveBySession: (sessionId) => `${base_url}/administration/file-active/session/${sessionId}`,
  administrationFileActiveUpdateStatus: (fileActiveId) => `${base_url}/administration/file-active/${fileActiveId}/status`,

  // Administration - Global Configuration
  administrationConfig: `${base_url}/administration/config`,
  administrationConfigByKey: (key) => `${base_url}/administration/config/${key}`,
  administrationConfigNotifications: `${base_url}/administration/config/notifications`,
  administrationConfigPassagesLimits: `${base_url}/administration/config/passages/limits`,
  administrationConfigQRCodeValidity: `${base_url}/administration/config/qr-code/validity`,
  administrationConfigStationRadius: `${base_url}/administration/config/station/radius`,

  // Administration - Reports & Statistics
  administrationReportsActiveFilesOccupation: `${base_url}/administration/reports/active-files-occupation`,
  administrationReportsAverageServiceTime: `${base_url}/administration/reports/average-service-time`,
  administrationReportsLitersDistribution: (period) => `${base_url}/administration/reports/liters-distribution?period=${period}`,
  administrationReportsMostActiveStations: (limit) => `${base_url}/administration/reports/most-active-stations${limit ? `?limit=${limit}` : ''}`,
  administrationReportsRefusalExpirationRates: `${base_url}/administration/reports/refusal-expiration-rates`,
  administrationReportsTotalPassages: (period) => `${base_url}/administration/reports/total-passages?period=${period}`,
  administrationReportsUserGrowth: `${base_url}/administration/reports/user-growth`,
  administrationReportsExport: `${base_url}/administration/reports/export`,

  // Administration - Roles & Permissions
  administrationRolesPermissionsMatrix: `${base_url}/administration/roles/permissions-matrix`,
  administrationRolesUsers: `${base_url}/administration/roles/users`,
  administrationRolesUserById: (userId) => `${base_url}/administration/roles/users/${userId}`,
  administrationRolesUserDisconnect: (userId) => `${base_url}/administration/roles/users/${userId}/disconnect`,
  administrationRolesUserResetPassword: (userId) => `${base_url}/administration/roles/users/${userId}/reset-password`,
  administrationRolesUserUpdateRole: (userId) => `${base_url}/administration/roles/users/${userId}/role`,

  // Stations Management
  stations: `${base_url}/stations`,
  stationById: (stationId) => `${base_url}/stations/${stationId}`,
  stationCapacity: (stationId) => `${base_url}/stations/${stationId}/capacity`,
  stationFiles: (stationId) => `${base_url}/stations/${stationId}/files`,
  stationPompistesPerformance: (stationId) => `${base_url}/stations/${stationId}/pompistes/performance`,
  stationSessions: (stationId) => `${base_url}/stations/${stationId}/sessions`,
  stationPompistes: (stationId) => `${base_url}/stations/${stationId}/pompistes`,
  stationReset: (stationId) => `${base_url}/stations/${stationId}/reset`,
  stationStatus: (stationId) => `${base_url}/stations/${stationId}/status`,

  // Users Management
  users: `${base_url}/users`,
  userIncidents: (userId) => `${base_url}/users/${userId}/incidents`,
  userPassages: (userId) => `${base_url}/users/${userId}/passages`,
  userProfile: (userId) => `${base_url}/users/${userId}/profile`,
  userVehicle: (userId) => `${base_url}/users/${userId}/vehicle`,
  userUpdateRole: (userId) => `${base_url}/users/${userId}/role`,
  userUpdateStatus: (userId) => `${base_url}/users/${userId}/status`,

  // Sessions Management
  sessions: `${base_url}/sessions`,
  sessionsActive: `${base_url}/sessions/active`,
  sessionById: (sessionId) => `${base_url}/sessions/${sessionId}`,
  sessionClose: (sessionId) => `${base_url}/sessions/${sessionId}/close`,
  sessionRefreshFile: (sessionId) => `${base_url}/sessions/${sessionId}/refresh-file`,
  sessionResolve: (sessionId) => `${base_url}/sessions/${sessionId}/resolve`,
  sessionUpdateCapacity: (sessionId) => `${base_url}/sessions/${sessionId}/capacity`,
  sessionUpdateRadius: (sessionId) => `${base_url}/sessions/${sessionId}/radius`,
  sessionUpdateStatus: (sessionId) => `${base_url}/sessions/${sessionId}/status`,
  sessionUpdateVolumePerService: (sessionId) => `${base_url}/sessions/${sessionId}/volume-per-service`,
};

export const apiUrlAsset = {
  cv: `${base_url_asset}/resumes`,
  logo: `${base_url_asset}/logos`,
  coverFormation: `${base_url_asset}/formations`,
  candidate: `${base_url_asset}/candidates`,
  avatars: `${base_url_asset}/avatars`,
  games: `${base_url_asset}/games`,
  categories: `${base_url_asset}/categories`,
  competitions: `${base_url_asset}/competitions`,
  events: `${base_url_asset}/events`,
  actualites: `${base_url_asset}/actualites`,
};

export const apiUrlConsulteRessource = {
  viewJob: (_id) => `${base_url}/job/${_id}?overview=admin`,
};
