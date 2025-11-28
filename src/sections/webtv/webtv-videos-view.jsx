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

export default function WebTVVideosView() {
  const router = useRouter();
  const { contextHolder, showApiResponse } = useNotification();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    categoryId: '',
    sourceType: '',
    premiumRequired: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, video: null });
  const [moderateDialog, setModerateDialog] = useState({ open: false, video: null, status: '', reason: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [page, rowsPerPage, filters]);

  const fetchCategories = async () => {
    try {
      const result = await ConsumApi.getWebTVCategories({ limit: 100 });
      const processedResult = showApiResponse(result, { showNotification: false });
      if (processedResult.success) {
        const apiData = processedResult.data;
        setCategories(apiData.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement des catégories' });
    }
  };

  const fetchVideos = async () => {
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

      const result = await ConsumApi.getWebTVVideos(params);
      const processedResult = showApiResponse(result, { showNotification: false });

      if (processedResult.success) {
        const apiData = processedResult.data;
        setVideos(apiData.data || []);
        setTotal(apiData.total || 0);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      showApiResponse({ success: false, message: 'Erreur lors du chargement des vidéos' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      const result = await ConsumApi.deleteWebTVVideo(deleteDialog.video.id);
      const processedResult = showApiResponse(result, { 
        successTitle: 'Suppression réussie',
        errorTitle: 'Erreur de suppression'
      });
      
      if (processedResult.success) {
        fetchVideos();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la suppression' });
    } finally {
      setDeleteDialog({ open: false, video: null });
    }
  };

  const handleModerateVideo = async () => {
    try {
      const result = await ConsumApi.moderateWebTVVideo(moderateDialog.video.id, {
        status: moderateDialog.status,
        reason: moderateDialog.reason,
      });
      const processedResult = showApiResponse(result, { 
        successTitle: 'Modération réussie',
        errorTitle: 'Erreur de modération'
      });
      
      if (processedResult.success) {
        fetchVideos();
      }
    } catch (error) {
      console.error('Error moderating video:', error);
      showApiResponse({ success: false, message: 'Erreur lors de la modération' });
    } finally {
      setModerateDialog({ open: false, video: null, status: '', reason: '' });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_LIGNE':
        return 'success';
      case 'EN_ATTENTE':
        return 'warning';
      case 'HORS_LIGNE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSourceTypeColor = (sourceType) => {
    switch (sourceType) {
      case 'YOUTUBE':
        return 'error';
      case 'VIMEO':
        return 'info';
      case 'UPLOAD':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center">
            Chargement...
          </TableCell>
        </TableRow>
      );
    }

    if (videos.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center">
            Aucune vidéo trouvée
          </TableCell>
        </TableRow>
      );
    }

    return videos.map((video) => (
      <TableRow key={video.id} hover>
        <TableCell>
          <Typography variant="subtitle2" sx={{ maxWidth: 200 }}>
            {video.title}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {video.category?.name || 'Sans catégorie'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={video.status}
            color={getStatusColor(video.status)}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={video.sourceType}
            color={getSourceTypeColor(video.sourceType)}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={video.premiumRequired ? 'Oui' : 'Non'}
            color={video.premiumRequired ? 'warning' : 'default'}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {fNumber(video.views || 0)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {fDate(video.createdAt)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              onClick={() => router.push(routesName.adminWebTVVideoDetails.replace(':id', video.id))}
            >
              <Iconify icon="eva:eye-fill" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => router.push(routesName.adminWebTVVideoEdit.replace(':id', video.id))}
            >
              <Iconify icon="eva:edit-fill" />
            </IconButton>
            {video.status === 'EN_ATTENTE' && (
              <IconButton
                size="small"
                color="success"
                onClick={() => setModerateDialog({ open: true, video, status: 'EN_LIGNE', reason: '' })}
              >
                <Iconify icon="eva:checkmark-fill" />
              </IconButton>
            )}
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDialog({ open: true, video })}
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
        <title>WebTV - Vidéos</title>
      </Helmet>

      {contextHolder}

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Vidéos WebTV</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(routesName.adminWebTVVideoCreate)}
          >
            Nouvelle Vidéo
          </Button>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Rechercher une vidéo..."
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
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={handleFilterChange('status')}
                    label="Statut"
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="EN_LIGNE">En ligne</MenuItem>
                    <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                    <MenuItem value="HORS_LIGNE">Hors ligne</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={filters.categoryId}
                    onChange={handleFilterChange('categoryId')}
                    label="Catégorie"
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={filters.sourceType}
                    onChange={handleFilterChange('sourceType')}
                    label="Source"
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    <MenuItem value="YOUTUBE">YouTube</MenuItem>
                    <MenuItem value="VIMEO">Vimeo</MenuItem>
                    <MenuItem value="UPLOAD">Upload</MenuItem>
                    <MenuItem value="AUTRE">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
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
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Premium</TableCell>
                  <TableCell>Vues</TableCell>
                  <TableCell>Date</TableCell>
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
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, video: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer la vidéo &quot;{deleteDialog.video?.title}&quot; ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, video: null })}>Annuler</Button>
            <Button onClick={handleDeleteVideo} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Moderate Dialog */}
        <Dialog open={moderateDialog.open} onClose={() => setModerateDialog({ open: false, video: null, status: '', reason: '' })}>
          <DialogTitle>Modérer la vidéo</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography>
                Vidéo: &quot;{moderateDialog.video?.title}&quot;
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Nouveau statut</InputLabel>
                <Select
                  value={moderateDialog.status}
                  onChange={(e) => setModerateDialog(prev => ({ ...prev, status: e.target.value }))}
                  label="Nouveau statut"
                >
                  <MenuItem value="EN_LIGNE">En ligne</MenuItem>
                  <MenuItem value="HORS_LIGNE">Hors ligne</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Raison"
                multiline
                rows={3}
                value={moderateDialog.reason}
                onChange={(e) => setModerateDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Raison de la modération..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModerateDialog({ open: false, video: null, status: '', reason: '' })}>Annuler</Button>
            <Button onClick={handleModerateVideo} variant="contained" disabled={!moderateDialog.status}>
              Modérer
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
