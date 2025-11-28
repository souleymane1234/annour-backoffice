import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Paper,
  Button,
  Avatar,
  Dialog,
  Container,
  TextField,
  Typography,
  Breadcrumbs,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
  { value: 'VALIDEE', label: 'Validée', color: 'success' },
  { value: 'REJETEE', label: 'Rejetée', color: 'error' },
];

// ----------------------------------------------------------------------

export default function ApplicationDetailsView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showApiResponse } = useNotification();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', reason: '', comment: '' });

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getApplicationById(id);
      
      if (result.success) {
        setApplication(result.data);
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
        navigate(routesName.adminApplications);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement de la candidature' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
      navigate(routesName.adminApplications);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type) => {
    setActionDialog({ open: true, type, reason: '', comment: '' });
  };

  const handleActionConfirm = async () => {
    const { type, reason, comment } = actionDialog;
    
    try {
      let result;
      switch (type) {
        case 'validate':
          result = await ConsumApi.validateApplication(id, reason, comment);
          break;
        case 'reject':
          result = await ConsumApi.rejectApplication(id, reason, comment);
          break;
        case 'pending':
          result = await ConsumApi.setApplicationPending(id, reason, comment);
          break;
        case 'delete':
          result = await ConsumApi.deleteApplication(id);
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
          navigate(routesName.adminApplications);
        } else {
          fetchApplication();
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

    setActionDialog({ open: false, type: '', reason: '', comment: '' });
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

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Chargement...</Typography>
        </Box>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Candidature non trouvée</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails de la Candidature</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Candidature de {application.student?.firstName} {application.student?.lastName}
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Candidatures
              </Typography>
              <Typography variant="body2" color="text.primary">
                Détails
              </Typography>
            </Breadcrumbs>
          </div>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminApplications)}
          >
            Retour
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Student Information */}
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Informations de l&apos;étudiant
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar 
                      src={application.student?.avatar} 
                      sx={{ width: 64, height: 64 }}
                    >
                      {application.student?.firstName?.charAt(0)}{application.student?.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {application.student?.firstName} {application.student?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.student?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {application.student?.phoneNumber}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Niveau d&apos;études
                      </Typography>
                      <Typography variant="body1">
                        {application.student?.currentLevel}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date de candidature
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(application.appliedAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Scholarship Information */}
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Informations de la bourse
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Titre de la bourse
                      </Typography>
                      <Typography variant="h6">
                        {application.scholarship?.title}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Pays d&apos;accueil
                      </Typography>
                      <Typography variant="body1">
                        {application.scholarship?.hostCountry}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date limite
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(application.scholarship?.dateLimite)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {application.scholarship?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* Application Details */}
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Détails de la candidature
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Statut
                      </Typography>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        ID de la candidature
                      </Typography>
                      <Typography variant="body1">
                        {application.id}
                      </Typography>
                    </Grid>
                    {application.motivation && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Lettre de motivation
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {application.motivation}
                        </Typography>
                      </Grid>
                    )}
                    {application.documents && application.documents.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Documents joints
                        </Typography>
                        <Stack spacing={1}>
                          {application.documents.map((doc, index) => (
                            <Button
                              key={index}
                              variant="outlined"
                              startIcon={<Iconify icon="eva:download-fill" />}
                              href={doc.url}
                              target="_blank"
                              size="small"
                            >
                              {doc.name}
                            </Button>
                          ))}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Card>

              {/* Comments and History */}
              {application.comments && application.comments.length > 0 && (
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Commentaires et historique
                    </Typography>
                    <Stack spacing={2}>
                      {application.comments.map((comment, index) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {comment.author} - {formatDateTime(comment.date)}
                          </Typography>
                          <Typography variant="body1">
                            {comment.content}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Card>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  <Stack spacing={2}>
                    {application.status !== 'VALIDEE' && (
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                        onClick={() => handleAction('validate')}
                        fullWidth
                      >
                        Valider la candidature
                      </Button>
                    )}
                    {application.status !== 'REJETEE' && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Iconify icon="eva:close-circle-fill" />}
                        onClick={() => handleAction('reject')}
                        fullWidth
                      >
                        Rejeter la candidature
                      </Button>
                    )}
                    {application.status !== 'EN_ATTENTE' && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Iconify icon="eva:clock-outline" />}
                        onClick={() => handleAction('pending')}
                        fullWidth
                      >
                        Remettre en attente
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
                    Informations de la candidature
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Dernière modification
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTime(application.updatedAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Créée le
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTime(application.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', reason: '', comment: '' })} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionDialog.type === 'validate' && 'Valider la candidature'}
            {actionDialog.type === 'reject' && 'Rejeter la candidature'}
            {actionDialog.type === 'pending' && 'Remettre en attente'}
            {actionDialog.type === 'delete' && 'Supprimer la candidature'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {actionDialog.type !== 'delete' && (
                <>
                  <TextField
                    fullWidth
                    label="Raison"
                    multiline
                    rows={3}
                    value={actionDialog.reason}
                    onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Commentaire"
                    multiline
                    rows={3}
                    value={actionDialog.comment}
                    onChange={(e) => setActionDialog({ ...actionDialog, comment: e.target.value })}
                  />
                </>
              )}
              {actionDialog.type === 'delete' && (
                <Typography>
                  Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: '', reason: '', comment: '' })}>
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
