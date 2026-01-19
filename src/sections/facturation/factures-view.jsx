import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Button,
  Dialog,
  Select,
  Autocomplete,
  Divider,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Container,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';
import { useAdminStore } from 'src/store/useAdminStore';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const FACTURE_STATUS_COLORS = {
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'error',
};

const STATUS_TEXT = {
  pending: 'En attente',
  partial: 'Partiel',
  paid: 'Payé',
  overdue: 'En retard',
};

export default function FacturesView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const clientIdFromUrl = searchParams.get('clientId');
  const { contextHolder, showApiResponse, showError, showSuccess } = useNotification();
  const { admin } = useAdminStore();

  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState(clientIdFromUrl || '');
  const [typeFilter, setTypeFilter] = useState('facture'); // 'facture' ou 'proforma'

  // Dialogs
  const [createDialog, setCreateDialog] = useState({
    open: false,
    loading: false,
    formData: {
      clientId: '',
      sessionId: '',
      montantTotal: '',
      dateEcheance: '',
      clientAddress: '',
      items: [{ description: '', quantity: 1, unitPrice: '' }],
    },
  });

  const loadFactures = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      // Si un client est sélectionné, charger ses factures
      if (clientFilter) {
        result = await ConsumApi.getClientFactures(clientFilter);
      } else {
        result = await ConsumApi.getFactures();
      }

      if (result.success) {
        let facturesData = Array.isArray(result.data) ? result.data : [];
        
        // Filtrer par type (facture ou proforma)
        if (typeFilter === 'facture') {
          facturesData = facturesData.filter((f) => 
            f.type !== 'proforma' && 
            (!f.numeroFacture || !f.numeroFacture.startsWith('PRO-'))
          );
        } else if (typeFilter === 'proforma') {
          facturesData = facturesData.filter((f) => 
            f.type === 'proforma' || 
            (f.numeroFacture && f.numeroFacture.startsWith('PRO-'))
          );
        }
        
        // Filtrer par statut si nécessaire
        if (statusFilter) {
          facturesData = facturesData.filter((f) => f.status === statusFilter);
        }
        
        setFactures(facturesData);
      } else {
        setFactures([]);
      }
    } catch (error) {
      console.error('Error loading factures:', error);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, clientFilter, typeFilter]);

  const loadClients = useCallback(async () => {
    try {
      const result = await ConsumApi.getClients();
      if (result.success) {
        setClients(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, []);

  useEffect(() => {
    loadFactures();
    loadClients();
  }, [loadFactures, loadClients]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openCreateDialog = () => {
    setCreateDialog({
      open: true,
      loading: false,
      formData: {
        clientId: '',
        sessionId: '',
        montantTotal: '',
        dateFacture: '',
        dateEcheance: '',
        clientAddress: '',
        items: [{ description: '', quantity: 1, unitPrice: '' }],
      },
    });
  };

  const closeCreateDialog = () => {
    setCreateDialog({
      open: false,
      loading: false,
      formData: {
        clientId: '',
        sessionId: '',
        montantTotal: '',
        dateFacture: '',
        dateEcheance: '',
        clientAddress: '',
        items: [{ description: '', quantity: 1, unitPrice: '' }],
      },
    });
  };

  const handleCreateFacture = async () => {
    if (!createDialog.formData.clientId || !createDialog.formData.montantTotal) {
      showError('Erreur', 'Le client et le montant total sont obligatoires');
      return;
    }

    setCreateDialog({ ...createDialog, loading: true });
  
    try {
      // Formater la date au format ISO avec timezone si elle est fournie
      const formatDateToISO = (dateString) => {
        if (!dateString) return undefined;
        // Si la date est déjà au format ISO, la retourner telle quelle
        if (dateString.includes('T')) return dateString;
        // Sinon, convertir YYYY-MM-DD en ISO avec timezone
        return `${dateString}T00:00:00Z`;
      };

      const formData = {
        type: 'facture',
        clientId: createDialog.formData.clientId,
        montantTotal: parseFloat(createDialog.formData.montantTotal),
        dateFacture: formatDateToISO(createDialog.formData.dateFacture),
        dateEcheance: formatDateToISO(createDialog.formData.dateEcheance),
        sessionId: createDialog.formData.sessionId || undefined,
        clientAddress: createDialog.formData.clientAddress || undefined,
        items: createDialog.formData.items.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice),
        })),
      };

      const result = await ConsumApi.createFacture(formData);
      const processed = showApiResponse(result, {
        successTitle: 'Facture créée',
        errorTitle: 'Erreur de création',
      });

      if (processed.success) {
        showSuccess('Succès', 'Facture créée avec succès');
        closeCreateDialog();
        loadFactures();
      } else {
        // En cas d'échec, on garde le modal ouvert mais on arrête le loading
        setCreateDialog({ ...createDialog, loading: false });
      }
    } catch (error) {
      console.error('Error creating facture:', error);
      showError('Erreur', 'Impossible de créer la facture');
      setCreateDialog({ ...createDialog, loading: false });
    }
  };

  const addItem = () => {
    setCreateDialog({
      ...createDialog,
      formData: {
        ...createDialog.formData,
        items: [...createDialog.formData.items, { description: '', quantity: 1, unitPrice: '' }],
      },
    });
  };

  const removeItem = (index) => {
    const newItems = createDialog.formData.items.filter((_, i) => i !== index);
    setCreateDialog({
      ...createDialog,
      formData: {
        ...createDialog.formData,
        items: newItems,
      },
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...createDialog.formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCreateDialog({
      ...createDialog,
      formData: {
        ...createDialog.formData,
        items: newItems,
      },
    });
  };

  const getTotalAmount = () => factures.reduce((sum, f) => sum + (f.montantTotal || 0), 0);

  const getPaidAmount = () => factures.reduce((sum, f) => sum + (f.montantPaye || 0), 0);

  const getRemainingAmount = () => factures.reduce((sum, f) => sum + (f.montantRestant || 0), 0);

  const [convertingId, setConvertingId] = useState(null);
  const [convertDialog, setConvertDialog] = useState({
    open: false,
    factureId: null,
    facture: null,
    loading: false,
  });

  const openConvertDialog = (factureId, facture) => {
    setConvertDialog({
      open: true,
      factureId,
      facture,
      loading: false,
    });
  };

  const closeConvertDialog = () => {
    setConvertDialog({
      open: false,
      factureId: null,
      facture: null,
      loading: false,
    });
  };

  const handleConvertProformaToFacture = async () => {
    if (!convertDialog.factureId) {
      return;
    }

    setConvertDialog({ ...convertDialog, loading: true });
    try {
      const result = await ConsumApi.convertProformaToFacture(convertDialog.factureId);
      const processed = showApiResponse(result, {
        successTitle: 'Facture convertie',
        errorTitle: 'Erreur de conversion',
      });

      if (processed && processed.success) {
        showSuccess('Succès', 'Facture proforma convertie en facture définitive avec succès');
        closeConvertDialog();
        loadFactures();
      } else {
        setConvertDialog({ ...convertDialog, loading: false });
      }
    } catch (error) {
      console.error('Error converting proforma to facture:', error);
      showError('Erreur', 'Impossible de convertir la facture proforma');
      setConvertDialog({ ...convertDialog, loading: false });
    }
  };

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = () => {
    if (!admin) return false;
    const role = (admin.role || '').trim().toUpperCase();
    const service = (admin.service || '').trim().toLowerCase();
    return (
      role === 'ADMIN' ||
      role === 'SUPERADMIN' ||
      service.includes('admin') ||
      role.startsWith('ADMIN')
    );
  };

  return (
    <>
      {contextHolder}
      <Helmet>
        <title> Factures | Annour Travel </title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Factures</Typography>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreateDialog}
          >
            Nouvelle Facture
          </Button>
        </Stack>

        {/* Statistiques - Affichées uniquement pour les administrateurs */}
        {isAdmin() && (
          <Stack direction="row" spacing={2} mb={3}>
            <Card sx={{ p: 2, minWidth: 150 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Facturé
              </Typography>
              <Typography variant="h4">{fNumber(getTotalAmount())} FCFA</Typography>
            </Card>
            <Card sx={{ p: 2, minWidth: 150 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Payé
              </Typography>
              <Typography variant="h4" color="success.main">
                {fNumber(getPaidAmount())} FCFA
              </Typography>
            </Card>
            <Card sx={{ p: 2, minWidth: 150 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Restant
              </Typography>
              <Typography variant="h4" color="warning.main">
                {fNumber(getRemainingAmount())} FCFA
              </Typography>
            </Card>
            <Card sx={{ p: 2, minWidth: 150 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Factures
              </Typography>
              <Typography variant="h4">{factures.length}</Typography>
            </Card>
          </Stack>
        )}

        {/* Filtres */}
        <Card sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} p={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="facture">Factures</MenuItem>
                <MenuItem value="proforma">Factures Proforma</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Client</InputLabel>
              <Select
                value={clientFilter}
                label="Client"
                onChange={(e) => {
                  setClientFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Tous les clients</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.nom} - {client.numero}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="partial">Partiel</MenuItem>
                <MenuItem value="paid">Payé</MenuItem>
                <MenuItem value="overdue">En retard</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {/* Table */}
        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Numéro</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Montant Total</TableCell>
                    <TableCell>Montant Payé</TableCell>
                    <TableCell>Restant</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date Facture</TableCell>
                    <TableCell>Date Échéance</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Chargement...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && factures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Aucune facture trouvée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && factures.length > 0 && factures
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((facture) => (
                        <TableRow key={facture.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {facture.numeroFacture}
                              {(facture.type === 'proforma' || (facture.numeroFacture && facture.numeroFacture.startsWith('PRO-'))) && (
                                <Chip 
                                  label="Proforma" 
                                  size="small" 
                                  color="warning" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{facture.clientName || facture.client?.nom || '-'}</Typography>
                            {facture.client?.email && (
                              <Typography variant="caption" color="text.secondary">
                                {facture.client.email}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{fNumber(facture.montantTotal || 0)} FCFA</TableCell>
                          <TableCell>{fNumber(facture.montantPaye || 0)} FCFA</TableCell>
                          <TableCell>{fNumber(facture.montantRestant || 0)} FCFA</TableCell>
                          <TableCell>
                            <Chip
                              label={STATUS_TEXT[facture.status] || facture.status || 'En attente'}
                              color={FACTURE_STATUS_COLORS[facture.status] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{facture.dateFacture ? fDate(facture.dateFacture) : '-'}</TableCell>
                          <TableCell>{facture.dateEcheance ? fDate(facture.dateEcheance) : '-'}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton
                                onClick={() => {
                                  router.push(`/facturation/factures/${facture.id}`);
                                }}
                                title="Voir les détails"
                              >
                                <Iconify icon="solar:eye-bold" />
                              </IconButton>
                              {typeFilter === 'proforma' && (
                                <IconButton
                                  onClick={() => openConvertDialog(facture.id, facture)}
                                  disabled={convertingId === facture.id}
                                  color="success"
                                  title="Convertir en facture définitive"
                                >
                                  <Iconify icon="solar:check-circle-bold" />
                                </IconButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            page={page}
            component="div"
            count={factures.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* Dialog de création */}
        <Dialog open={createDialog.open} onClose={closeCreateDialog} maxWidth="md" fullWidth>
          <DialogTitle>Nouvelle Facture</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Autocomplete
                fullWidth
                options={clients}
                getOptionLabel={(option) => `${option.nom || ''} - ${option.numero || ''}`.trim() || option.id}
                value={clients.find((c) => c.id === createDialog.formData.clientId) || null}
                onChange={(event, newValue) => {
                  setCreateDialog({
                    ...createDialog,
                    formData: {
                      ...createDialog.formData,
                      clientId: newValue ? newValue.id : '',
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Client *"
                    placeholder="Rechercher par nom ou numéro..."
                  />
                )}
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) => {
                    const searchText = params.inputValue.toLowerCase();
                    const nom = (option.nom || '').toLowerCase();
                    const numero = (option.numero || '').toLowerCase();
                    return nom.includes(searchText) || numero.includes(searchText);
                  });
                  return filtered;
                }}
              />
              <TextField
                label="Session ID (optionnel)"
                fullWidth
                value={createDialog.formData.sessionId}
                onChange={(e) =>
                  setCreateDialog({
                    ...createDialog,
                    formData: { ...createDialog.formData, sessionId: e.target.value },
                  })
                }
              />
              <TextField
                label="Montant Total *"
                fullWidth
                type="number"
                value={createDialog.formData.montantTotal}
                onChange={(e) =>
                  setCreateDialog({
                    ...createDialog,
                    formData: { ...createDialog.formData, montantTotal: e.target.value },
                  })
                }
              />
              <TextField
                label="Date Facture"
                fullWidth
                type="date"
                value={createDialog.formData.dateFacture}
                onChange={(e) =>
                  setCreateDialog({
                    ...createDialog,
                    formData: { ...createDialog.formData, dateFacture: e.target.value },
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date d'échéance"
                fullWidth
                type="date"
                value={createDialog.formData.dateEcheance}
                onChange={(e) =>
                  setCreateDialog({
                    ...createDialog,
                    formData: { ...createDialog.formData, dateEcheance: e.target.value },
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Adresse du client"
                fullWidth
                multiline
                rows={2}
                value={createDialog.formData.clientAddress}
                onChange={(e) =>
                  setCreateDialog({
                    ...createDialog,
                    formData: { ...createDialog.formData, clientAddress: e.target.value },
                  })
                }
              />
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Articles</Typography>
                  <Button size="small" onClick={addItem} startIcon={<Iconify icon="mingcute:add-line" />}>
                    Ajouter
                  </Button>
                </Stack>
                {createDialog.formData.items.map((item, index) => (
                  <Stack key={index} direction="row" spacing={2} mb={2}>
                    <TextField
                      label="Description"
                      fullWidth
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                    <TextField
                      label="Quantité"
                      type="number"
                      sx={{ width: 120 }}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                    <TextField
                      label="Prix unitaire"
                      type="number"
                      sx={{ width: 150 }}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    />
                    {createDialog.formData.items.length > 1 && (
                      <IconButton onClick={() => removeItem(index)} color="error">
                        <Iconify icon="mingcute:delete-line" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCreateDialog}>Annuler</Button>
            <LoadingButton variant="contained" onClick={handleCreateFacture} loading={createDialog.loading}>
              Créer
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmation de conversion */}
        <Dialog open={convertDialog.open} onClose={closeConvertDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:check-circle-bold" width={24} color="success.main" />
              <Box>
                <Typography variant="h6">Convertir en facture définitive</Typography>
                <Typography variant="caption" color="text.secondary">
                  Confirmer la conversion de la facture proforma
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                Êtes-vous sûr de vouloir convertir cette facture proforma en facture définitive ?
              </Typography>
              {convertDialog.facture && (
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Numéro:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {convertDialog.facture.numeroFacture || '-'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Client:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {convertDialog.facture.clientName || convertDialog.facture.client?.nom || '-'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Montant:</Typography>
                      <Typography variant="body2" fontWeight="medium" color="primary.main">
                        {fNumber(convertDialog.facture.montantTotal || 0)} FCFA
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              )}
              <Typography variant="caption" color="text.secondary">
                Une fois convertie, la facture apparaîtra dans la liste des factures définitive et permettra l&apos;enregistrement de paiements.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConvertDialog} disabled={convertDialog.loading}>
              Annuler
            </Button>
            <LoadingButton
              variant="contained"
              color="success"
              onClick={handleConvertProformaToFacture}
              loading={convertDialog.loading}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              Confirmer la conversion
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

