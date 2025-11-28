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
    TablePagination
} from '@mui/material';

import { fDate } from 'src/utils/format-time';

import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function WebTVCommentsView() {
  const [comments, setComments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    videoId: '',
    userId: '',
    isValid: '',
  });
  const [selectedComments, setSelectedComments] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, comment: null });
  const [moderateDialog, setModerateDialog] = useState({ open: false, comment: null, isValid: true, reason: '' });
  const [bulkModerateDialog, setBulkModerateDialog] = useState({ open: false, isValid: true, reason: '' });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVideos();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchComments();
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

  const fetchComments = async () => {
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

      const result = await ConsumApi.getWebTVComments(params);

      if (result.success) {
        setComments(result.data.data || []);
        setTotal(result.data.total || 0);
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors du chargement des commentaires', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setAlert({ open: true, message: 'Erreur lors du chargement des commentaires', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    try {
      const result = await ConsumApi.deleteWebTVComment(deleteDialog.comment.id);
      if (result.success) {
        setAlert({ open: true, message: 'Commentaire supprimé avec succès', severity: 'success' });
        fetchComments();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la suppression', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setAlert({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, comment: null });
    }
  };

  const handleModerateComment = async () => {
    try {
      const result = await ConsumApi.moderateWebTVComment(moderateDialog.comment.id, {
        isValid: moderateDialog.isValid,
        reason: moderateDialog.reason,
      });
      if (result.success) {
        setAlert({ open: true, message: 'Commentaire modéré avec succès', severity: 'success' });
        fetchComments();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la modération', severity: 'error' });
      }
    } catch (error) {
      console.error('Error moderating comment:', error);
      setAlert({ open: true, message: 'Erreur lors de la modération', severity: 'error' });
    } finally {
      setModerateDialog({ open: false, comment: null, isValid: true, reason: '' });
    }
  };

  const handleBulkModerateComments = async () => {
    try {
      const result = await ConsumApi.bulkModerateWebTVComments({
        commentIds: selectedComments,
        isValid: bulkModerateDialog.isValid,
        reason: bulkModerateDialog.reason,
      });
      if (result.success) {
        setAlert({ open: true, message: 'Commentaires modérés avec succès', severity: 'success' });
        setSelectedComments([]);
        fetchComments();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la modération', severity: 'error' });
      }
    } catch (error) {
      console.error('Error bulk moderating comments:', error);
      setAlert({ open: true, message: 'Erreur lors de la modération', severity: 'error' });
    } finally {
      setBulkModerateDialog({ open: false, isValid: true, reason: '' });
    }
  };

  const handleBulkDeleteComments = async () => {
    try {
      const result = await ConsumApi.bulkDeleteWebTVComments(selectedComments);
      if (result.success) {
        setAlert({ open: true, message: 'Commentaires supprimés avec succès', severity: 'success' });
        setSelectedComments([]);
        fetchComments();
      } else {
        setAlert({ open: true, message: result.message || 'Erreur lors de la suppression', severity: 'error' });
      }
    } catch (error) {
      console.error('Error bulk deleting comments:', error);
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

  const handleSelectComment = (commentId) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(comment => comment.id));
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            Chargement...
          </TableCell>
        </TableRow>
      );
    }

    if (comments.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            Aucun commentaire trouvé
          </TableCell>
        </TableRow>
      );
    }

    return comments.map((comment) => (
      <TableRow key={comment.id} hover>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedComments.includes(comment.id)}
            onChange={() => handleSelectComment(comment.id)}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ maxWidth: 300 }}>
            {comment.content}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {comment.video?.title || 'Vidéo supprimée'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {comment.author?.email || 'Utilisateur inconnu'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={comment.isValid ? 'Valide' : 'Invalide'}
            color={comment.isValid ? 'success' : 'error'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {fDate(comment.createdAt)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              color={comment.isValid ? 'error' : 'success'}
              onClick={() => setModerateDialog({ 
                open: true, 
                comment, 
                isValid: !comment.isValid, 
                reason: '' 
              })}
            >
              <Iconify icon={comment.isValid ? 'eva:close-fill' : 'eva:checkmark-fill'} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteDialog({ open: true, comment })}
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
        <title>WebTV - Commentaires</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Commentaires WebTV
        </Typography>

        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un commentaire..."
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filters.isValid}
                    onChange={handleFilterChange('isValid')}
                    label="Statut"
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="true">Valides</MenuItem>
                    <MenuItem value="false">Invalides</MenuItem>
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
                Commentaires ({total})
              </Typography>
              <Stack direction="row" spacing={1}>
                {selectedComments.length > 0 && (
                  <>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => setBulkModerateDialog({ open: true, isValid: true, reason: '' })}
                    >
                      Valider ({selectedComments.length})
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => setBulkModerateDialog({ open: true, isValid: false, reason: '' })}
                    >
                      Invalider ({selectedComments.length})
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleBulkDeleteComments}
                    >
                      Supprimer ({selectedComments.length})
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedComments.length === comments.length && comments.length > 0}
                      indeterminate={selectedComments.length > 0 && selectedComments.length < comments.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Contenu</TableCell>
                  <TableCell>Vidéo</TableCell>
                  <TableCell>Auteur</TableCell>
                  <TableCell>Statut</TableCell>
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
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, comment: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer ce commentaire ?
            </Typography>
             <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
               &quot;{deleteDialog.comment?.content}&quot;
             </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, comment: null })}>Annuler</Button>
            <Button onClick={handleDeleteComment} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Moderate Dialog */}
        <Dialog open={moderateDialog.open} onClose={() => setModerateDialog({ open: false, comment: null, isValid: true, reason: '' })}>
          <DialogTitle>Modérer le commentaire</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
               <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                 &quot;{moderateDialog.comment?.content}&quot;
               </Typography>
              <FormControl fullWidth>
                <InputLabel>Nouveau statut</InputLabel>
                <Select
                  value={moderateDialog.isValid}
                  onChange={(e) => setModerateDialog(prev => ({ ...prev, isValid: e.target.value }))}
                  label="Nouveau statut"
                >
                  <MenuItem value>Valide</MenuItem>
                  <MenuItem value={false}>Invalide</MenuItem>
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
            <Button onClick={() => setModerateDialog({ open: false, comment: null, isValid: true, reason: '' })}>Annuler</Button>
            <Button onClick={handleModerateComment} variant="contained">
              Modérer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Moderate Dialog */}
        <Dialog open={bulkModerateDialog.open} onClose={() => setBulkModerateDialog({ open: false, isValid: true, reason: '' })}>
          <DialogTitle>Modération en lot</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography>
                Modérer {selectedComments.length} commentaire(s)
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Nouveau statut</InputLabel>
                <Select
                  value={bulkModerateDialog.isValid}
                  onChange={(e) => setBulkModerateDialog(prev => ({ ...prev, isValid: e.target.value }))}
                  label="Nouveau statut"
                >
                  <MenuItem value>Valide</MenuItem>
                  <MenuItem value={false}>Invalide</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Raison"
                multiline
                rows={3}
                value={bulkModerateDialog.reason}
                onChange={(e) => setBulkModerateDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Raison de la modération..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkModerateDialog({ open: false, isValid: true, reason: '' })}>Annuler</Button>
            <Button onClick={handleBulkModerateComments} variant="contained">
              Modérer
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
