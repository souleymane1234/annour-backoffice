import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Stack, Button,
  Container,
  Typography,
  Breadcrumbs,
  LinearProgress
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

export default function TransferStatsView() {
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
      const result = await ConsumApi.getTransferStats();
      
      if (result.success) {
        setStats(result.data);
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
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

  const totalTransfers = stats?.totalTransfers || 0;
  const transfersByStatus = stats?.transfersByStatus || [];
  const transfersByInstitution = stats?.transfersByInstitution || [];
  const transfersThisMonth = stats?.transfersThisMonth || 0;

  return (
    <>
      <Helmet>
        <title>Statistiques des Permutations</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Statistiques des Permutations
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Permutations
              </Typography>
              <Typography variant="body2" color="text.primary">
                Statistiques
              </Typography>
            </Breadcrumbs>
          </div>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate(routesName.adminTransfers)}
            >
              Retour
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:refresh-fill" />}
              onClick={fetchStats}
            >
              Actualiser
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total des permutations"
              value={totalTransfers}
              icon="solar:document-bold"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Ce mois"
              value={transfersThisMonth}
              icon="solar:calendar-bold"
              color="info"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="En attente"
              value={transfersByStatus.find(s => s.status === 'EN_ATTENTE')?.count || 0}
              icon="solar:clock-circle-bold"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Acceptées"
              value={transfersByStatus.find(s => s.status === 'ACCEPTEE')?.count || 0}
              icon="solar:check-circle-bold"
              color="success"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Répartition par statut
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {transfersByStatus.map((item) => {
                  const colorMap = {
                    EN_ATTENTE: 'warning',
                    ACCEPTEE: 'success',
                    REFUSEE: 'error',
                  };
                  
                  let title = 'Refusées';
                  if (item.status === 'EN_ATTENTE') {
                    title = 'En attente';
                  } else if (item.status === 'ACCEPTEE') {
                    title = 'Acceptées';
                  }
                  
                  return (
                    <ProgressCard
                      key={item.status}
                      title={title}
                      value={item.count || 0}
                      total={totalTransfers}
                      color={colorMap[item.status] || 'primary'}
                    />
                  );
                })}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Répartition par établissement
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {transfersByInstitution.slice(0, 5).map((item, index) => (
                  <ProgressCard
                    key={index}
                    title={item.institution || 'Non spécifié'}
                    value={item.count || 0}
                    total={totalTransfers}
                    color="info"
                  />
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

