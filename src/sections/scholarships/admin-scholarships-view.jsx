import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Chip,
  Grid, Table,
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
  TablePagination
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Titre', align: 'left' },
  { id: 'hostCountry', label: 'Pays d\'accueil', align: 'left' },
  { id: 'status', label: 'Statut', align: 'center' },
  { id: 'dateLimite', label: 'Date limite', align: 'center' },
  { id: 'createdAt', label: 'Créé le', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const STATUS_OPTIONS = [
  { value: 'OUVERTE', label: 'Ouverte', color: 'success' },
  { value: 'FERMEE', label: 'Fermée', color: 'error' },
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
];

// ----------------------------------------------------------------------

export default function AdminScholarshipsView() {
  const navigate = useNavigate();
  const { showApiResponse } = useNotification();

  const [scholarships, setScholarships] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hostCountryFilter, setHostCountryFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [openPopover, setOpenPopover] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', scholarship: null });

  const handleOpenMenu = (event, scholarship) => {
    setOpenPopover(event.currentTarget);
    setActionDialog({ ...actionDialog, scholarship });
  };

  const handleCloseMenu = () => {
    setOpenPopover(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = scholarships.map((scholarship) => scholarship.id);
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

  const handleHostCountryFilter = (event) => {
    setHostCountryFilter(event.target.value);
    setPage(0);
  };

  const handleAction = (type) => {
    setActionDialog({ open: true, type, scholarship: actionDialog.scholarship });
    handleCloseMenu();
  };

  const handleActionConfirm = async () => {
    const { type, scholarship } = actionDialog;
    
    try {
      let result;
      switch (type) {
        case 'close':
          result = await ConsumApi.closeScholarship(scholarship.id, 'Fermeture administrative');
          break;
        case 'open':
          result = await ConsumApi.openScholarship(scholarship.id, 'Ouverture administrative');
          break;
        case 'delete':
          result = await ConsumApi.deleteScholarship(scholarship.id);
          break;
        default:
          return;
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        fetchScholarships();
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de l\'action' 
      }, {
        errorTitle: 'Erreur'
      });
    }

    setActionDialog({ open: false, type: '', scholarship: null });
  };

  const fetchScholarships = async () => {
    try {
      const result = await ConsumApi.getScholarships({
        page: page + 1,
        limit: rowsPerPage,
        search,
        status: statusFilter,
        hostCountry: hostCountryFilter,
      });

      showApiResponse(result, {
        successTitle: 'Chargement réussi',
        errorTitle: 'Erreur de chargement'
      });
      
      if (result.success) {
        setScholarships(result.data.data || []);
        setTotal(result.data.total || 0);
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement des bourses' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [page, rowsPerPage, search, statusFilter, hostCountryFilter]);

  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR');

  const getActionText = (type) => {
    if (type === 'delete') return 'supprimer';
    if (type === 'close') return 'fermer';
    return 'ouvrir';
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Bourses et Études</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Gestion des Bourses et Études
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.primary">
                Bourses et Études
              </Typography>
            </Breadcrumbs>
          </div>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate(routesName.adminScholarshipCreate)}
          >
            Nouvelle Bourse
          </Button>
        </Stack>

        <Card>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par titre ou description..."
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
                  placeholder="Pays d'accueil"
                  value={hostCountryFilter}
                  onChange={handleHostCountryFilter}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                  onClick={fetchScholarships}
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
                        indeterminate={selected.length > 0 && selected.length < scholarships.length}
                        checked={scholarships.length > 0 && selected.length === scholarships.length}
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
                  {scholarships.map((scholarship) => {
                    const { id, title, hostCountry, status, dateLimite, createdAt } = scholarship;
                    const selectedRow = selected.indexOf(id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedRow}
                        onClick={() => navigate(`${routesName.adminScholarshipDetails.replace(':id', id)}`)}
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
                            <Typography variant="subtitle2" noWrap>
                              {title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{hostCountry}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(status)}
                            color={getStatusColor(status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{formatDate(dateLimite)}</TableCell>
                        <TableCell align="center">{formatDate(createdAt)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="large"
                            color="inherit"
                            onClick={(event) => handleOpenMenu(event, scholarship)}
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
            sx: { width: 160 },
          }}
        >
          <MenuItem onClick={() => navigate(`${routesName.adminScholarshipDetails.replace(':id', actionDialog.scholarship?.id)}`)}>
            <Iconify icon="eva:eye-fill" sx={{ mr: 2 }} />
            Voir
          </MenuItem>
          <MenuItem onClick={() => navigate(`${routesName.adminScholarshipEdit.replace(':id', actionDialog.scholarship?.id)}`)}>
            <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={() => handleAction('close')}>
            <Iconify icon="eva:lock-fill" sx={{ mr: 2 }} />
            Fermer
          </MenuItem>
          <MenuItem onClick={() => handleAction('open')}>
            <Iconify icon="eva:unlock-fill" sx={{ mr: 2 }} />
            Ouvrir
          </MenuItem>
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
            Supprimer
          </MenuItem>
        </Popover>

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', scholarship: null })}>
          <DialogTitle>
            Confirmer l&apos;action
          </DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir {getActionText(actionDialog.type)} cette bourse ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: '', scholarship: null })}>
              Annuler
            </Button>
            <Button onClick={handleActionConfirm} variant="contained" color={actionDialog.type === 'delete' ? 'error' : 'primary'}>
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
