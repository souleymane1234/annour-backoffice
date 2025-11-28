import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h3">{value}</Typography>
        </Box>
        <Box
          sx={{
            width: 64,
            height: 64,
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
          }}
        >
          <Iconify icon={icon} width={32} />
        </Box>
      </Box>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default function NewsStatsView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getNewsStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Statistiques des actualités</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Vue d&apos;ensemble des performances de vos actualités
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => navigate(routesName.adminNews)}
        >
          Retour
        </Button>
      </Box>

      {stats && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total d'actualités"
                value={stats.totalNews || 0}
                icon="solar:document-text-bold"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Actualités publiées"
                value={stats.publishedNews || 0}
                icon="solar:check-circle-bold"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Brouillons"
                value={stats.draftNews || 0}
                icon="solar:document-add-bold"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de vues"
                value={stats.totalViews || 0}
                icon="solar:eye-bold"
                color="info"
              />
            </Grid>
          </Grid>

          {/* Most Viewed News */}
          {stats.mostViewedNews && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Actualité la plus consultée
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stats.mostViewedNews.mainImage && (
                  <Box
                    component="img"
                    src={stats.mostViewedNews.mainImage}
                    sx={{
                      width: 100,
                      height: 75,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{stats.mostViewedNews.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.mostViewedNews.views || 0} vues
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`${routesName.adminNews}/${stats.mostViewedNews.id}/edit`)}
                >
                  Voir
                </Button>
              </Box>
            </Card>
          )}

          {/* Category Stats */}
          {stats.categoryStats && stats.categoryStats.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Statistiques par catégorie</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(routesName.adminNewsCategories)}
                >
                  Gérer les catégories
                </Button>
              </Box>
              <Grid container spacing={3}>
                {stats.categoryStats.map((categoryStat, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: (theme) => theme.customShadows.z8,
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            display: 'flex',
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                          }}
                        >
                          <Iconify icon="solar:folder-with-files-bold" width={24} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5">{categoryStat.count || 0}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            actualité(s)
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" noWrap>
                        {categoryStat.name || 'Sans catégorie'}
                      </Typography>
                      {categoryStat.views && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {categoryStat.views} vues au total
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}
        </>
      )}

      {!stats && !loading && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            Aucune statistique disponible
          </Typography>
        </Card>
      )}
    </>
  );
}

