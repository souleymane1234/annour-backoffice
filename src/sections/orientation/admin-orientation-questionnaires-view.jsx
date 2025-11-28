import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { RouterLink } from 'src/routes/components';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDeleteDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export default function AdminOrientationQuestionnairesView() {
  const navigate = useNavigate();
  const { contextHolder, showApiResponse, showError } = useNotification();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, questionnaire: null, loading: false });

  const loadQuestionnaires = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getOrientationQuestionnaires();

      if (result.success) {
        const data = result.data?.data || result.data || [];
        setQuestionnaires(data);
        setTotal(data.length);
      }
    } catch (error) {
      console.error('Error loading questionnaires:', error);
      showError('Erreur', 'Une erreur est survenue lors du chargement des questionnaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = questionnaires.map((q) => q.id);
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

  const handleDeleteClick = (questionnaire) => {
    setDeleteDialog({ open: true, questionnaire, loading: false });
  };

  const handleDeleteConfirm = async () => {
    const { questionnaire } = deleteDialog;
    setDeleteDialog({ ...deleteDialog, loading: true });
    
    try {
      const result = await ConsumApi.deleteOrientationQuestionnaire(questionnaire.id);
      showApiResponse(result, {
        successTitle: 'Questionnaire supprimé',
        errorTitle: 'Erreur de suppression',
      });

      if (result.success) {
        setDeleteDialog({ open: false, questionnaire: null, loading: false });
        loadQuestionnaires();
      } else {
        setDeleteDialog({ ...deleteDialog, loading: false });
      }
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      showError('Erreur', 'Une erreur est survenue lors de la suppression');
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  const isNotFound = !questionnaires.length && !loading;

  return (
    <>
      {contextHolder}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Gestion des Questionnaires d&apos;Orientation</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Gérez les questionnaires d&apos;orientation avec leurs blocs et questions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:chart-bold" />}
            component={RouterLink}
            href={routesName.adminOrientationStats}
          >
            Statistiques
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate(routesName.adminOrientationQuestionnaireCreate)}
          >
            Nouveau Questionnaire
          </Button>
        </Box>
      </Box>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < questionnaires.length}
                      checked={questionnaires.length > 0 && selected.length === questionnaires.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Titre</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Blocs</TableCell>
                  <TableCell>Questions</TableCell>
                  <TableCell>Sessions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(() => {
                  if (loading) {
                    return (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    );
                  }
                  if (isNotFound) {
                    return (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Aucun questionnaire trouvé
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <>
                      {questionnaires
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((questionnaire) => (
                      <TableRow
                        hover
                        key={questionnaire.id}
                        selected={selected.indexOf(questionnaire.id) !== -1}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.indexOf(questionnaire.id) !== -1}
                            onChange={(event) => handleClick(event, questionnaire.id)}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="subtitle2" noWrap>
                            {questionnaire.title}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                            {questionnaire.description || '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={questionnaire.active ? 'Actif' : 'Inactif'}
                            color={questionnaire.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {questionnaire.totalBlocks || 0}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {questionnaire.totalQuestions || 0}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {questionnaire.totalSessions || 0}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Voir les détails">
                            <IconButton
                              component={RouterLink}
                              href={`${routesName.adminOrientationQuestionnaireDetails.replace(':id', questionnaire.id)}`}
                            >
                              <Iconify icon="solar:eye-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton
                              component={RouterLink}
                              href={`${routesName.adminOrientationQuestionnaireEdit.replace(':id', questionnaire.id)}`}
                            >
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(questionnaire)}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                        ))}
                    </>
                  );
                })()}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, questionnaire: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        loading={deleteDialog.loading}
        title="Supprimer le questionnaire"
        message={`Êtes-vous sûr de vouloir supprimer le questionnaire "${deleteDialog.questionnaire?.title}" ? Cette action est irréversible.`}
      />
    </>
  );
}

