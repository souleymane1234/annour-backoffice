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
  Dialog, Container,
  TextField,
  Typography,
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
  { value: 'SOUMIS', label: 'Soumis', color: 'info' },
  { value: 'ACCEPTE', label: 'Accepté', color: 'success' },
  { value: 'REJETE', label: 'Rejeté', color: 'error' },
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
];

// ----------------------------------------------------------------------

export default function StudentFileDetailsView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showApiResponse } = useNotification();

  const [studentFile, setStudentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', reason: '', comment: '' });

  useEffect(() => {
    fetchStudentFile();
  }, [id]);

  const fetchStudentFile = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getStudentFileById(id);
      
      if (result.success) {
        setStudentFile(result.data);
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
        navigate(routesName.adminStudentFiles);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement du dossier' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
      navigate(routesName.adminStudentFiles);
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
          result = await ConsumApi.validateStudentFile(id, reason, comment);
          break;
        case 'reject':
          result = await ConsumApi.rejectStudentFile(id, reason, comment);
          break;
        case 'submit':
          result = await ConsumApi.submitStudentFile(id, reason, comment);
          break;
        case 'delete':
          result = await ConsumApi.deleteStudentFile(id);
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
          navigate(routesName.adminStudentFiles);
        } else {
          fetchStudentFile();
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

  if (!studentFile) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Dossier non trouvé</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails du Dossier Étudiant</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Dossier de {studentFile.student?.firstName} {studentFile.student?.lastName}
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dossiers Étudiants
              </Typography>
              <Typography variant="body2" color="text.primary">
                Détails
              </Typography>
            </Breadcrumbs>
          </div>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminStudentFiles)}
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
                      src={studentFile.student?.avatar} 
                      sx={{ width: 64, height: 64 }}
                    >
                      {studentFile.student?.firstName?.charAt(0)}{studentFile.student?.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {studentFile.student?.firstName} {studentFile.student?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {studentFile.student?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {studentFile.student?.phoneNumber}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Niveau d&apos;études actuel
                      </Typography>
                      <Typography variant="body1">
                        {studentFile.currentLevel}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Statut du dossier
                      </Typography>
                      <Chip
                        label={getStatusLabel(studentFile.status)}
                        color={getStatusColor(studentFile.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        CV disponible
                      </Typography>
                      <Typography variant="body1">
                        {studentFile.hasCv ? 'Oui' : 'Non'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date de création
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(studentFile.createdAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* CV Information */}
              {studentFile.cvUrl && (
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      CV de l&apos;étudiant
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="eva:download-fill" />}
                      href={studentFile.cvUrl}
                      target="_blank"
                    >
                      Télécharger le CV
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Comments and History */}
              {studentFile.comments && studentFile.comments.length > 0 && (
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Commentaires et historique
                    </Typography>
                    <Stack spacing={2}>
                      {studentFile.comments.map((comment, index) => (
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
                    {studentFile.status !== 'ACCEPTE' && (
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                        onClick={() => handleAction('validate')}
                        fullWidth
                      >
                        Valider le dossier
                      </Button>
                    )}
                    {studentFile.status !== 'REJETE' && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Iconify icon="eva:close-circle-fill" />}
                        onClick={() => handleAction('reject')}
                        fullWidth
                      >
                        Rejeter le dossier
                      </Button>
                    )}
                    {studentFile.status !== 'SOUMIS' && (
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<Iconify icon="eva:upload-fill" />}
                        onClick={() => handleAction('submit')}
                        fullWidth
                      >
                        Marquer comme soumis
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
                    Informations du dossier
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        ID du dossier
                      </Typography>
                      <Typography variant="body2">
                        {studentFile.id}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Dernière modification
                      </Typography>
                      <Typography variant="body2">
                        {formatDateTime(studentFile.updatedAt)}
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
            {actionDialog.type === 'validate' && 'Valider le dossier'}
            {actionDialog.type === 'reject' && 'Rejeter le dossier'}
            {actionDialog.type === 'submit' && 'Marquer comme soumis'}
            {actionDialog.type === 'delete' && 'Supprimer le dossier'}
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
                  Êtes-vous sûr de vouloir supprimer ce dossier étudiant ? Cette action est irréversible.
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
