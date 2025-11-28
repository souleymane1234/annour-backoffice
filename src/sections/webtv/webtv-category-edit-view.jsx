import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import {
    Box,
    Card,
    Stack,
    Button,
    Container,
    TextField,
    Typography,
    CardContent,
    CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

// ----------------------------------------------------------------------

export default function WebTVCategoryEditView() {
  const router = useRouter();
  const { id } = useParams();
  const { contextHolder, showApiResponse } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setInitialLoading(true);
      const result = await ConsumApi.getWebTVCategoryById(id);
      const processedResult = showApiResponse(result, { showNotification: false });
      
      if (processedResult.success) {
        setFormData({
          name: processedResult.data.name || '',
          description: processedResult.data.description || '',
        });
      } else {
        showApiResponse({ success: false, message: 'Catégorie non trouvée' });
        setTimeout(() => {
          router.push(routesName.adminWebTVCategories);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement' });
      setTimeout(() => {
        router.push(routesName.adminWebTVCategories);
      }, 2000);
    } finally {
      setInitialLoading(false);
    }
  };

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
      const result = await ConsumApi.updateWebTVCategory(id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      const processedResult = showApiResponse(result, { 
        successTitle: 'Modification réussie',
        errorTitle: 'Erreur de modification'
      });

      if (processedResult.success) {
        setTimeout(() => {
          router.push(routesName.adminWebTVCategories);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>WebTV - Modifier Catégorie</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Modifier la Catégorie WebTV
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
                    {loading ? 'Modification...' : 'Modifier la Catégorie'}
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
