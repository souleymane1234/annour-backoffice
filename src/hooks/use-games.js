import { useQuery, useMutation } from '@tanstack/react-query';

import ConsumApi from 'src/services_workers/consum_api';

const getGames = async () => {
  try {
    return await ConsumApi.getGames();
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCategoriesGames = async () => {
  try {
    return await ConsumApi.getCategoriesGames();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useGames = () =>
  useQuery({
    queryKey: ['games'],
    queryFn: getGames,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    retry: 1, // Ne réessaye qu'une seule fois en cas d'erreur
  });

export const useCategoriesGames = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesGames,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    retry: 1, // Ne réessaye qu'une seule fois en cas d'erreur
  });

// --- Partie POST pour créer
const createGame = async ({
  nameProfil,
  base64Profil,
  title,
  description,
  videoCover,
  covers,
  isPortrait,
  url,
  categories,
}) => {
  try {
    return await ConsumApi.createGame({
      nameProfil,
      base64Profil,
      title,
      description,
      videoCover,
      covers: covers.reverse(),
      isPortrait,
      url,
      categories,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const createCategoryGames = async ({ name, fileName, base64 }) => {
  try {
    return await ConsumApi.createCategoryGames({ name, fileName, base64 });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useCreateGame = () =>
  useMutation({
    mutationFn: createGame,
  });

export const useCreateCategoryGames = () =>
  useMutation({
    mutationFn: createCategoryGames,
  });
