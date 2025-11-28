import { create } from 'zustand';

import { localStorageKey } from 'src/constants/localStorageKey';

// Fonction pour obtenir l'admin depuis localStorage
const getAdminFromStorage = () => {
  try {
    const adminData = localStorage.getItem(localStorageKey.adminInfo);
    return adminData ? JSON.parse(adminData) : null;
  } catch (error) {
    console.error('Error parsing admin data from localStorage:', error);
    return null;
  }
};

export const useAdminStore = create((set, get) => ({
  admin: getAdminFromStorage(),
  setAdmin: (admin) => {
    localStorage.setItem(localStorageKey.adminInfo, JSON.stringify(admin));
    set({ admin });
  },
  clearAdmin: () => {
    localStorage.removeItem(localStorageKey.adminInfo);
    set({ admin: null });
  },
  // Méthode pour rafraîchir depuis localStorage (utile après connexion)
  refreshAdmin: () => {
    const admin = getAdminFromStorage();
    set({ admin });
    return admin;
  },
}));
