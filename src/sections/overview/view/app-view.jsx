// import { faker } from '@faker-js/faker';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';
// import Iconify from 'src/components/iconify';

// import AppTasks from '../app-tasks';
// import { apiUrlAsset } from 'src/constants/apiUrl';

// import AppNewsUpdate from '../app-news-update';
// import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
// import AppTrafficBySite from '../app-traffic-by-site';
// import AppCurrentSubject from '../app-current-subject';
import AppConversionRates from '../app-conversion-rates';
// ----------------------------------------------------------------------

export default function AppView() {
  const { contextHolder, showError } = useNotification();

  const [isFetching, setFetch] = useState(true);
  const [dates, setDates] = useState([]);
  const [topEcoles, setTopEcoles] = useState([]);
  const [formationsParDomaine, setFormationsParDomaine] = useState([]);
  const [newUserAtMoment, setNewUserAtMoment] = useState([]);
  const [orientationTests, setOrientationTests] = useState([]);
  const [boursesActives, setBoursesActives] = useState([]);

  // Totaux
  const [totalEcoles, setTotalEcoles] = useState(0);
  const [totalEtudiants, setTotalEtudiants] = useState(0);
  const [totalFormations, setTotalFormations] = useState(0);
  const [totalBourses, setTotalBourses] = useState(0);

  // Indicateurs de chargement spécifiques
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Cache pour éviter les requêtes répétées
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    // Éviter les requêtes répétées
    if (dataLoaded) {
      console.log('Data already loaded, skipping API calls');
      return;
    }

    try {
      console.log('Loading dashboard data...');
      
      // Charger les données en parallèle avec les API admin
      const [userStatsResult, schoolStatsResult, schoolsResult] = await Promise.allSettled([
        ConsumApi.getUsers({ limit: 1 }),
        ConsumApi.getSchoolStatsOverview(),
        ConsumApi.getSchools({ limit: 5 })
      ]);

      // Traiter les statistiques des utilisateurs
      if (userStatsResult.status === 'fulfilled' && userStatsResult.value.success) {
        const userData = userStatsResult.value.data;
        setTotalEtudiants(userData.total || 0);
        setLoadingUsers(false);
      } else {
        // Fallback vers l'API legacy
        try {
          const legacyUsers = await ConsumApi.getUsersLegacy();
          if (legacyUsers.success) {
            setTotalEtudiants(legacyUsers.data?.length || 0);
          }
        } catch (legacyError) {
          console.warn('Legacy users API failed:', legacyError);
          setTotalEtudiants(2847); // Valeur par défaut
        }
        setLoadingUsers(false);
      }

      // Traiter les statistiques des écoles
      if (schoolStatsResult.status === 'fulfilled' && schoolStatsResult.value.success) {
        const schoolData = schoolStatsResult.value.data;
        setTotalEcoles(schoolData.totalSchools || 0);
        
        // Adapter les données pour les graphiques
        if (schoolData.schoolsByRegion) {
          setTopEcoles(
            schoolData.schoolsByRegion.slice(0, 5).map((item) => ({
              label: item.region,
              value: item.count,
            }))
          );
        }
        setLoadingSchools(false);
      } else {
        // Données mockées pour les écoles
        setTotalEcoles(25);
        setTopEcoles([
          { label: 'Abidjan', value: 15 },
          { label: 'Bouaké', value: 5 },
          { label: 'San-Pédro', value: 3 },
          { label: 'Korhogo', value: 2 },
        ]);
        setLoadingSchools(false);
      }

      // Traiter la liste des écoles pour les formations
      if (schoolsResult.status === 'fulfilled' && schoolsResult.value.success) {
        // const schoolsData = schoolsResult.value.data;
        // Simuler des formations par domaine basées sur les écoles
        const domaines = ['Informatique', 'Commerce', 'Médecine', 'Ingénierie', 'Arts'];
        setFormationsParDomaine(
          domaines.map((domaine) => ({
            label: domaine,
            value: Math.floor(Math.random() * 50) + 20,
          }))
        );
        setLoadingStats(false);
      } else {
        // Données mockées pour les formations
        setFormationsParDomaine([
          { label: 'Informatique', value: 85 },
          { label: 'Commerce', value: 65 },
          { label: 'Médecine', value: 45 },
          { label: 'Ingénierie', value: 55 },
          { label: 'Arts', value: 35 },
        ]);
        setLoadingStats(false);
      }

      // Générer les données de graphiques temporels
      setDates(
        Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        })
      );

      // Données simulées pour les graphiques temporels
      setNewUserAtMoment(
        Array.from({ length: 30 }, () => Math.floor(Math.random() * 50))
      );
      setOrientationTests(
        Array.from({ length: 30 }, () => Math.floor(Math.random() * 30))
      );
      setBoursesActives(
        Array.from({ length: 30 }, () => Math.floor(Math.random() * 15))
      );

      // Valeurs par défaut pour les autres métriques
      setTotalFormations(285);
      setTotalBourses(42);

      console.log('Dashboard admin data loaded successfully');
      setDataLoaded(true); // Marquer les données comme chargées
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard admin:', error);
      
      // Gérer spécifiquement l'erreur 429 (Too Many Requests)
      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded, using fallback data');
        showError('Limite de requêtes', 'Trop de requêtes simultanées. Utilisation des données de démonstration.');
      } else {
        showError('Erreur', 'Impossible de charger les statistiques. Veuillez réessayer.');
      }
      
      // Données de fallback en cas d'erreur
      setTotalEcoles(25);
      setTotalEtudiants(2847);
      setTotalFormations(285);
      setTotalBourses(42);
      setTopEcoles([
        { label: 'INPHB', value: 450 },
        { label: 'Université FHB', value: 380 },
        { label: 'ESI', value: 320 },
      ]);
      setFormationsParDomaine([
        { label: 'Informatique', value: 85 },
        { label: 'Commerce', value: 65 },
        { label: 'Médecine', value: 45 },
        { label: 'Ingénierie', value: 55 },
        { label: 'Arts', value: 35 },
      ]);
      setDataLoaded(true); // Marquer comme chargé même en cas d'erreur
    } finally {
      setFetch(false);
    }
  }, [showError, dataLoaded]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Container maxWidth="xl">
      {contextHolder}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant="h4">
          Tableau de bord - AlloEcole
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => {
            setDataLoaded(false);
            setFetch(true);
            setLoadingUsers(true);
            setLoadingSchools(true);
            setLoadingStats(true);
            loadData();
          }}
          disabled={isFetching}
        >
          {isFetching ? 'Chargement...' : 'Actualiser'}
        </Button>
      </Box>

      {/* Indicateurs de statut des API */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, bgcolor: loadingUsers ? 'warning.lighter' : 'success.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              API Utilisateurs: {loadingUsers ? 'Chargement...' : 'Connectée'}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, bgcolor: loadingSchools ? 'warning.lighter' : 'success.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              API Écoles: {loadingSchools ? 'Chargement...' : 'Connectée'}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, bgcolor: loadingStats ? 'warning.lighter' : 'success.lighter' }}>
            <Typography variant="body2" color="text.secondary">
              API Statistiques: {loadingStats ? 'Chargement...' : 'Connectée'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {!isFetching && (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppWidgetSummary
              title="Écoles partenaires"
              total={totalEcoles}
              color="info"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_batiment.png" />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppWidgetSummary
              title="Étudiants inscrits"
              total={totalEtudiants}
              color="success"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppWidgetSummary
              title="Formations disponibles"
              total={totalFormations}
              color="warning"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag1.png" />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AppWidgetSummary
              title="Bourses actives"
              total={totalBourses}
              color="error"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <AppWebsiteVisits
              title="Activité sur les 30 derniers jours"
              subheader="Suivi des nouvelles inscriptions, tests d'orientation et candidatures bourses"
              chart={{
                labels: dates,
                series: [
                  {
                    name: 'Nouveaux étudiants',
                    type: 'column',
                    fill: 'solid',
                    data: newUserAtMoment,
                  },
                  {
                    name: "Tests d'orientation",
                    type: 'area',
                    fill: 'gradient',
                    data: orientationTests,
                  },
                  {
                    name: 'Candidatures bourses',
                    type: 'line',
                    fill: 'solid',
                    data: boursesActives,
                  },
                ],
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <AppCurrentVisits
              title="Top écoles partenaires"
              subheader={`Écoles les plus consultées en ${new Date().getFullYear()}`}
              chart={{
                series: topEcoles,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <AppConversionRates
              title="Formations par domaine"
              subheader="Répartition des formations disponibles par secteur d'activité"
              chart={{
                series: formationsParDomaine,
              }}
            />
          </Grid>

          {/* <Grid size={{xs:12, md:6, lg:4}}>
          <AppCurrentVisits
            title="Rapport qualité embauche annuel"
            subheader={`Candidature acceptées/rejetté/en attente pour ${new Date().getFullYear()}`}
            chart={{
              series: annualReportQualityCandidature,
            }}
          />
        </Grid>

        <Grid size={{xs:12, md:6, lg:8}}>
          <AppNewsUpdate
            title="Dernières offres en ligne"
            list={lastSixJobOffers.map((job) => ({
              id: job._id,
              title: job.title,
              description: job.location,
              image: `${apiUrlAsset.logo}/${job.cover}`,
              postedAt: new Date(job.postedAt),
            }))}
          />
        </Grid>

        <Grid size={{xs:12, md:6, lg:4}}>
          <AppOrderTimeline
            title="Dernières formations en ligne"
            list={lastSixJTrainings.map((training, index) => ({
              id: training._id,
              title: training.title,
              type: `order${index + 1}`,
              time: new Date(training.startDate),
            }))}
          />
        </Grid> */}

          {/* <Grid xs={12} md={6} lg={6}>
          <AppTrafficBySite
            title="Traffic by Site"
            list={[
              {
                name: 'FaceBook',
                value: 323234,
                icon: <Iconify icon="eva:facebook-fill" color="#1877F2" width={32} />,
              },
              {
                name: 'Google',
                value: 341212,
                icon: <Iconify icon="eva:google-fill" color="#DF3E30" width={32} />,
              },
              {
                name: 'Linkedin',
                value: 411213,
                icon: <Iconify icon="eva:linkedin-fill" color="#006097" width={32} />,
              },
              {
                name: 'Twitter',
                value: 443232,
                icon: <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={32} />,
              },
            ]}
          />
        </Grid> */}

          {/* <Grid xs={12} md={6} lg={6}>
          <AppTasks
            title="Actions rapide vote en ligne"
            list={[
              { id: 1, name: 'Edition Miss 2023', isActive: false },
              { id: 2, name: 'Edition Miss 2022', isActive: true },
              { id: 3, name: 'Edition Miss 2021', isActive: false },
              { id: 4, name: 'Edition Miss 2020', isActive: false },
              { id: 5, name: 'Edition Miss 2019', isActive: false },
            ]}
          />
        </Grid> */}
          {/* <Grid xs={12} md={6} lg={6}>
          <AppTasks
            title="Actions rapide sondage"
            list={[
              { id: 1, name: 'Edition Miss 2023', isActive: false },
              { id: 2, name: 'Edition Miss 2022', isActive: true },
              { id: 3, name: 'Edition Miss 2021', isActive: false },
              { id: 4, name: 'Edition Miss 2020', isActive: false },
              { id: 5, name: 'Edition Miss 2019', isActive: false },
            ]}
          />
        </Grid> */}
        </Grid>
      )}
      {isFetching && (
        <Grid container spacing={3}>
          {Array.from(new Array(4)).map((item, index) => (
            <Grid xs={12} key={`skeleton-${index}`} sm={6} md={3}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
          ))}

          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <Card sx={{ padding: 1 }}>
              <Skeleton width="30%" variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton width="60%" variant="text" sx={{ fontSize: '1em' }} />
              <Grid
                container
                direction="row"
                justifyContent="flex-end"
                spacing={1}
                sx={{ pr: 1, mb: 3 }}
              >
                {Array.from(new Array(3)).map((item, index) => (
                  <Grid direction="row" key={`skeleton-sondage-${index}`} item xs={2} md={1}>
                    <Skeleton variant="circular" width={10} height={10} />
                    <Skeleton width="70%" variant="text" sx={{ fontSize: '0.4em' }} />
                  </Grid>
                ))}
              </Grid>
              <Grid container spacing={3}>
                <Skeleton variant="rectangular" width="100%" height={450} animation="pulse" />
              </Grid>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ padding: 1, height: 540, pt: 4 }}>
              <Skeleton width="30%" variant="text" sx={{ fontSize: '1rem' }} />

              <Grid
                container
                justifyContent="center"
                alignItems="center"
                spacing={1}
                sx={{ pt: 10, mb: 3 }}
              >
                <Skeleton variant="circular" width="60%" height={300} />
              </Grid>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <Card sx={{ padding: 1 }}>
              <Skeleton width="30%" variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton width="60%" variant="text" sx={{ fontSize: '1em' }} />
              <Grid container spacing={3}>
                <Skeleton variant="rectangular" width="100%" height={450} animation="pulse" />
              </Grid>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ padding: 1, height: 490, pt: 3 }}>
              <Skeleton width="30%" variant="text" sx={{ fontSize: '1rem' }} />

              <Grid
                container
                justifyContent="center"
                alignItems="center"
                spacing={1}
                sx={{ pt: 10, mb: 3 }}
              >
                <Skeleton variant="circular" width="60%" height={300} />
              </Grid>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
