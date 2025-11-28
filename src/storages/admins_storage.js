import { localStorageKey } from 'src/constants/localStorageKey';

export class AdminStorage {
  static saveInfoAdmin(infoAdmin) {
    localStorage.setItem(localStorageKey.adminInfo, JSON.stringify(infoAdmin));
  }

  static saveCompetition(infoCompetition) {
    localStorage.setItem(localStorageKey.competition, JSON.stringify(infoCompetition));
  }

  static getInfoCompetition() {
    return JSON.parse(localStorage.getItem(localStorageKey.competition) ?? '{}');
  }

  static saveInfoEdition(infoCompetition) {
    localStorage.setItem(localStorageKey.edition, JSON.stringify(infoCompetition));
  }

  static getInfoEdition() {
    return JSON.parse(localStorage.getItem(localStorageKey.edition) ?? '{}');
  }

  static getInfoAdmin() {
    return JSON.parse(localStorage.getItem(localStorageKey.adminInfo) ?? '{}');
  }

  static saveTokenAdmin(token) {
    localStorage.setItem(localStorageKey.token, token);
  }

  static saveRefreshToken(refreshToken) {
    localStorage.setItem(localStorageKey.refreshToken, refreshToken);
  }

  static getTokenAdmin() {
    return localStorage.getItem(localStorageKey.token);
  }

  static getRefreshToken() {
    return localStorage.getItem(localStorageKey.refreshToken);
  }

  static verifyAdminLogged() {
    const token = localStorage.getItem(localStorageKey.token);
    return token && token.trim().length > 0;
  }

  static clearStokage() {
    localStorage.clear();
  }

  static validateNominate() {
    localStorage.setItem(localStorageKey.nominee, '1');
  }

  static getNominate() {
    return localStorage.getItem(localStorageKey.nominee) ?? '';
  }
}
