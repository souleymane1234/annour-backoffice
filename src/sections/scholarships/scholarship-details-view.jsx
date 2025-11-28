import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import {
    Box,
    Card,
    Grid,
    Chip,
    Stack,
    Button,
    Dialog,
    Divider,
    Container,
    TextField, Typography,
    Breadcrumbs,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'OUVERTE', label: 'Ouverte', color: 'success' },
  { value: 'FERMEE', label: 'Fermée', color: 'error' },
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
];

// ----------------------------------------------------------------------

export default function ScholarshipDetailsView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showApiResponse } = useNotification();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', reason: '' });

  useEffect(() => {
    fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getScholarshipById(id);
      
      if (result.success) {
        setScholarship(result.data);
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
        navigate(routesName.adminScholarships);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement de la bourse' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
      navigate(routesName.adminScholarships);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type) => {
    setActionDialog({ open: true, type, reason: '' });
  };

  const handleActionConfirm = async () => {
    const { type, reason } = actionDialog;
    
    try {
      let result;
      switch (type) {
        case 'close':
          result = await ConsumApi.closeScholarship(id, reason);
          break;
        case 'open':
          result = await ConsumApi.openScholarship(id, reason);
          break;
        case 'delete':
          result = await ConsumApi.deleteScholarship(id);
          break;
        default:
          return;
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        if (type === 'delete') {
          navigate(routesName.adminScholarships);
        } else {
          fetchScholarship();
        }
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de l\'action' 
      }, {
        errorTitle: 'Erreur'
      });
    }

    setActionDialog({ open: false, type: '', reason: '' });
  };

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatDateTime = (dateString) => new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getActionText = (type) => {
    if (type === 'delete') return 'supprimer';
    if (type === 'close') return 'fermer';
    return 'ouvrir';
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Chargement...</Typography>
        </Box>
      </Container>
    );
  }

  if (!scholarship) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Bourse non trouvée</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails de la Bourse - {scholarship.title}</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              {scholarship.title}
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.primary">
                Détails
              </Typography>
            </Breadcrumbs>
          </div>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate(routesName.adminScholarships)}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => navigate(`${routesName.adminScholarshipEdit.replace(':id', id)}`)}
            >
              Modifier
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {scholarship.description}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Informations générales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Pays d&apos;accueil
                        </Typography>
                        <Typography variant="body1">
                          {scholarship.hostCountry}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Statut
                        </Typography>
                        <Chip
                          label={getStatusLabel(scholarship.status)}
                          color={getStatusColor(scholarship.status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date limite de candidature
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(scholarship.dateLimite)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Créée le
                        </Typography>
                        <Typography variant="body1">
                          {formatDateTime(scholarship.createdAt)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  <Stack spacing={2}>
                    {scholarship.status === 'OUVERTE' && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Iconify icon="eva:lock-fill" />}
                        onClick={() => handleAction('close')}
                        fullWidth
                      >
                        Fermer la bourse
                      </Button>
                    )}
                    {scholarship.status === 'FERMEE' && (
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<Iconify icon="eva:unlock-fill" />}
                        onClick={() => handleAction('open')}
                        fullWidth
                      >
                        Ouvrir la bourse
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Iconify icon="eva:trash-2-outline" />}
                      onClick={() => handleAction('delete')}
                      fullWidth
                    >
                      Supprimer
                    </Button>
                  </Stack>
                </Box>
              </Card>

              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Statistiques
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Candidatures
                      </Typography>
                      <Typography variant="body2">
                        {scholarship.applicationsCount || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Dossiers étudiants
                      </Typography>
                      <Typography variant="body2">
                        {scholarship.studentFilesCount || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', reason: '' })}>
          <DialogTitle>
            Confirmer l&apos;action
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Êtes-vous sûr de vouloir {getActionText(actionDialog.type)} cette bourse ?
            </Typography>
            {actionDialog.type !== 'delete' && (
              <TextField
                fullWidth
                label="Raison (optionnel)"
                multiline
                rows={3}
                value={actionDialog.reason}
                onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: '', reason: '' })}>
              Annuler
            </Button>
            <Button 
              onClick={handleActionConfirm} 
              variant="contained" 
              color={actionDialog.type === 'delete' ? 'error' : 'primary'}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
