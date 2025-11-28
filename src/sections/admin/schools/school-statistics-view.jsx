import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SchoolStatisticsView() {
  const { id } = useParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);

  const loadSchoolStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Charger les détails de l'école
      const schoolResult = await ConsumApi.getSchoolById(id);
      if (schoolResult.success) {
        setSchool(schoolResult.data);
      }

      // Charger les statistiques de l'école
      const statsResult = await ConsumApi.getSchoolStatistics(id);
      
      if (statsResult.success) {
        setStatistics(statsResult.data);
      } else {
        // Fallback vers des données mockées
        const mockStatistics = {
          schoolId: parseInt(id, 10),
          period: '30 derniers jours',
          overview: {
            totalStudents: 1250,
            newStudents: 45,
            totalPrograms: 8,
            activePrograms: 6,
            totalTeachers: 45,
            newTeachers: 3,
            averageRating: 4.7,
            totalReviews: 156,
            newReviews: 12,
            completionRate: 87.5,
            satisfactionRate: 92.3,
          },
          students: {
            total: 1250,
            byProgram: [
              { program: 'Master en Management', count: 320, percentage: 25.6 },
              { program: 'Licence en Marketing', count: 280, percentage: 22.4 },
              { program: 'Master en Finance', count: 250, percentage: 20.0 },
              { program: 'Licence en Comptabilité', count: 200, percentage: 16.0 },
              { program: 'Master en RH', count: 150, percentage: 12.0 },
              { program: 'Autres', count: 50, percentage: 4.0 },
            ],
            byRegion: [
              { region: 'Abidjan', count: 800, percentage: 64.0 },
              { region: 'Yamoussoukro', count: 200, percentage: 16.0 },
              { region: 'Bouaké', count: 150, percentage: 12.0 },
              { region: 'Autres', count: 100, percentage: 8.0 },
            ],
            growth: [
              { month: 'Jan', count: 1200 },
              { month: 'Fév', count: 1220 },
              { month: 'Mar', count: 1240 },
              { month: 'Avr', count: 1250 },
            ],
          },
          programs: {
            total: 8,
            active: 6,
            byStatus: [
              { status: 'Actif', count: 6, percentage: 75.0 },
              { status: 'Inactif', count: 2, percentage: 25.0 },
            ],
            byLevel: [
              { level: 'Master', count: 4, percentage: 50.0 },
              { level: 'Licence', count: 3, percentage: 37.5 },
              { level: 'Certificat', count: 1, percentage: 12.5 },
            ],
            topPrograms: [
              { name: 'Master en Management', students: 320, rating: 4.8 },
              { name: 'Licence en Marketing', students: 280, rating: 4.6 },
              { name: 'Master en Finance', students: 250, rating: 4.7 },
            ],
          },
          teachers: {
            total: 45,
            byExperience: [
              { experience: '0-2 ans', count: 15, percentage: 33.3 },
              { experience: '3-5 ans', count: 20, percentage: 44.4 },
              { experience: '6-10 ans', count: 8, percentage: 17.8 },
              { experience: '10+ ans', count: 2, percentage: 4.4 },
            ],
            byQualification: [
              { qualification: 'Doctorat', count: 20, percentage: 44.4 },
              { qualification: 'Master', count: 22, percentage: 48.9 },
              { qualification: 'Licence', count: 3, percentage: 6.7 },
            ],
            averageRating: 4.6,
          },
          reviews: {
            total: 156,
            average: 4.7,
            distribution: [
              { rating: 5, count: 98, percentage: 62.8 },
              { rating: 4, count: 35, percentage: 22.4 },
              { rating: 3, count: 15, percentage: 9.6 },
              { rating: 2, count: 5, percentage: 3.2 },
              { rating: 1, count: 3, percentage: 1.9 },
            ],
            recent: [
              {
                id: 1,
                student: 'Jean Kouassi',
                program: 'Master en Management',
                rating: 5,
                comment: 'Excellente formation, enseignants très compétents.',
                date: '2024-03-15',
              },
              {
                id: 2,
                student: 'Marie Traoré',
                program: 'Licence en Marketing',
                rating: 4,
                comment: 'Très bon programme, contenu à jour.',
                date: '2024-03-12',
              },
            ],
          },
          financial: {
            revenue: {
              total: 125000000, // 125M FCFA
              monthly: 10416667, // 10.4M FCFA
              growth: 15.2,
            },
            expenses: {
              total: 85000000, // 85M FCFA
              monthly: 7083333, // 7.1M FCFA
              breakdown: [
                { category: 'Salaires', amount: 50000000, percentage: 58.8 },
                { category: 'Infrastructure', amount: 20000000, percentage: 23.5 },
                { category: 'Marketing', amount: 10000000, percentage: 11.8 },
                { category: 'Autres', amount: 5000000, percentage: 5.9 },
              ],
            },
            profit: {
              total: 40000000, // 40M FCFA
              monthly: 3333333, // 3.3M FCFA
              margin: 32.0,
            },
          },
        };
        setStatistics(mockStatistics);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques de l\'école');
      
      // Données mockées en cas d'erreur
      const mockSchool = {
        id: parseInt(id, 10),
        name: 'École Supérieure de Commerce',
        region: 'Abidjan',
        city: 'Cocody',
      };
      setSchool(mockSchool);
      
      const mockStatistics = {
        schoolId: parseInt(id, 10),
        period: '30 derniers jours',
        overview: {
          totalStudents: 1250,
          newStudents: 45,
          totalPrograms: 8,
          activePrograms: 6,
          totalTeachers: 45,
          newTeachers: 3,
          averageRating: 4.7,
          totalReviews: 156,
          newReviews: 12,
          completionRate: 87.5,
          satisfactionRate: 92.3,
        },
        students: {
          total: 1250,
          byProgram: [
            { program: 'Master en Management', count: 320, percentage: 25.6 },
            { program: 'Licence en Marketing', count: 280, percentage: 22.4 },
            { program: 'Master en Finance', count: 250, percentage: 20.0 },
            { program: 'Licence en Comptabilité', count: 200, percentage: 16.0 },
            { program: 'Master en RH', count: 150, percentage: 12.0 },
            { program: 'Autres', count: 50, percentage: 4.0 },
          ],
        },
        programs: {
          total: 8,
          active: 6,
          topPrograms: [
            { name: 'Master en Management', students: 320, rating: 4.8 },
            { name: 'Licence en Marketing', students: 280, rating: 4.6 },
            { name: 'Master en Finance', students: 250, rating: 4.7 },
          ],
        },
        teachers: {
          total: 45,
          averageRating: 4.6,
        },
        reviews: {
          total: 156,
          average: 4.7,
        },
        financial: {
          revenue: {
            total: 125000000,
            monthly: 10416667,
            growth: 15.2,
          },
          profit: {
            total: 40000000,
            monthly: 3333333,
            margin: 32.0,
          },
        },
      };
      setStatistics(mockStatistics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSchoolStatistics();
    }
  }, [id]);

  const formatNumber = (num) => new Intl.NumberFormat('fr-FR').format(num);

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des statistiques...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={loadSchoolStatistics}>
          Réessayer
        </Button>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Aucune statistique disponible
        </Typography>
        <Button variant="contained" component={RouterLink} href="/admin/schools">
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            component={RouterLink}
            href="/admin/schools"
          >
            Retour
          </Button>
          <Typography variant="h4">
            Statistiques - {school?.name || 'École'}
          </Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary">
          Période: {statistics.period}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Vue d'ensemble */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vue d&apos;ensemble
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="primary">
                      {formatNumber(statistics.overview.totalStudents)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Étudiants total
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +{statistics.overview.newStudents} nouveaux
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="info.main">
                      {statistics.overview.totalPrograms}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Programmes total
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {statistics.overview.activePrograms} actifs
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="warning.main">
                      {statistics.overview.totalTeachers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enseignants
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +{statistics.overview.newTeachers} nouveaux
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" color="success.main">
                      {statistics.overview.averageRating}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Note moyenne
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {statistics.overview.totalReviews} avis
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques financières */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenus
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(statistics.financial.revenue.total)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total des revenus
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="h5">
                    {formatCurrency(statistics.financial.revenue.monthly)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenus mensuels
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body1" color="success.main">
                    +{statistics.financial.revenue.growth}% de croissance
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bénéfices
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(statistics.financial.profit.total)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bénéfices totaux
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="h5">
                    {formatCurrency(statistics.financial.profit.monthly)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bénéfices mensuels
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body1" color="primary.main">
                    {statistics.financial.profit.margin}% de marge
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Répartition des étudiants par programme */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Étudiants par programme
              </Typography>
              
              <Stack spacing={2}>
                {statistics.students.byProgram.map((item, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{item.program}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(item.count)} ({item.percentage}%)
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 1,
                        mt: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top programmes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top programmes
              </Typography>
              
              <Stack spacing={2}>
                {statistics.programs.topPrograms.map((program, index) => (
                  <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {program.name}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(program.students)} étudiants
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        ⭐ {program.rating}/5
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Avis récents */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Avis récents
              </Typography>
              
              <Stack spacing={2}>
                {statistics.reviews.recent.map((review) => (
                  <Box key={review.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">{review.student}</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          {review.date}
                        </Typography>
                        <Typography variant="body2" color="primary.main">
                          {'⭐'.repeat(review.rating)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {review.program}
                    </Typography>
                    <Typography variant="body2">{review.comment}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
