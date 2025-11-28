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
  Avatar,
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

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'student', label: 'Étudiant', align: 'left' },
  { id: 'scholarship', label: 'Bourse', align: 'left' },
  { id: 'status', label: 'Statut', align: 'center' },
  { id: 'appliedAt', label: 'Date de candidature', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const STATUS_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
  { value: 'VALIDEE', label: 'Validée', color: 'success' },
  { value: 'REJETEE', label: 'Rejetée', color: 'error' },
];

// ----------------------------------------------------------------------

export default function ApplicationsView() {
  const navigate = useNavigate();
  const { showApiResponse, showWarning } = useNotification();

  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scholarshipFilter, setScholarshipFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [openPopover, setOpenPopover] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', application: null, reason: '', comment: '' });

  const handleOpenMenu = (event, application) => {
    setOpenPopover(event.currentTarget);
    setActionDialog({ ...actionDialog, application });
  };

  const handleCloseMenu = () => {
    setOpenPopover(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = applications.map((application) => application.id);
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

  const handleScholarshipFilter = (event) => {
    setScholarshipFilter(event.target.value);
    setPage(0);
  };

  const handleAction = (type) => {
    setActionDialog({ open: true, type, application: actionDialog.application, reason: '', comment: '' });
    handleCloseMenu();
  };

  const handleActionConfirm = async () => {
    const { type, application, reason, comment } = actionDialog;
    
    try {
      let result;
      switch (type) {
        case 'validate':
          result = await ConsumApi.validateApplication(application.id, reason, comment);
          break;
        case 'reject':
          result = await ConsumApi.rejectApplication(application.id, reason, comment);
          break;
        case 'pending':
          result = await ConsumApi.setApplicationPending(application.id, reason, comment);
          break;
        case 'delete':
          result = await ConsumApi.deleteApplication(application.id);
          break;
        default:
          return;
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        fetchApplications();
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de l\'action' 
      }, {
        errorTitle: 'Erreur'
      });
    }

    setActionDialog({ open: false, type: '', application: null, reason: '', comment: '' });
  };

  const handleBulkAction = async (type) => {
    if (selected.length === 0) {
      showWarning('Attention', 'Veuillez sélectionner au moins une candidature');
      return;
    }

    try {
      let result;
      switch (type) {
        case 'bulkValidate':
          result = await ConsumApi.bulkValidateApplications(selected, 'VALIDEE');
          break;
        case 'bulkReject':
          result = await ConsumApi.bulkRejectApplications(selected, 'REJETEE');
          break;
        default:
          return;
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        setSelected([]);
        fetchApplications();
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors des actions' 
      }, {
        errorTitle: 'Erreur'
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const result = await ConsumApi.getApplications({
        page: page + 1,
        limit: rowsPerPage,
        studentId: search,
        scholarshipId: scholarshipFilter,
        status: statusFilter,
      });

      showApiResponse(result, {
        successTitle: 'Chargement réussi',
        errorTitle: 'Erreur de chargement'
      });
      
      if (result.success) {
        setApplications(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement des candidatures' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, rowsPerPage, search, statusFilter, scholarshipFilter]);

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR');

  return (
    <>
      <Helmet>
        <title>Candidatures</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Candidatures
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.primary">
                Candidatures
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
            {selected.length > 0 && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                  onClick={() => handleBulkAction('bulkValidate')}
                >
                  Valider ({selected.length})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Iconify icon="eva:close-circle-fill" />}
                  onClick={() => handleBulkAction('bulkReject')}
                >
                  Rejeter ({selected.length})
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        <Card>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par étudiant..."
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="ID de la bourse"
                  value={scholarshipFilter}
                  onChange={handleScholarshipFilter}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                  onClick={fetchApplications}
                  fullWidth
                >
                  Actualiser
                </Button>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < applications.length}
                        checked={applications.length > 0 && selected.length === applications.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    {TABLE_HEAD.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        sortDirection={false}
                      >
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((application) => {
                    const { id, student, scholarship, status, appliedAt } = application;
                    const selectedRow = selected.indexOf(id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedRow}
                        onClick={() => navigate(`${routesName.adminApplicationDetails.replace(':id', id)}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRow}
                            onChange={(event) => handleClick(event, id)}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={student?.avatar} sx={{ width: 32, height: 32 }}>
                              {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {student?.firstName} {student?.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {student?.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body2" noWrap>
                            {scholarship?.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {scholarship?.hostCountry}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(status)}
                            color={getStatusColor(status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{formatDate(appliedAt)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="large"
                            color="inherit"
                            onClick={(event) => handleOpenMenu(event, application)}
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
          PaperProps={{
            sx: { width: 200 },
          }}
        >
          <MenuItem onClick={() => navigate(`${routesName.adminApplicationDetails.replace(':id', actionDialog.application?.id)}`)}>
            <Iconify icon="eva:eye-fill" sx={{ mr: 2 }} />
            Voir
          </MenuItem>
          <MenuItem onClick={() => handleAction('validate')}>
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
            Valider
          </MenuItem>
          <MenuItem onClick={() => handleAction('reject')}>
            <Iconify icon="eva:close-circle-fill" sx={{ mr: 2 }} />
            Rejeter
          </MenuItem>
          <MenuItem onClick={() => handleAction('pending')}>
            <Iconify icon="eva:clock-outline" sx={{ mr: 2 }} />
            Remettre en attente
          </MenuItem>
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
            Supprimer
          </MenuItem>
        </Popover>

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', application: null, reason: '', comment: '' })} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setActionDialog({ open: false, type: '', application: null, reason: '', comment: '' })}>
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
