import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Stack,
  Paper,
  Button,
  Dialog,
  Select,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableHead,
  TableBody,
  TableCell,
  Container,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  Breadcrumbs,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  TableContainer,
  InputAdornment,
  TablePagination,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'student', label: 'Étudiant', align: 'left' },
  { id: 'sourceInstitution', label: 'Établissement source', align: 'left' },
  { id: 'targetInstitution', label: 'Établissement destination', align: 'left' },
  { id: 'status', label: 'Statut', align: 'center' },
  { id: 'createdAt', label: 'Créé le', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const STATUS_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
  { value: 'ACCEPTEE', label: 'Acceptée', color: 'success' },
  { value: 'REFUSEE', label: 'Refusée', color: 'error' },
];

// ----------------------------------------------------------------------

export default function AdminTransfersView() {
  const navigate = useNavigate();
  const { showApiResponse } = useNotification();

  const [transfers, setTransfers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceInstitutionFilter, setSourceInstitutionFilter] = useState('');
  const [targetInstitutionFilter, setTargetInstitutionFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [openPopover, setOpenPopover] = useState(null);
  const [actionDialog, setActionDialog] = useState({ 
    open: false, 
    type: '', 
    transfer: null,
    status: '',
    reason: '',
    comment: '',
  });

  const handleOpenMenu = (event, transfer) => {
    setOpenPopover(event.currentTarget);
    setActionDialog({ ...actionDialog, transfer });
  };

  const handleCloseMenu = () => {
    setOpenPopover(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = transfers.map((transfer) => transfer.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSourceInstitutionFilter = (event) => {
    setSourceInstitutionFilter(event.target.value);
    setPage(0);
  };

  const handleTargetInstitutionFilter = (event) => {
    setTargetInstitutionFilter(event.target.value);
    setPage(0);
  };

  const handleAction = (type) => {
    let status = '';
    if (type === 'accept') {
      status = 'ACCEPTEE';
    } else if (type === 'reject') {
      status = 'REFUSEE';
    }
    
    setActionDialog({ 
      open: true, 
      type, 
      transfer: actionDialog.transfer,
      status,
      reason: '',
      comment: '',
    });
    handleCloseMenu();
  };

  const handleActionConfirm = async () => {
    const { type, transfer, status, reason, comment } = actionDialog;
    
    try {
      let result;
      if (type === 'delete') {
        result = await ConsumApi.deleteTransfer(transfer.id);
      } else if (type === 'status') {
        result = await ConsumApi.updateTransferStatus(transfer.id, { status, reason });
      } else {
        result = await ConsumApi.performTransferAction(transfer.id, { status, reason, comment });
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        fetchTransfers();
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
      transfer: null,
      status: '',
      reason: '',
      comment: '',
    });
  };

  const fetchTransfers = async () => {
    try {
      const result = await ConsumApi.getTransfers({
        page: page + 1,
        limit: rowsPerPage,
        search,
        status: statusFilter,
        sourceInstitution: sourceInstitutionFilter,
        targetInstitution: targetInstitutionFilter,
      });

      if (result.success) {
        setTransfers(result.data.data || []);
        setTotal(result.data.total || 0);
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement des permutations' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [page, rowsPerPage, search, statusFilter, sourceInstitutionFilter, targetInstitutionFilter]);

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
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStudentName = (transfer) => {
    if (transfer.student) {
      return transfer.student.fullName || transfer.student.email || 'N/A';
    }
    return 'N/A';
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Permutations</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Gestion des Permutations
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.primary">
                Permutations
              </Typography>
            </Breadcrumbs>
          </div>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:chart-bold" />}
              component={RouterLink}
              href={routesName.adminTransferStats}
            >
              Statistiques
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:history-bold" />}
              component={RouterLink}
              href={routesName.adminTransferHistory}
            >
              Historique
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:refresh-fill" />}
              onClick={fetchTransfers}
            >
              Actualiser
            </Button>
          </Stack>
        </Stack>

        <Card>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par nom d'étudiant ou établissement..."
                  value={search}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    label="Statut"
                  >
                    <MenuItem value="">Tous les statuts</MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  placeholder="Établissement source"
                  value={sourceInstitutionFilter}
                  onChange={handleSourceInstitutionFilter}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  placeholder="Établissement destination"
                  value={targetInstitutionFilter}
                  onChange={handleTargetInstitutionFilter}
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < transfers.length}
                        checked={transfers.length > 0 && selected.length === transfers.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    {TABLE_HEAD.map((headCell) => (
                      <TableCell key={headCell.id} align={headCell.align}>
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune permutation trouvée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transfers.map((transfer) => {
                      const isSelected = selected.indexOf(transfer.id) !== -1;

                      return (
                        <TableRow
                          hover
                          key={transfer.id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isSelected}
                          onClick={(event) => navigate(routesName.adminTransferDetails.replace(':id', transfer.id))}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={(event) => handleClick(event, transfer.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {getStudentName(transfer)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transfer.sourceInstitution || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transfer.targetInstitution || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(transfer.status)}
                              color={getStatusColor(transfer.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {formatDate(transfer.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenMenu(e, transfer);
                              }}
                            >
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Card>

        <Popover
          open={Boolean(openPopover)}
          anchorEl={openPopover}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Stack sx={{ p: 1 }}>
            <Button
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={() => {
                navigate(routesName.adminTransferDetails.replace(':id', actionDialog.transfer?.id));
                handleCloseMenu();
              }}
            >
              Voir les détails
            </Button>
            {actionDialog.transfer?.status === 'EN_ATTENTE' && (
              <>
                <Button
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={() => handleAction('accept')}
                  color="success"
                >
                  Accepter
                </Button>
                <Button
                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                  onClick={() => handleAction('reject')}
                  color="error"
                >
                  Refuser
                </Button>
              </>
            )}
            <Button
              startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
              onClick={() => handleAction('delete')}
              color="error"
            >
              Supprimer
            </Button>
          </Stack>
        </Popover>

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

