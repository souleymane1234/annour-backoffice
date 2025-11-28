import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    Box,
    Card,
    Chip,
    Grid,
    Table,
    Stack,
    Alert,
    Button,
    Dialog,
    Select,
    TableRow,
    MenuItem,
    Checkbox,
    Container, TableBody,
    TableCell,
    TableHead,
    Typography,
    IconButton,
    InputLabel,
    DialogTitle,
    FormControl,
    DialogContent,
    DialogActions,
    TableContainer,
    TablePagination
} from '@mui/material';

import { fDate } from 'src/utils/format-time';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function WebTVLikesView() {
  const [likes, setLikes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    videoId: '',
    userId: '',
    type: '',
  });
  const [selectedLikes, setSelectedLikes] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, like: null });
  const [editDialog, setEditDialog] = useState({ open: false, like: null, type: 'LIKE' });
  const [createDialog, setCreateDialog] = useState({ open: false, videoId: '', userId: '', type: 'LIKE' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVideos();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [page, rowsPerPage, filters]);

  const fetchVideos = async () => {
    try {
      const result = await ConsumApi.getWebTVVideos({ limit: 100 });
      if (result.success) {
        setVideos(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await ConsumApi.getUsers({ limit: 100 });
      if (result.success) {
        setUsers(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLikes = async () => {
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

      const result = await ConsumApi.getWebTVLikes(params);

      if (result.success) {
        setLikes(result.data.data || []);
        setTotal(result.data.total || 0);
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors du chargement des likes', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      setAlert({ open: true, message: 'Erreur lors du chargement des likes', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLike = async () => {
    try {
      const result = await ConsumApi.deleteWebTVLike(deleteDialog.like.id);
      if (result.success) {
        setAlert({ open: true, message: 'Like supprimé avec succès', severity: 'success' });
        fetchLikes();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la suppression', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting like:', error);
      setAlert({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, like: null });
    }
  };

  const handleUpdateLike = async () => {
    try {
      const result = await ConsumApi.updateWebTVLike(editDialog.like.id, {
        type: editDialog.type,
      });
      if (result.success) {
        setAlert({ open: true, message: 'Like modifié avec succès', severity: 'success' });
        fetchLikes();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la modification', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      setAlert({ open: true, message: 'Erreur lors de la modification', severity: 'error' });
    } finally {
      setEditDialog({ open: false, like: null, type: 'LIKE' });
    }
  };

  const handleCreateLike = async () => {
    try {
      const result = await ConsumApi.createWebTVLike({
        videoId: createDialog.videoId,
        userId: createDialog.userId,
        type: createDialog.type,
      });
      if (result.success) {
        setAlert({ open: true, message: 'Like créé avec succès', severity: 'success' });
        fetchLikes();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la création', severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating like:', error);
      setAlert({ open: true, message: 'Erreur lors de la création', severity: 'error' });
    } finally {
      setCreateDialog({ open: false, videoId: '', userId: '', type: 'LIKE' });
    }
  };

  const handleBulkDeleteLikes = async () => {
    try {
      const result = await ConsumApi.bulkDeleteWebTVLikes({ likeIds: selectedLikes });
      if (result.success) {
        setAlert({ open: true, message: 'Likes supprimés avec succès', severity: 'success' });
        setSelectedLikes([]);
        fetchLikes();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la suppression', severity: 'error' });
      }
    } catch (error) {
      console.error('Error bulk deleting likes:', error);
      setAlert({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
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

  const handleSelectLike = (likeId) => {
    setSelectedLikes(prev => 
      prev.includes(likeId) 
        ? prev.filter(id => id !== likeId)
        : [...prev, likeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLikes.length === likes.length) {
      setSelectedLikes([]);
    } else {
      setSelectedLikes(likes.map(like => like.id));
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'LIKE':
        return 'primary';
      case 'FAVORI':
        return 'warning';
      default:
        return 'default';
    }
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

    if (likes.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            Aucun like trouvé
          </TableCell>
        </TableRow>
      );
    }

    return likes.map((like) => (
      <TableRow key={like.id} hover>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedLikes.includes(like.id)}
            onChange={() => handleSelectLike(like.id)}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {like.video?.title || 'Vidéo supprimée'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {like.user?.email || 'Utilisateur inconnu'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={like.type}
            color={getTypeColor(like.type)}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {fDate(like.createdAt)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              onClick={() => setEditDialog({ 
                open: true, 
                like, 
                type: like.type 
              })}
            >
              <Iconify icon="eva:edit-fill" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDialog({ open: true, like })}
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
        <title>WebTV - Likes</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Likes WebTV</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setCreateDialog({ open: true, videoId: '', userId: '', type: 'LIKE' })}
          >
            Nouveau Like
          </Button>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Vidéo</InputLabel>
                  <Select
                    value={filters.videoId}
                    onChange={handleFilterChange('videoId')}
                    label="Vidéo"
                  >
                    <MenuItem value="">Toutes les vidéos</MenuItem>
                    {videos.map((video) => (
                      <MenuItem key={video.id} value={video.id}>
                        {video.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Utilisateur</InputLabel>
                  <Select
                    value={filters.userId}
                    onChange={handleFilterChange('userId')}
                    label="Utilisateur"
                  >
                    <MenuItem value="">Tous les utilisateurs</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={handleFilterChange('type')}
                    label="Type"
                  >
                    <MenuItem value="">Tous les types</MenuItem>
                    <MenuItem value="LIKE">Like</MenuItem>
                    <MenuItem value="FAVORI">Favori</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Likes ({total})
              </Typography>
              {selectedLikes.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleBulkDeleteLikes}
                >
                  Supprimer ({selectedLikes.length})
                </Button>
              )}
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedLikes.length === likes.length && likes.length > 0}
                      indeterminate={selectedLikes.length > 0 && selectedLikes.length < likes.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Vidéo</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Type</TableCell>
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
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, like: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer ce like ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, like: null })}>Annuler</Button>
            <Button onClick={handleDeleteLike} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, like: null, type: 'LIKE' })}>
          <DialogTitle>Modifier le like</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editDialog.type}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, type: e.target.value }))}
                  label="Type"
                >
                  <MenuItem value="LIKE">Like</MenuItem>
                  <MenuItem value="FAVORI">Favori</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, like: null, type: 'LIKE' })}>Annuler</Button>
            <Button onClick={handleUpdateLike} variant="contained">
              Modifier
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, videoId: '', userId: '', type: 'LIKE' })}>
          <DialogTitle>Créer un nouveau like</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Vidéo</InputLabel>
                <Select
                  value={createDialog.videoId}
                  onChange={(e) => setCreateDialog(prev => ({ ...prev, videoId: e.target.value }))}
                  label="Vidéo"
                >
                  {videos.map((video) => (
                    <MenuItem key={video.id} value={video.id}>
                      {video.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Utilisateur</InputLabel>
                <Select
                  value={createDialog.userId}
                  onChange={(e) => setCreateDialog(prev => ({ ...prev, userId: e.target.value }))}
                  label="Utilisateur"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={createDialog.type}
                  onChange={(e) => setCreateDialog(prev => ({ ...prev, type: e.target.value }))}
                  label="Type"
                >
                  <MenuItem value="LIKE">Like</MenuItem>
                  <MenuItem value="FAVORI">Favori</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog({ open: false, videoId: '', userId: '', type: 'LIKE' })}>Annuler</Button>
            <Button 
              onClick={handleCreateLike} 
              variant="contained"
              disabled={!createDialog.videoId || !createDialog.userId}
            >
              Créer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alert */}
        {alert.open && (
          <Alert
            severity={alert.severity}
            onClose={() => setAlert({ open: false, message: '', severity: 'success' })}
            sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
          >
            {alert.message}
          </Alert>
        )}
      </Container>
    </>
  );
}
