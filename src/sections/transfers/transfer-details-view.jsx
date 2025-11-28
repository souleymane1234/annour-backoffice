import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Table,
  Button,
  Dialog,
  Select,
  Divider,
  MenuItem,
  TableRow,
  Container,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  InputLabel,
  Breadcrumbs,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  TableContainer, LinearProgress
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
  { value: 'ACCEPTEE', label: 'Acceptée', color: 'success' },
  { value: 'REFUSEE', label: 'Refusée', color: 'error' },
];

// ----------------------------------------------------------------------

export default function TransferDetailsView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showApiResponse } = useNotification();

  const [transfer, setTransfer] = useState(null);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState({ 
    open: false, 
    type: '', 
    status: '',
    reason: '',
    comment: '',
  });

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getTransferById(id);
      
      if (result.success) {
        setTransfer(result.data);
        
        // Fetch history if available
        if (result.data.history) {
          setHistory(result.data.history);
        }
        
        // Fetch notifications if available
        if (result.data.notifications) {
          setNotifications(result.data.notifications);
        }
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
        navigate(routesName.adminTransfers);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement de la permutation' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
      navigate(routesName.adminTransfers);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type) => {
    let status = transfer?.status || '';
    if (type === 'accept') {
      status = 'ACCEPTEE';
    } else if (type === 'reject') {
      status = 'REFUSEE';
    }
    
    setActionDialog({ 
      open: true, 
      type, 
      status,
      reason: '',
      comment: '',
    });
  };

  const handleActionConfirm = async () => {
    const { type, status, reason, comment } = actionDialog;
    
    try {
      let result;
      if (type === 'delete') {
        result = await ConsumApi.deleteTransfer(id);
      } else if (type === 'status') {
        result = await ConsumApi.updateTransferStatus(id, { status, reason });
      } else {
        result = await ConsumApi.performTransferAction(id, { status, reason, comment });
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        if (type === 'delete') {
          navigate(routesName.adminTransfers);
        } else {
          fetchTransfer();
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

    setActionDialog({ 
      open: false, 
      type: '', 
      status: '',
      reason: '',
      comment: '',
    });
  };

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <LinearProgress />
          <Typography>Chargement...</Typography>
        </Box>
      </Container>
    );
  }

  if (!transfer) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Permutation non trouvée</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails de la Permutation</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Détails de la Permutation
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Permutations
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
              onClick={() => navigate(routesName.adminTransfers)}
            >
              Retour
            </Button>
            {transfer.status === 'EN_ATTENTE' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={() => handleAction('accept')}
                >
                  Accepter
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                  onClick={() => handleAction('reject')}
                >
                  Refuser
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
              onClick={() => handleAction('delete')}
            >
              Supprimer
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={getStatusLabel(transfer.status)}
                    color={getStatusColor(transfer.status)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de création
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {formatDate(transfer.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Établissement source
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {transfer.sourceInstitution || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Établissement destination
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {transfer.targetInstitution || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {transfer.student && (
              <Card sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informations étudiant
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nom complet
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {transfer.student.fullName || transfer.student.email || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {transfer.student.email || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            )}

            {history && history.length > 0 && (
              <Card sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Historique
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Acteur</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDateTime(entry.actionDate || entry.createdAt)}</TableCell>
                          <TableCell>{entry.action || '-'}</TableCell>
                          <TableCell>{entry.actorId || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nombre d&apos;historiques
                  </Typography>
                  <Typography variant="h4">{transfer.historyCount || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nombre de notifications
                  </Typography>
                  <Typography variant="h4">{transfer.notificationsCount || 0}</Typography>
                </Box>
              </Stack>
            </Card>

            {notifications && notifications.length > 0 && (
              <Card sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Notifications récentes
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2}>
                  {notifications.slice(0, 5).map((notification, index) => (
                    <Box key={index}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(notification.createdAt)}
                      </Typography>
                      <Typography variant="body1">
                        {notification.message || '-'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            )}
          </Grid>
        </Grid>

        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ ...actionDialog, open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionDialog.type === 'delete' && 'Supprimer la permutation'}
            {actionDialog.type === 'accept' && 'Accepter la permutation'}
            {actionDialog.type === 'reject' && 'Refuser la permutation'}
            {actionDialog.type === 'status' && 'Modifier le statut'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {actionDialog.type !== 'delete' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={actionDialog.status}
                      onChange={(e) => setActionDialog({ ...actionDialog, status: e.target.value })}
                      label="Statut"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Raison"
                    multiline
                    rows={3}
                    value={actionDialog.reason}
                    onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
                    placeholder="Raison du changement de statut..."
                  />
                  <TextField
                    fullWidth
                    label="Commentaire (optionnel)"
                    multiline
                    rows={3}
                    value={actionDialog.comment}
                    onChange={(e) => setActionDialog({ ...actionDialog, comment: e.target.value })}
                    placeholder="Commentaire additionnel..."
                  />
                </>
              )}
              {actionDialog.type === 'delete' && (
                <Typography>
                  Êtes-vous sûr de vouloir supprimer cette permutation ? Cette action est irréversible.
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ ...actionDialog, open: false })}>
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

