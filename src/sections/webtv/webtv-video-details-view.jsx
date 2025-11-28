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
    CircularProgress
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Helper functions to extract video IDs and create embed URLs
const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getVimeoVideoId = (url) => {
  if (!url) return null;
  
  // Pattern for player.vimeo.com/video/123456789
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) return playerMatch[1];
  
  // Pattern for vimeo.com/123456789
  const directMatch = url.match(/vimeo\.com\/(\d+)/);
  if (directMatch) return directMatch[1];
  
  // Pattern for vimeo.com/channels/channelname/123456789
  const channelMatch = url.match(/vimeo\.com\/channels\/[^/]+\/(\d+)/);
  if (channelMatch) return channelMatch[1];
  
  // Pattern for vimeo.com/groups/groupname/videos/123456789
  const groupMatch = url.match(/vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/);
  if (groupMatch) return groupMatch[1];
  
  // Pattern for vimeo.com/ondemand/name/123456789
  const ondemandMatch = url.match(/vimeo\.com\/ondemand\/[^/]+\/(\d+)/);
  if (ondemandMatch) return ondemandMatch[1];
  
  return null;
};

const getVideoEmbedUrl = (url, sourceType) => {
  if (!url) return null;
  
  // For YouTube, check sourceType or auto-detect from URL
  if (sourceType === 'YOUTUBE' || url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // For Vimeo, check sourceType or auto-detect from URL
  if (sourceType === 'VIMEO' || url.includes('vimeo.com')) {
    const videoId = getVimeoVideoId(url);
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }
  
  // If not YouTube or Vimeo, it's a direct video URL (will use HTML5 player)
  return null;
};

const renderVideoPlayer = (video) => {
  if (!video.url) return null;

  const embedUrl = getVideoEmbedUrl(video.url, video.sourceType);

  if (embedUrl) {
    // YouTube or Vimeo embed
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          overflow: 'hidden',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box
          component="iframe"
          src={embedUrl}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    );
  }

  // Direct video URL - use HTML5 video player
  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        bgcolor: 'grey.900',
      }}
    >
      <Box
        component="video"
        src={video.url}
        controls
        sx={{
          width: '100%',
          maxHeight: '600px',
          display: 'block',
        }}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </Box>
    </Box>
  );
};

export default function WebTVVideoDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getWebTVVideoById(id);
      
      if (result.success) {
        setVideo(result.data);
      } else {
        setAlert({ open: true, message: result.message || 'Vidéo non trouvée', severity: 'error' });
        setTimeout(() => {
          router.push(routesName.adminWebTVVideos);
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      setAlert({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
      setTimeout(() => {
        router.push(routesName.adminWebTVVideos);
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

  const formatDuration = (seconds) => {
    if (!seconds) return 'Non spécifiée';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } 
      return `${secs}s`;
    
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

  if (!video) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Vidéo non trouvée</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>WebTV - Détails Vidéo</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Détails de la Vidéo</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(routesName.adminWebTVVideos)}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => router.push(routesName.adminWebTVVideoEdit.replace(':id', id))}
            >
              Modifier
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Video Player */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Lecture de la Vidéo
                </Typography>
                {renderVideoPlayer(video)}
              </CardContent>
            </Card>
          </Grid>

          {/* Video Info */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Informations de la Vidéo
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Titre
                    </Typography>
                    <Typography variant="h6">{video.title}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {video.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      URL
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {video.url}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Statut
                        </Typography>
                        <Chip
                          label={video.status}
                          color={getStatusColor(video.status)}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type de source
                        </Typography>
                        <Chip
                          label={video.sourceType}
                          color={getSourceTypeColor(video.sourceType)}
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Premium requis
                        </Typography>
                        <Chip
                          label={video.premiumRequired ? 'Oui' : 'Non'}
                          color={video.premiumRequired ? 'warning' : 'default'}
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Durée
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {formatDuration(video.duration)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {video.tags && video.tags.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Tags
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {video.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Statistiques
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de vues
                    </Typography>
                    <Typography variant="h6">
                      {fNumber(video.views || 0)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de commentaires
                    </Typography>
                    <Typography variant="h6">
                      {fNumber(video.commentsCount || 0)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de likes
                    </Typography>
                    <Typography variant="h6">
                      {fNumber(video.likesCount || 0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Informations Générales
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Catégorie
                    </Typography>
                    <Typography variant="body1">
                      {video.category?.name || 'Sans catégorie'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Auteur
                    </Typography>
                    <Typography variant="body1">
                      {video.author?.email || 'Utilisateur inconnu'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date de création
                    </Typography>
                    <Typography variant="body1">
                      {fDate(video.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Dernière modification
                    </Typography>
                    <Typography variant="body1">
                      {fDate(video.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Comments */}
          {video.comments && video.comments.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Commentaires ({video.comments.length})
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Auteur</TableCell>
                          <TableCell>Commentaire</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {video.comments.map((comment, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {comment.author?.email || 'Utilisateur anonyme'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {comment.content}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {fDate(comment.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
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
