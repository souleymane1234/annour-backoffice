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
    Dialog,
    Select,
    TableRow,
    MenuItem,
    Container,
    TableBody,
    TableCell,
    TableHead,
    TextField,
    Typography,
    IconButton,
    InputLabel,
    CardContent,
    DialogTitle,
    FormControl,
    DialogContent,
    DialogActions,
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

export default function WebTVPlaylistDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [addVideoDialog, setAddVideoDialog] = useState({ open: false, videoId: '', order: 1 });
  const [removeVideoDialog, setRemoveVideoDialog] = useState({ open: false, video: null });

  useEffect(() => {
    fetchPlaylist();
    fetchVideos();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getWebTVPlaylistById(id);
      
      if (result.success) {
        setPlaylist(result.data);
      } else {
        setAlert({ open: true, message: result.message || 'Playlist non trouvée', severity: 'error' });
        setTimeout(() => {
          router.push(routesName.adminWebTVPlaylists);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setAlert({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
      setTimeout(() => {
        router.push(routesName.adminWebTVPlaylists);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const result = await ConsumApi.getWebTVVideos({ limit: 100 });
      if (result.success) {
        setVideos(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleAddVideo = async () => {
    try {
      const result = await ConsumApi.addVideoToPlaylist(id, {
        videoId: addVideoDialog.videoId,
        order: addVideoDialog.order,
      });
      
      if (result.success) {
        setAlert({ open: true, message: 'Vidéo ajoutée avec succès', severity: 'success' });
        fetchPlaylist();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de l\'ajout', severity: 'error' });
      }
    } catch (error) {
      console.error('Error adding video:', error);
      setAlert({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' });
    } finally {
      setAddVideoDialog({ open: false, videoId: '', order: 1 });
    }
  };

  const handleRemoveVideo = async () => {
    try {
      const result = await ConsumApi.removeVideoFromPlaylist(id, {
        videoId: removeVideoDialog.video.id,
      });
      
      if (result.success) {
        setAlert({ open: true, message: 'Vidéo supprimée avec succès', severity: 'success' });
        fetchPlaylist();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la suppression', severity: 'error' });
      }
    } catch (error) {
      console.error('Error removing video:', error);
      setAlert({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    } finally {
      setRemoveVideoDialog({ open: false, video: null });
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

  if (!playlist) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Playlist non trouvée</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>WebTV - Détails Playlist</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Détails de la Playlist</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(routesName.adminWebTVPlaylists)}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => router.push(routesName.adminWebTVPlaylistEdit.replace(':id', id))}
            >
              Modifier
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Playlist Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Informations de la Playlist
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Titre
                    </Typography>
                    <Typography variant="h6">{playlist.title}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Auteur
                    </Typography>
                    <Typography variant="body1">
                      {playlist.author?.email || 'Utilisateur inconnu'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Premium requis
                    </Typography>
                    <Chip
                      label={playlist.premiumRequired ? 'Oui' : 'Non'}
                      color={playlist.premiumRequired ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de vidéos
                    </Typography>
                    <Chip
                      label={fNumber(playlist.videosCount || 0)}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date de création
                    </Typography>
                    <Typography variant="body1">
                      {fDate(playlist.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Videos List */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    Vidéos dans cette Playlist ({playlist.videos?.length || 0})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => setAddVideoDialog({ open: true, videoId: '', order: (playlist.videos?.length || 0) + 1 })}
                  >
                    Ajouter une vidéo
                  </Button>
                </Stack>
                
                {playlist.videos && playlist.videos.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ordre</TableCell>
                          <TableCell>Titre</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Premium</TableCell>
                          <TableCell>Vues</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {playlist.videos.map((video, index) => (
                          <TableRow key={video.id} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {index + 1}
                              </Typography>
                            </TableCell>
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
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <IconButton
                                  size="small"
                                  onClick={() => router.push(routesName.adminWebTVVideoDetails.replace(':id', video.id))}
                                >
                                  <Iconify icon="eva:eye-fill" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setRemoveVideoDialog({ open: true, video })}
                                >
                                  <Iconify icon="eva:trash-2-fill" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Aucune vidéo dans cette playlist
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Video Dialog */}
        <Dialog open={addVideoDialog.open} onClose={() => setAddVideoDialog({ open: false, videoId: '', order: 1 })}>
          <DialogTitle>Ajouter une vidéo</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Vidéo</InputLabel>
                <Select
                  value={addVideoDialog.videoId}
                  onChange={(e) => setAddVideoDialog(prev => ({ ...prev, videoId: e.target.value }))}
                  label="Vidéo"
                >
                  {videos.map((video) => (
                    <MenuItem key={video.id} value={video.id}>
                      {video.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Ordre"
                type="number"
                value={addVideoDialog.order}
                onChange={(e) => setAddVideoDialog(prev => ({ ...prev, order: parseInt(e.target.value, 10) || 1 }))}
                helperText="Position dans la playlist"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddVideoDialog({ open: false, videoId: '', order: 1 })}>Annuler</Button>
            <Button onClick={handleAddVideo} variant="contained" disabled={!addVideoDialog.videoId}>
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Video Dialog */}
        <Dialog open={removeVideoDialog.open} onClose={() => setRemoveVideoDialog({ open: false, video: null })}>
          <DialogTitle>Supprimer la vidéo</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer la vidéo &quot;{removeVideoDialog.video?.title}&quot; de cette playlist ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRemoveVideoDialog({ open: false, video: null })}>Annuler</Button>
            <Button onClick={handleRemoveVideo} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

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
