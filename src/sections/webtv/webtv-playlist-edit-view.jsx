import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import {
  Box,
  Card,
  Stack,
  Button,
  Switch,
  Container,
  TextField,
  Typography,
  CardContent,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

// ----------------------------------------------------------------------

export default function WebTVPlaylistEditView() {
  const router = useRouter();
  const { id } = useParams();
  const { contextHolder, showApiResponse } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    premiumRequired: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      setInitialLoading(true);
      const result = await ConsumApi.getWebTVPlaylistById(id);
      const processedResult = showApiResponse(result, { showNotification: false });
      
      if (processedResult.success) {
        const playlist = processedResult.data;
        setFormData({
          title: playlist.title || '',
          premiumRequired: playlist.premiumRequired || false,
        });
      } else {
        showApiResponse({ success: false, message: 'Playlist non trouvée' });
        setTimeout(() => {
          router.push(routesName.adminWebTVPlaylists);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement' });
      setTimeout(() => {
        router.push(routesName.adminWebTVPlaylists);
      }, 2000);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.title.trim()) {
      showApiResponse({ success: false, message: 'Le titre de la playlist est requis' });
      return;
    }

    try {
      setLoading(true);
      const result = await ConsumApi.updateWebTVPlaylist(id, {
        title: formData.title.trim(),
        premiumRequired: formData.premiumRequired,
      });

      const processedResult = showApiResponse(result, { 
        successTitle: 'Modification réussie',
        errorTitle: 'Erreur de modification'
      });

      if (processedResult.success) {
        setTimeout(() => {
          router.push(routesName.adminWebTVPlaylists);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
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
        <title>WebTV - Modifier Playlist</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Modifier la Playlist WebTV
        </Typography>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Titre de la playlist"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  required
                  helperText="Le titre de la playlist est requis"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.premiumRequired}
                      onChange={handleInputChange('premiumRequired')}
                    />
                  }
                  label="Playlist premium requise"
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push(routesName.adminWebTVPlaylists)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.title.trim()}
                  >
                    {loading ? 'Modification...' : 'Modifier la Playlist'}
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
