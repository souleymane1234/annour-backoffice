import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useRouter } from 'src/routes/hooks';

import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Dialog,
  Divider,
  Tooltip,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableHead,
  Table,
  Grid,
  Alert,
  CircularProgress,
  TableContainer,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { RouterLink } from 'src/routes/components';
import { useNotification } from 'src/hooks/useNotification';

import ConsumApi from 'src/services_workers/consum_api';
import { fNumber } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const STATUS_COLORS = {
  OPEN: 'success',
  PENDING: 'warning',
  CLOSED: 'default',
  FORCE_CLOSED: 'error',
};

const FILE_STATUS_COLORS = {
  WAITING: 'default',
  IN_SERVICE: 'info',
  SERVED: 'success',
  REFUSED: 'warning',
  EXPIRED: 'error',
};

export default function StationDetailsView() {
  const { id: stationId } = useParams();
  const router = useRouter();
  const { contextHolder, showApiResponse, showError, showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState(null);
  const [history, setHistory] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pompistes, setPompistes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  const [activeFiles, setActiveFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [performance, setPerformance] = useState([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [createPompisteDialog, setCreatePompisteDialog] = useState({ open: false, loading: false });
  const [pompisteForm, setPompisteForm] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const loadStationDetails = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getStationById(stationId);
      const processed = showApiResponse(result, {
        successTitle: 'Détails chargés',
        errorTitle: 'Erreur de chargement',
      });
      if (processed.success && processed.data) {
        setStation(processed.data.station || null);
        setHistory(processed.data.history || null);
        setSessions(Array.isArray(processed.data.sessions) ? processed.data.sessions : []);
        setPompistes(Array.isArray(processed.data.pompistes) ? processed.data.pompistes : []);
        setLogs(Array.isArray(processed.data.logs) ? processed.data.logs : []);
      }
    } catch (error) {
      console.error('Error loading station details:', error);
      showError('Erreur', 'Impossible de charger les détails de la station');
    } finally {
      setLoading(false);
    }
  };

  const loadCapacity = async () => {
    setLoadingCapacity(true);
    try {
      const result = await ConsumApi.getStationCapacity(stationId);
      if (result.success) {
        setCapacity(result.data);
      }
    } catch (error) {
      console.error('Error loading capacity:', error);
    } finally {
      setLoadingCapacity(false);
    }
  };

  const loadActiveFiles = async () => {
    setLoadingFiles(true);
    try {
      const result = await ConsumApi.getStationFiles(stationId);
      if (result.success) {
        setActiveFiles(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error loading active files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadPerformance = async () => {
    setLoadingPerformance(true);
    try {
      const result = await ConsumApi.getStationPompistesPerformance(stationId);
      if (result.success) {
        setPerformance(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error loading performance:', error);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const handleCreatePompiste = async () => {
    if (!pompisteForm.email || !pompisteForm.phone || !pompisteForm.password || !pompisteForm.firstName || !pompisteForm.lastName) {
      showError('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (pompisteForm.password.length < 4) {
      showError('Erreur', 'Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    setCreatePompisteDialog({ open: true, loading: true });
    try {
      const result = await ConsumApi.createStationPompiste(stationId, pompisteForm);
      const processed = showApiResponse(result, {
        successTitle: 'Pompiste créé',
        errorTitle: 'Erreur de création',
      });
      if (processed.success) {
        showSuccess('Succès', 'Le pompiste a été créé avec succès');
        // Fermer la modal et réinitialiser le formulaire
        setCreatePompisteDialog({ open: false, loading: false });
        setPompisteForm({
          email: '',
          phone: '',
          password: '',
          firstName: '',
          lastName: '',
        });
        // Recharger les données
        loadPerformance();
        loadStationDetails();
      } else {
        // En cas d'erreur, garder la modal ouverte mais arrêter le chargement
        setCreatePompisteDialog({ open: true, loading: false });
      }
    } catch (error) {
      console.error('Error creating pompiste:', error);
      showError('Erreur', 'Impossible de créer le pompiste');
      setCreatePompisteDialog({ open: true, loading: false });
    }
  };

  useEffect(() => {
    if (stationId) {
      loadStationDetails();
      loadCapacity();
      loadActiveFiles();
      loadPerformance();
    }
  }, [stationId]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!station) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Station non trouvée</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title> Détails Station | CarbuGo </title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Button
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                  onClick={() => router.back()}
                  variant="outlined"
                  size="small"
                >
                  Retour
                </Button>
              </Box>
              <Typography variant="h4">{station.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Informations détaillées et historique de la station
              </Typography>
            </Box>
            <Chip
              label={station.isActive ? 'Active' : 'Inactive'}
              color={station.isActive ? 'success' : 'default'}
              size="large"
            />
          </Box>

          {/* Informations de base */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Informations Générales
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="subtitle2">{station.name}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Coordonnées
                    </Typography>
                    <Typography variant="subtitle2">
                      {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Capacité
                    </Typography>
                    <Typography variant="subtitle2">
                      {fNumber(station.capacityRemaining || 0)} / {fNumber(station.capacityTotal || 0)} L
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Volume par service
                    </Typography>
                    <Typography variant="subtitle2">{fNumber(station.volumePerService || 0)} L</Typography>
                  </Box>
                  {station.createdAt && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date de création
                        </Typography>
                        <Typography variant="subtitle2">
                          {new Date(station.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Statistiques
                </Typography>
                {history ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sessions totales
                      </Typography>
                      <Typography variant="h5">{history.totalSessions || 0}</Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Sessions actives
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            {history.activeSessions || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Sessions fermées
                          </Typography>
                          <Typography variant="h5">{history.closedSessions || 0}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Litres distribués
                      </Typography>
                      <Typography variant="h5">{fNumber(history.litersDistributed || 0)} L</Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Pompistes actifs
                      </Typography>
                      <Typography variant="h5">{history.activePompistes || 0}</Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Incidents
                      </Typography>
                      <Typography variant="h5" color={history.incidents > 0 ? 'error.main' : 'success.main'}>
                        {history.incidents || 0}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography color="text.secondary">Aucune statistique disponible</Typography>
                )}
              </Card>
            </Grid>
          </Grid>

          {/* Capacité */}
          {capacity && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Capacité Consommée
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Capacité totale
                    </Typography>
                    <Typography variant="h6">{fNumber(capacity.capacityTotal || 0)} L</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Capacité restante
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {fNumber(capacity.capacityRemaining || 0)} L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Capacité consommée
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {fNumber(capacity.capacityConsumed || 0)} L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Taux de consommation
                    </Typography>
                    <Typography variant="h6">{fNumber(capacity.consumptionRate || 0)}%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          )}

          {/* Files actives */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Files Actives</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="eva:refresh-outline" />}
                onClick={loadActiveFiles}
                disabled={loadingFiles}
              >
                Actualiser
              </Button>
            </Box>
            {loadingFiles ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : activeFiles.length === 0 ? (
              <Alert severity="info">Aucune file active</Alert>
            ) : (
              <Stack spacing={2}>
                {activeFiles.map((session) => (
                  <Accordion key={session.id}>
                    <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip
                          label={session.status}
                          color={STATUS_COLORS[session.status] || 'default'}
                          size="small"
                        />
                        <Typography variant="subtitle2">{session.fuelType}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                          Créée le {new Date(session.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Capacité: {fNumber(session.capacityRemaining || 0)} / {fNumber(session.capacityTotal || 0)} L
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Volume par service: {fNumber(session.volumePerService || 0)} L
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Rayon: {fNumber(session.radiusKm || 0)} km
                          </Typography>
                        </Box>
                        {session.fileActive && session.fileActive.length > 0 && (
                          <>
                            <Divider />
                            <Typography variant="subtitle2">Utilisateurs en file</Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Utilisateur</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Date</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {session.fileActive.map((file) => (
                                    <TableRow key={file.id}>
                                      <TableCell>
                                        {file.user?.firstName} {file.user?.lastName}
                                      </TableCell>
                                      <TableCell>{file.user?.email}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={file.status}
                                          color={FILE_STATUS_COLORS[file.status] || 'default'}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {new Date(file.createdAt).toLocaleDateString('fr-FR', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </Card>

          {/* Pompistes de la station */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pompistes de la Station</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => setCreatePompisteDialog({ open: true, loading: false })}
                >
                  Créer un Pompiste
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="eva:refresh-outline" />}
                  onClick={() => {
                    loadPerformance();
                    loadStationDetails();
                  }}
                  disabled={loadingPerformance || loading}
                >
                  Actualiser
                </Button>
              </Stack>
            </Box>
            
            {/* Liste des pompistes de base */}
            {pompistes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Liste des Pompistes ({pompistes.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Téléphone</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pompistes.map((pompiste) => (
                        <TableRow key={pompiste.id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {pompiste.firstName} {pompiste.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>{pompiste.email}</TableCell>
                          <TableCell>{pompiste.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Performance des pompistes */}
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Performance des Pompistes
              </Typography>
              {loadingPerformance ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : performance.length === 0 ? (
                <Alert severity="info">Aucune donnée de performance disponible</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Téléphone</TableCell>
                        <TableCell align="right">Sessions</TableCell>
                        <TableCell align="right">Logs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performance.map((pompiste) => (
                        <TableRow key={pompiste.pompisteId}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {pompiste.firstName} {pompiste.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>{pompiste.email}</TableCell>
                          <TableCell>{pompiste.phone}</TableCell>
                          <TableCell align="right">{pompiste.sessionsCount || 0}</TableCell>
                          <TableCell align="right">{pompiste.logsCount || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Card>

          {/* Sessions */}
          {sessions.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Historique des Sessions ({sessions.length})
              </Typography>
              <TableContainer>
                <Scrollbar>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID Session</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Capacité</TableCell>
                        <TableCell>Rayon</TableCell>
                        <TableCell>Créée le</TableCell>
                        <TableCell>Fermée le</TableCell>
                        <TableCell>Files</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {session.id.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>{session.fuelType}</TableCell>
                          <TableCell>
                            <Chip
                              label={session.status}
                              color={STATUS_COLORS[session.status] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {fNumber(session.capacityRemaining || 0)} / {fNumber(session.capacityTotal || 0)} L
                          </TableCell>
                          <TableCell>{fNumber(session.radiusKm || 0)} km</TableCell>
                          <TableCell>
                            {new Date(session.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            {session.closedAt
                              ? new Date(session.closedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip label={session.fileActive?.length || 0} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Logs d&apos;Activité ({logs.length})
              </Typography>
              <TableContainer>
                <Scrollbar>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Acteur</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Chip label={log.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.message}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {log.actorRole || '-'}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
          )}
        </Stack>
      </Container>

      {/* Dialog de création de pompiste */}
      <Dialog
        open={createPompisteDialog.open}
        onClose={() => setCreatePompisteDialog({ open: false, loading: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Créer un Pompiste</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={pompisteForm.email}
              onChange={(e) => setPompisteForm({ ...pompisteForm, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Téléphone"
              value={pompisteForm.phone}
              onChange={(e) => setPompisteForm({ ...pompisteForm, phone: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Prénom"
              value={pompisteForm.firstName}
              onChange={(e) => setPompisteForm({ ...pompisteForm, firstName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Nom"
              value={pompisteForm.lastName}
              onChange={(e) => setPompisteForm({ ...pompisteForm, lastName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={pompisteForm.password}
              onChange={(e) => setPompisteForm({ ...pompisteForm, password: e.target.value })}
              helperText="Minimum 4 caractères"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreatePompisteDialog({ open: false, loading: false });
              setPompisteForm({
                email: '',
                phone: '',
                password: '',
                firstName: '',
                lastName: '',
              });
            }}
          >
            Annuler
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleCreatePompiste}
            loading={createPompisteDialog.loading}
            disabled={
              !pompisteForm.email ||
              !pompisteForm.phone ||
              !pompisteForm.password ||
              !pompisteForm.firstName ||
              !pompisteForm.lastName ||
              pompisteForm.password.length < 4
            }
          >
            Créer
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

