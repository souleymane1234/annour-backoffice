import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useNotification } from 'src/hooks/useNotification';

import { routesName } from 'src/constants/routes';
import ConsumApi from 'src/services_workers/consum_api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function NewsCategoriesView() {
  const navigate = useNavigate();
  const { contextHolder, showApiResponse, showError } = useNotification();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, categoryId: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await ConsumApi.getNewsCategories();
      if (result.success) {
        setCategories(result.data?.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category?.name || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    setSaving(true);
    try {
      let result;
      if (editingCategory) {
        result = await ConsumApi.updateNewsCategory(editingCategory.id, categoryName);
        showApiResponse(result, {
          successTitle: 'Catégorie modifiée',
          errorTitle: 'Erreur de modification',
        });
      } else {
        result = await ConsumApi.createNewsCategory(categoryName);
        showApiResponse(result, {
          successTitle: 'Catégorie créée',
          errorTitle: 'Erreur de création',
        });
      }

      if (result.success) {
        loadCategories();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showError('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = (id) => {
    setConfirmDialog({ open: true, categoryId: id });
  };

  const handleConfirmDelete = async () => {
    const { categoryId } = confirmDialog;
    setConfirmDialog({ open: false, categoryId: null });

    try {
      const result = await ConsumApi.deleteNewsCategory(categoryId);
      showApiResponse(result, {
        successTitle: 'Catégorie supprimée',
        errorTitle: 'Erreur de suppression',
      });

      if (result.success) {
        loadCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Erreur', 'Impossible de supprimer cette catégorie. Elle contient peut-être des actualités.');
    }
  };

  return (
    <>
      {contextHolder}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Catégories d&apos;actualités</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Gérez les catégories pour organiser vos actualités
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(routesName.adminNews)}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle catégorie
          </Button>
        </Box>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom de la catégorie</TableCell>
                    <TableCell>Nombre d&apos;actualités</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {categories.map((category) => (
                    <TableRow hover key={category.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{category.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {category.newsCount || 0} actualité(s)
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton onClick={() => handleOpenDialog(category)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ py: 3 }}>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                          Aucune catégorie trouvée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nom de la catégorie"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Ex: Bourses d'études"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={!categoryName.trim() || saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, categoryId: null })}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette catégorie ? Si elle contient des actualités, la suppression échouera.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, categoryId: null })}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

