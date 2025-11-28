import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function OrientationStatsView() {
  const navigate = useNavigate();
  const { contextHolder, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getOrientationStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      showError('Erreur', 'Erreur lors du chargement des statistiques');
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
      {contextHolder}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Statistiques du Module Orientation</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Vue d&apos;ensemble des questionnaires et sessions d&apos;orientation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => navigate(routesName.adminOrientationQuestionnaires)}
        >
          Retour
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:document-text-bold" width={32} sx={{ color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="h4">{stats?.totalQuestionnaires || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Questionnaires totaux
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'success.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={32} sx={{ color: 'success.main' }} />
              </Box>
              <Box>
                <Typography variant="h4">{stats?.activeQuestionnaires || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Questionnaires actifs
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'info.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:users-group-rounded-bold" width={32} sx={{ color: 'info.main' }} />
              </Box>
              <Box>
                <Typography variant="h4">{stats?.totalSessions || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sessions totales
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'warning.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:check-read-bold" width={32} sx={{ color: 'warning.main' }} />
              </Box>
              <Box>
                <Typography variant="h4">{stats?.completedSessions || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sessions complétées
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'secondary.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:user-id-bold" width={32} sx={{ color: 'secondary.main' }} />
              </Box>
              <Box>
                <Typography variant="h4">{stats?.totalProfiles || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Profils créés
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'error.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:chart-bold" width={32} sx={{ color: 'error.main' }} />
              </Box>
              <Box>
                <Typography variant="h4">
                  {stats?.averageCompletionRate ? `${(stats.averageCompletionRate * 100).toFixed(1)}%` : '0%'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taux de complétion moyen
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

