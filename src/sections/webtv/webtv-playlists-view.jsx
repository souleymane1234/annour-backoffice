import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    Box,
    Card,
    Chip,
    Grid,
    Table,
    Stack,
    Button,
    Dialog,
    Select,
    TableRow,
    MenuItem,
    Container,
    TableBody,
    TableCell,
    TableHead,
    TextField,
    Typography,
    IconButton,
    InputLabel,
    DialogTitle,
    FormControl,
    DialogContent,
    DialogActions,
    TableContainer,
    InputAdornment,
    TablePagination,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useNotification } from 'src/hooks/useNotification';

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function WebTVPlaylistsView() {
  const router = useRouter();
  const { contextHolder, showApiResponse } = useNotification();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    userId: '',
    premiumRequired: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, playlist: null });

  useEffect(() => {
    fetchPlaylists();
  }, [page, rowsPerPage, filters]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const result = await ConsumApi.getWebTVPlaylists(params);
      const processedResult = showApiResponse(result, { showNotification: false });

      if (processedResult.success) {
        const apiData = processedResult.data;
        setPlaylists(apiData.data || []);
        setTotal(apiData.total || 0);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement des playlists' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const result = await ConsumApi.deleteWebTVPlaylist(deleteDialog.playlist.id);
      const processedResult = showApiResponse(result, { 
        successTitle: 'Suppression réussie',
        errorTitle: 'Erreur de suppression'
      });
      
      if (processedResult.success) {
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la suppression' });
    } finally {
      setDeleteDialog({ open: false, playlist: null });
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            Chargement...
          </TableCell>
        </TableRow>
      );
    }

    if (playlists.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            Aucune playlist trouvée
          </TableCell>
        </TableRow>
      );
    }

    return playlists.map((playlist) => (
      <TableRow key={playlist.id} hover>
        <TableCell>
          <Typography variant="subtitle2">
            {playlist.title}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {playlist.author?.email || 'Utilisateur inconnu'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={playlist.premiumRequired ? 'Oui' : 'Non'}
            color={playlist.premiumRequired ? 'warning' : 'default'}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={fNumber(playlist.videosCount || 0)}
            color="primary"
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {fDate(playlist.createdAt)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              onClick={() => router.push(routesName.adminWebTVPlaylistDetails.replace(':id', playlist.id))}
            >
              <Iconify icon="eva:eye-fill" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => router.push(routesName.adminWebTVPlaylistEdit.replace(':id', playlist.id))}
            >
              <Iconify icon="eva:edit-fill" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDialog({ open: true, playlist })}
            >
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Helmet>
        <title>WebTV - Playlists</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Playlists WebTV</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(routesName.adminWebTVPlaylistCreate)}
          >
            Nouvelle Playlist
          </Button>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher une playlist..."
                  value={filters.search}
                  onChange={handleFilterChange('search')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Premium</InputLabel>
                  <Select
                    value={filters.premiumRequired}
                    onChange={handleFilterChange('premiumRequired')}
                    label="Premium"
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    <MenuItem value="true">Premium requis</MenuItem>
                    <MenuItem value="false">Gratuit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Auteur</TableCell>
                  <TableCell>Premium</TableCell>
                  <TableCell>Nombre de Vidéos</TableCell>
                  <TableCell>Date de Création</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderTableBody()}
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
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, playlist: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer la playlist &quot;{deleteDialog.playlist?.title}&quot; ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, playlist: null })}>Annuler</Button>
            <Button onClick={handleDeletePlaylist} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
