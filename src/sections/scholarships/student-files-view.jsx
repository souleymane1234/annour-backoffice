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
  { id: 'currentLevel', label: 'Niveau d\'études', align: 'left' },
  { id: 'status', label: 'Statut', align: 'center' },
  { id: 'hasCv', label: 'CV', align: 'center' },
  { id: 'createdAt', label: 'Créé le', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const STATUS_OPTIONS = [
  { value: 'BROUILLON', label: 'Brouillon', color: 'default' },
  { value: 'SOUMIS', label: 'Soumis', color: 'info' },
  { value: 'ACCEPTE', label: 'Accepté', color: 'success' },
  { value: 'REFUSE', label: 'Refusé', color: 'error' },
  { value: 'REJETE', label: 'Rejeté', color: 'error' },
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning' },
];

const LEVEL_OPTIONS = [
  'Licence 1', 'Licence 2', 'Licence 3',
  'Master 1', 'Master 2',
  'Doctorat', 'Autre'
];

// ----------------------------------------------------------------------

export default function StudentFilesView() {
  const navigate = useNavigate();
  const { showApiResponse } = useNotification();

  const [studentFiles, setStudentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [openPopover, setOpenPopover] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', file: null, reason: '', comment: '' });

  const handleOpenMenu = (event, file) => {
    setOpenPopover(event.currentTarget);
    setActionDialog({ ...actionDialog, file });
  };

  const handleCloseMenu = () => {
    setOpenPopover(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = studentFiles.map((file) => file.id);
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

  const handleLevelFilter = (event) => {
    setLevelFilter(event.target.value);
    setPage(0);
  };

  const handleAction = (type) => {
    setActionDialog({ open: true, type, file: actionDialog.file, reason: '', comment: '' });
    handleCloseMenu();
  };

  const handleActionConfirm = async () => {
    const { type, file, reason, comment } = actionDialog;
    
    try {
      let result;
      switch (type) {
        case 'validate':
          result = await ConsumApi.validateStudentFile(file.id, reason, comment);
          break;
        case 'reject':
          result = await ConsumApi.rejectStudentFile(file.id, reason, comment);
          break;
        case 'submit':
          result = await ConsumApi.submitStudentFile(file.id, reason, comment);
          break;
        case 'delete':
          result = await ConsumApi.deleteStudentFile(file.id);
          break;
        default:
          return;
      }

      showApiResponse(result, {
        successTitle: 'Succès',
        errorTitle: 'Erreur'
      });
      
      if (result.success) {
        fetchStudentFiles();
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors de l\'action' 
      }, {
        errorTitle: 'Erreur'
      });
    }

    setActionDialog({ open: false, type: '', file: null, reason: '', comment: '' });
  };

  const fetchStudentFiles = async () => {
    try {
      setLoading(true);
      const result = await ConsumApi.getStudentFiles({
        page: page + 1,
        limit: rowsPerPage,
        search,
        status: statusFilter,
        currentLevel: levelFilter,
      });
      
      if (result.success) {
        // La structure de réponse peut varier :
        // - result.data est directement un tableau (après traitement par apiClient)
        // - result.data.data est un tableau (si apiClient a retourné l'objet complet)
        // - result.data contient { data: [...], pagination: {...} }
        let files = [];
        let totalCount = 0;
        
        if (Array.isArray(result.data)) {
          // Si result.data est directement un tableau (cas le plus probable après apiClient)
          files = result.data;
          totalCount = result.data.length;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          // Si la structure est { data: [...], pagination: {...} }
          files = result.data.data;
          totalCount = result.data.pagination?.total || result.data.total || files.length;
        } else if (result.data?.studentFiles && Array.isArray(result.data.studentFiles)) {
          // Structure alternative
          files = result.data.studentFiles;
          totalCount = result.data.total || files.length;
        }
        
        setStudentFiles(files);
        setTotal(totalCount);
      } else {
        showApiResponse(result, {
          successTitle: 'Chargement réussi',
          errorTitle: 'Erreur de chargement'
        });
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement des dossiers' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentFiles();
  }, [page, rowsPerPage, search, statusFilter, levelFilter]);

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
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return '-';
    }
  };

  return (
    <>
      <Helmet>
        <title>Dossiers Étudiants</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Dossiers Étudiants
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bourses et Études
              </Typography>
              <Typography variant="body2" color="text.primary">
                Dossiers Étudiants
              </Typography>
            </Breadcrumbs>
          </div>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminScholarships)}
          >
            Retour
          </Button>
        </Stack>

        <Card>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par nom d'étudiant ou email..."
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
                <FormControl fullWidth>
                  <InputLabel>Niveau d&apos;études</InputLabel>
                  <Select
                    value={levelFilter}
                    onChange={handleLevelFilter}
                    label="Niveau d'études"
                  >
                    <MenuItem value="">Tous les niveaux</MenuItem>
                    {LEVEL_OPTIONS.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                  onClick={fetchStudentFiles}
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
                        indeterminate={selected.length > 0 && selected.length < studentFiles.length}
                        checked={studentFiles.length > 0 && selected.length === studentFiles.length}
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
                  {studentFiles.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Stack spacing={2} alignItems="center">
                          <Iconify icon="eva:file-remove-outline" width={64} sx={{ color: 'text.disabled' }} />
                          <Typography variant="h6" color="text.secondary">
                            Aucun dossier trouvé
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {search || statusFilter || levelFilter
                              ? 'Aucun dossier ne correspond à vos critères de recherche.'
                              : 'Aucun dossier étudiant n\'a été créé pour le moment.'}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentFiles.map((file) => {
                      const { id, student, currentLevel, status, cvUrl, createdAt } = file;
                      const selectedRow = selected.indexOf(id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={selectedRow}
                        onClick={() => navigate(`${routesName.adminStudentFileDetails.replace(':id', id)}`)}
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
                            <Avatar src={student?.studentProfile?.profileImage || student?.avatar} sx={{ width: 32, height: 32 }}>
                              {student?.studentProfile?.firstName?.charAt(0) || student?.firstName?.charAt(0)}
                              {student?.studentProfile?.lastName?.charAt(0) || student?.lastName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {student?.studentProfile?.firstName || student?.firstName || ''} {student?.studentProfile?.lastName || student?.lastName || ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {student?.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{currentLevel}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(status)}
                            color={getStatusColor(status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {cvUrl ? (
                            <Iconify icon="eva:checkmark-circle-2-fill" color="success.main" />
                          ) : (
                            <Iconify icon="eva:close-circle-fill" color="error.main" />
                          )}
                        </TableCell>
                        <TableCell align="center">{formatDate(file.createdAt || file.updatedAt || createdAt)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="large"
                            color="inherit"
                            onClick={(event) => handleOpenMenu(event, file)}
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
          PaperProps={{
            sx: { width: 200 },
          }}
        >
          <MenuItem onClick={() => navigate(`${routesName.adminStudentFileDetails.replace(':id', actionDialog.file?.id)}`)}>
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
          <MenuItem onClick={() => handleAction('submit')}>
            <Iconify icon="eva:upload-fill" sx={{ mr: 2 }} />
            Marquer comme soumis
          </MenuItem>
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
            Supprimer
          </MenuItem>
        </Popover>

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', file: null, reason: '', comment: '' })} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setActionDialog({ open: false, type: '', file: null, reason: '', comment: '' })}>
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
