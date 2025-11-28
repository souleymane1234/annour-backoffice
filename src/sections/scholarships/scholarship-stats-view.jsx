import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import {
    Box,
    Card,
    Grid,
    Stack,
    Paper,
    Button,
    Container,
    Typography,
    Breadcrumbs,
    LinearProgress,
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card>
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          <Iconify icon={icon} width={24} height={24} />
        </Box>
        <Box>
          <Typography variant="h4">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  subtitle: PropTypes.string,
};

const ProgressCard = ({ title, value, total, color = 'primary' }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h4" color={`${color}.main`}>
            {value}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {percentage.toFixed(1)}% du total
        </Typography>
      </Box>
    </Card>
  );
};

ProgressCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string,
};

export default function ScholarshipStatsView() {
  const navigate = useNavigate();
  const { showApiResponse } = useNotification();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getScholarshipStats();
      
      showApiResponse(result, {
        successTitle: 'Chargement réussi',
        errorTitle: 'Erreur de chargement'
      });
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement des statistiques' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Chargement des statistiques...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Statistiques des Bourses et Études</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Statistiques des Bourses et Études
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.primary">
                Statistiques
              </Typography>
            </Breadcrumbs>
          </div>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminScholarships)}
          >
            Retour
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total des Bourses"
              value={stats?.totalScholarships || 0}
              icon="eva:book-outline"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Bourses Ouvertes"
              value={stats?.openScholarships || 0}
              icon="eva:unlock-outline"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Bourses Fermées"
              value={stats?.closedScholarships || 0}
              icon="eva:lock-outline"
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="En Attente"
              value={stats?.pendingScholarships || 0}
              icon="eva:clock-outline"
              color="warning"
            />
          </Grid>

          {/* Applications Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Statistiques des Candidatures
                </Typography>
                <Stack spacing={3}>
                  <ProgressCard
                    title="Candidatures Total"
                    value={stats?.totalApplications || 0}
                    total={stats?.totalApplications || 1}
                    color="primary"
                  />
                  <ProgressCard
                    title="Candidatures Validées"
                    value={stats?.validatedApplications || 0}
                    total={stats?.totalApplications || 1}
                    color="success"
                  />
                  <ProgressCard
                    title="Candidatures Rejetées"
                    value={stats?.rejectedApplications || 0}
                    total={stats?.totalApplications || 1}
                    color="error"
                  />
                  <ProgressCard
                    title="Candidatures En Attente"
                    value={stats?.pendingApplications || 0}
                    total={stats?.totalApplications || 1}
                    color="warning"
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Student Files Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Statistiques des Dossiers Étudiants
                </Typography>
                <Stack spacing={3}>
                  <ProgressCard
                    title="Dossiers Total"
                    value={stats?.totalStudentFiles || 0}
                    total={stats?.totalStudentFiles || 1}
                    color="primary"
                  />
                  <ProgressCard
                    title="Dossiers Validés"
                    value={stats?.validatedStudentFiles || 0}
                    total={stats?.totalStudentFiles || 1}
                    color="success"
                  />
                  <ProgressCard
                    title="Dossiers Rejetés"
                    value={stats?.rejectedStudentFiles || 0}
                    total={stats?.totalStudentFiles || 1}
                    color="error"
                  />
                  <ProgressCard
                    title="Dossiers Soumis"
                    value={stats?.submittedStudentFiles || 0}
                    total={stats?.totalStudentFiles || 1}
                    color="info"
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Country Distribution */}
          {stats?.countryDistribution && stats.countryDistribution.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition par Pays d&apos;Accueil
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.countryDistribution.map((country, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ p: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body1">{country.country}</Typography>
                            <Typography variant="h6" color="primary">
                              {country.count}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Card>
            </Grid>
          )}

          {/* Recent Activity */}
          {stats?.recentActivity && stats.recentActivity.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Activité Récente
                  </Typography>
                  <Stack spacing={2}>
                    {stats.recentActivity.map((activity, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                        <Typography variant="body2">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {new Date(activity.date).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}
