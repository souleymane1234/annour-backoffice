import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import {
    Box,
    Card,
    Chip,
    Grid,
    Stack,
    Table,
    Alert,
    Button,
    TableRow,
    Container,
    TableBody,
    TableCell,
    TableHead,
    Typography,
    CardContent,
    TableContainer,
    CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function WebTVCategoryDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getWebTVCategoryById(id);
      
      if (result.success) {
        setCategory(result.data);
      } else {
        setAlert({ open: true, message: result.message || 'Catégorie non trouvée', severity: 'error' });
        setTimeout(() => {
          router.push(routesName.adminWebTVCategories);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setAlert({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
      setTimeout(() => {
        router.push(routesName.adminWebTVCategories);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_LIGNE':
        return 'success';
      case 'EN_ATTENTE':
        return 'warning';
      case 'HORS_LIGNE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSourceTypeColor = (sourceType) => {
    switch (sourceType) {
      case 'YOUTUBE':
        return 'error';
      case 'VIMEO':
        return 'info';
      case 'UPLOAD':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Catégorie non trouvée</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>WebTV - Détails Catégorie</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Détails de la Catégorie</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(routesName.adminWebTVCategories)}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => router.push(routesName.adminWebTVCategoryEdit.replace(':id', id))}
            >
              Modifier
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Category Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Informations de la Catégorie
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="h6">{category.name}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {category.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de Vidéos
                    </Typography>
                    <Chip
                      label={fNumber(category.videosCount || 0)}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Videos List */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Vidéos dans cette Catégorie ({category.videos?.length || 0})
                </Typography>
                
                {category.videos && category.videos.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Titre</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Premium</TableCell>
                          <TableCell>Vues</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.videos.map((video) => (
                          <TableRow key={video.id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ maxWidth: 200 }}>
                                {video.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={video.status}
                                color={getStatusColor(video.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={video.sourceType}
                                color={getSourceTypeColor(video.sourceType)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={video.premiumRequired ? 'Oui' : 'Non'}
                                color={video.premiumRequired ? 'warning' : 'default'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {fNumber(video.views || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {fDate(video.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                onClick={() => router.push(routesName.adminWebTVVideoDetails.replace(':id', video.id))}
                              >
                                Voir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Aucune vidéo dans cette catégorie
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert */}
        {alert.open && (
          <Alert
            severity={alert.severity}
            onClose={() => setAlert({ open: false, message: '', severity: 'success' })}
            sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
          >
            {alert.message}
          </Alert>
        )}
      </Container>
    </>
  );
}
