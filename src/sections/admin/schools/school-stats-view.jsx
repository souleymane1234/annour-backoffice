import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SchoolStatsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Utiliser l'API admin pour les statistiques
      const result = await ConsumApi.getSchoolStatsOverview();
      
      if (result.success) {
        setStats(result.data);
      } else {
        // Fallback vers des données mockées si l'API n'est pas disponible
        const mockStats = {
          totalSchools: 25,
          verifiedSchools: 18,
          paidSchools: 12,
          schoolsByRegion: [
            { region: 'Abidjan', count: 15 },
            { region: 'Bouaké', count: 5 },
            { region: 'San-Pédro', count: 3 },
            { region: 'Korhogo', count: 2 }
          ],
          recentSchools: [
            {
              id: 1,
              name: 'École Supérieure de Commerce',
              region: 'Abidjan',
              city: 'Cocody',
              logoUrl: null,
              createdAt: '2024-01-15T10:00:00Z'
            },
            {
              id: 2,
              name: 'Institut de Technologie',
              region: 'Bouaké',
              city: 'Centre',
              logoUrl: null,
              createdAt: '2024-02-20T14:30:00Z'
            },
            {
              id: 3,
              name: 'Université des Sciences',
              region: 'San-Pédro',
              city: 'Port',
              logoUrl: null,
              createdAt: '2024-03-10T09:15:00Z'
            }
          ]
        };
        
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(null);
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

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Statistiques des Écoles</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Vue d&apos;ensemble des statistiques des écoles
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Statistiques générales */}
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
                <Iconify icon="solar:buildings-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{stats.totalSchools}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total des écoles
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
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:check-circle-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{stats.verifiedSchools}</Typography>
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
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:star-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{stats.paidSchools}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Écoles premium
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
                <Iconify icon="solar:clock-circle-bold" color="white" />
              </Box>
              <Box>
                <Typography variant="h4">{stats.totalSchools - stats.verifiedSchools}</Typography>
                <Typography variant="body2" color="text.secondary">
                  En attente
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Répartition par région */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Répartition par région
            </Typography>
            <Stack spacing={2}>
              {stats.schoolsByRegion?.map((region, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">{region.region}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {region.count}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(region.count / stats.totalSchools) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Écoles récentes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Écoles récentes
            </Typography>
            <Stack spacing={2}>
              {stats.recentSchools?.slice(0, 5).map((school) => (
                <Box key={school.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {school.logoUrl && (
                    <Box
                      component="img"
                      src={school.logoUrl}
                      sx={{ width: 32, height: 32, borderRadius: 1 }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {school.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {school.region}, {school.city}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(school.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}