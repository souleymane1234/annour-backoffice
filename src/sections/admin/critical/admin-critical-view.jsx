import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import {
  Box,
  Tab,
  Card,
  Alert,
  Grid,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  Container,
  DialogTitle,
  DialogContent,
  DialogActions,
  AlertTitle,
  Divider,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AdminCriticalView() {
  const { contextHolder, showApiResponse, showError, showSuccess } = useNotification();
  
  const [currentTab, setCurrentTab] = useState('kill-switch');
  const [loading, setLoading] = useState(false);

  // Kill Switch Dialog
  const [killSwitchDialog, setKillSwitchDialog] = useState(false);

  // User Actions Dialogs
  const [userBanDialog, setUserBanDialog] = useState({ open: false, userId: '' });
  const [userDeleteDialog, setUserDeleteDialog] = useState({ open: false, userId: '' });
  const [userResetDialog, setUserResetDialog] = useState({ open: false, userId: '' });

  // Station Actions Dialogs
  const [stationBanDialog, setStationBanDialog] = useState({ open: false, stationId: '' });
  const [stationDeleteDialog, setStationDeleteDialog] = useState({ open: false, stationId: '' });

  // Pompiste Actions Dialogs
  const [pompisteBanDialog, setPompisteBanDialog] = useState({ open: false, pompisteId: '' });
  const [pompisteReassignDialog, setPompisteReassignDialog] = useState({ 
    open: false, 
    pompisteId: '', 
    newStationId: '' 
  });

  // Session Actions Dialogs
  const [sessionReservoirDialog, setSessionReservoirDialog] = useState({ 
    open: false, 
    sessionId: '', 
    correctedCapacity: '' 
  });
  const [sessionServedDialog, setSessionServedDialog] = useState({ 
    open: false, 
    sessionId: '', 
    correctedCapacity: '' 
  });

  const handleKillSwitch = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.activateKillSwitch();
      showApiResponse(result, {
        successTitle: 'Kill Switch activé',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setKillSwitchDialog(false);
      }
    } catch (error) {
      showError('Erreur', 'Impossible d\'activer le kill switch');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!userBanDialog.userId.trim()) {
      showError('Erreur', 'Veuillez entrer un ID utilisateur');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.banUser(userBanDialog.userId);
      showApiResponse(result, {
        successTitle: 'Utilisateur banni',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setUserBanDialog({ open: false, userId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de bannir l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userDeleteDialog.userId.trim()) {
      showError('Erreur', 'Veuillez entrer un ID utilisateur');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.deleteUserPermanent(userDeleteDialog.userId);
      showApiResponse(result, {
        successTitle: 'Utilisateur supprimé',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setUserDeleteDialog({ open: false, userId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de supprimer l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleResetUserPassages = async () => {
    if (!userResetDialog.userId.trim()) {
      showError('Erreur', 'Veuillez entrer un ID utilisateur');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.resetUserPassages(userResetDialog.userId);
      showApiResponse(result, {
        successTitle: 'Passages réinitialisés',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setUserResetDialog({ open: false, userId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de réinitialiser les passages');
    } finally {
      setLoading(false);
    }
  };

  const handleBanStation = async () => {
    if (!stationBanDialog.stationId.trim()) {
      showError('Erreur', 'Veuillez entrer un ID de station');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.banStation(stationBanDialog.stationId);
      showApiResponse(result, {
        successTitle: 'Station bannie',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setStationBanDialog({ open: false, stationId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de bannir la station');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStation = async () => {
    if (!stationDeleteDialog.stationId.trim()) {
      showError('Erreur', 'Veuillez entrer un ID de station');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.deleteStationPermanent(stationDeleteDialog.stationId);
      showApiResponse(result, {
        successTitle: 'Station supprimée',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setStationDeleteDialog({ open: false, stationId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de supprimer la station');
    } finally {
      setLoading(false);
    }
  };

  const handleBanPompiste = async () => {
    if (!pompisteBanDialog.pompisteId.trim()) {
      showError('Erreur', 'Veuillez entrer un ID de pompiste');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.banPompiste(pompisteBanDialog.pompisteId);
      showApiResponse(result, {
        successTitle: 'Pompiste banni',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setPompisteBanDialog({ open: false, pompisteId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de bannir le pompiste');
    } finally {
      setLoading(false);
    }
  };

  const handleReassignPompiste = async () => {
    if (!pompisteReassignDialog.pompisteId.trim() || !pompisteReassignDialog.newStationId.trim()) {
      showError('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.reassignPompiste(
        pompisteReassignDialog.pompisteId,
        pompisteReassignDialog.newStationId
      );
      showApiResponse(result, {
        successTitle: 'Pompiste réassigné',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setPompisteReassignDialog({ open: false, pompisteId: '', newStationId: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de réassigner le pompiste');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectReservoir = async () => {
    if (!sessionReservoirDialog.sessionId.trim() || !sessionReservoirDialog.correctedCapacity) {
      showError('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.correctReservoir(
        sessionReservoirDialog.sessionId,
        Number(sessionReservoirDialog.correctedCapacity)
      );
      showApiResponse(result, {
        successTitle: 'Réservoir corrigé',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setSessionReservoirDialog({ open: false, sessionId: '', correctedCapacity: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de corriger le réservoir');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectServed = async () => {
    if (!sessionServedDialog.sessionId.trim() || !sessionServedDialog.correctedCapacity) {
      showError('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const result = await ConsumApi.correctServedCapacity(
        sessionServedDialog.sessionId,
        Number(sessionServedDialog.correctedCapacity)
      );
      showApiResponse(result, {
        successTitle: 'Capacité servie corrigée',
        errorTitle: 'Erreur',
      });
      if (result.success) {
        setSessionServedDialog({ open: false, sessionId: '', correctedCapacity: '' });
      }
    } catch (error) {
      showError('Erreur', 'Impossible de corriger la capacité servie');
    } finally {
      setLoading(false);
    }
  };

  const renderKillSwitchSection = () => (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Kill Switch - Blocage Système d'Urgence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ACTION CRITIQUE : Ferme toutes les sessions, désactive toutes les stations, suspend tous les utilisateurs (sauf Super Admin)
          </Typography>
        </Box>

        <Alert severity="error">
          <AlertTitle>Attention</AlertTitle>
          Cette action est irréversible et affectera tous les utilisateurs du système.
        </Alert>

        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<Iconify icon="solar:danger-triangle-bold" />}
          onClick={() => setKillSwitchDialog(true)}
        >
          Activer le Kill Switch
        </Button>
      </Stack>
    </Card>
  );

  const renderUserActionsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Bannir un utilisateur</Typography>
            <Typography variant="body2" color="text.secondary">
              Bannir un utilisateur (admin/station/user). Impossible de bannir un Super Admin.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setUserBanDialog({ open: true, userId: '' })}
            >
              Bannir un utilisateur
            </Button>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Supprimer un utilisateur</Typography>
            <Typography variant="body2" color="text.secondary">
              Supprimer définitivement un utilisateur du système. Impossible de supprimer un Super Admin ou un utilisateur dans une file active.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setUserDeleteDialog({ open: true, userId: '' })}
            >
              Supprimer un utilisateur
            </Button>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Réinitialiser les passages</Typography>
            <Typography variant="body2" color="text.secondary">
              Réinitialiser les passages d'un utilisateur.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setUserResetDialog({ open: true, userId: '' })}
            >
              Réinitialiser les passages
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );

  const renderStationActionsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Bannir une station</Typography>
            <Typography variant="body2" color="text.secondary">
              Bannir une station du système.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setStationBanDialog({ open: true, stationId: '' })}
            >
              Bannir une station
            </Button>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Supprimer une station</Typography>
            <Typography variant="body2" color="text.secondary">
              Supprimer définitivement une station. Impossible si la station a des sessions actives.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setStationDeleteDialog({ open: true, stationId: '' })}
            >
              Supprimer une station
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPompisteActionsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Bannir un pompiste</Typography>
            <Typography variant="body2" color="text.secondary">
              Bannir un pompiste du système.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setPompisteBanDialog({ open: true, pompisteId: '' })}
            >
              Bannir un pompiste
            </Button>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Réassigner un pompiste</Typography>
            <Typography variant="body2" color="text.secondary">
              Réassigner un pompiste à une autre station. Impossible si le pompiste a des sessions actives.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setPompisteReassignDialog({ open: true, pompisteId: '', newStationId: '' })}
            >
              Réassigner un pompiste
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSessionActionsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Corriger un réservoir</Typography>
            <Typography variant="body2" color="text.secondary">
              Modifier un réservoir (erreur déclarée) pour une session.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSessionReservoirDialog({ open: true, sessionId: '', correctedCapacity: '' })}
            >
              Corriger un réservoir
            </Button>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6">Corriger une capacité servie</Typography>
            <Typography variant="body2" color="text.secondary">
              Corriger une capacité servie (en cas de fraude) pour une session.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSessionServedDialog({ open: true, sessionId: '', correctedCapacity: '' })}
            >
              Corriger une capacité servie
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Helmet>
        <title>Actions Critiques | CarbuGo</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Actions Critiques</Typography>
            <Typography variant="body2" color="text.secondary">
              Gestion des actions critiques réservées au Super Admin
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Attention</AlertTitle>
            Toutes les actions de cette page sont irréversibles ou critiques. 
            Utilisez-les avec précaution.
          </Alert>

          <Card>
            <TabContext value={currentTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList
                  onChange={(e, newValue) => setCurrentTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    label="Kill Switch"
                    value="kill-switch"
                    icon={<Iconify icon="solar:danger-triangle-bold" />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Utilisateurs"
                    value="users"
                    icon={<Iconify icon="solar:user-bold" />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Stations"
                    value="stations"
                    icon={<Iconify icon="solar:shop-bold" />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Pompistes"
                    value="pompistes"
                    icon={<Iconify icon="solar:users-group-rounded-bold" />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Sessions"
                    value="sessions"
                    icon={<Iconify icon="solar:document-bold" />}
                    iconPosition="start"
                  />
                </TabList>
              </Box>

              <Box sx={{ p: 3 }}>
                <TabPanel value="kill-switch" sx={{ p: 0 }}>
                  {renderKillSwitchSection()}
                </TabPanel>
                <TabPanel value="users" sx={{ p: 0 }}>
                  {renderUserActionsSection()}
                </TabPanel>
                <TabPanel value="stations" sx={{ p: 0 }}>
                  {renderStationActionsSection()}
                </TabPanel>
                <TabPanel value="pompistes" sx={{ p: 0 }}>
                  {renderPompisteActionsSection()}
                </TabPanel>
                <TabPanel value="sessions" sx={{ p: 0 }}>
                  {renderSessionActionsSection()}
                </TabPanel>
              </Box>
            </TabContext>
          </Card>
        </Stack>
      </Container>

      {/* Kill Switch Dialog */}
      <Dialog open={killSwitchDialog} onClose={() => setKillSwitchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Activer le Kill Switch</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Action critique</AlertTitle>
            Cette action va :
            <ul>
              <li>Fermer toutes les sessions actives</li>
              <li>Désactiver toutes les stations</li>
              <li>Suspendre tous les utilisateurs (sauf Super Admin)</li>
            </ul>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Êtes-vous sûr de vouloir activer le kill switch ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKillSwitchDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleKillSwitch}
            disabled={loading}
          >
            {loading ? 'Activation...' : 'Activer le Kill Switch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Ban Dialog */}
      <Dialog open={userBanDialog.open} onClose={() => setUserBanDialog({ open: false, userId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Bannir un utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID Utilisateur"
            value={userBanDialog.userId}
            onChange={(e) => setUserBanDialog({ ...userBanDialog, userId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Entrez l'ID de l'utilisateur à bannir"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserBanDialog({ open: false, userId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBanUser}
            disabled={loading}
          >
            {loading ? 'Bannissement...' : 'Bannir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Delete Dialog */}
      <Dialog open={userDeleteDialog.open} onClose={() => setUserDeleteDialog({ open: false, userId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Supprimer un utilisateur</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible. Impossible de supprimer un Super Admin ou un utilisateur dans une file active.
          </Alert>
          <TextField
            fullWidth
            label="ID Utilisateur"
            value={userDeleteDialog.userId}
            onChange={(e) => setUserDeleteDialog({ ...userDeleteDialog, userId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Entrez l'ID de l'utilisateur à supprimer"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDeleteDialog({ open: false, userId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={loading}
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Reset Passages Dialog */}
      <Dialog open={userResetDialog.open} onClose={() => setUserResetDialog({ open: false, userId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Réinitialiser les passages d'un utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID Utilisateur"
            value={userResetDialog.userId}
            onChange={(e) => setUserResetDialog({ ...userResetDialog, userId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Entrez l'ID de l'utilisateur dont vous voulez réinitialiser les passages"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserResetDialog({ open: false, userId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleResetUserPassages}
            disabled={loading}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Station Ban Dialog */}
      <Dialog open={stationBanDialog.open} onClose={() => setStationBanDialog({ open: false, stationId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Bannir une station</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID Station"
            value={stationBanDialog.stationId}
            onChange={(e) => setStationBanDialog({ ...stationBanDialog, stationId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Entrez l'ID de la station à bannir"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStationBanDialog({ open: false, stationId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBanStation}
            disabled={loading}
          >
            {loading ? 'Bannissement...' : 'Bannir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Station Delete Dialog */}
      <Dialog open={stationDeleteDialog.open} onClose={() => setStationDeleteDialog({ open: false, stationId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Supprimer une station</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action est irréversible. Impossible de supprimer une station avec des sessions actives.
          </Alert>
          <TextField
            fullWidth
            label="ID Station"
            value={stationDeleteDialog.stationId}
            onChange={(e) => setStationDeleteDialog({ ...stationDeleteDialog, stationId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Entrez l'ID de la station à supprimer"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStationDeleteDialog({ open: false, stationId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteStation}
            disabled={loading}
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pompiste Ban Dialog */}
      <Dialog open={pompisteBanDialog.open} onClose={() => setPompisteBanDialog({ open: false, pompisteId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Bannir un pompiste</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID Pompiste"
            value={pompisteBanDialog.pompisteId}
            onChange={(e) => setPompisteBanDialog({ ...pompisteBanDialog, pompisteId: e.target.value })}
            sx={{ mt: 2 }}
            helperText="Entrez l'ID du pompiste à bannir"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPompisteBanDialog({ open: false, pompisteId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBanPompiste}
            disabled={loading}
          >
            {loading ? 'Bannissement...' : 'Bannir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pompiste Reassign Dialog */}
      <Dialog open={pompisteReassignDialog.open} onClose={() => setPompisteReassignDialog({ open: false, pompisteId: '', newStationId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Réassigner un pompiste</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="ID Pompiste"
              value={pompisteReassignDialog.pompisteId}
              onChange={(e) => setPompisteReassignDialog({ ...pompisteReassignDialog, pompisteId: e.target.value })}
              helperText="Entrez l'ID du pompiste à réassigner"
            />
            <TextField
              fullWidth
              label="ID Nouvelle Station"
              value={pompisteReassignDialog.newStationId}
              onChange={(e) => setPompisteReassignDialog({ ...pompisteReassignDialog, newStationId: e.target.value })}
              helperText="Entrez l'ID de la nouvelle station"
            />
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>
            Impossible de réassigner un pompiste avec des sessions actives.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPompisteReassignDialog({ open: false, pompisteId: '', newStationId: '' })}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleReassignPompiste}
            disabled={loading}
          >
            {loading ? 'Réassignation...' : 'Réassigner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Correct Reservoir Dialog */}
      <Dialog open={sessionReservoirDialog.open} onClose={() => setSessionReservoirDialog({ open: false, sessionId: '', correctedCapacity: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Corriger un réservoir</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="ID Session"
              value={sessionReservoirDialog.sessionId}
              onChange={(e) => setSessionReservoirDialog({ ...sessionReservoirDialog, sessionId: e.target.value })}
              helperText="Entrez l'ID de la session"
            />
            <TextField
              fullWidth
              type="number"
              label="Capacité corrigée"
              value={sessionReservoirDialog.correctedCapacity}
              onChange={(e) => setSessionReservoirDialog({ ...sessionReservoirDialog, correctedCapacity: e.target.value })}
              helperText="Entrez la capacité corrigée en litres"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionReservoirDialog({ open: false, sessionId: '', correctedCapacity: '' })}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCorrectReservoir}
            disabled={loading}
          >
            {loading ? 'Correction...' : 'Corriger'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Correct Served Dialog */}
      <Dialog open={sessionServedDialog.open} onClose={() => setSessionServedDialog({ open: false, sessionId: '', correctedCapacity: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Corriger une capacité servie</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action corrige une capacité servie en cas de fraude.
          </Alert>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="ID Session"
              value={sessionServedDialog.sessionId}
              onChange={(e) => setSessionServedDialog({ ...sessionServedDialog, sessionId: e.target.value })}
              helperText="Entrez l'ID de la session"
            />
            <TextField
              fullWidth
              type="number"
              label="Capacité servie corrigée"
              value={sessionServedDialog.correctedCapacity}
              onChange={(e) => setSessionServedDialog({ ...sessionServedDialog, correctedCapacity: e.target.value })}
              helperText="Entrez la capacité servie corrigée en litres"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionServedDialog({ open: false, sessionId: '', correctedCapacity: '' })}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCorrectServed}
            disabled={loading}
          >
            {loading ? 'Correction...' : 'Corriger'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

