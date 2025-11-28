import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Grid, Card, Chip, Container, Typography, CardContent } from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { fNumber } from 'src/utils/format-number';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette[color].main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Iconify icon={icon} sx={{ color: theme.palette[color].main }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {fNumber(value)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function WebTVDashboardView() {
  const { contextHolder, showApiResponse } = useNotification();
  const [stats, setStats] = useState({
    categories: { total: 0, withVideos: 0 },
    videos: { total: 0, byStatus: [], byCategory: [], bySourceType: [] },
    playlists: { total: 0, byUser: [], byPremium: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [categoriesStats, videosStats, playlistsStats] = await Promise.all([
        ConsumApi.getWebTVCategoriesStats(),
        ConsumApi.getWebTVVideosStats(),
        ConsumApi.getWebTVPlaylistsStats(),
      ]);

      // Traiter les réponses avec notifications silencieuses
      const categoriesResult = showApiResponse(categoriesStats, { showNotification: false });
      const videosResult = showApiResponse(videosStats, { showNotification: false });
      const playlistsResult = showApiResponse(playlistsStats, { showNotification: false });

      if (categoriesResult.success) {
        console.log('Categories Stats Data:', categoriesResult.data); // Debug log
        setStats(prev => ({
          ...prev,
          categories: categoriesResult.data,
        }));
      }

      if (videosResult.success) {
        setStats(prev => ({
          ...prev,
          videos: videosResult.data,
        }));
      }

      if (playlistsResult.success) {
        setStats(prev => ({
          ...prev,
          playlists: playlistsResult.data,
        }));
      }

      // Afficher une notification d'erreur globale si aucune donnée n'a pu être chargée
      if (!categoriesResult.success && !videosResult.success && !playlistsResult.success) {
        showApiResponse({ success: false, message: 'Impossible de charger les statistiques WebTV' });
      }
    } catch (error) {
      console.error('Error fetching WebTV stats:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement des statistiques' });
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

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Chargement...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>WebTV - Tableau de bord</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          WebTV - Tableau de bord
        </Typography>

        {/* Categories Stats */}
        <Typography variant="h6" sx={{ mb: 3 }}>
          Statistiques des Catégories
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Catégories"
              value={stats.categories.totalCategories || 0}
              icon="material-symbols:category"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Catégories avec Vidéos"
              value={stats.categories.categoriesWithVideos || 0}
              icon="material-symbols:video-library"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Vidéos"
              value={stats.categories.totalVideos || 0}
              icon="material-symbols:play-circle"
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Moyenne Vidéos/Catégorie"
              value={stats.categories.averageVideosPerCategory || 0}
              icon="material-symbols:analytics"
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Top Categories */}
        {stats.categories.topCategories && stats.categories.topCategories.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Catégories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stats.categories.topCategories.map((category) => (
                  <Chip
                    key={category.id}
                    label={`${category.name}: ${category.videosCount} vidéo(s)`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Videos Stats */}
        <Typography variant="h6" sx={{ mb: 3 }}>
          Statistiques des Vidéos
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Vidéos"
              value={stats.videos.totalVideos || 0}
              icon="material-symbols:video-library"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Vidéos ce Mois"
              value={stats.videos.videosThisMonth || 0}
              icon="material-symbols:calendar-month"
              color="success"
            />
          </Grid>
        </Grid>

        {/* Videos by Status */}
        {stats.videos.videosByStatus && stats.videos.videosByStatus.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Vidéos par Statut
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stats.videos.videosByStatus.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.status}: ${item.count}`}
                    color={getStatusColor(item.status)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Videos by Source Type */}
        {stats.videos.videosBySourceType && stats.videos.videosBySourceType.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Vidéos par Type de Source
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stats.videos.videosBySourceType.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.sourceType}: ${item.count}`}
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Playlists Stats */}
        <Typography variant="h6" sx={{ mb: 3 }}>
          Statistiques des Playlists
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Playlists"
              value={stats.playlists.totalPlaylists || 0}
              icon="material-symbols:playlist-play"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Vidéos dans Playlists"
              value={stats.playlists.totalVideosInPlaylists || 0}
              icon="material-symbols:video-library"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Moyenne Vidéos/Playlist"
              value={stats.playlists.averageVideosPerPlaylist || 0}
              icon="material-symbols:analytics"
              color="info"
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
