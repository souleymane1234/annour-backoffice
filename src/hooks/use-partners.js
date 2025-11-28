import { useQuery, useMutation } from '@tanstack/react-query';

import ConsumApi from 'src/services_workers/consum_api';

// --- Partie GET des partenaires
const getPartners = async () => {
  try {
    return await ConsumApi.getPartners();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const usePartners = () =>
  useQuery({
    queryKey: ['partners'],
    queryFn: getPartners,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    retry: 1, // Ne réessaye qu'une seule fois en cas d'erreur
  });

// --- Partie POST pour créer un partenaire
const createPartner = async ({ fullName, logo, number, email, password, role }) => {
  try {
    return await ConsumApi.createPartners({ fullName, logo, number, email, password, role });
  } catch (error) {
    throw new Error(error.message);
  }
};
const createOrUpdateConfigPartner = async ({
  domaine,
  url_generate_otp,
  url_billing,
  isMobileMoney,
  admin_id,
}) => {
  try {
    return await ConsumApi.createOrUpdateConfigPartners({
      domaine,
      url_generate_otp,
      url_billing,
      isMobileMoney,
      admin_id,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const useCreatePartner = () =>
  useMutation({
    mutationFn: createPartner,
  });

export const useCreateOrUpdateConfigPartner = () =>
  useMutation({
    mutationFn: createOrUpdateConfigPartner,
  });
