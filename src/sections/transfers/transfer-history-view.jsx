import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Table,
  Paper,
  Button,
  TableRow,
  Container,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  Breadcrumbs,
  TableContainer,
  InputAdornment, TablePagination
} from '@mui/material';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'actionDate', label: 'Date', align: 'left' },
  { id: 'action', label: 'Action', align: 'left' },
  { id: 'transferId', label: 'ID Permutation', align: 'left' },
  { id: 'actorId', label: 'Acteur', align: 'left' },
];

// ----------------------------------------------------------------------

export default function TransferHistoryView() {
  const navigate = useNavigate();
  const { showApiResponse } = useNotification();

  const [historyEntries, setHistoryEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [transferIdFilter, setTransferIdFilter] = useState('');
  const [actorIdFilter, setActorIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const fetchHistory = async () => {
    try {
      const result = await ConsumApi.getTransferHistoryEntries({
        page: page + 1,
        limit: rowsPerPage,
        transferId: transferIdFilter || undefined,
        actorId: actorIdFilter || undefined,
        action: actionFilter || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
      });

      if (result.success) {
        setHistoryEntries(result.data.data || []);
        setTotal(result.data.total || 0);
      } else {
        showApiResponse(result, {
          errorTitle: 'Erreur de chargement'
        });
      }
    } catch (error) {
      showApiResponse({ 
        success: false, 
        message: 'Erreur lors du chargement de l\'historique' 
      }, {
        errorTitle: 'Erreur de chargement'
      });
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage, transferIdFilter, actorIdFilter, actionFilter, dateFromFilter, dateToFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
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

  return (
    <>
      <Helmet>
        <title>Historique des Permutations</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4" gutterBottom>
              Historique des Permutations
            </Typography>
            <Breadcrumbs>
              <Typography variant="body2" color="text.secondary">
                Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Permutations
              </Typography>
              <Typography variant="body2" color="text.primary">
                Historique
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
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:refresh-fill" />}
              onClick={fetchHistory}
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
                  placeholder="ID Permutation"
                  value={transferIdFilter}
                  onChange={(e) => setTransferIdFilter(e.target.value)}
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
                <TextField
                  fullWidth
                  placeholder="ID Acteur"
                  value={actorIdFilter}
                  onChange={(e) => setActorIdFilter(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  placeholder="Action"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de début"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de fin"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((headCell) => (
                      <TableCell key={headCell.id} align={headCell.align}>
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Aucune entrée d&apos;historique trouvée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyEntries.map((entry, index) => (
                      <TableRow
                        hover
                        key={index}
                        onClick={() => entry.transferId && navigate(routesName.adminTransferDetails.replace(':id', entry.transferId))}
                        sx={{ cursor: entry.transferId ? 'pointer' : 'default' }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(entry.actionDate || entry.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.action || '-'}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.transferId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.actorId || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
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
      </Container>
    </>
  );
}

