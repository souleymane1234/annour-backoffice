import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    Box,
    Card,
    Stack,
    Button,
    Select,
    Switch,
    MenuItem,
    Container,
    TextField,
    Typography,
    InputLabel,
    CardContent,
    FormControl,
    FormControlLabel,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

// ----------------------------------------------------------------------

export default function WebTVPlaylistCreateView() {
  const router = useRouter();
  const { contextHolder, showApiResponse } = useNotification();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    userId: '',
    premiumRequired: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const result = await ConsumApi.getUsers({ limit: 100 });
      if (result.success) {
        setUsers(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

    if (!formData.userId) {
      showApiResponse({ success: false, message: 'L\'utilisateur est requis' });
      return;
    }

    try {
      setLoading(true);
      const result = await ConsumApi.createWebTVPlaylist({
        title: formData.title.trim(),
        userId: formData.userId,
        premiumRequired: formData.premiumRequired,
      });

      const processedResult = showApiResponse(result, { 
        successTitle: 'Création réussie',
        errorTitle: 'Erreur de création'
      });

      if (processedResult.success) {
        setTimeout(() => {
          router.push(routesName.adminWebTVPlaylists);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la création' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>WebTV - Nouvelle Playlist</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Nouvelle Playlist WebTV
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

                <FormControl fullWidth required>
                  <InputLabel>Utilisateur propriétaire</InputLabel>
                  <Select
                    value={formData.userId}
                    onChange={handleInputChange('userId')}
                    label="Utilisateur propriétaire"
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                    disabled={loading || !formData.title.trim() || !formData.userId}
                  >
                    {loading ? 'Création...' : 'Créer la Playlist'}
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
