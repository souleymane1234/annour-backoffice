import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AdminDashboardView() {
  const [userStats, setUserStats] = useState(null);
  const [schoolStats, setSchoolStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Load user stats
      const userResult = await ConsumApi.getUsers({ limit: 1 });
      if (userResult.success) {
        setUserStats({
          total: userResult.data.total || 0,
          page: userResult.data.page || 1,
          limit: userResult.data.limit || 10,
        });
      }

      // Load school stats
      const schoolResult = await ConsumApi.getSchoolStatsOverview();
      if (schoolResult.success) {
        setSchoolStats(schoolResult.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Administration</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Tableau de bord d&apos;administration de la plateforme
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Statistiques utilisateurs */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:users-group-rounded-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{userStats?.total || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total utilisateurs
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Statistiques écoles */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:buildings-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{schoolStats?.totalSchools || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total écoles
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:check-circle-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{schoolStats?.verifiedSchools || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Écoles vérifiées
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:star-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{schoolStats?.paidSchools || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Écoles premium
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Actions rapides */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gestion des Utilisateurs
            </Typography>
            <Stack spacing={2}>
              <Button
                component={RouterLink}
                href="/admin/users"
                variant="contained"
                startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
                fullWidth
              >
                Voir tous les utilisateurs
              </Button>
              <Button
                component={RouterLink}
                href="/admin/users/create"
                variant="outlined"
                startIcon={<Iconify icon="solar:user-plus-bold" />}
                fullWidth
              >
                Créer un utilisateur
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gestion des Écoles
            </Typography>
            <Stack spacing={2}>
              <Button
                component={RouterLink}
                href="/admin/schools"
                variant="contained"
                startIcon={<Iconify icon="solar:buildings-bold" />}
                fullWidth
              >
                Voir toutes les écoles
              </Button>
              <Button
                component={RouterLink}
                href="/admin/schools/stats"
                variant="outlined"
                startIcon={<Iconify icon="solar:chart-bold" />}
                fullWidth
              >
                Statistiques des écoles
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
