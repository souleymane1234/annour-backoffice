import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    Box,
    Card,
    Stack,
    Button,
    Container,
    TextField,
    Typography,
    CardContent,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

// ----------------------------------------------------------------------

export default function WebTVCategoryCreateView() {
  const router = useRouter();
  const { contextHolder, showApiResponse } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.name.trim()) {
      showApiResponse({ success: false, message: 'Le nom de la catégorie est requis' });
      return;
    }

    try {
      setLoading(true);
      const result = await ConsumApi.createWebTVCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      const processedResult = showApiResponse(result, { 
        successTitle: 'Création réussie',
        errorTitle: 'Erreur de création'
      });

      if (processedResult.success) {
        setTimeout(() => {
          router.push(routesName.adminWebTVCategories);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la création' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>WebTV - Nouvelle Catégorie</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Nouvelle Catégorie WebTV
        </Typography>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nom de la catégorie"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  helperText="Le nom de la catégorie est requis"
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={4}
                  helperText="Description optionnelle de la catégorie"
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push(routesName.adminWebTVCategories)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.name.trim()}
                  >
                    {loading ? 'Création...' : 'Créer la Catégorie'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

      </Container>
    </>
  );
}
