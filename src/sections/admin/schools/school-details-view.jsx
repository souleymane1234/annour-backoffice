import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SchoolDetailsView() {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSchoolDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ConsumApi.getSchoolById(id);
      
      if (result.success) {
        setSchool(result.data);
      } else {
        // Fallback vers des données mockées
        const mockSchool = {
          id: parseInt(id, 10),
          name: 'École Supérieure de Commerce',
          slogan: 'Excellence et Innovation',
          description: 'Une école de commerce de renommée internationale, formant les leaders de demain.',
          region: 'Abidjan',
          city: 'Cocody',
          address: 'Boulevard de la République, Cocody',
          phone: '+225 20 30 40 50',
          email: 'contact@esc-ci.com',
          website: 'https://www.esc-ci.com',
          logoUrl: null,
          coverImageUrl: null,
          isVerified: true,
          hasPaid: true,
          premiumExpiresAt: '2024-12-31T23:59:59Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-03-15T14:30:00Z',
          statistics: {
            totalStudents: 1250,
            totalPrograms: 8,
            totalTeachers: 45,
            averageRating: 4.7,
            totalReviews: 156
          },
          programs: [
            {
              id: 1,
              name: 'Master en Management',
              description: 'Formation complète en management d\'entreprise',
              duration: '2 ans',
              level: 'Master',
              isActive: true
            },
            {
              id: 2,
              name: 'Licence en Marketing',
              description: 'Formation en marketing digital et traditionnel',
              duration: '3 ans',
              level: 'Licence',
              isActive: true
            }
          ],
          media: [
            {
              id: 1,
              type: 'image',
              url: 'https://example.com/image1.jpg',
              title: 'Campus principal',
              description: 'Vue du campus principal'
            },
            {
              id: 2,
              type: 'video',
              url: 'https://example.com/video1.mp4',
              title: 'Présentation de l\'école',
              description: 'Vidéo de présentation'
            }
          ]
        };
        setSchool(mockSchool);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails de l\'école:', err);
      setError('Impossible de charger les détails de l\'école');
      
      // Données mockées en cas d'erreur
      const mockSchool = {
        id: parseInt(id, 10),
        name: 'École Supérieure de Commerce',
        slogan: 'Excellence et Innovation',
        description: 'Une école de commerce de renommée internationale, formant les leaders de demain.',
        region: 'Abidjan',
        city: 'Cocody',
        address: 'Boulevard de la République, Cocody',
        phone: '+225 20 30 40 50',
        email: 'contact@esc-ci.com',
        website: 'https://www.esc-ci.com',
        logoUrl: null,
        coverImageUrl: null,
        isVerified: true,
        hasPaid: true,
        premiumExpiresAt: '2024-12-31T23:59:59Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-15T14:30:00Z',
        statistics: {
          totalStudents: 1250,
          totalPrograms: 8,
          totalTeachers: 45,
          averageRating: 4.7,
          totalReviews: 156
        },
        programs: [
          {
            id: 1,
            name: 'Master en Management',
            description: 'Formation complète en management d\'entreprise',
            duration: '2 ans',
            level: 'Master',
            isActive: true
          },
          {
            id: 2,
            name: 'Licence en Marketing',
            description: 'Formation en marketing digital et traditionnel',
            duration: '3 ans',
            level: 'Licence',
            isActive: true
          }
        ],
        media: [
          {
            id: 1,
            type: 'image',
            url: 'https://example.com/image1.jpg',
            title: 'Campus principal',
            description: 'Vue du campus principal'
          },
          {
            id: 2,
            type: 'video',
            url: 'https://example.com/video1.mp4',
            title: 'Présentation de l\'école',
            description: 'Vidéo de présentation'
          }
        ]
      };
      setSchool(mockSchool);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSchoolDetails();
    }
  }, [id]);

  const handleValidateSchool = async () => {
    try {
      const result = await ConsumApi.validateSchool(id);
      if (result.success) {
        setSchool(prev => ({ ...prev, isVerified: true }));
      }
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
    }
  };

  const handleRejectSchool = async () => {
    try {
      const result = await ConsumApi.rejectSchool(id);
      if (result.success) {
        setSchool(prev => ({ ...prev, isVerified: false }));
      }
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
    }
  };

  const handleTogglePremium = async () => {
    try {
      if (school.hasPaid) {
        await ConsumApi.deactivateSchoolPremium(id);
        setSchool(prev => ({ ...prev, hasPaid: false }));
      } else {
        await ConsumApi.activateSchoolPremium(id);
        setSchool(prev => ({ ...prev, hasPaid: true }));
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut premium:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des détails de l&apos;école...
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
        <Button variant="contained" onClick={loadSchoolDetails}>
          Réessayer
        </Button>
      </Box>
    );
  }

  if (!school) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          École non trouvée
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
          <Typography variant="h4">{school.name}</Typography>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Chip
            label={school.isVerified ? 'Vérifiée' : 'En attente'}
            color={school.isVerified ? 'success' : 'warning'}
            size="small"
          />
          <Chip
            label={school.hasPaid ? 'Premium' : 'Gratuit'}
            color={school.hasPaid ? 'success' : 'default'}
            size="small"
          />
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Slogan
                  </Typography>
                  <Typography variant="body1">{school.slogan}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{school.description}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Localisation
                  </Typography>
                  <Typography variant="body1">
                    {school.address}, {school.city}, {school.region}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2">📞 {school.phone}</Typography>
                    <Typography variant="body2">✉️ {school.email}</Typography>
                    <Typography variant="body2">🌐 {school.website}</Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Programmes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Programmes ({school.programs?.length || 0})
              </Typography>
              
              <Stack spacing={2}>
                {school.programs?.map((program) => (
                  <Box key={program.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1">{program.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {program.description}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Chip label={program.level} size="small" />
                      <Chip label={program.duration} size="small" />
                      <Chip 
                        label={program.isActive ? 'Actif' : 'Inactif'} 
                        color={program.isActive ? 'success' : 'default'} 
                        size="small" 
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Médias */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Médias ({school.media?.length || 0})
              </Typography>
              
              <Stack spacing={2}>
                {school.media?.map((media) => (
                  <Box key={media.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1">{media.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {media.description}
                    </Typography>
                    <Chip 
                      label={media.type === 'image' ? 'Image' : 'Vidéo'} 
                      color={media.type === 'image' ? 'primary' : 'secondary'} 
                      size="small" 
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques et actions */}
        <Grid item xs={12} md={4}>
          {/* Statistiques */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Étudiants
                  </Typography>
                  <Typography variant="h4">{school.statistics?.totalStudents || 0}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Programmes
                  </Typography>
                  <Typography variant="h4">{school.statistics?.totalPrograms || 0}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Enseignants
                  </Typography>
                  <Typography variant="h4">{school.statistics?.totalTeachers || 0}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Note moyenne
                  </Typography>
                  <Typography variant="h4">{school.statistics?.averageRating || 0}/5</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Stack spacing={2}>
                {!school.isVerified && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    onClick={handleValidateSchool}
                    fullWidth
                  >
                    Valider l&apos;école
                  </Button>
                )}
                
                {!school.isVerified && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="solar:close-circle-bold" />}
                    onClick={handleRejectSchool}
                    fullWidth
                  >
                    Rejeter l&apos;école
                  </Button>
                )}
                
                <Button
                  variant={school.hasPaid ? 'outlined' : 'contained'}
                  color={school.hasPaid ? 'error' : 'primary'}
                  startIcon={<Iconify icon={school.hasPaid ? 'solar:star-bold' : 'solar:star-outline'} />}
                  onClick={handleTogglePremium}
                  fullWidth
                >
                  {school.hasPaid ? 'Désactiver Premium' : 'Activer Premium'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  component={RouterLink}
                  href={`/admin/schools/${id}/edit`}
                  fullWidth
                >
                  Modifier l&apos;école
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:chart-bold" />}
                  component={RouterLink}
                  href={`/admin/schools/${id}/statistics`}
                  fullWidth
                >
                  Voir les statistiques
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:book-bold" />}
                  component={RouterLink}
                  href={`/admin/schools/${id}/programs`}
                  fullWidth
                >
                  Gérer les programmes
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:gallery-bold" />}
                  component={RouterLink}
                  href={`/admin/schools/${id}/media`}
                  fullWidth
                >
                  Gérer les médias
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
